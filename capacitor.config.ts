import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finwise.app',
  appName: 'FinWise',
  server: {
    url: 'https://seuapp.com',
    cleartext: true,
  },
};

export default config;
