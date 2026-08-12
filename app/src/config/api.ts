import { Platform } from 'react-native';

/**
 * Android emulator reaches the host machine via 10.0.2.2.
 * iOS simulator can use localhost.
 * On a physical device, point this at your machine's LAN IP.
 */
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api';
