import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FloatingActionButton({ onClick, icon }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-40"
    >
      {icon || <Plus size={24} />}
    </button>
  );
}
