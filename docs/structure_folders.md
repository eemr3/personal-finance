```plan text
src/
│
├── app/
│   ├── (auth)/              # grupo de rotas de autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (app)/               # área logada
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   │
│   │   ├── rules/
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
├── components/              # Componentes reutilizáveis
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   │
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── bottom-navigation.tsx
│   │
│   └── charts/
│       └── financial-chart.tsx
│
├── features/                # Domínios da aplicação
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── types.ts
│   │
│   ├── transactions/
│   │   ├── components/
│   │   │   └── transaction-item.tsx
│   │   ├── hooks/
│   │   │   └── useTransactions.ts
│   │   ├── services/
│   │   │   └── transaction.service.ts
│   │   └── types.ts
│   │
│   ├── rules/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── rule.service.ts
│   │   └── types.ts
│   │
│   └── fixed-expenses/
│       ├── components/
│       ├── services/
│       │   └── fixed-expense.service.ts
│       └── types.ts
│
├── lib/                     # integrações externas
│   ├── firebase/
│   │   ├── firebase-client.ts
│   │   ├── firebase-admin.ts
│   │   └── firestore.ts
│   │
│   └── utils/
│       ├── currency.ts
│       ├── date.ts
│       └── calculations.ts
│
├── hooks/                   # hooks globais
│   └── useUser.ts
│
├── store/                   # estado global
│   └── useAppStore.ts
│
├── types/                   # tipos globais
│   └── index.ts
│
└── config/                  # configurações
    └── app.config.ts
```
