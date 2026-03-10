import {
  Briefcase,
  BrushCleaning,
  Car,
  Church,
  Computer,
  CreditCard,
  DollarSign,
  GraduationCap,
  HandCoins,
  Heart,
  Home as HomeIcon,
  Landmark,
  LucideIcon,
  Package,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';

export const categoryIcons: Record<string, LucideIcon> = {
  salary: Briefcase,
  freelance: TrendingUp,
  investment: TrendingUp,
  food: Utensils,
  education: GraduationCap,
  transport: Car,
  shopping: ShoppingBag,
  home: HomeIcon,
  bills: HandCoins,
  subscriptions: Smartphone,
  computer: Computer,
  health: Heart,
  other: Package,
  religious: Church,
  taxes: HandCoins,
  credit_card: CreditCard,
  supermarket: ShoppingCart,
  home_supplies: BrushCleaning,
  home_cleaning: Sparkles,
  utilities: Zap,
  insurance: Shield,
  debt: Wallet,
  savings: Landmark,
};

export const categoryLabels: Record<string, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  food: 'Alimentação',
  transport: 'Transporte',
  shopping: 'Compras',
  home: 'Casa',
  bills: 'Contas',
  subscription: 'Assinaturas',
  health: 'Saúde',
  other: 'Outros',
};

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className = '' }: CategoryIconProps) {
  const Icon = categoryIcons[category] || DollarSign;
  return <Icon className={className} />;
}
