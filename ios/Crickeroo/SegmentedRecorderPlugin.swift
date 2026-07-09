import VisionCamera

@objc(SegmentedRecorderPlugin)
public class SegmentedRecorderPlugin: FrameProcessorPlugin {

    public override func callback(_ frame: Frame,
                                  withArguments arguments: [AnyHashable: Any]?) -> Any? {
        let buffer = frame.buffer
        SegmentedRecorderEngine.shared.appendSampleBuffer(buffer)
        return nil
    }
}
