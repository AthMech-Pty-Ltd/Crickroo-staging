import AVFoundation
import Foundation

final class SegmentedRecorderEngine {

    static let shared = SegmentedRecorderEngine()
    private init() {}

    // ─── State ────────────────────────────────────────────────────────────────

    private(set) var isRunning = false

    private var writer: AVAssetWriter?
    private var videoInput: AVAssetWriterInput?
    private var audioInput: AVAssetWriterInput?
    private var currentURL: URL?
    private var pendingRotateURL: URL?
    private var isRotating = false
    private var sessionStarted = false

    private let writerQueue = DispatchQueue(label: "com.crickeroo.segmentedrec", qos: .userInitiated)

    private var _fps = 60

    // Pre-warm state
    private var isPreparing = false
    private var cachedFormatDesc: CMFormatDescription?

    // Audio engine
    private var audioEngine: AVAudioEngine?
    private var audioConverter: AVAudioConverter?
    private var audioSampleTime: Int64 = 0

    var onChunkReady: ((String) -> Void)?
    var onStopped: (() -> Void)?

    // ─── Public API ───────────────────────────────────────────────────────────

    func prepare(width: Int, height: Int, fps: Int) {
        writerQueue.async { [weak self] in
            guard let self = self, !self.isRunning else { return }
            self._fps = fps
            self.isPreparing = true
            self.cachedFormatDesc = nil
            NSLog("[SegRec] Prepare")
        }
    }

    func start(path: String, width: Int, height: Int, fps: Int) {
        writerQueue.async { [weak self] in
            guard let self = self, !self.isRunning else { return }
            self._fps = fps
            self.isPreparing = false
            self.currentURL = URL(fileURLWithPath: path)
            self.pendingRotateURL = nil
            self.isRotating = false

            do {
                try self.openWriter(url: self.currentURL!, videoFormatDesc: self.cachedFormatDesc)
                self.isRunning = true
                NSLog("[SegRec] Started → \(path)")
            } catch {
                NSLog("[SegRec] start failed: \(error)")
            }
        }
        startAudioCapture()
    }

    func rotate(nextPath: String) {
        writerQueue.async { [weak self] in
            self?.pendingRotateURL = URL(fileURLWithPath: nextPath)
        }
    }

    func stop() {
        writerQueue.async { [weak self] in
            guard let self = self, self.isRunning else { return }
            self.isRunning = false
            self.isPreparing = false
            self.stopAudioCapture()
            self.finalizeCurrentWriter(isLastChunk: true) {
                self.onStopped?()
            }
        }
    }

    func appendSampleBuffer(_ sampleBuffer: CMSampleBuffer) {
        // Cache format desc during prepare phase
        if isPreparing && cachedFormatDesc == nil {
            writerQueue.async { [weak self] in
                guard let self = self, self.isPreparing, self.cachedFormatDesc == nil else { return }
                self.cachedFormatDesc = CMSampleBufferGetFormatDescription(sampleBuffer)
            }
        }
        guard isRunning else { return }
        writerQueue.sync { [weak self] in
            self?.handleVideoAppend(sampleBuffer)
        }
    }

    // ─── Audio capture ────────────────────────────────────────────────────────

    private func startAudioCapture() {
        let engine = AVAudioEngine()
        audioEngine = engine
        audioSampleTime = 0

        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playAndRecord,
                mode: .videoRecording,
                options: [.defaultToSpeaker, .allowBluetooth, .mixWithOthers]
            )
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            NSLog("[SegRec] AVAudioSession setup failed: \(error)")
        }

        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        let targetSampleRate: Double = 44100
        let targetFormat = AVAudioFormat(standardFormatWithSampleRate: targetSampleRate, channels: 1)!
        audioConverter = AVAudioConverter(from: inputFormat, to: targetFormat)

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: inputFormat) { [weak self] buffer, time in
            self?.handleAudioBuffer(buffer, time: time)
        }

        do {
            try engine.start()
            NSLog("[SegRec] Audio engine started (inputSR=\(inputFormat.sampleRate))")
        } catch {
            NSLog("[SegRec] Audio engine start failed: \(error)")
        }
    }

    private func stopAudioCapture() {
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine?.stop()
        audioEngine = nil
        audioConverter = nil
        NSLog("[SegRec] Audio engine stopped")
    }

    private func handleAudioBuffer(_ buffer: AVAudioPCMBuffer, time: AVAudioTime) {
        guard isRunning, let converter = audioConverter else { return }

        let targetFormat = converter.outputFormat
        let targetSampleRate = targetFormat.sampleRate
        let inputSampleRate = converter.inputFormat.sampleRate

        let frameCapacity = AVAudioFrameCount(
            Double(buffer.frameLength) * targetSampleRate / inputSampleRate + 1
        )
        guard let converted = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: frameCapacity) else { return }

        var inputConsumed = false
        let status = converter.convert(to: converted, error: nil) { _, outStatus in
            if inputConsumed { outStatus.pointee = .noDataNow; return nil }
            outStatus.pointee = .haveData
            inputConsumed = true
            return buffer
        }
        guard status != .error, converted.frameLength > 0 else { return }

        // Build presentation timestamp from running sample count
        let pts = CMTime(value: audioSampleTime, timescale: CMTimeScale(targetSampleRate))
        audioSampleTime += Int64(converted.frameLength)

        guard let cmBuf = makeCMSampleBuffer(from: converted, pts: pts) else { return }

        writerQueue.async { [weak self] in
            self?.handleAudioAppend(cmBuf)
        }
    }

    private func makeCMSampleBuffer(from pcmBuffer: AVAudioPCMBuffer, pts: CMTime) -> CMSampleBuffer? {
        guard let channelData = pcmBuffer.floatChannelData else { return nil }
        let frameLength = Int(pcmBuffer.frameLength)
        let byteCount = frameLength * MemoryLayout<Float>.size

        // Wrap the PCM data in a CMBlockBuffer
        var blockBuffer: CMBlockBuffer?
        var status = CMBlockBufferCreateWithMemoryBlock(
            allocator: kCFAllocatorDefault,
            memoryBlock: nil,
            blockLength: byteCount,
            blockAllocator: kCFAllocatorDefault,
            customBlockSource: nil,
            offsetToData: 0,
            dataLength: byteCount,
            flags: 0,
            blockBufferOut: &blockBuffer
        )
        guard status == noErr, let bb = blockBuffer else { return nil }
        CMBlockBufferReplaceDataBytes(with: channelData[0], blockBuffer: bb, offsetIntoDestination: 0, dataLength: byteCount)

        // Build format description
        var asbd = pcmBuffer.format.streamDescription.pointee
        var formatDesc: CMAudioFormatDescription?
        CMAudioFormatDescriptionCreate(
            allocator: kCFAllocatorDefault, asbd: &asbd,
            layoutSize: 0, layout: nil,
            magicCookieSize: 0, magicCookie: nil,
            extensions: nil, formatDescriptionOut: &formatDesc
        )
        guard let fmt = formatDesc else { return nil }

        let duration = CMTime(value: CMTimeValue(frameLength), timescale: CMTimeScale(pcmBuffer.format.sampleRate))
        var timingInfo = CMSampleTimingInfo(duration: duration, presentationTimeStamp: pts, decodeTimeStamp: .invalid)

        var sampleBuffer: CMSampleBuffer?
        status = CMSampleBufferCreate(
            allocator: kCFAllocatorDefault,
            dataBuffer: bb,
            dataReady: true,
            makeDataReadyCallback: nil,
            refcon: nil,
            formatDescription: fmt,
            sampleCount: CMItemCount(frameLength),
            sampleTimingEntryCount: 1,
            sampleTimingArray: &timingInfo,
            sampleSizeEntryCount: 0,
            sampleSizeArray: nil,
            sampleBufferOut: &sampleBuffer
        )
        guard status == noErr else { return nil }
        return sampleBuffer
    }

    // ─── Writer helpers ───────────────────────────────────────────────────────

    /// Opens a new AVAssetWriter and adds BOTH video and audio inputs before startWriting().
    private func openWriter(url: URL, videoFormatDesc: CMFormatDescription?) throws {
        try? FileManager.default.removeItem(at: url)
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )

        let w = try AVAssetWriter(outputURL: url, fileType: .mp4)

        // ── Audio input (always added before startWriting) ──────────────────
        let audioSettings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderBitRateKey: 128_000,
        ]
        let aInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
        aInput.expectsMediaDataInRealTime = true
        if w.canAdd(aInput) { w.add(aInput) } else { NSLog("[SegRec] canAdd(audioInput) false") }

        // ── Video input (added if format desc is known) ─────────────────────
        var vInput: AVAssetWriterInput?
        if let fmt = videoFormatDesc {
            vInput = makeVideoInput(formatDesc: fmt)
            if let vi = vInput, w.canAdd(vi) { w.add(vi) }
        }
        // If no format desc yet, video input is added lazily on first frame (before startWriting check)

        writer       = w
        audioInput   = aInput
        videoInput   = vInput
        sessionStarted = false

        // Start writing immediately so audio can flow in right away
        // (session anchor is set on first video frame via startSession)
        w.startWriting()
        NSLog("[SegRec] Writer opened — status: \(w.status.rawValue)")
    }

    private func makeVideoInput(formatDesc: CMFormatDescription) -> AVAssetWriterInput {
        let dims   = CMVideoFormatDescriptionGetDimensions(formatDesc)
        let width  = (Int(dims.width)  / 2) * 2
        let height = (Int(dims.height) / 2) * 2
        let settings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 16_000_000,
                AVVideoMaxKeyFrameIntervalKey: _fps,
            ] as [String: Any],
        ]
        let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings, sourceFormatHint: formatDesc)
        input.expectsMediaDataInRealTime = true
        input.transform = CGAffineTransform(rotationAngle: .pi / 2)
        return input
    }

    // ─── Video append ─────────────────────────────────────────────────────────

    private func handleVideoAppend(_ sampleBuffer: CMSampleBuffer) {
        guard isRunning, !isRotating, let writer = writer else { return }

        // Add video input lazily if not yet added (format desc wasn't available at openWriter time)
        if videoInput == nil, let fmt = CMSampleBufferGetFormatDescription(sampleBuffer) {
            cachedFormatDesc = fmt
            let vi = makeVideoInput(formatDesc: fmt)
            // Can only add before startWriting — if writer already started this will be false
            if writer.canAdd(vi) {
                writer.add(vi)
                videoInput = vi
            } else {
                NSLog("[SegRec] Cannot add video input after startWriting — reopen writer")
                // Reopen writer now that we have the format desc
                if let url = currentURL {
                    try? reopenWriter(url: url, videoFormatDesc: fmt)
                }
                return
            }
        }

        guard let input = videoInput else { return }
        let isSync = isSyncSample(sampleBuffer)

        // Pending rotation at a sync frame
        if isSync, let nextURL = pendingRotateURL {
            pendingRotateURL = nil
            isRotating = true

            let finishedURL = currentURL
            let oldVideoInput = input
            let oldAudioInput = audioInput
            let oldWriter    = writer

            do {
                try openWriter(url: nextURL, videoFormatDesc: cachedFormatDesc)
                currentURL = nextURL
                let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                self.writer?.startSession(atSourceTime: pts)
                sessionStarted = true
                videoInput?.append(sampleBuffer)
            } catch {
                NSLog("[SegRec] rotate openWriter failed: \(error)")
            }

            oldVideoInput.markAsFinished()
            oldAudioInput?.markAsFinished()
            oldWriter.finishWriting { [weak self] in
                NSLog("[SegRec] Chunk finalized: \(finishedURL?.path ?? "?")")
                if let path = finishedURL?.path { self?.onChunkReady?(path) }
            }
            isRotating = false
            return
        }

        guard writer.status == .writing else {
            NSLog("[SegRec] Writer not writing — status: \(writer.status.rawValue)")
            return
        }
        guard input.isReadyForMoreMediaData else { return }

        if !sessionStarted {
            let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
            writer.startSession(atSourceTime: pts)
            sessionStarted = true
        }

        if !input.append(sampleBuffer) {
            NSLog("[SegRec] Video append failed: \(writer.error?.localizedDescription ?? "?")")
        }
    }

    // ─── Audio append ─────────────────────────────────────────────────────────

    private func handleAudioAppend(_ sampleBuffer: CMSampleBuffer) {
        guard isRunning, !isRotating else { return }
        guard let writer = writer, writer.status == .writing else { return }
        guard let input = audioInput, input.isReadyForMoreMediaData else { return }
        guard sessionStarted else { return }   // don't write audio before video session is anchored

        if !input.append(sampleBuffer) {
            NSLog("[SegRec] Audio append failed: \(writer.error?.localizedDescription ?? "?")")
        }
    }

    // ─── Finalize ─────────────────────────────────────────────────────────────

    private func finalizeCurrentWriter(isLastChunk: Bool, completion: @escaping () -> Void) {
        guard let w = writer else { completion(); return }
        let url = currentURL
        videoInput?.markAsFinished()
        audioInput?.markAsFinished()
        w.finishWriting { [weak self] in
            if isLastChunk, let path = url?.path {
                NSLog("[SegRec] Last chunk: \(path)")
                self?.onChunkReady?(path)
            }
            self?.writer     = nil
            self?.videoInput = nil
            self?.audioInput = nil
            completion()
        }
    }

    private func reopenWriter(url: URL, videoFormatDesc: CMFormatDescription) throws {
        try openWriter(url: url, videoFormatDesc: videoFormatDesc)
        currentURL = url
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private func isSyncSample(_ sampleBuffer: CMSampleBuffer) -> Bool {
        guard let attachments = CMSampleBufferGetSampleAttachmentsArray(
            sampleBuffer, createIfNecessary: false) as? [[CFString: Any]],
              let first = attachments.first else { return true }
        return !(first[kCMSampleAttachmentKey_NotSync] as? Bool ?? false)
    }
}
