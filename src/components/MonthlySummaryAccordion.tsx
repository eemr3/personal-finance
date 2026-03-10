'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatCurrency, type FormatCurrencyCode } from '@/lib/format';
import { Lightbulb, TrendingDown } from 'lucide-react';

export type MonthlySummaryAccordionProps = {
  /** Nome do mês (ex: "Março") */
  monthName: string;
  currentYear: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  /** Código da moeda para formatação */
  currency: FormatCurrencyCode;
  /** Texto do resumo gerado pela IA (quando existir) */
  resumo?: string;
  /** Texto "maior gasto" gerado pela IA */
  maiorGasto?: string;
  /** Dica gerada pela IA */
  dica?: string;
  /** Rótulos para i18n (opcional) */
  labelMonthSummary?: string;
  labelBiggestExpense?: string;
  labelTip?: string;
  /** Se true, o acordeão inicia aberto */
  defaultOpen?: boolean;
};

export function MonthlySummaryAccordion({
  monthName,
  currentYear,
  monthlyIncome,
  monthlyExpense,
  monthlyBalance,
  currency,
  resumo,
  maiorGasto,
  dica,
  labelMonthSummary = 'Resumo do mês',
  labelBiggestExpense = 'Maior gasto',
  labelTip = 'Dica',
  defaultOpen = false,
}: MonthlySummaryAccordionProps) {
  const balanceStatus =
    monthlyBalance >= 0 ? 'positivo' : 'negativo';

  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={defaultOpen ? 'monthly-summary' : undefined}
      >
        <AccordionItem value="monthly-summary" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:bg-white/5 transition-colors data-[state=open]:border-b data-[state=open]:border-white/5">
            <span className="text-base font-semibold">{labelMonthSummary}</span>
          </AccordionTrigger>

          <AccordionContent className="px-6">
            <div className="space-y-5 pb-2">
              {/* Resumo: usa texto da IA quando existir, senão parágrafo estático */}
              <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 space-y-3">
                {resumo ? (
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {resumo}
                  </p>
                ) : (
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Em{' '}
                    <span className="capitalize font-semibold">{monthName}</span>{' '}
                    de {currentYear}, sua renda total foi de{' '}
                    <span className="font-bold text-primary">
                      {formatCurrency(monthlyIncome, currency)}
                    </span>
                    . Seus gastos somaram{' '}
                    <span className="font-bold text-destructive">
                      {formatCurrency(monthlyExpense, currency)}
                    </span>
                    . Isso resultou em um saldo{' '}
                    <span className="font-semibold">{balanceStatus}</span> de{' '}
                    <span
                      className={`font-bold ${
                        monthlyBalance >= 0 ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {formatCurrency(Math.abs(monthlyBalance), currency)}
                    </span>
                    .
                  </p>
                )}
              </div>

              {/* Maior gasto (texto da IA) */}
              {maiorGasto && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-destructive shrink-0" />
                    <h4 className="font-semibold text-sm">{labelBiggestExpense}</h4>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">
                    {maiorGasto}
                  </p>
                </div>
              )}

              {/* Dica (texto da IA) */}
              {dica && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                    <h4 className="font-semibold text-sm">{labelTip}</h4>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">
                    {dica}
                  </p>
                </div>
              )}

            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
