package com.athmech.crickroo.camera2

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.graphics.SurfaceTexture
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraDevice
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.params.StreamConfigurationMap
import android.media.ImageReader
import android.media.MediaCodec
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Range
import android.view.Surface
import com.athmech.crickroo.segmentedrec.SegmentedRecorderEngine
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.FileOutputStream

object Camera2Manager {

    private const val TAG = "Camera2Manager"
    private const val WIDTH  = 1920
    private const val HEIGHT = 1080
    private const val TARGET_FPS = 60
    private const val BIT_RATE = 16_000_000  // match reference app: 16 Mbps CBR

    const val EVENT_READY = "onCamera2Ready"

    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var imageReader: ImageReader? = null
    private var cameraThread: HandlerThread? = null
    private var cameraHandler: Handler? = null

    @Volatile private var previewSurfaceTexture: SurfaceTexture? = null
    @Volatile private var photoCallback: ((path: String, width: Int, height: Int) -> Unit)? = null
    @Volatile private var cacheDir: String = ""

    fun open(context: Context, reactCtx: ReactContext, previewSurface: Surface, surfaceTexture: SurfaceTexture) {
        if (context.checkSelfPermission(Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Camera permission not granted")
            emitReady(reactCtx, capable = false, fps = 0)
            return
        }

        cacheDir = context.cacheDir.absolutePath
        previewSurfaceTexture = surfaceTexture

        val ht = HandlerThread("Camera2Thread")
        ht.start()
        cameraThread = ht
        cameraHandler = Handler(ht.looper)

        val camMgr = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val cameraId = chooseBestBackCamera(camMgr) ?: run {
            Log.w(TAG, "No back camera with public 1080p + exact [60,60] found")
            emitReady(reactCtx, capable = false, fps = 0)
            cameraThread?.quitSafely(); cameraThread = null; cameraHandler = null
            return
        }

        Log.d(TAG, "Selected cameraId=$cameraId — 1080p + [60,60] confirmed")

        // Set the TextureView buffer to the recording resolution (matches reference app).
        surfaceTexture.setDefaultBufferSize(WIDTH, HEIGHT)

        // Initialise the encoder in surface mode to obtain its input Surface.
        SegmentedRecorderEngine.initSurfaceMode(WIDTH, HEIGHT, TARGET_FPS)
        val encoderSurface = SegmentedRecorderEngine.getEncoderSurface()

        // ImageReader for still JPEG capture used by stump detection.
        val reader = ImageReader.newInstance(WIDTH, HEIGHT, ImageFormat.JPEG, 2)
        imageReader = reader
        reader.setOnImageAvailableListener({ ir ->
            val image = ir.acquireLatestImage() ?: return@setOnImageAvailableListener
            try {
                val buffer = image.planes[0].buffer
                val bytes  = ByteArray(buffer.remaining())
                buffer.get(bytes)
                val path = "$cacheDir/cam2_photo_${System.currentTimeMillis()}.jpg"
                FileOutputStream(path).use { it.write(bytes) }
                photoCallback?.invoke(path, image.width, image.height)
                photoCallback = null
            } catch (e: Exception) {
                Log.e(TAG, "Photo save error", e)
            } finally {
                image.close()
            }
        }, cameraHandler)

        camMgr.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                createSession(camera, previewSurface, encoderSurface, reader.surface) {
                    emitReady(reactCtx, capable = true, fps = TARGET_FPS)
                }
            }
            override fun onDisconnected(camera: CameraDevice) {
                camera.close(); cameraDevice = null
                Log.w(TAG, "Camera disconnected")
            }
            override fun onError(camera: CameraDevice, error: Int) {
                camera.close(); cameraDevice = null
                Log.e(TAG, "Camera error $error")
                emitReady(reactCtx, capable = false, fps = 0)
            }
        }, cameraHandler)
    }

    /**
     * Iterates ALL back-facing cameras and requires ALL three conditions:
     *   1. Public 1920x1080 video output (MediaCodec OR MediaRecorder OR SurfaceTexture OR HighSpeed)
     *   2. Exact [60,60] AE FPS range advertised (so AE can lock to 60fps)
     *   3. Hardware min-frame-duration at 1920x1080 confirms >= 60fps physically possible
     *      (CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES is NOT resolution-specific — a device can
     *       list [60,60] for 720p only; the min-frame-duration check catches this.)
     */
    fun chooseBestBackCamera(camMgr: CameraManager): String? {
        for (id in camMgr.cameraIdList) {
            val c = camMgr.getCameraCharacteristics(id)
            if (c.get(CameraCharacteristics.LENS_FACING) != CameraCharacteristics.LENS_FACING_BACK) continue

            val map = c.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
            if (!supportsEncoder1080p(map)) {
                Log.d(TAG, "REJECT cameraId=$id: no public 1080p output")
                continue
            }

            val fpsRanges = c.get(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES)
            val hasExact60 = fpsRanges?.any { it.lower == TARGET_FPS && it.upper == TARGET_FPS } ?: false
            Log.d(TAG, "cameraId=$id fpsRanges=${fpsRanges?.joinToString()} exact[60,60]=$hasExact60")
            if (!hasExact60) {
                Log.d(TAG, "REJECT cameraId=$id: no exact [60,60] in AE ranges")
                continue
            }

            // Hardware check: verify the sensor can physically output >= 60fps at 1920x1080.
            // Some devices list [60,60] in AE ranges for smaller resolutions only; at 1080p they
            // silently cap at 30fps. getOutputMinFrameDuration is the authoritative hardware limit.
            val hwMaxFps = hardwareMaxFpsAt1080p(map)
            Log.d(TAG, "cameraId=$id hardware max fps at ${WIDTH}x${HEIGHT} = $hwMaxFps")
            if (hwMaxFps < TARGET_FPS) {
                Log.d(TAG, "REJECT cameraId=$id: hardware max $hwMaxFps fps < required $TARGET_FPS fps at 1080p")
                continue
            }

            Log.d(TAG, "ACCEPT cameraId=$id: 1080p output + AE [60,60] + hardware $hwMaxFps fps confirmed")
            return id
        }
        return null
    }

    /**
     * Returns the maximum fps the camera hardware can physically deliver at 1920x1080
     * in a regular capture session (not HighSpeed). Checks MediaCodec, MediaRecorder,
     * and SurfaceTexture output classes and takes the best (highest) result.
     * Returns 0 if the size is not supported or min frame duration is unavailable.
     */
    private fun hardwareMaxFpsAt1080p(map: StreamConfigurationMap?): Long {
        if (map == null) return 0L
        val size = android.util.Size(WIDTH, HEIGHT)
        val classes = listOf(MediaCodec::class.java, MediaRecorder::class.java, SurfaceTexture::class.java)
        var bestFps = 0L
        for (cls in classes) {
            try {
                val minDuration = map.getOutputMinFrameDuration(cls, size)
                if (minDuration > 0) {
                    val fps = 1_000_000_000L / minDuration
                    if (fps > bestFps) bestFps = fps
                }
            } catch (_: Exception) {}
        }
        return bestFps
    }

    /**
     * Checks if this camera exposes a public 1920x1080 video output via any of the
     * four output types the reference app checks (Samsung workaround — some Samsung cameras
     * do not advertise 1080p under MediaCodec.class even though it works in practice).
     */
    private fun supportsEncoder1080p(map: StreamConfigurationMap?): Boolean {
        if (map == null) return false
        return has1080p(map.getOutputSizes(MediaCodec::class.java))
                || has1080p(map.getOutputSizes(MediaRecorder::class.java))
                || has1080p(map.getOutputSizes(SurfaceTexture::class.java))
                || hasHighSpeed1080p(map)
    }

    private fun has1080p(sizes: Array<android.util.Size>?): Boolean =
        sizes?.any { (it.width == WIDTH && it.height == HEIGHT) || (it.width == HEIGHT && it.height == WIDTH) } ?: false

    private fun hasHighSpeed1080p(map: StreamConfigurationMap): Boolean {
        return try {
            has1080p(map.highSpeedVideoSizes)
        } catch (e: Exception) { false }
    }

    private fun createSession(
        camera: CameraDevice,
        previewSurface: Surface,
        encoderSurface: Surface,
        photoSurface: Surface,
        onReady: () -> Unit,
    ) {
        val surfaces = listOf(previewSurface, encoderSurface, photoSurface)
        camera.createCaptureSession(surfaces, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                captureSession = session
                // Use TEMPLATE_RECORD to tell camera hardware to optimise for video recording.
                val req = camera.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                    addTarget(previewSurface)
                    addTarget(encoderSurface)
                    applyCameraRequestOptions(this)
                }
                session.setRepeatingRequest(req.build(), null, cameraHandler)
                Log.d(TAG, "Capture session configured @${TARGET_FPS}fps (TEMPLATE_RECORD)")
                onReady()
            }
            override fun onConfigureFailed(session: CameraCaptureSession) {
                Log.e(TAG, "Capture session configure failed")
            }
        }, cameraHandler)
    }

    /**
     * Mirrors reference app applyCameraRequestOptions() exactly.
     */
    private fun applyCameraRequestOptions(b: CaptureRequest.Builder) {
        b.set(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(TARGET_FPS, TARGET_FPS))
        b.set(CaptureRequest.CONTROL_MODE, CaptureRequest.CONTROL_MODE_AUTO)
        b.set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
        b.set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            b.set(CaptureRequest.CONTROL_VIDEO_STABILIZATION_MODE,
                  CaptureRequest.CONTROL_VIDEO_STABILIZATION_MODE_OFF)
        }
    }

    fun takePhoto(callback: (path: String, width: Int, height: Int) -> Unit) {
        val session = captureSession ?: run { Log.e(TAG, "takePhoto: no session"); return }
        val camera  = cameraDevice  ?: run { Log.e(TAG, "takePhoto: no device"); return }
        val reader  = imageReader   ?: run { Log.e(TAG, "takePhoto: no reader"); return }
        photoCallback = callback
        val req = camera.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
            addTarget(reader.surface)
            set(CaptureRequest.CONTROL_MODE, CaptureRequest.CONTROL_MODE_AUTO)
        }
        session.capture(req.build(), null, cameraHandler)
    }

    fun close() {
        try { captureSession?.close() } catch (e: Exception) { Log.e(TAG, "session close", e) }
        captureSession = null
        try { cameraDevice?.close() } catch (e: Exception) { Log.e(TAG, "device close", e) }
        cameraDevice = null
        try { imageReader?.close() } catch (e: Exception) { Log.e(TAG, "reader close", e) }
        imageReader = null
        photoCallback = null
        previewSurfaceTexture = null
        SegmentedRecorderEngine.releaseSurfaceMode()
        cameraThread?.quitSafely(); cameraThread = null; cameraHandler = null
        Log.d(TAG, "Camera2Manager closed")
    }

    private fun emitReady(ctx: ReactContext, capable: Boolean, fps: Int) {
        val params = Arguments.createMap().apply {
            putBoolean("capable", capable)
            putInt("fps", fps)
        }
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_READY, params)
    }
}
