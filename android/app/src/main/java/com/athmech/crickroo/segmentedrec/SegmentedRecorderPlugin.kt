package com.athmech.crickroo.segmentedrec

import com.mrousavy.camera.core.FrameInvalidError
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * VisionCamera Frame Processor Plugin.
 *
 * JS sends commands via plugin.call(frame, { cmd, path, width, height, fps }).
 * Native returns events as { event: "chunkReady", path } or { event: "stopped" }.
 */
class SegmentedRecorderPlugin : FrameProcessorPlugin() {

    // Thread-safe queue: encode thread pushes events, frame-processor thread polls them
    private val pendingEvents = ConcurrentLinkedQueue<Map<String, Any>>()

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {

        // ── 1. Handle one-shot command ────────────────────────────────────────
        val cmd = params?.get("cmd") as? String
        if (cmd != null) {
            when (cmd) {
                "prepare" -> {
                    val width  = (params["width"]  as? Double)?.toInt() ?: 1920
                    val height = (params["height"] as? Double)?.toInt() ?: 1080
                    val fps    = (params["fps"]    as? Double)?.toInt() ?: 30
                    SegmentedRecorderEngine.prepare(width, height, fps)
                }
                "start" -> {
                    val path   = params["path"]   as? String ?: return null
                    val width  = (params["width"]  as? Double)?.toInt() ?: 1920
                    val height = (params["height"] as? Double)?.toInt() ?: 1080
                    val fps    = (params["fps"]    as? Double)?.toInt() ?: 30

                    // Wire engine callbacks into this plugin's event queue
                    SegmentedRecorderEngine.onChunkReady = { chunkPath ->
                        pendingEvents.offer(mapOf("event" to "chunkReady", "path" to chunkPath))
                    }
                    SegmentedRecorderEngine.onStopped = {
                        pendingEvents.offer(mapOf("event" to "stopped"))
                    }
                    SegmentedRecorderEngine.start(path, width, height, fps)
                }
                "rotate" -> {
                    val path = params["path"] as? String ?: return null
                    SegmentedRecorderEngine.rotate(path)
                }
                "stop" -> SegmentedRecorderEngine.stop()
            }
        }

        // ── 2. Submit frame to encoder ────────────────────────────────────────
        if (SegmentedRecorderEngine.isRunning()) {
            try {
                val image = frame.getImage()
                if (image != null) {
                    SegmentedRecorderEngine.submitFrame(image, frame.getTimestamp() / 1_000L)
                }
            } catch (_: FrameInvalidError) { /* frame released early – skip */ }
        }

        // ── 3. Return next pending event to the JS worklet ────────────────────
        return pendingEvents.poll()
    }
}
