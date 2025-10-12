# Icon Usage Guide - Lucide React

## Quick Start

### 1. Import the Icon

```tsx
import { DollarSign, Package, Users } from 'lucide-react';
```

### 2. Use the Icon

```tsx
<DollarSign size={24} strokeWidth={2} />
```

## Common Patterns

### Pattern 1: Icon in a Container

Use this for report cards, feature boxes, etc.

```tsx
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "var(--s-border-radius-base)",
    backgroundColor: "var(--s-color-surface-subdued)",
    color: "var(--s-color-text)",
  }}
>
  <DollarSign size={24} strokeWidth={2} />
</div>
```

### Pattern 2: Inline Icon

Use this for icons next to text.

```tsx
<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  <Package size={20} strokeWidth={2} />
  <span>Orders Report</span>
</div>
```

### Pattern 3: Dynamic Icon from Config

Use this when the icon comes from configuration.

```tsx
const IconComponent = report.icon;

return (
  <div>
    <IconComponent size={24} strokeWidth={2} />
  </div>
);
```

### Pattern 4: Icon with IIFE (Immediately Invoked Function Expression)

Use this when you need to extract and render in one expression.

```tsx
{(() => {
  const IconComponent = getReportIcon(reportType);
  return <IconComponent size={20} strokeWidth={2} />;
})()}
```

## Size Guidelines

### Small (16px)
Use for: Inline text, small badges, compact lists

```tsx
<Icon size={16} strokeWidth={2} />
```

### Medium (20-24px)
Use for: Cards, buttons, table cells, navigation

```tsx
<Icon size={20} strokeWidth={2} />  // Tables
<Icon size={24} strokeWidth={2} />  // Cards, buttons
```

### Large (28-32px)
Use for: Feature highlights, section headers

```tsx
<Icon size={28} strokeWidth={2} />
<Icon size={32} strokeWidth={2} />
```

### Extra Large (48px+)
Use for: Modals, empty states, hero sections

```tsx
<Icon size={48} strokeWidth={2} />
<Icon size={64} strokeWidth={2} />
```

## Stroke Width Guidelines

### Light (1.5)
Use for: Subtle, background elements

```tsx
<Icon size={24} strokeWidth={1.5} />
```

### Normal (2)
Use for: Most cases (default)

```tsx
<Icon size={24} strokeWidth={2} />
```

### Bold (2.5)
Use for: Emphasis, important actions

```tsx
<Icon size={24} strokeWidth={2.5} />
```

## Color Guidelines

### Using CSS Variables

```tsx
<Icon 
  size={24} 
  strokeWidth={2}
  color="var(--s-color-text)"
/>
```

### Common Colors

```tsx
// Primary text
color="var(--s-color-text)"

// Subdued text
color="var(--s-color-text-subdued)"

// Success
color="var(--s-color-text-success)"

// Warning
color="var(--s-color-text-warning)"

// Critical/Error
color="var(--s-color-text-critical)"

// Info
color="var(--s-color-text-info)"
```

### Inline Styles

```tsx
<div style={{ color: "var(--s-color-text-subdued)" }}>
  <Icon size={20} strokeWidth={2} />
</div>
```

## Available Icons in the App

### Report Type Icons

```tsx
import {
  DollarSign,    // Sales
  Package,       // Orders
  ShoppingBag,   // Products
  Users,         // Customers
  BarChart3,     // Inventory, Analytics
  TrendingUp,    // Traffic, Growth
  Tag,           // Discounts
  Receipt,       // Finance
  Settings,      // Custom, Configuration
} from 'lucide-react';
```

### Feature Icons

```tsx
import {
  Calendar,       // Daily scheduling
  CalendarDays,   // Weekly scheduling
  CalendarRange,  // Monthly scheduling
  Clock,          // Time-based features
  Search,         // Filtering, search
  Mail,           // Email delivery
  FileText,       // Documents, CSV
  Sparkles,       // Special features
} from 'lucide-react';
```

### Action Icons (for future use)

```tsx
import {
  Plus,           // Add, create
  Edit,           // Edit, modify
  Trash2,         // Delete, remove
  Download,       // Download, export
  Upload,         // Upload, import
  RefreshCw,      // Refresh, reload
  Check,          // Confirm, success
  X,              // Close, cancel
  ChevronRight,   // Navigate forward
  ChevronLeft,    // Navigate back
  ChevronDown,    // Expand, dropdown
  ChevronUp,      // Collapse
} from 'lucide-react';
```

## Best Practices

### ✅ DO

1. **Always specify size:**
   ```tsx
   <Icon size={24} strokeWidth={2} />
   ```

2. **Use consistent stroke width:**
   ```tsx
   // Use 2 for most cases
   <Icon size={24} strokeWidth={2} />
   ```

3. **Extract icon component for dynamic rendering:**
   ```tsx
   const IconComponent = report.icon;
   return <IconComponent size={24} strokeWidth={2} />;
   ```

4. **Use semantic container elements:**
   ```tsx
   <div role="img" aria-label="Sales icon">
     <DollarSign size={24} />
   </div>
   ```

5. **Match icon size to context:**
   ```tsx
   // Small in tables
   <Icon size={20} />
   
   // Medium in cards
   <Icon size={24} />
   
   // Large in headers
   <Icon size={48} />
   ```

### ❌ DON'T

1. **Don't use icons without size:**
   ```tsx
   // ❌ Bad
   <Icon />
   
   // ✅ Good
   <Icon size={24} />
   ```

2. **Don't mix stroke widths randomly:**
   ```tsx
   // ❌ Bad - inconsistent
   <Icon size={24} strokeWidth={1.5} />
   <Icon size={24} strokeWidth={2.5} />
   
   // ✅ Good - consistent
   <Icon size={24} strokeWidth={2} />
   <Icon size={24} strokeWidth={2} />
   ```

3. **Don't use inline styles for colors when CSS variables exist:**
   ```tsx
   // ❌ Bad
   <Icon color="#666666" />
   
   // ✅ Good
   <Icon color="var(--s-color-text-subdued)" />
   ```

4. **Don't render icons directly in Polaris web components:**
   ```tsx
   // ❌ Bad - causes "Component is not a function" error
   <s-box>
     <Icon size={24} />
   </s-box>
   
   // ✅ Good - wrap in regular HTML element
   <s-box>
     <div>
       <Icon size={24} />
     </div>
   </s-box>
   ```

## Troubleshooting

### Issue: Icon not displaying

**Check:**
1. Is the icon imported?
2. Is size specified?
3. Is the icon wrapped in a regular HTML element (not Polaris web component)?

### Issue: "Component is not a function"

**Solution:** Don't render Lucide icons directly inside Polaris web components. Wrap them in a div first.

### Issue: Icon too small/large

**Solution:** Adjust the size prop:
```tsx
<Icon size={24} />  // Adjust this number
```

### Issue: Icon too thin/thick

**Solution:** Adjust the strokeWidth prop:
```tsx
<Icon size={24} strokeWidth={2} />  // Adjust this number
```

## Finding More Icons

Browse all available icons at: https://lucide.dev/icons/

### How to Add a New Icon

1. Find the icon on lucide.dev
2. Import it:
   ```tsx
   import { IconName } from 'lucide-react';
   ```
3. Use it:
   ```tsx
   <IconName size={24} strokeWidth={2} />
   ```

## Examples from the App

### Report Card Icon

```tsx
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "2.5rem",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "var(--s-border-radius-base)",
    backgroundColor: "var(--s-color-surface-subdued)",
    color: "var(--s-color-text)",
    flexShrink: 0,
  }}
>
  <IconComponent size={24} strokeWidth={2} />
</div>
```

### Table Cell Icon

```tsx
<div style={{ 
  display: "flex", 
  alignItems: "center", 
  gap: "0.5rem" 
}}>
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    color: "var(--s-color-text-subdued)",
  }}>
    <IconComponent size={20} strokeWidth={2} />
  </div>
  <span>Report Name</span>
</div>
```

### Modal Header Icon

```tsx
<div style={{ 
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "0.5rem",
  color: "var(--s-color-text)"
}}>
  <IconComponent size={48} strokeWidth={2} />
</div>
```

