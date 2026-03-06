import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionCardProps {
  id: string;
  type: 'income' | 'expense';
  name: string;
  amount: number;
  category: string;
  date: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function TransactionCard({
  type,
  name,
  amount,
  category,
  date,
  icon,
  onClick,
}: TransactionCardProps) {
  const isIncome = type === 'income';
  const amountColor = isIncome ? 'text-success' : 'text-danger';

  return (
    <div
      className="bg-card rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-success/10' : 'bg-danger/10'}`}>
        {icon || (isIncome ? (
          <ArrowDownRight className="text-success" size={24} />
        ) : (
          <ArrowUpRight className="text-danger" size={24} />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="truncate">{name}</h4>
        <p className="text-sm text-muted-foreground">{category}</p>
      </div>

      <div className="text-right">
        <p className={`font-medium ${amountColor}`}>
          {isIncome ? '+' : '-'}${amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
