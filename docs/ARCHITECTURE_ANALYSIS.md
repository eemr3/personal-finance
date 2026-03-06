# Análise de Arquitetura — App de Finanças Pessoais

**Autor:** Análise como Arquiteto de Software Sênior  
**Data:** Março 2026  
**Objetivo:** Documentar lacunas, melhorias e roadmap para evolução do produto.

---

## 1. Contexto Atual

O app é uma aplicação de finanças pessoais em Next.js 16 + Firebase (Auth + Firestore). Possui:

- **Transações manuais:** receitas e despesas criadas pelo usuário
- **Regras de despesas fixas:** valores fixos ou percentuais sobre receita (calculados em memória)
- **Dashboard:** saldo, cards de receitas/despesas, gráficos mensais e por categoria, transações recentes

---

## 2. Problema Central: Período e Sazonalidade

### 2.1 Situação Atual

- **Todas as telas usam o conjunto completo de transações**, sem filtro por período.
- O dashboard exibe "Este mês" nos cards, mas os totais incluem **todas** as transações históricas.
- O gráfico de gastos mensais agrupa por mês, mas a base de dados não é filtrada — apenas a visualização agrupa.
- Regras de despesas fixas são aplicadas sobre o **total de receitas de todos os tempos**, não do mês selecionado.

### 2.2 Impacto

| Cenário | Comportamento Atual | Comportamento Esperado |
|---------|---------------------|------------------------|
| Usuário tem R$ 50k de receita histórica e R$ 2k no mês atual | Saldo e despesas projetadas usam R$ 50k | Usar R$ 2k para o mês atual |
| Comparar março vs abril | Impossível | Seletor de mês/ano |
| Planejamento mensal | Inviável | Ver receitas e despesas do mês em foco |
| Regras percentuais (ex: 10% dízimo) | 10% sobre receita total | 10% sobre receita do mês |

### 2.3 Direção de Solução

1. **Introduzir conceito de período em toda a aplicação**
   - Parâmetro global ou contexto: `{ month, year }` (ex: `{ month: 3, year: 2026 }`)
   - Padrão: mês atual
   - Persistir em URL ou estado global (ex: `?month=3&year=2026`)

2. **Filtrar transações por data efetiva**
   - Transação tem `date` (data da operação) e `createdAt` (quando foi cadastrada)
   - Usar `date` para filtrar por período
   - Queries Firestore: `where('date', '>=', inicioMes)`, `where('date', '<=', fimMes)`
   - Índice composto: `(userId, date)` ou `(userId, date, type)`

3. **Recalcular regras por período**
   - `totalIncome` = soma de receitas do período selecionado
   - `projectedExpenses` = `calculateExpensesFromRules(rules, totalIncomeDoPeriodo)`

4. **UI de seleção de período**
   - Seletor de mês/ano no header do dashboard e da lista de transações
   - Navegação anterior/próximo mês
   - Opção "Todos" para visão histórica (opcional)

---

## 3. Multi-tenancy e Segurança

### 3.1 Lacuna Crítica

- **Nenhuma coleção filtra por usuário.** Todas as queries retornam dados de todos os usuários.
- `transactions` e `fixedExpenseRules` não possuem campo `userId`.
- Qualquer usuário autenticado vê e altera dados de outros.

### 3.2 Ações Necessárias

1. **Adicionar `userId` em todas as coleções**
   - Ao criar transação: `{ ...data, userId: user.uid }`
   - Ao criar/atualizar regra: `{ ...rule, userId: user.uid }`

2. **Filtrar todas as queries por `userId`**
   - `where('userId', '==', user.uid)`
   - Combinar com filtros de período quando aplicável

3. **Regras de segurança Firestore**
   - Garantir que `request.auth.uid == resource.data.userId` em read/write
   - Criar índices compostos: `(userId, createdAt)`, `(userId, date)`

4. **Migração de dados existentes**
   - Script para popular `userId` em documentos antigos (se houver dados de produção)

---

## 4. CRUD de Transações Incompleto

### 4.1 Estado Atual

| Operação | Status |
|----------|--------|
| Criar | ✅ |
| Listar | ✅ |
| Editar | ❌ |
| Excluir | ❌ |

### 4.2 Impacto

- Usuário não consegue corrigir erros de digitação ou valores.
- Não há como remover transações duplicadas ou incorretas.
- Experiência fica limitada para uso real.

### 4.3 Recomendação

- Implementar edição e exclusão na tela de transações.
- Opções: swipe para deletar, menu de contexto, ou tela de detalhes com ações.
- Manter `userId` e validação de ownership em update/delete.

---

## 5. Modelo de Dados e Regras

### 5.1 Campo `date` vs `createdAt`

- `date`: data efetiva da transação (ex: dia do pagamento)
- `createdAt`: quando foi cadastrada no sistema
- Para filtros por período, **`date`** deve ser a referência.
- Garantir que o formulário sempre preencha `date` (hoje por padrão).

### 5.2 Regras de Despesas Fixas

- **`condition`** existe no modelo mas não é usada na lógica.
- Possíveis evoluções:
  - Condições por valor mínimo de receita (ex: "aplicar só se receita > R$ 3.000")
  - Condições por dia do mês (ex: "dia 20")
  - Condições por categoria de receita
- Por ora, manter simples; documentar `condition` como texto livre até haver engine de condições.

### 5.3 Consistência de Categorias

- Categorias são strings livres em transações e regras.
- Sugestão futura: entidade `Category` ou lista padronizada por usuário para relatórios consistentes.

---

## 6. Proteção de Rotas e UX

### 6.1 Rotas Protegidas

- Não há middleware de autenticação.
- Proteção feita apenas em componentes (ex: `if (!user) return ...`).
- Usuário não logado pode acessar URLs como `/dashboard` e ver mensagem genérica.

### 6.2 Recomendações

- Middleware Next.js para redirecionar não autenticados para `/login`.
- Loading state consistente durante verificação de auth.
- Tratamento de erro de rede/Firebase (retry, mensagem amigável).

---

## 7. Melhorias Adicionais (Visão de Produto)

### 7.1 Prioridade Alta

| Item | Descrição |
|------|-----------|
| Filtro por período | Seletor de mês/ano; recalcular totais e regras por período |
| Multi-tenancy | `userId` em todas as coleções e queries |
| Editar/Excluir transações | CRUD completo |
| Regras Firestore | Garantir segurança por `userId` |

### 7.2 Prioridade Média

| Item | Descrição |
|------|-----------|
| Orçamento mensal | Meta de gastos por mês; alerta ao ultrapassar |
| Exportação | CSV/PDF para declaração de IR ou análise externa |
| Gráficos vazios | Placeholder quando não há dados no período |
| Recorrência real | Transações que se repetem (ex: assinatura mensal) sem depender só de regras |

### 7.3 Prioridade Baixa / Futuro

| Item | Descrição |
|------|-----------|
| Múltiplas contas/carteiras | Conta corrente, poupança, investimentos |
| Conciliação bancária | Importar extrato e reconciliar com transações manuais |
| Metas de economia | Objetivos com prazo e acompanhamento |
| Notificações | Lembretes de vencimento, resumo semanal |
| Modo offline | PWA com sync quando online |
| Engine de condições nas regras | Usar o campo `condition` de forma estruturada |

---

## 8. Resumo Executivo

O app tem base sólida (stack moderna, modelo de regras flexível), mas precisa de ajustes críticos para uso real:

1. **Período:** Toda a lógica deve considerar mês/ano selecionado; hoje tudo é "sempre".
2. **Segurança:** Isolamento por usuário é obrigatório antes de qualquer deploy compartilhado.
3. **CRUD:** Edição e exclusão de transações são esperadas pelo usuário.
4. **Proteção:** Middleware de auth e tratamento de erros melhoram confiabilidade e UX.

A ordem sugerida de implementação: **multi-tenancy** → **filtro por período** → **CRUD completo** → demais melhorias.

---

## 9. Implementação Realizada (Março 2026)

### 9.1 Multi-tenancy
- Campo `userId` adicionado em `transactions` e `fixedExpenseRules`
- Queries filtradas por `where('userId', '==', user.uid)`
- Regras Firestore em `firestore.rules` e índices em `firestore.indexes.json`
- **Migração:** Documentos antigos sem `userId` precisam ser atualizados manualmente ou via script

### 9.2 Filtro por período
- `PeriodContext` e `usePeriod` para mês/ano selecionado
- `PeriodSelector` no dashboard e na lista de transações
- `getTransactions(userId, period)` filtra por `date` no Firestore
- Regras recalculadas com base na receita do período

### 9.3 CRUD completo
- `updateTransaction` e `deleteTransaction` no service
- `editTransaction` e `removeTransaction` no hook
- Página `/transactions/[id]/edit` para edição
- Menu de contexto no `TransactionCard` (Editar/Excluir) para transações manuais

### 9.4 Deploy Firestore
Para aplicar regras e índices:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```
