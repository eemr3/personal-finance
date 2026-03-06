import React from 'react';
import { Card, CardContent } from './Card';
import { formatBRL } from '../lib/format';

interface FinanceSummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  variant?: 'income' | 'expense' | 'balance';
  subtitle?: string;
}

export function FinanceSummaryCard({
  title,
  amount,
  icon,
  variant = 'balance',
  subtitle,
}: FinanceSummaryCardProps) {
  const variantStyles = {
    income: 'text-success',
    expense: 'text-danger',
    balance: 'text-foreground',
  };

  const bgStyles = {
    income: 'bg-success/10',
    expense: 'bg-danger/10',
    balance: 'bg-primary/10',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${bgStyles[variant]}`}
          >
            {icon}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h2 className={variantStyles[variant]}>R$ {formatBRL(amount)}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
