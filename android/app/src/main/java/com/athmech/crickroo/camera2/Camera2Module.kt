package com.athmech.crickroo.camera2

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import android.content.Context
import android.hardware.camera2.CameraManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class Camera2Module(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "Camera2"

    // Required boilerplate for NativeEventEmitter
    @ReactMethod fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {}
    @ReactMethod fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {}


    @ReactMethod
    fun isRecordingSupported(promise: Promise) {
        try {
            val camMgr = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val supported = Camera2Manager.chooseBestBackCamera(camMgr) != null
            promise.resolve(supported)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun takePhoto(promise: Promise) {
        Camera2Manager.takePhoto { path, width, height ->
            val result = Arguments.createMap().apply {
                putString("path", path)
                putInt("width", width)
                putInt("height", height)
            }
            promise.resolve(result)
        }
    }
}
