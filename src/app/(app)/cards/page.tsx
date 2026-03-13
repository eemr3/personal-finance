'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowDownRight, CreditCard } from 'lucide-react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MonthSelector } from '@/components/layout';
import { TransactionCard } from '@/features/transactions/components/TransactionCard';
import { useCardSpendingByMonth } from '@/features/transactions/hooks/useCardSpendingByMonth';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useFormatDate } from '@/hooks/useFormatDate';

const CARD_LABEL_KEYS: Record<string, string> = {
  credit_personal: 'cards.creditPersonal',
  credit_business: 'cards.creditBusiness',
};

/* ─── Carbon styles ────────────────────────────────────────────────────────
   Pessoal  → grafite frio  (reflexo azul-aço)
   Empresarial → grafite quente (reflexo bronze-champagne)
   FIX: glow removido; border-radius reduzido para 1.5rem (mais premium)
─────────────────────────────────────────────────────────────────────────── */
const CARD_STYLES: Record<string, React.CSSProperties> = {
  credit_personal: {
    background: `
      radial-gradient(ellipse 70% 60% at 15% 25%, rgba(100,120,160,0.14) 0%, transparent 55%),
      linear-gradient(160deg, #252628 0%, #1a1b1d 35%, #141516 60%, #111213 100%)
    `,
    boxShadow: `
      0 2px 0 rgba(255,255,255,0.07) inset,
      0 -1px 0 rgba(0,0,0,0.9) inset,
      0 16px 48px rgba(0,0,0,0.55)
    `,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  credit_business: {
    background: `
      radial-gradient(ellipse 70% 60% at 15% 25%, rgba(160,140,90,0.13) 0%, transparent 55%),
      linear-gradient(160deg, #242219 0%, #1a1915 35%, #141310 60%, #111009 100%)
    `,
    boxShadow: `
      0 2px 0 rgba(255,255,255,0.06) inset,
      0 -1px 0 rgba(0,0,0,0.9) inset,
      0 16px 48px rgba(0,0,0,0.55)
    `,
    borderColor: 'rgba(255,255,255,0.06)',
  },
};

/* Cores do chip EMV por tipo */
const CHIP_GRADIENT: Record<string, string> = {
  credit_personal:
    'linear-gradient(135deg, #8a9ab8 0%, #6a7a98 40%, #9aaac8 70%, #7a8aac 100%)',
  credit_business:
    'linear-gradient(135deg, #b8a070 0%, #988050 40%, #c8b080 70%, #a89060 100%)',
};

/* Aresta de luz no topo do card */
const EDGE_GRADIENT: Record<string, string> = {
  credit_personal:
    'linear-gradient(90deg, transparent 5%, rgba(200,210,225,0.25) 30%, rgba(220,228,240,0.40) 50%, rgba(200,210,225,0.25) 70%, transparent 95%)',
  credit_business:
    'linear-gradient(90deg, transparent 5%, rgba(200,190,155,0.22) 30%, rgba(215,205,165,0.35) 50%, rgba(200,190,155,0.22) 70%, transparent 95%)',
};

/* Cores semânticas por tipo de cartão */
const CARD_TOKENS: Record<
  string,
  {
    label: string; // label topo e metadados chave
    dot: string; // pontinho indicador
    cardName: string; // nome do cartão
    metaVal: string; // valores dos metadados
    watermark: string; // "Carbon" watermark
  }
> = {
  credit_personal: {
    label: 'rgba(170,188,218,0.52)',
    dot: 'rgba(150,175,225,0.65)',
    cardName: 'rgba(210,220,238,0.78)',
    metaVal: 'rgba(200,215,240,0.85)',
    watermark: 'rgba(180,195,220,0.13)',
  },
  credit_business: {
    label: 'rgba(210,190,140,0.48)',
    dot: 'rgba(200,170,100,0.65)',
    cardName: 'rgba(225,210,170,0.75)',
    metaVal: 'rgba(220,205,160,0.85)',
    watermark: 'rgba(200,185,140,0.13)',
  },
};

/* ─── Lista de cartões ─────────────────────────────────────────────────────
   FIX: avatar herda identidade do cartão (azul-aço vs dourado), não mais verde
─────────────────────────────────────────────────────────────────────────── */
const CARD_LIST_ACTIVE: Record<
  string,
  { border: string; bg: string; avatar: string }
> = {
  credit_personal: {
    border: 'border-[rgba(140,160,210,0.25)]',
    bg: 'bg-[#18191c]',
    avatar: 'bg-[rgba(130,155,205,0.15)] text-[#9ab0d8]',
  },
  credit_business: {
    border: 'border-[rgba(180,155,90,0.22)]',
    bg: 'bg-[#191712]',
    avatar: 'bg-[rgba(180,155,90,0.15)] text-[#c8a860]',
  },
};

export default function CardsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();
  const { formatDate } = useFormatDate();
  const { cards, totalIncome, loading, removeTransaction } =
    useCardSpendingByMonth();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  const hasCards = cards.length > 0;
  const selectedCard = hasCards
    ? cards[Math.min(selectedIndex, cards.length - 1)]
    : undefined;

  const pctOfIncome = (total: number) =>
    totalIncome > 0 ? ((total / totalIncome) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-32">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {t('cards.title')}
        </h1>
        <p className="text-muted-foreground text-sm">{t('cards.subtitle')}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonthSelector />
      </div>

      {/* ── Card hero ──────────────────────────────────────────────────────── */}
      {hasCards &&
        selectedCard &&
        (() => {
          const pm = selectedCard.paymentMethod;
          const tokens = CARD_TOKENS[pm] ?? CARD_TOKENS.credit_personal;

          return (
            <section className="relative">
              {/* FIX: glow neutro grafite — não usa mais a cor primária verde */}
              <div
                className="absolute inset-[-8px] rounded-[2.5rem] pointer-events-none"
                style={{
                  background:
                    pm === 'credit_personal'
                      ? 'radial-gradient(ellipse at 40% 60%, rgba(100,115,150,0.18) 0%, transparent 70%)'
                      : 'radial-gradient(ellipse at 40% 60%, rgba(140,120,70,0.16) 0%, transparent 70%)',
                  filter: 'blur(28px)',
                }}
              />

              {/* Card — FIX: border-radius reduzido para 1.5rem (mais premium) */}
              <div
                className="relative rounded-3xl border overflow-hidden"
                style={CARD_STYLES[pm] ?? CARD_STYLES.credit_personal}
              >
                {/* Textura escovada horizontal */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                    0deg,
                    rgba(255,255,255,0.016) 0px,
                    rgba(255,255,255,0.016) 1px,
                    transparent 1px,
                    transparent 3px
                  )`,
                  }}
                />

                {/* Sweep de reflexo diagonal */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(
                    118deg,
                    transparent 28%,
                    rgba(255,255,255,0.025) 44%,
                    rgba(255,255,255,0.06) 50%,
                    rgba(255,255,255,0.025) 56%,
                    transparent 72%
                  )`,
                  }}
                />

                {/* Aresta de luz no topo */}
                <div
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{
                    background:
                      EDGE_GRADIENT[pm] ?? EDGE_GRADIENT.credit_personal,
                  }}
                />

                {/* ── Conteúdo ── */}
                {/* FIX: padding vertical aumentado para mais respiro (py-9) */}
                <div className="relative px-8 py-9">
                  {/* Chip EMV */}
                  <div
                    aria-hidden
                    className="absolute top-7 right-7 w-8 h-6 rounded overflow-hidden"
                    style={{
                      background:
                        CHIP_GRADIENT[pm] ?? CHIP_GRADIENT.credit_personal,
                      boxShadow:
                        '0 1px 4px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
                    }}
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-black/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black/20" />
                  </div>

                  {/* Watermark "Carbon" */}
                  <span
                    aria-hidden
                    className="absolute bottom-6 right-7 text-[9px] font-semibold tracking-[0.36em] uppercase pointer-events-none select-none"
                    style={{ color: tokens.watermark }}
                  >
                    Carbon
                  </span>

                  {/* Label topo */}
                  <span
                    className="text-[10px] font-medium tracking-[0.14em] uppercase flex items-center gap-1.5 mb-5"
                    style={{ color: tokens.label }}
                  >
                    <span
                      className="w-[5px] h-[5px] rounded-full shrink-0"
                      style={{ background: tokens.dot }}
                    />
                    <CreditCard className="w-3.5 h-3.5" />
                    {t('cards.totalMonth')}
                  </span>

                  {/* Nome do cartão */}
                  {/* FIX: espaçamento mb-3 aumentado para respirar antes do valor */}
                  <h2
                    className="text-sm font-normal tracking-wide mb-3"
                    style={{ color: tokens.cardName }}
                  >
                    {t(
                      CARD_LABEL_KEYS[pm] ??
                        `transactions.paymentMethods.${pm}`,
                    )}
                  </h2>

                  {/* Valor — FIX: tracking menos apertado, mais legível */}
                  <p className="text-[2.6rem] font-bold leading-none tracking-[-0.02em] text-white/95 mb-5">
                    {formatCurrency(selectedCard.total)}
                  </p>

                  {/* Metadados */}
                  <div className="flex gap-6">
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[9px] tracking-widest uppercase"
                        style={{ color: tokens.label }}
                      >
                        {t('cards.ofIncome')}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: tokens.metaVal }}
                      >
                        {pctOfIncome(selectedCard.total)}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[9px] tracking-widest uppercase"
                        style={{ color: tokens.label }}
                      >
                        {t('cards.transactions')}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: tokens.metaVal }}
                      >
                        {selectedCard.transactions.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

      {/* ── Seções inferiores ──────────────────────────────────────────────── */}
      <div className="space-y-6">
        {!hasCards ? (
          <div className="rounded-3xl border border-border border-dashed bg-card/60 px-6 py-12 text-center">
            <CreditCard
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
            />
            <p className="text-muted-foreground">{t('cards.noCardExpenses')}</p>
          </div>
        ) : (
          <>
            {/* Lista de cartões */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {t('cards.allCards')}
              </h3>
              <div className="space-y-2">
                {cards.map((card, index) => {
                  const isActive =
                    selectedCard?.paymentMethod === card.paymentMethod;
                  const pm = card.paymentMethod;
                  /* FIX: avatar usa identidade do cartão, não a cor primária */
                  const active =
                    CARD_LIST_ACTIVE[pm] ?? CARD_LIST_ACTIVE.credit_personal;

                  return (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                        isActive
                          ? `${active.border} ${active.bg}`
                          : 'border-border bg-card hover:bg-accent/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                            isActive
                              ? active.avatar
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {pm === 'credit_personal' ? 'P' : 'E'}
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {t(
                              CARD_LABEL_KEYS[pm] ??
                                `transactions.paymentMethods.${pm}`,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pctOfIncome(card.total)}% {t('cards.ofIncome')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(card.total)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Atividade recente */}
            {selectedCard && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {t('cards.recentActivity')}
                </h3>
                <div className="space-y-2">
                  {selectedCard.transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-2xl bg-card border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
                          <ArrowDownRight size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[160px]">
                            {tx.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.date)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-danger">
                        -{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Lista completa */}
            {selectedCard && (
              <section className="space-y-2">
                {selectedCard.transactions.map((tx) => (
                  <TransactionCard
                    key={`${tx.id}-full`}
                    id={tx.id}
                    type="expense"
                    name={tx.name}
                    amount={tx.amount}
                    category={tx.category}
                    paymentMethod={
                      tx.paymentMethod ?? selectedCard.paymentMethod
                    }
                    date={tx.date}
                    source={tx.source}
                    onEdit={
                      tx.source !== 'rule'
                        ? () => router.push(`/transactions/edit?id=${tx.id}`)
                        : undefined
                    }
                    onDelete={
                      tx.source !== 'rule' && tx.id
                        ? () => {
                            setTransactionToDelete(tx.id);
                            setDeleteConfirmOpen(true);
                          }
                        : undefined
                    }
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('common.confirmDelete')}
        description={t('transactions.deleteTransactionConfirm')}
        onConfirm={() => {
          if (transactionToDelete) {
            removeTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
        variant="destructive"
      />
    </div>
  );
}
