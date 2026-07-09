#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import "Crickeroo-Swift.h"

// Registers the Swift class as a VisionCamera Frame Processor Plugin
// named "segmentedRecorder" – must match the name used in JS useFrameProcessorPlugin().
VISION_EXPORT_SWIFT_FRAME_PROCESSOR(SegmentedRecorderPlugin, segmentedRecorder)
