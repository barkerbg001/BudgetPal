import { NativeModules } from 'react-native';

type BatteryNativeModule = {
  getBatteryLevel: () => Promise<number>;
};

const LINKING_ERROR =
  "BatteryModule native module is not linked. Rebuild the app after adding the native code.";

const NativeBattery = NativeModules.BatteryModule as
  | BatteryNativeModule
  | undefined;

/**
 * Reads device battery level (0–100) via the custom native module.
 * Falls back to 75 when unavailable (tests / missing link / simulator quirks).
 */
export async function getBatteryLevel(): Promise<number> {
  if (!NativeBattery?.getBatteryLevel) {
    if (__DEV__) {
      console.warn(LINKING_ERROR);
    }
    return 75;
  }

  try {
    const level = await NativeBattery.getBatteryLevel();
    if (!Number.isFinite(level)) {
      return 75;
    }
    return Math.max(0, Math.min(100, Math.round(level)));
  } catch (error) {
    console.warn('getBatteryLevel failed', error);
    return 75;
  }
}
