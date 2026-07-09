package com.athmech.crickroo

import android.app.Application
import com.athmech.crickroo.camera2.Camera2Package
import com.athmech.crickroo.segmentedrec.SegmentedRecorderPackage
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(SegmentedRecorderPackage())
          add(Camera2Package())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    SegmentedRecorderPackage.registerPlugin()
    loadReactNative(this)
  }
}
