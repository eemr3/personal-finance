# Personal Finance (PWA)

Aplicação de **controle financeiro pessoal** feita em **Next.js (App Router)**, com foco em **mobile/PWA**. Permite registrar transações, visualizar resumo por mês, gerenciar categorias e gerar um **resumo mensal automático com IA (Gemini)**.

## Funcionalidades

- **Autenticação**: login via **Firebase Auth**.
- **Transações**:
  - criar/editar/excluir
  - listagem e detalhes
  - suporte a categoria e forma de pagamento
- **Período (mês/ano)**: navegação por mês via `PeriodContext` (ex.: dashboard, histórico).
- **Regras de despesas fixas**: criação/remoção de regras (ex.: recorrências).
- **Resumo do mês com IA**:
  - botão para **gerar análise** do mês selecionado
  - cache por mês no `localStorage`
  - UI em formato de acordeão (sanfona)
- **i18n**: UI traduzida em **pt / en / es**.
- **PWA**: `next-pwa` com service worker e assets em `public/`.

## Stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **Firebase** (Auth + dados)
- **Gemini** (resumo mensal via API)
- **Radix/shadcn** (componentes base: dialog, accordion, etc.)

## Requisitos

- Node.js (LTS recomendado)
- npm (ou pnpm/yarn)

## Configuração

Crie um arquivo `.env.local` na raiz (não versionar) com:

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gemini (server)
GEMINI_API_KEY=...
```

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build e deploy (export estático)

Este projeto está configurado com `output: 'export'` no `next.config.ts`, ou seja, gera um build **estático**:

```bash
npm run build
```

Isso cria a pasta `out/` (site estático). Você pode servir localmente com qualquer servidor estático (ex.: `npx serve out`).

### Observação importante sobre a IA no modo export

A rota `src/app/api/ai/month-summary/route.ts` roda em **runtime Node.js** (precisa de servidor). Em deploy 100% estático (`output: 'export'`), rotas de API do Next **não ficam disponíveis**.

Opções:

- **Manter export estático** e mover a IA para um backend separado (Cloud Functions, etc.), chamando via HTTP.
- **Desativar `output: 'export'`** e fazer deploy em um ambiente com suporte a rotas server (serverless/Node).

#### Erro comum em produção / PWA

Se ao clicar em **“Gerar análise do mês”** você ver no console:

- `POST /api/ai/month-summary 404 (Not Found)`
- `Unexpected token '<', '<!DOCTYPE '... is not valid JSON`

significa que o app está rodando como **site estático** e a rota de API não existe em produção.

**Como corrigir (Vercel):**

1. Abra `next.config.ts`.
2. Remova ou comente a linha:
   ```ts
   output: 'export',
   ```
3. Faça um novo deploy no Vercel.
4. Depois do deploy, a chamada para `/api/ai/month-summary` deve responder 200 e o erro some no PWA/produção.

## Scripts úteis

- `npm run dev`: desenvolvimento
- `npm run build`: build (com export estático)
- `npm run lint`: lint
