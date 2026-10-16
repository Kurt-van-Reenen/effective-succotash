// Maps the API's small icon vocabulary to explicit Lucide components.
import { Car, CircleHelp, Film, ShoppingBag, ShoppingCart, Utensils, Zap } from "lucide-react";

const categoryIcons = {
  "shopping-cart": ShoppingCart,
  film: Film,
  car: Car,
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  zap: Zap,
} as const;

type CategoryIconProps = {
  name: string;
  className?: string;
};

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const iconEntry = Object.entries(categoryIcons).find(([iconName]) => iconName === name);
  const Icon = iconEntry?.[1] ?? CircleHelp;
  return <Icon className={className} aria-hidden="true" focusable="false" />;
}
