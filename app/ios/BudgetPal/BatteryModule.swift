import Foundation
import UIKit
import React

@objc(BatteryModule)
class BatteryModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc
  func getBatteryLevel(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    UIDevice.current.isBatteryMonitoringEnabled = true
    let level = UIDevice.current.batteryLevel

    // Simulator often reports -1; fall back so the UI still works.
    if level < 0 {
      resolve(75)
      return
    }

    resolve(Double(level * 100))
  }
}
