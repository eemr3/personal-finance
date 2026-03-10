'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowDownRight, CreditCard } from 'lucide-react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { useCardSpendingByMonth } from '@/features/transactions/hooks/useCardSpendingByMonth';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useFormatDate } from '@/hooks/useFormatDate';

const CARD_LABEL_KEYS: Record<string, string> = {
  credit_personal: 'cards.creditPersonal',
  credit_business: 'cards.creditBusiness',
};

/* Mesmo gradiente do card de saldo – direção diferencia pessoal vs empresarial */
const CARD_GRADIENT_CLASSES: Record<string, string> = {
  credit_personal: 'bg-linear-to-br from-card to-card/50',
  credit_business: 'bg-linear-to-bl from-card to-card/50',
};

/* Lista de cartões – tom sutil alinhado ao gradiente */
const CARD_LIST_ACTIVE_CLASSES: Record<
  string,
  { border: string; bg: string; avatar: string }
> = {
  credit_personal: {
    border: 'border-white/10',
    bg: 'bg-card/80',
    avatar: 'bg-primary/20 text-primary',
  },
  credit_business: {
    border: 'border-white/10',
    bg: 'bg-card/80',
    avatar: 'bg-primary/20 text-primary',
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
    null
  );
  const hasCards = cards.length > 0;
  const selectedCard = hasCards ? cards[Math.min(selectedIndex, cards.length - 1)] : undefined;

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

      {hasCards && selectedCard && (
        <section className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-[3rem]" />
          <div
            className={`relative p-8 rounded-[2rem] ${CARD_GRADIENT_CLASSES[selectedCard.paymentMethod] ?? 'bg-linear-to-br from-card to-card/50'} border border-white/10 shadow-xl overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> {t('cards.totalMonth')}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {t(
                CARD_LABEL_KEYS[selectedCard.paymentMethod] ??
                  `transactions.paymentMethods.${selectedCard.paymentMethod}`,
              )}
            </h2>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(selectedCard.total)}
            </p>
            <p className="text-sm text-white/80 mt-2">
              {pctOfIncome(selectedCard.total)}% {t('cards.ofIncome')}
            </p>
            <p className="text-xs text-white/70 mt-1">
              {t('cards.transactionsCount', {
                count: selectedCard.transactions.length,
              })}
            </p>
          </div>
        </section>
      )}

      <div className="space-y-6">
        {!hasCards ? (
          <div className="rounded-3xl border border-border border-dashed bg-card/60 px-6 py-12 text-center">
            <CreditCard
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
            />
            <p className="text-muted-foreground">
              {t('cards.noCardExpenses')}
            </p>
          </div>
        ) : (
          <>
            {/* Lista de todos os cartões */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {t('cards.allCards')}
              </h3>
              <div className="space-y-2">
                {cards.map((card, index) => {
                  const isActive = selectedCard?.paymentMethod === card.paymentMethod;
                  const activeClasses =
                    CARD_LIST_ACTIVE_CLASSES[card.paymentMethod] ??
                    CARD_LIST_ACTIVE_CLASSES.credit_personal;
                  return (
                    <button
                      key={card.paymentMethod}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                        isActive
                          ? `${activeClasses.border} ${activeClasses.bg}`
                          : 'border-border bg-card hover:bg-accent/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                            isActive ? activeClasses.avatar : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {card.paymentMethod === 'credit_personal' ? 'P' : 'E'}
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {t(
                              CARD_LABEL_KEYS[card.paymentMethod] ??
                                `transactions.paymentMethods.${card.paymentMethod}`,
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

            {/* Atividade recente do cartão selecionado */}
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

            {/* Lista completa de transações (opcional, reaproveitando TransactionCard) */}
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
                    paymentMethod={tx.paymentMethod ?? selectedCard.paymentMethod}
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
