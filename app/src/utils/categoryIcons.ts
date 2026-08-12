import type { LucideIcon } from 'lucide-react-native';
import {
  Bus,
  CircleEllipsis,
  Clapperboard,
  HeartPulse,
  Home,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react-native';

import type { TransactionCategory } from '../types/api';

export const CATEGORY_ICONS: Record<TransactionCategory, LucideIcon> = {
  income: TrendingUp,
  housing: Home,
  food: Utensils,
  transport: Bus,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  health: HeartPulse,
  utilities: Zap,
  other: CircleEllipsis,
};
