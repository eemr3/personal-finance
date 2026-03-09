/// <reference types="@capacitor-firebase/authentication" />

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finwise.app',
  appName: 'FinWise',
  webDir: 'www',
  // Remova a propriedade 'server' para produção ou comente-a
  /* server: {
    url: 'https://finwise-io.vercel.app',
    cleartext: false,
  }, */
  android: {
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
    },
  },
};
