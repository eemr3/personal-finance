import { Capacitor } from '@capacitor/core';

export function getApiUrl() {
  if (Capacitor.isNativePlatform()) {
    return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}
