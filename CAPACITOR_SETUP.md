# Configuração Capacitor - FinWise

## O que foi corrigido

### 1. Login com Google (tela em branco / Firebase auth handler)
- **Problema**: Fluxo web (Chrome Custom Tab) ficava preso em `firebaseapp.com/__/auth/handler`
- **Solução**: Plugin `@codetrix-studio/capacitor-google-auth` com fluxo **100% nativo**
- Não abre browser nem passa pelo Firebase auth handler

### 2. Splash e Ícone
- **Problema**: App usava splash e ícone padrão do Capacitor
- **Solução**: Geração de assets com `@capacitor/assets` a partir do logo do FinWise
- Ícones e splash customizados foram gerados em `android/app/src/main/res/`

---

## Passos obrigatórios para o Google Auth funcionar no Android

### 1. Adicionar `google-services.json`
Baixe o arquivo do [Firebase Console](https://console.firebase.google.com/) e coloque em:
```
android/app/google-services.json
```

### 2. Registrar o app Android no Firebase
1. No Firebase Console → Configurações do projeto → Seus apps
2. Clique em "Adicionar app" → Android
3. Package name: `com.finwise.app`
4. Baixe o `google-services.json` e coloque em `android/app/`

### 3. Adicionar SHA-1 no Firebase
Execute no terminal (na pasta `android`):
```bash
cd android
./gradlew signInReport
```
Copie o **SHA-1** (Debug e Release) e adicione em:
- Firebase Console → Configurações do projeto → Seus apps → Android → Adicionar impressão digital

### 4. Habilitar Google Sign-In
- Firebase Console → Authentication → Sign-in method → Google → Ativar

### 5. Web Client ID (obrigatório)
Adicione ao `.env.local`:
```
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-web-client-id.apps.googleusercontent.com
```
Encontre em: Firebase Console → Configurações do projeto → Seus apps → Web → Web client ID

Ou edite `android/app/src/main/res/values/strings.xml` e substitua `server_client_id` pelo seu Web Client ID.

### 6. Tela de consentimento OAuth (se aparecer tela em branco)
Se após escolher a conta Google aparecer tela em branco ou "Um momento...":
- [Google Cloud Console](https://console.cloud.google.com/) → APIs e Serviços → Tela de consentimento OAuth
- Altere de "Interno" para **"Externo"** (publique, mesmo sem verificação)
- Alguns dispositivos exigem que a tela esteja publicada

---

## Comandos úteis

```bash
# Build e sync
npm run build
npx cap sync android

# Regenerar ícones/splash (se alterar assets/logo.png)
npm run cap:assets

# Abrir no Android Studio
npx cap open android
```

---

## Estrutura de assets

Para alterar o ícone ou splash no futuro:
- Edite ou substitua `assets/logo.png` (mínimo 1024x1024px)
- Execute: `npm run cap:assets`
