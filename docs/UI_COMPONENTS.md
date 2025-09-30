# Report Flow - UI Components Guide

## Overview

This document describes the UI structure and components used in the Report Flow app.

## Technology Stack

- **Framework:** React Router v7
- **UI Library:** Shopify Polaris Web Components
- **Styling:** CSS with Polaris design tokens
- **Navigation:** React Router with Shopify App Bridge

---

## Page Structure

### 1. Home Page (`/app`)

**Route:** `app/routes/app._index.tsx`

**Purpose:** Landing page with app overview and quick start guide

**Components:**
- Welcome section with app description
- 4-step quick start guide
- Features list
- Call-to-action button to create reports

**Key Features:**
- Clean, informative design
- Clear value proposition
- Easy navigation to report creation

---

### 2. Reports Selection Page (`/app/reports`)

**Route:** `app/routes/app.reports._index.tsx`

**Purpose:** Browse and select report types to schedule

**Components:**
- Report type cards organized by category
- Category sections (Sales, Operations, Marketing, Analytics)
- Sidebar with help information

**Report Card Features:**
- Icon and name
- Description
- Filter count badge
- Data field count badge
- Select button
- Hover effects

**Categories:**
- 💰 **Sales Reports** - Sales, Products
- 📦 **Operations Reports** - Orders, Inventory
- 🎯 **Marketing Reports** - Discounts
- 📈 **Analytics Reports** - Customers, Traffic

---

### 3. New Report Configuration Page (`/app/reports/new`)

**Route:** `app/routes/app.reports.new.tsx`

**Purpose:** Configure a new scheduled report

**Status:** 🚧 Under Construction

**Planned Components:**
- Report name and description form
- Dynamic filter configuration
- Schedule setup (frequency, time, timezone)
- Email recipient management
- Preview functionality
- Save/Cancel actions

**URL Parameters:**
- `type` - Report type (SALES, ORDERS, etc.)

---

## Polaris Web Components Used

### Layout Components

#### `<s-page>`
Main page container with heading and actions
```tsx
<s-page heading="Page Title" backAction={{ content: "Back", url: "/app" }}>
  {/* Page content */}
</s-page>
```

#### `<s-section>`
Content sections with optional headings
```tsx
<s-section heading="Section Title">
  {/* Section content */}
</s-section>
```

#### `<s-stack>`
Flexbox layout for spacing elements
```tsx
<s-stack direction="block" gap="base">
  {/* Stacked elements */}
</s-stack>
```

#### `<s-box>`
Container with padding, borders, and background
```tsx
<s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
  {/* Box content */}
</s-box>
```

---

### Content Components

#### `<s-heading>`
Headings with semantic levels
```tsx
<s-heading level={3}>Heading Text</s-heading>
```

#### `<s-paragraph>`
Text paragraphs
```tsx
<s-paragraph>Paragraph text</s-paragraph>
```

#### `<s-text>`
Inline text with variants
```tsx
<s-text variant="subdued">Subdued text</s-text>
<s-text weight="bold">Bold text</s-text>
```

#### `<s-link>`
Links (internal or external)
```tsx
<s-link href="/app/reports">Internal link</s-link>
<s-link href="https://example.com" target="_blank">External link</s-link>
```

---

### Action Components

#### `<s-button>`
Buttons with variants
```tsx
<s-button variant="primary">Primary Action</s-button>
<s-button variant="secondary">Secondary Action</s-button>
<s-button variant="tertiary">Tertiary Action</s-button>
```

---

### Feedback Components

#### `<s-badge>`
Small status indicators
```tsx
<s-badge variant="info">Info</s-badge>
<s-badge variant="success">Success</s-badge>
<s-badge variant="attention">Attention</s-badge>
```

#### `<s-banner>`
Important messages
```tsx
<s-banner variant="info">
  <s-paragraph>Information message</s-paragraph>
</s-banner>
```

---

### List Components

#### `<s-unordered-list>` & `<s-list-item>`
Bulleted lists
```tsx
<s-unordered-list>
  <s-list-item>Item 1</s-list-item>
  <s-list-item>Item 2</s-list-item>
</s-unordered-list>
```

---

## Navigation

### App Navigation (`<s-app-nav>`)

Located in `app/routes/app.tsx`

**Current Links:**
- Home (`/app`)
- Reports (`/app/reports`)
- Additional page (`/app/additional`)

**Usage:**
```tsx
<s-app-nav>
  <s-link href="/app">Home</s-link>
  <s-link href="/app/reports">Reports</s-link>
</s-app-nav>
```

---

## Styling

### CSS Files

- `app/styles/reports.css` - Report-specific styles

### Design Tokens

Polaris provides CSS custom properties (variables) for consistent styling:

**Colors:**
- `--s-color-surface` - Surface background
- `--s-color-text` - Primary text
- `--s-color-text-subdued` - Secondary text
- `--s-color-border` - Border color
- `--s-color-border-emphasis` - Emphasized border

**Spacing:**
- `--s-spacing-tight` - Small spacing
- `--s-spacing-base` - Base spacing
- `--s-spacing-loose` - Large spacing

**Border:**
- `--s-border-radius-base` - Base border radius
- `--s-border-width-base` - Base border width

---

## Responsive Design

All components are responsive by default. Custom responsive styles use standard media queries:

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

---

## Accessibility

Polaris components include built-in accessibility features:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support

---

## Future UI Components

### Planned for Next Tasks:

1. **Filter Configuration Form**
   - Dynamic form based on report type
   - Date range picker
   - Multi-select dropdowns
   - Product/collection selectors

2. **Schedule Configuration**
   - Frequency selector (daily, weekly, monthly)
   - Time picker with timezone
   - Day of week/month selector

3. **Email Recipients Manager**
   - Add/remove email addresses
   - Email validation
   - Recipient list display

4. **Report List Table**
   - Sortable columns
   - Status indicators
   - Action buttons (edit, delete, run now)

5. **Report History View**
   - Execution timeline
   - Success/failure indicators
   - Download links

6. **Report Preview Modal**
   - Data preview before scheduling
   - Sample data display
   - Filter verification

---

## Best Practices

### 1. Use Polaris Components
Always use Polaris web components instead of custom HTML elements for consistency.

### 2. Maintain Hierarchy
Use proper heading levels and semantic structure.

### 3. Provide Feedback
Use banners, toasts, and loading states to keep users informed.

### 4. Mobile-First
Design for mobile first, then enhance for larger screens.

### 5. Accessibility
Ensure all interactive elements are keyboard accessible and have proper labels.

---

## Resources

- [Polaris Web Components Documentation](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge)
- [React Router Documentation](https://reactrouter.com/)

