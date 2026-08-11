package com.budgetpal.app

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "BatteryModule"

  @ReactMethod
  fun getBatteryLevel(promise: Promise) {
    try {
      val manager =
        reactContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager

      val capacity =
        manager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)

      if (capacity != null && capacity in 0..100) {
        promise.resolve(capacity.toDouble())
        return
      }

      // Fallback for older APIs / emulator edge cases.
      val intent =
        reactContext.registerReceiver(
          null,
          IntentFilter(Intent.ACTION_BATTERY_CHANGED),
        )
      val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
      val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

      if (level >= 0 && scale > 0) {
        promise.resolve(level * 100.0 / scale)
        return
      }

      promise.resolve(75.0)
    } catch (error: Exception) {
      promise.reject("BATTERY_ERROR", error.message, error)
    }
  }
}
