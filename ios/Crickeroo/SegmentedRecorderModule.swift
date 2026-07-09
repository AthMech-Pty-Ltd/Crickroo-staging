import Foundation
import React

@objc(SegmentedRecorderModule)
class SegmentedRecorderModule: RCTEventEmitter {

    override static func moduleName() -> String! { "SegmentedRecorder" }

    override static func requiresMainQueueSetup() -> Bool { false }

    override func supportedEvents() -> [String]! { ["onChunkReady"] }

    // ─── JS API ───────────────────────────────────────────────────────────────

    @objc
    func prepare(_ width: NSNumber,
                 height: NSNumber,
                 fps: NSNumber,
                 resolver: RCTPromiseResolveBlock,
                 rejecter: RCTPromiseRejectBlock) {
        // On iOS, AVAssetWriter initialises fast — no cold-start problem like Android MediaCodec.
        // We still store dimensions so start() uses the correct values if called immediately after.
        SegmentedRecorderEngine.shared.prepare(
            width: width.intValue,
            height: height.intValue,
            fps: fps.intValue
        )
        resolver(nil)
    }

    @objc
    func start(_ path: String,
               width: NSNumber,
               height: NSNumber,
               fps: NSNumber,
               resolver: RCTPromiseResolveBlock,
               rejecter: RCTPromiseRejectBlock) {
        SegmentedRecorderEngine.shared.onChunkReady = { [weak self] chunkPath in
            self?.sendEvent(withName: "onChunkReady", body: ["path": chunkPath])
        }
        SegmentedRecorderEngine.shared.start(
            path: path,
            width: width.intValue,
            height: height.intValue,
            fps: fps.intValue
        )
        resolver(nil)
    }

    @objc
    func rotate(_ nextPath: String,
                resolver: RCTPromiseResolveBlock,
                rejecter: RCTPromiseRejectBlock) {
        SegmentedRecorderEngine.shared.rotate(nextPath: nextPath)
        resolver(nil)
    }

    @objc
    func stop(_ resolver: @escaping RCTPromiseResolveBlock,
              rejecter: @escaping RCTPromiseRejectBlock) {
        SegmentedRecorderEngine.shared.onStopped = {
            SegmentedRecorderEngine.shared.onStopped = nil
            resolver(nil)
        }
        SegmentedRecorderEngine.shared.stop()
    }
}
