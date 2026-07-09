#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Exposes the Swift SegmentedRecorderModule to React Native.
@interface RCT_EXTERN_REMAP_MODULE(SegmentedRecorder, SegmentedRecorderModule, RCTEventEmitter)

RCT_EXTERN_METHOD(prepare:(nonnull NSNumber *)width
                  height:(nonnull NSNumber *)height
                  fps:(nonnull NSNumber *)fps
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(start:(NSString *)path
                  width:(nonnull NSNumber *)width
                  height:(nonnull NSNumber *)height
                  fps:(nonnull NSNumber *)fps
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(rotate:(NSString *)nextPath
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
