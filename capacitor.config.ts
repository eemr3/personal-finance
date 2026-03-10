import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finwise.app',
  appName: 'FinWise',
  webDir: 'out', // ✅ era 'www', Next.js exporta para 'out'
  android: {
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    SocialLogin: {
      google: {
        webClientId:
          '580862513441-82oh923pftmlan6916pa3frskhlkam7m.apps.googleusercontent.com',
      },
    },
  },
};

export default config;
