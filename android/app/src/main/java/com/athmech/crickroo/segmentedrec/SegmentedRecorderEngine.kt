package com.athmech.crickroo.segmentedrec

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.media.MediaRecorder
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import java.io.File
import java.nio.ByteBuffer
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * Encodes video frames + microphone audio into rotating MP4 chunks.
 *
 * Two input modes:
 *  - CPU mode  : caller submits NV12 byte arrays via submitFrame() (VisionCamera / iOS path)
 *  - Surface mode: Camera2 writes directly to encoder's input Surface (Android Camera2 path)
 *
 * Thread model:
 *  - encodeThread : video encode loop + all muxer writes (single writer)
 *  - audioThread  : AudioRecord capture + AAC encode → drops into audioMuxQueue
 *  - encodeThread drains audioMuxQueue so the muxer is only ever touched from one thread
 */
object SegmentedRecorderEngine {

    private const val TAG = "SegRec"

    // Video
    private const val VIDEO_MIME       = "video/avc"
    private const val VIDEO_BIT_RATE   = 16_000_000
    private const val I_FRAME_INTERVAL_SECONDS = 1

    // Audio
    private const val AUDIO_MIME        = "audio/mp4a-latm"
    private const val AUDIO_SAMPLE_RATE = 44100
    private const val AUDIO_CHANNELS    = 1
    private const val AUDIO_BIT_RATE    = 128_000
    private const val AUDIO_BUF_SIZE    = 8192

    // ─── Video pipeline ───────────────────────────────────────────────────────

    private val freeBuffers = LinkedBlockingQueue<ByteArray>()
    private data class FrameEntry(val nv12: ByteArray, val timestampUs: Long)
    private val frameQueue = LinkedBlockingQueue<FrameEntry>(30)

    private var videoEncoder: MediaCodec? = null
    @Volatile private var cachedVideoFormat: MediaFormat? = null

    // Surface-mode encoder input surface (Camera2 writes here directly)
    @Volatile private var encoderInputSurface: android.view.Surface? = null

    // ─── Audio pipeline ───────────────────────────────────────────────────────

    private var audioRecord: AudioRecord? = null
    private var audioEncoder: MediaCodec? = null
    private var audioThread: HandlerThread? = null
    @Volatile private var cachedAudioFormat: MediaFormat? = null

    private data class AudioSample(val buf: ByteBuffer, val info: MediaCodec.BufferInfo)
    private val audioMuxQueue = LinkedBlockingQueue<AudioSample>(200)

    // ─── Muxer — only touched from encodeThread ───────────────────────────────

    private var muxer: MediaMuxer? = null
    private var videoTrack    = -1
    private var audioTrack    = -1
    private var muxerStarted  = false
    private var clipVideoBaseUs: Long = -1L
    private var clipAudioBaseUs: Long = -1L

    // ─── State ────────────────────────────────────────────────────────────────

    private val isPrepared        = AtomicBoolean(false)
    private val isRunning         = AtomicBoolean(false)
    private val stopRequested     = AtomicBoolean(false)
    private val pendingRotatePath = AtomicReference<String?>(null)
    @Volatile private var audioInitFailed = false

    @Volatile private var currentPath: String? = null
    @Volatile private var frameWidth  = 0
    @Volatile private var frameHeight = 0
    @Volatile private var frameFps    = 30
    @Volatile private var recordingEverStarted = false

    @Volatile var onChunkReady: ((path: String) -> Unit)? = null
    @Volatile var onStopped:    (() -> Unit)?             = null

    private var encodeThread: HandlerThread? = null

    // ─── Surface mode state ───────────────────────────────────────────────────

    @Volatile private var surfaceMode      = false
    @Volatile private var surfaceReleased  = false
    private val stopMuxerRequested = AtomicBoolean(false)

    // ─── Public API ───────────────────────────────────────────────────────────

    fun isRunning(): Boolean = isRunning.get()

    /**
     * Surface mode init — called by Camera2Manager when the camera opens.
     * Initialises the video encoder with COLOR_FormatSurface and starts the encode thread.
     * The audio encoder is initialised lazily in start().
     */
    fun initSurfaceMode(width: Int, height: Int, fps: Int) {
        if (surfaceMode && encoderInputSurface != null) return
        surfaceMode      = true
        surfaceReleased  = false
        frameWidth  = width
        frameHeight = height
        frameFps    = fps
        stopRequested.set(false)
        stopMuxerRequested.set(false)
        audioInitFailed = false
        initSurfaceVideoEncoder()
        startEncodeThread()
        Log.d(TAG, "Surface mode initialised ${width}x${height}@${fps}fps")
    }

    /** Returns the MediaCodec input Surface for Camera2 to write frames to. */
    fun getEncoderSurface(): android.view.Surface =
        encoderInputSurface ?: throw IllegalStateException("initSurfaceMode not called")

    /**
     * Signals EOS to the video encoder so the encode thread can drain and exit.
     * Called by Camera2Manager.close() when the TextureView is destroyed.
     */
    fun releaseSurfaceMode() {
        if (!surfaceMode) return
        surfaceReleased = true
        videoEncoder?.signalEndOfInputStream()
        Log.d(TAG, "releaseSurfaceMode — EOS signalled")
    }

    fun prepare(width: Int, height: Int, fps: Int) {
        if (surfaceMode) return  // no-op in surface mode (already prepared)
        if (isPrepared.get() || isRunning.get()) return
        stopRequested.set(false)
        audioInitFailed = false
        frameWidth  = width
        frameHeight = height
        frameFps    = fps
        frameQueue.clear()
        freeBuffers.clear()
        val bufSize = width * height * 3 / 2
        repeat(10) { freeBuffers.offer(ByteArray(bufSize)) }
        initVideoEncoder()
        initAudioEncoder()
        startEncodeThread()
        isPrepared.set(true)
        Log.d(TAG, "Prepared ${width}x${height}@${fps}fps")
    }

    fun start(path: String, width: Int, height: Int, fps: Int) {
        if (isRunning.get()) { Log.w(TAG, "Already running"); return }
        stopRequested.set(false)
        stopMuxerRequested.set(false)
        audioInitFailed = false

        if (surfaceMode) {
            // In surface mode the video encoder is already running; just open the muxer + audio.
            initAudioEncoder()
            currentPath = path
            initMuxer(path)
            recordingEverStarted = true
            isRunning.set(true)
            startAudioCapture()
            Log.d(TAG, "Surface mode recording started → $path")
            return
        }

        if (!isPrepared.get()) {
            frameWidth  = width
            frameHeight = height
            frameFps    = fps
            frameQueue.clear()
            freeBuffers.clear()
            val bufSize = width * height * 3 / 2
            repeat(10) { freeBuffers.offer(ByteArray(bufSize)) }
            initVideoEncoder()
            initAudioEncoder()
            startEncodeThread()
        }
        currentPath = path
        initMuxer(path)
        recordingEverStarted = true
        isRunning.set(true)
        isPrepared.set(false)
        startAudioCapture()
        Log.d(TAG, "Started → $path")
    }

    fun rotate(nextPath: String) { pendingRotatePath.set(nextPath) }

    fun stop() {
        if (surfaceMode) {
            if (!isRunning.get()) return
            pendingRotatePath.set(null)   // discard any pending rotation
            stopRequested.set(true)       // stops the audio loop
            stopMuxerRequested.set(true)  // encode thread closes muxer at next keyframe
            isRunning.set(false)
            return
        }
        if (!isPrepared.get() && !isRunning.get()) return
        stopRequested.set(true)
    }

    fun submitFrame(image: android.media.Image, timestampUs: Long) {
        if (!isRunning.get() || stopRequested.get()) return
        val buf = freeBuffers.poll() ?: return
        try {
            extractNV12(image, buf)
            if (!frameQueue.offer(FrameEntry(buf, timestampUs))) freeBuffers.offer(buf)
        } catch (e: Exception) {
            freeBuffers.offer(buf)
        }
    }

    // ─── Encoder init ─────────────────────────────────────────────────────────

    private fun initVideoEncoder() {
        val format = MediaFormat.createVideoFormat(VIDEO_MIME, frameWidth, frameHeight).apply {
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar)
            setInteger(MediaFormat.KEY_BIT_RATE, VIDEO_BIT_RATE)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameFps)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, I_FRAME_INTERVAL_SECONDS)
        }
        videoEncoder = MediaCodec.createEncoderByType(VIDEO_MIME).also {
            it.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            it.start()
        }
    }

    private fun initSurfaceVideoEncoder() {
        val format = MediaFormat.createVideoFormat(VIDEO_MIME, frameWidth, frameHeight).apply {
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
            setInteger(MediaFormat.KEY_BIT_RATE, VIDEO_BIT_RATE)
            setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameFps)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, I_FRAME_INTERVAL_SECONDS)
        }
        val enc = MediaCodec.createEncoderByType(VIDEO_MIME)
        enc.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        encoderInputSurface = enc.createInputSurface()
        enc.start()
        videoEncoder = enc
    }

    private fun initAudioEncoder() {
        val format = MediaFormat.createAudioFormat(AUDIO_MIME, AUDIO_SAMPLE_RATE, AUDIO_CHANNELS).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, AUDIO_BIT_RATE)
            setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, 16384)
        }
        audioEncoder = MediaCodec.createEncoderByType(AUDIO_MIME).also {
            it.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            it.start()
        }
    }

    // ─── Audio capture (audioThread) ──────────────────────────────────────────

    private fun startAudioCapture() {
        val minBuf = AudioRecord.getMinBufferSize(
            AUDIO_SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
        )
        if (minBuf == AudioRecord.ERROR || minBuf == AudioRecord.ERROR_BAD_VALUE) {
            Log.e(TAG, "AudioRecord.getMinBufferSize failed: $minBuf")
            return
        }
        val bufSize = maxOf(minBuf, AUDIO_BUF_SIZE)
        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                AUDIO_SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufSize,
            )
            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord not initialized")
                audioRecord?.release(); audioRecord = null; audioInitFailed = true; return
            }
            audioRecord?.startRecording()
        } catch (e: Exception) {
            Log.e(TAG, "AudioRecord init failed", e)
            audioRecord = null; audioInitFailed = true; return
        }

        val ht = HandlerThread("SegRecAudio")
        ht.start(); audioThread = ht
        Handler(ht.looper).post { audioLoop(bufSize) }
        Log.d(TAG, "Audio capture started (bufSize=$bufSize)")
    }

    private fun audioLoop(bufSize: Int) {
        val enc = audioEncoder ?: return
        val pcm = ShortArray(bufSize / 2)
        var presentationUs = 0L
        val info = MediaCodec.BufferInfo()

        while (!stopRequested.get()) {
            val read = audioRecord?.read(pcm, 0, pcm.size) ?: break
            if (read <= 0) continue

            val inIdx = enc.dequeueInputBuffer(5_000)
            if (inIdx >= 0) {
                val inBuf = enc.getInputBuffer(inIdx)
                if (inBuf != null) {
                    inBuf.clear()
                    for (i in 0 until read) inBuf.putShort(pcm[i])
                    enc.queueInputBuffer(inIdx, 0, read * 2, presentationUs, 0)
                    presentationUs += (read.toLong() * 1_000_000L) / AUDIO_SAMPLE_RATE
                } else {
                    enc.queueInputBuffer(inIdx, 0, 0, 0, 0)
                }
            }
            drainAudioEncoder(enc, info, isEos = false)
        }

        val inIdx = enc.dequeueInputBuffer(10_000)
        if (inIdx >= 0) enc.queueInputBuffer(inIdx, 0, 0, presentationUs, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
        drainAudioEncoder(enc, info, isEos = true)

        audioRecord?.stop(); audioRecord?.release(); audioRecord = null
        Log.d(TAG, "Audio loop done")
    }

    private fun drainAudioEncoder(enc: MediaCodec, info: MediaCodec.BufferInfo, isEos: Boolean) {
        while (true) {
            val idx = enc.dequeueOutputBuffer(info, if (isEos) 10_000L else 0L)
            when {
                idx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                    cachedAudioFormat = enc.outputFormat
                    Log.d(TAG, "Audio format ready")
                }
                idx >= 0 -> {
                    val src = enc.getOutputBuffer(idx)
                    val isConfig = info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0
                    val eos      = info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0

                    if (!isConfig && src != null && info.size > 0) {
                        val copy = ByteBuffer.allocate(info.size)
                        src.position(info.offset); src.limit(info.offset + info.size)
                        copy.put(src); copy.flip()
                        val copyInfo = MediaCodec.BufferInfo().also {
                            it.set(0, info.size, info.presentationTimeUs, info.flags)
                        }
                        audioMuxQueue.offer(AudioSample(copy, copyInfo))
                    }
                    enc.releaseOutputBuffer(idx, false)
                    if (eos) return
                }
                else -> return
            }
        }
    }

    // ─── Encode thread ────────────────────────────────────────────────────────

    private fun startEncodeThread() {
        val ht = HandlerThread("SegRecEncode")
        ht.start(); encodeThread = ht
        Handler(ht.looper).post { encodeLoop() }
    }

    private fun encodeLoop() {
        val info = MediaCodec.BufferInfo()
        var eosSent = false
        try {
            while (true) {
                if (!surfaceMode) {
                    // CPU mode: pull frames from queue and feed them into the encoder.
                    val shouldStop = stopRequested.get() && frameQueue.isEmpty()
                    val frame = frameQueue.poll(5, TimeUnit.MILLISECONDS)
                    if (frame != null) {
                        feedVideoFrame(frame); freeBuffers.offer(frame.nv12)
                    } else if (shouldStop && !eosSent) {
                        val idx = videoEncoder!!.dequeueInputBuffer(5_000)
                        if (idx >= 0) {
                            videoEncoder!!.queueInputBuffer(idx, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            eosSent = true
                        }
                    }
                }
                // Surface mode: Camera2 writes directly; just drain encoder output.

                flushAudioQueue()
                if (drainVideoEncoder(info)) break
            }
        } catch (e: Exception) {
            Log.e(TAG, "Encode loop error", e)
        } finally {
            if (surfaceMode) {
                // Camera2 path teardown
                if (muxerStarted) safeStopMuxer(isLastChunk = true)
                audioThread?.quitSafely()
                try { audioThread?.join(2_000) } catch (_: InterruptedException) {}
                audioThread = null
                audioRecord?.stop(); audioRecord?.release(); audioRecord = null
                try { audioEncoder?.stop() } catch (_: Exception) {}
                try { audioEncoder?.release() } catch (_: Exception) {}
                audioEncoder = null
                try { videoEncoder?.stop() } catch (_: Exception) {}
                try { videoEncoder?.release() } catch (_: Exception) {}
                videoEncoder = null
                encoderInputSurface?.release(); encoderInputSurface = null
                encodeThread?.quitSafely(); encodeThread = null
                frameQueue.clear(); freeBuffers.clear(); audioMuxQueue.clear()
                cachedVideoFormat = null; cachedAudioFormat = null; audioInitFailed = false
                isRunning.set(false); surfaceMode = false; surfaceReleased = false
                stopMuxerRequested.set(false); recordingEverStarted = false
                Log.d(TAG, "Surface mode engine released")
            } else {
                if (recordingEverStarted) safeStopMuxer(isLastChunk = true)
                safeReleaseEncoders()
                isRunning.set(false); isPrepared.set(false)
                if (recordingEverStarted) { recordingEverStarted = false; onStopped?.invoke() }
                Log.d(TAG, "Encode thread done")
            }
        }
    }

    private fun flushAudioQueue() {
        if (!muxerStarted || audioTrack < 0) return
        while (true) {
            val sample = audioMuxQueue.poll() ?: return
            try {
                if (clipAudioBaseUs < 0) clipAudioBaseUs = sample.info.presentationTimeUs
                val normInfo = MediaCodec.BufferInfo().also {
                    it.set(0, sample.info.size, maxOf(0L, sample.info.presentationTimeUs - clipAudioBaseUs), sample.info.flags)
                }
                muxer?.writeSampleData(audioTrack, sample.buf, normInfo)
            } catch (e: Exception) { Log.e(TAG, "Audio mux write error", e) }
        }
    }

    private fun feedVideoFrame(frame: FrameEntry) {
        val enc = videoEncoder ?: return
        val idx = enc.dequeueInputBuffer(5_000)
        if (idx < 0) return
        val buf = enc.getInputBuffer(idx) ?: run { enc.queueInputBuffer(idx, 0, 0, 0, 0); return }
        buf.clear(); buf.put(frame.nv12)
        enc.queueInputBuffer(idx, 0, frame.nv12.size, frame.timestampUs, 0)
    }

    private fun drainVideoEncoder(info: MediaCodec.BufferInfo): Boolean {
        val enc = videoEncoder ?: return true
        while (true) {
            val idx = enc.dequeueOutputBuffer(info, 5_000)
            when {
                idx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                    cachedVideoFormat = enc.outputFormat
                    tryStartMuxer()
                }
                idx >= 0 -> {
                    val buf = enc.getOutputBuffer(idx)
                    if (buf == null) { enc.releaseOutputBuffer(idx, false); continue }

                    tryStartMuxer()

                    val isConfig = info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0
                    val isEos    = info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
                    val isKey    = info.flags and MediaCodec.BUFFER_FLAG_KEY_FRAME != 0

                    if (!isConfig && muxerStarted && info.size > 0 && videoTrack >= 0) {
                        // Rotate at keyframe boundary (both CPU and surface modes)
                        val nextPath = if (isKey && !stopMuxerRequested.get()) pendingRotatePath.getAndSet(null) else null
                        if (nextPath != null) {
                            val finished = currentPath
                            flushAudioQueue()
                            safeStopMuxer(isLastChunk = false)
                            currentPath = nextPath
                            initMuxer(nextPath)
                            Log.d(TAG, "Rotated → $nextPath")
                            finished?.let { onChunkReady?.invoke(it) }
                        }

                        if (muxerStarted && videoTrack >= 0) {
                            if (clipVideoBaseUs < 0) clipVideoBaseUs = info.presentationTimeUs
                            val normInfo = MediaCodec.BufferInfo().also {
                                it.set(info.offset, info.size, info.presentationTimeUs - clipVideoBaseUs, info.flags)
                            }
                            muxer?.writeSampleData(videoTrack, buf, normInfo)
                        }

                        // Surface mode: close muxer after writing the keyframe that triggered stop.
                        if (surfaceMode && stopMuxerRequested.get() && isKey && muxerStarted) {
                            flushAudioQueue()
                            safeStopMuxer(isLastChunk = true)
                            stopMuxerRequested.set(false)
                            recordingEverStarted = false
                            onStopped?.invoke()
                            onStopped = null
                            Log.d(TAG, "Surface mode muxer closed after stop()")
                        }
                    }

                    enc.releaseOutputBuffer(idx, false)
                    if (isEos) return true
                }
                else -> return false
            }
        }
    }

    // ─── Muxer helpers (encodeThread only) ───────────────────────────────────

    private fun initMuxer(path: String) {
        File(path).parentFile?.mkdirs()
        muxer = MediaMuxer(path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        muxer!!.setOrientationHint(90)
        videoTrack = -1; audioTrack = -1; muxerStarted = false
        clipVideoBaseUs = -1L; clipAudioBaseUs = -1L
        tryStartMuxer()
    }

    private fun tryStartMuxer() {
        if (muxerStarted || muxer == null) return
        val vFmt = cachedVideoFormat ?: return
        if (!audioInitFailed) {
            val aFmt = cachedAudioFormat ?: return
            videoTrack = muxer!!.addTrack(vFmt)
            audioTrack = muxer!!.addTrack(aFmt)
            muxer!!.start()
            muxerStarted = true
            Log.d(TAG, "Muxer started (video+audio)")
        } else {
            videoTrack = muxer!!.addTrack(vFmt)
            muxer!!.start()
            muxerStarted = true
            Log.w(TAG, "Muxer started (video-only — audio init failed)")
        }
    }

    private fun safeStopMuxer(isLastChunk: Boolean) {
        try { if (muxerStarted) muxer?.stop() } catch (e: Exception) { Log.e(TAG, "muxer stop", e) }
        try { muxer?.release() } catch (e: Exception) { Log.e(TAG, "muxer release", e) }
        muxer = null; muxerStarted = false
        clipVideoBaseUs = -1L; clipAudioBaseUs = -1L
        if (isLastChunk) { currentPath?.let { onChunkReady?.invoke(it) }; currentPath = null }
    }

    private fun safeReleaseEncoders() {
        audioThread?.quitSafely()
        try { audioThread?.join(2_000) } catch (_: InterruptedException) {}
        audioThread = null

        try { videoEncoder?.stop() } catch (_: Exception) {}
        try { videoEncoder?.release() } catch (_: Exception) {}
        videoEncoder = null
        try { audioEncoder?.stop() } catch (_: Exception) {}
        try { audioEncoder?.release() } catch (_: Exception) {}
        audioEncoder = null
        encodeThread?.quitSafely(); encodeThread = null
        frameQueue.clear(); freeBuffers.clear(); audioMuxQueue.clear()
        cachedVideoFormat = null; cachedAudioFormat = null; audioInitFailed = false
    }

    // ─── NV12 extraction ──────────────────────────────────────────────────────

    private fun extractNV12(image: android.media.Image, dst: ByteArray) {
        val w = image.width; val h = image.height; var off = 0
        val yPlane = image.planes[0]; val yBuf = yPlane.buffer
        val yStride = yPlane.rowStride; val yLimit = yBuf.limit()
        for (row in 0 until h) {
            val pos = row * yStride; if (pos >= yLimit) break
            yBuf.position(pos); yBuf.get(dst, off, minOf(yLimit - pos, w)); off += w
        }
        val uvPlane = image.planes[1]; val uvBuf = uvPlane.buffer
        val uvStride = uvPlane.rowStride; val uvPixelStride = uvPlane.pixelStride
        val uvLimit = uvBuf.limit()
        if (uvPixelStride == 2) {
            for (row in 0 until h / 2) {
                val pos = row * uvStride; if (pos >= uvLimit) break
                uvBuf.position(pos); uvBuf.get(dst, off, minOf(uvLimit - pos, w)); off += w
            }
        } else {
            val vPlane = image.planes[2]; val vBuf = vPlane.buffer
            val vStride = vPlane.rowStride; val vLimit = vBuf.limit()
            val row = ByteArray(w / 2)
            for (r in 0 until h / 2) {
                val uPos = r * uvStride
                if (uPos < uvLimit) { uvBuf.position(uPos); uvBuf.get(row, 0, minOf(uvLimit - uPos, w / 2)); for (x in 0 until w / 2) dst[off + x * 2] = row[x] }
                val vPos = r * vStride
                if (vPos < vLimit) { vBuf.position(vPos); vBuf.get(row, 0, minOf(vLimit - vPos, w / 2)); for (x in 0 until w / 2) dst[off + x * 2 + 1] = row[x] }
                off += w
            }
        }
    }
}
