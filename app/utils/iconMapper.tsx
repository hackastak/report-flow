/**
 * Icon Mapper Utility
 * 
 * Maps icon name strings to Lucide React icon components.
 * This allows icons to be serialized as strings in configuration
 * and then mapped back to components on the client side.
 */

import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  Tag,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  Tag,
  Receipt,
  Settings,
};

/**
 * Get a Lucide icon component by name
 * @param iconName - The name of the icon (e.g., "DollarSign")
 * @returns The Lucide icon component, or Settings as fallback
 */
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Settings;
}

/**
 * Get all available icon names
 * @returns Array of icon names
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(iconMap);
}

