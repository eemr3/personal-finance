import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Preferences } from '@capacitor/preferences';

const BIOMETRIC_SERVER = 'com.finwise.app';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_TOKEN_KEY = 'biometric_refresh_token';

// Verificar se biometria está disponível no dispositivo
export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

// Verificar se usuário já ativou biometria
export async function isBiometricEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
  return value === 'true';
}

// Salvar credenciais + refreshToken
export async function saveBiometricCredentials(
  uid: string,
  email: string,
  idToken: string, // ✅ adicionar
  accessToken: string, // ✅ adicionar
): Promise<void> {
  await NativeBiometric.setCredentials({
    username: email,
    password: uid,
    server: BIOMETRIC_SERVER,
  });
  // ✅ Salvar tokens para reautenticar
  await Preferences.set({
    key: BIOMETRIC_TOKEN_KEY,
    value: JSON.stringify({ idToken, accessToken }),
  });
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: 'true' });

  const check = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
  console.log('Biometric preference saved:', check.value);
}

// Recuperar tokens salvos
export async function getBiometricTokens(): Promise<{
  idToken: string;
  accessToken: string;
} | null> {
  const { value } = await Preferences.get({ key: BIOMETRIC_TOKEN_KEY });
  if (!value) return null;
  return JSON.parse(value);
}

// Autenticar com biometria e recuperar credenciais
export async function loginWithBiometric(): Promise<{ uid: string; email: string }> {
  // 1. Mostrar prompt de biometria
  await NativeBiometric.verifyIdentity({
    reason: 'Confirme sua identidade para entrar',
    title: 'Login com Biometria',
    subtitle: 'Use sua digital ou reconhecimento facial',
    negativeButtonText: 'Cancelar',
    maxAttempts: 3,
  });

  // 2. Recuperar credenciais salvas no Keystore
  const credentials = await NativeBiometric.getCredentials({
    server: BIOMETRIC_SERVER,
  });

  return {
    uid: credentials.password,
    email: credentials.username,
  };
}

// Desativar biometria
export async function disableBiometric(): Promise<void> {
  try {
    await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
  } catch {}
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: 'false' });
}
