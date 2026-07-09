package com.athmech.crickroo.segmentedrec

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native NativeModule that exposes segmented recording to JS.
 *
 * Usage from JS:
 *   NativeModules.SegmentedRecorder.start(path, width, height, fps)
 *   NativeModules.SegmentedRecorder.rotate(nextPath)
 *   NativeModules.SegmentedRecorder.stop()
 *   // Listen for: NativeEventEmitter('onChunkReady', { path })
 */
class SegmentedRecorderModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "SegmentedRecorder"
    }

    override fun getName() = NAME

    // Required boilerplate for NativeEventEmitter
    @ReactMethod fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {}
    @ReactMethod fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {}

    @ReactMethod
    fun prepare(width: Int, height: Int, fps: Int, promise: Promise) {
        try {
            SegmentedRecorderEngine.prepare(width, height, fps)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("PREPARE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun start(path: String, width: Int, height: Int, fps: Int, promise: Promise) {
        try {
            SegmentedRecorderEngine.onChunkReady = { chunkPath ->
                val params = Arguments.createMap().apply { putString("path", chunkPath) }
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onChunkReady", params)
            }
            SegmentedRecorderEngine.start(path, width, height, fps)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun rotate(nextPath: String, promise: Promise) {
        try {
            SegmentedRecorderEngine.rotate(nextPath)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ROTATE_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            SegmentedRecorderEngine.onStopped = {
                SegmentedRecorderEngine.onStopped = null
                promise.resolve(null)
            }
            SegmentedRecorderEngine.stop()
        } catch (e: Exception) {
            promise.reject("STOP_FAILED", e.message, e)
        }
    }
}
