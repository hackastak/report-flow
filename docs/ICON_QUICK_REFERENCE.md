# Icon Quick Reference

## Import Icons

```tsx
import { DollarSign, Package, Users } from 'lucide-react';
```

## Basic Usage

```tsx
<DollarSign size={24} strokeWidth={2} />
```

## Common Patterns

### 1. Icon in Container (Report Cards)

```tsx
<div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "var(--s-border-radius-base)",
  backgroundColor: "var(--s-color-surface-subdued)",
  color: "var(--s-color-text)",
  flexShrink: 0,
}}>
  <IconComponent size={24} strokeWidth={2} />
</div>
```

### 2. Icon with Text (Tables)

```tsx
<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  <IconComponent size={20} strokeWidth={2} />
  <span>Text</span>
</div>
```

### 3. Dynamic Icon

```tsx
const IconComponent = report.icon;
return <IconComponent size={24} strokeWidth={2} />;
```

## Size Guide

| Size | Usage | Example |
|------|-------|---------|
| 16px | Inline, badges | `size={16}` |
| 20px | Tables, lists | `size={20}` |
| 24px | Cards, buttons | `size={24}` |
| 28px | Features | `size={28}` |
| 48px | Modals, headers | `size={48}` |

## Stroke Width

| Width | Usage |
|-------|-------|
| 1.5 | Light, subtle |
| 2 | Normal (default) |
| 2.5 | Bold, emphasis |

## Colors

```tsx
// Use CSS variables
color="var(--s-color-text)"
color="var(--s-color-text-subdued)"
color="var(--s-color-text-success)"
color="var(--s-color-text-critical)"
```

## Available Icons

### Report Types
- `DollarSign` - Sales
- `Package` - Orders
- `ShoppingBag` - Products
- `Users` - Customers
- `BarChart3` - Inventory
- `TrendingUp` - Traffic
- `Tag` - Discounts
- `Receipt` - Finance
- `Settings` - Custom

### Features
- `Calendar` - Daily
- `CalendarDays` - Weekly
- `CalendarRange` - Monthly
- `Clock` - Time
- `Search` - Filters
- `Mail` - Email
- `FileText` - Documents
- `Sparkles` - Special

## Common Mistakes

### ❌ Don't
```tsx
// Missing size
<Icon />

// Inside Polaris web component
<s-box>
  <Icon size={24} />
</s-box>
```

### ✅ Do
```tsx
// Always specify size
<Icon size={24} strokeWidth={2} />

// Wrap in regular HTML
<s-box>
  <div>
    <Icon size={24} strokeWidth={2} />
  </div>
</s-box>
```

## Find More Icons

Browse: https://lucide.dev/icons/

## Need Help?

See full documentation:
- `docs/ICON_USAGE_GUIDE.md` - Complete guide
- `docs/ICON_SYSTEM_UPDATE.md` - Migration details
- `docs/TESTING_ICONS.md` - Testing procedures

