# Report Flow - Filter Configuration Guide

## Overview

This document explains how the dynamic filter configuration system works in Report Flow.

## Architecture

### Components

1. **FilterField** (`app/components/FilterField.tsx`)
   - Renders individual filter inputs based on type
   - Supports: select, multiselect, text, date
   - Handles validation and error display

2. **FilterConfigurationForm** (`app/components/FilterConfigurationForm.tsx`)
   - Orchestrates multiple filters
   - Groups required vs optional filters
   - Displays filter summary
   - Manages form state

3. **Report Configuration Page** (`app/routes/app.reports.new.tsx`)
   - Uses FilterConfigurationForm
   - Collects report name and description
   - Prepares data for saving

---

## Filter Types

### 1. Select (Single Selection)

**Use Case:** Choose one option from a list

**Example:** Date range, order status, stock level

**Configuration:**
```typescript
{
  key: "dateRange",
  label: "Date Range",
  type: "select",
  options: [
    { value: "LAST_7_DAYS", label: "Last 7 days" },
    { value: "LAST_30_DAYS", label: "Last 30 days" },
    { value: "LAST_90_DAYS", label: "Last 90 days" },
  ],
  required: true,
  defaultValue: "LAST_30_DAYS",
}
```

**Rendered As:**
- Native HTML `<select>` dropdown
- Shows all options
- Single selection only

---

### 2. Multiselect (Multiple Selections)

**Use Case:** Choose multiple options from a list

**Example:** Sales channels, order statuses, product types

**Configuration:**
```typescript
{
  key: "salesChannel",
  label: "Sales Channel",
  type: "multiselect",
  options: [
    { value: "online_store", label: "Online Store" },
    { value: "pos", label: "Point of Sale" },
    { value: "mobile", label: "Mobile App" },
  ],
}
```

**Rendered As:**
- Checkbox list in a scrollable container
- Selected items shown as badges below
- Click anywhere on row to toggle

---

### 3. Text (Free-form Input)

**Use Case:** Search, filter by name, custom values

**Example:** Product name search, SKU filter

**Configuration:**
```typescript
{
  key: "productName",
  label: "Product Name",
  type: "text",
  description: "Filter by product name (partial match)",
}
```

**Rendered As:**
- Polaris `<s-text-field>` component
- Standard text input
- Supports placeholder and description

---

### 4. Date (Single Date)

**Use Case:** Specific date selection

**Example:** Order date, created date

**Configuration:**
```typescript
{
  key: "orderDate",
  label: "Order Date",
  type: "date",
  description: "Select a specific date",
}
```

**Rendered As:**
- Native HTML date picker
- Browser-native date selection UI
- Returns ISO date string

---

## Filter Properties

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the filter |
| `label` | string | Display label shown to user |
| `type` | FilterType | Type of filter (select, multiselect, text, date) |

### Optional Properties

| Property | Type | Description |
|----------|------|-------------|
| `options` | FilterOptionValue[] | Available options (for select/multiselect) |
| `required` | boolean | Whether filter must be filled |
| `defaultValue` | any | Default value when form loads |
| `description` | string | Help text shown below label |

---

## Filter Option Structure

For select and multiselect filters:

```typescript
interface FilterOptionValue {
  value: string;    // Internal value stored
  label: string;    // Display text shown to user
}
```

**Example:**
```typescript
options: [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
]
```

---

## Default Values

Filters can have default values set in three ways (priority order):

1. **Initial Values** - Passed to FilterConfigurationForm
   ```typescript
   <FilterConfigurationForm
     reportConfig={reportConfig}
     initialValues={{ dateRange: "LAST_7_DAYS" }}
     onChange={handleChange}
   />
   ```

2. **Filter Default Value** - Set in filter configuration
   ```typescript
   {
     key: "dateRange",
     defaultValue: "LAST_30_DAYS",
   }
   ```

3. **Report Default Filters** - Set in report type config
   ```typescript
   {
     type: "SALES",
     defaultFilters: {
       dateRange: "LAST_30_DAYS",
       salesChannel: "ALL",
     },
   }
   ```

---

## Validation

### Required Field Validation

Required filters are validated automatically:

- **Empty strings** - Show error
- **Null/undefined** - Show error
- **Empty arrays** (multiselect) - Show error

### Error Display

Errors are shown:
- Below the input field
- In red text
- With red border on input
- Cleared when user makes changes

### Validation Function

Export validation function for external use:

```typescript
import { validateFilterConfiguration } from "../components/FilterConfigurationForm";

const { isValid, errors } = validateFilterConfiguration(
  reportConfig,
  filterValues
);

if (!isValid) {
  console.log("Validation errors:", errors);
}
```

---

## Filter Summary

The form automatically displays an "Active Filters Summary" showing:

- All filters with values
- Human-readable labels (not internal values)
- Formatted display for multiselect (comma-separated)
- Skips empty/unset filters

**Example Display:**
```
Active Filters Summary
━━━━━━━━━━━━━━━━━━━━━━
Date Range: Last 30 days
Sales Channel: Online Store, Point of Sale
Order Status: Paid
```

---

## State Management

### Parent Component

The parent component manages filter state:

```typescript
const [filterValues, setFilterValues] = useState<Record<string, any>>({});

const handleFilterChange = (filters: Record<string, any>) => {
  setFilterValues(filters);
};

<FilterConfigurationForm
  reportConfig={reportConfig}
  onChange={handleFilterChange}
/>
```

### Filter Values Structure

Filter values are stored as a flat object:

```typescript
{
  dateRange: "LAST_30_DAYS",
  salesChannel: ["online_store", "pos"],
  orderStatus: "PAID",
  productName: "Snowboard",
}
```

---

## Styling

### Design Tokens Used

- `--s-color-border` - Input borders
- `--s-color-border-critical` - Error borders
- `--s-color-text-critical` - Error text
- `--s-color-surface-subdued` - Hover backgrounds
- `--s-border-radius-base` - Border radius
- `--s-spacing-base` - Spacing

### Responsive Design

All filter inputs are:
- Full width (`width: 100%`)
- Stack vertically on mobile
- Maintain consistent spacing

---

## Accessibility

### Features

- ✅ Proper label associations
- ✅ Error announcements
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Required field indicators

### Required Field Indicator

Required filters show a red asterisk (*) next to the label:

```tsx
{filter.label}
{filter.required && <span style={{ color: "red" }}> *</span>}
```

---

## Dynamic Options

Some filters have options populated dynamically from the store:

### Planned Dynamic Filters

- **Locations** - Fetch from store's location settings
- **Product Types** - Unique types from product catalog
- **Vendors** - Unique vendors from products
- **Collections** - Store's product collections

### Implementation (Future)

```typescript
// In loader function
const locations = await fetchStoreLocations(admin);
const productTypes = await fetchProductTypes(admin);

// Pass to component
return {
  reportConfig,
  dynamicOptions: {
    location: locations,
    productType: productTypes,
  },
};
```

---

## Examples

### Sales Report Filters

```typescript
filters: [
  {
    key: "dateRange",
    label: "Date Range",
    type: "select",
    options: DATE_RANGE_OPTIONS,
    required: true,
    defaultValue: "LAST_30_DAYS",
  },
  {
    key: "salesChannel",
    label: "Sales Channel",
    type: "multiselect",
    options: [
      { value: "online_store", label: "Online Store" },
      { value: "pos", label: "Point of Sale" },
    ],
  },
]
```

### Orders Report Filters

```typescript
filters: [
  {
    key: "dateRange",
    label: "Date Range",
    type: "select",
    options: DATE_RANGE_OPTIONS,
    required: true,
  },
  {
    key: "orderStatus",
    label: "Order Status",
    type: "select",
    options: [
      { value: "ALL", label: "All" },
      { value: "OPEN", label: "Open" },
      { value: "ARCHIVED", label: "Archived" },
    ],
  },
  {
    key: "fulfillmentStatus",
    label: "Fulfillment Status",
    type: "multiselect",
    options: [
      { value: "FULFILLED", label: "Fulfilled" },
      { value: "UNFULFILLED", label: "Unfulfilled" },
    ],
  },
]
```

---

## Future Enhancements

### Planned Features

1. **Date Range Picker** - Custom start/end date selection
2. **Product Picker** - Search and select specific products
3. **Collection Picker** - Select from store collections
4. **Conditional Filters** - Show/hide based on other selections
5. **Filter Presets** - Save and reuse filter combinations
6. **Advanced Validation** - Custom validation rules per filter

---

## Testing

### Manual Testing Checklist

- [ ] Required filters show asterisk
- [ ] Required filters validate on submit
- [ ] Optional filters can be left empty
- [ ] Multiselect shows selected badges
- [ ] Filter summary updates in real-time
- [ ] Error messages clear on change
- [ ] Default values load correctly
- [ ] All filter types render properly

---

## Troubleshooting

### Filter not showing

- Check filter is in `reportConfig.filters` array
- Verify filter type is supported
- Check for console errors

### Default value not working

- Verify defaultValue matches an option value
- Check initialValues prop is passed correctly
- Ensure reportConfig.defaultFilters is set

### Validation not working

- Confirm `required: true` is set
- Check validation function is called
- Verify error state is managed correctly

---

## Resources

- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [React Hook Form](https://react-hook-form.com/) (potential future integration)
- [Zod](https://zod.dev/) (potential future validation library)

