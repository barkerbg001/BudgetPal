import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.budgetpal.app.auth';

export async function saveToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('jwt', token, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) {
    return null;
  }
  return credentials.password;
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
