import React from 'react';
import { Card } from './Card';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface RuleCardProps {
  id: string;
  name: string;
  condition: string;
  amount: string;
  category: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RuleCard({
  name,
  condition,
  amount,
  category,
  onEdit,
  onDelete,
}: RuleCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <Card className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-2">{name}</h4>
          <p className="text-sm text-muted-foreground mb-1">{condition}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
              {amount}
            </span>
            <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-lg text-sm">
              {category}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[150px] z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <Edit size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-danger/10 text-danger rounded-lg transition-colors text-left"
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
