import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finwise.app',
  appName: 'FinWise',
  server: {
    url: 'https://finwise-io.vercel.app',
    cleartext: true,
  },
};

export default config;
