package com.athmech.crickroo.segmentedrec

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class SegmentedRecorderPackage : TurboReactPackage() {

    companion object {
        fun registerPlugin() {
            FrameProcessorPluginRegistry.addFrameProcessorPlugin("segmentedRecorder") { _, _ ->
                SegmentedRecorderPlugin()
            }
        }
    }

    override fun getModule(name: String, context: ReactApplicationContext): NativeModule? =
        if (name == SegmentedRecorderModule.NAME) SegmentedRecorderModule(context) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
        mapOf(
            SegmentedRecorderModule.NAME to ReactModuleInfo(
                SegmentedRecorderModule.NAME,
                SegmentedRecorderModule::class.java.name,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // isCxxModule
                false,  // isTurboModule 
            )
        )
    }

    override fun createViewManagers(context: ReactApplicationContext) =
        emptyList<ViewManager<*, *>>()
}
