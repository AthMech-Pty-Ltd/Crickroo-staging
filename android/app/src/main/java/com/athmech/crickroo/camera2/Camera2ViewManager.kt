package com.athmech.crickroo.camera2

import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.TextureView
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class Camera2ViewManager : SimpleViewManager<TextureView>() {

    override fun getName() = "Camera2View"

    override fun createViewInstance(reactContext: ThemedReactContext): TextureView {
        val tv = TextureView(reactContext)
        tv.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
            override fun onSurfaceTextureAvailable(st: SurfaceTexture, w: Int, h: Int) {
                Camera2Manager.open(
                    context = reactContext,
                    reactCtx = reactContext,
                    previewSurface = Surface(st),
                    surfaceTexture = st,
                )
            }
            override fun onSurfaceTextureSizeChanged(st: SurfaceTexture, w: Int, h: Int) {}
            override fun onSurfaceTextureDestroyed(st: SurfaceTexture): Boolean {
                Camera2Manager.close()
                return true
            }
            override fun onSurfaceTextureUpdated(st: SurfaceTexture) {}
        }
        return tv
    }
}
