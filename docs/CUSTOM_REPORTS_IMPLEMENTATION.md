# Custom Reports Implementation

## Overview

This document describes the implementation of the Custom Reports feature for the Report Flow Shopify App. This feature allows users to create their own custom reports by selecting any fields available from the Shopify Admin API.

## Features

- **Data Source Selection**: Users can choose from Orders, Products, or Customers as their data source
- **Comprehensive Field Catalog**: Access to 100+ fields from the Shopify API, organized by category
- **Dynamic Field Selection**: Interactive UI for browsing and selecting fields with category grouping
- **Flexible Filtering**: Date range and data source filters
- **CSV Export**: Generates CSV files with only the selected fields

## Architecture

### 1. Field Configuration (`app/config/customReportFields.ts`)

This file contains the comprehensive catalog of all available Shopify API fields:

- **ORDER_FIELDS**: 74+ fields including:
  - Basic order information (ID, name, number, dates)
  - Financial data (prices, taxes, discounts, shipping)
  - Status fields (financial status, fulfillment status)
  - Customer information
  - Shipping and billing addresses
  - Tax information
  - Additional metadata

- **PRODUCT_FIELDS**: 40+ fields including:
  - Basic product information
  - Variant details (SKU, barcode, pricing, inventory)
  - Pricing ranges
  - SEO information
  - URLs

- **CUSTOMER_FIELDS**: 30+ fields including:
  - Basic customer information
  - Statistics (amount spent, order count)
  - Preferences and settings
  - Tags and notes

Each field includes:
- `key`: Unique identifier
- `label`: Human-readable name
- `type`: Data type (string, number, currency, date, datetime, boolean, email, url)
- `source`: Data source (ORDERS, PRODUCTS, CUSTOMERS)
- `graphqlPath`: Path in GraphQL response for data extraction
- `category`: Grouping for UI organization

### 2. Report Type Configuration (`app/config/reportTypes.ts`)

Added `CUSTOM` to the `ReportType` union and created a new report configuration:

```typescript
CUSTOM: {
  type: "CUSTOM",
  name: "Custom Report",
  description: "Create your own custom report with any fields available from the Shopify API",
  icon: "⚙️",
  category: "analytics",
  filters: [
    { key: "dateRange", ... },
    { key: "dataSource", ... }
  ],
  dataFields: [], // Dynamically selected by user
  defaultFilters: {
    dateRange: "LAST_30_DAYS",
    dataSource: "ORDERS",
  },
}
```

### 3. UI Components

#### CustomFieldSelectionForm (`app/components/CustomFieldSelectionForm.tsx`)

A sophisticated field selection component that:
- Displays fields organized by category (Basic Info, Financial, Status, Customer, etc.)
- Provides collapsible category sections
- Shows field counts and selection status
- Includes "Select All" / "Clear All" functionality at both global and category levels
- Displays field metadata (type, description)
- Provides visual feedback for selected fields

Features:
- Category-based organization with expand/collapse
- Checkbox selection for individual fields
- Badge indicators showing selection counts
- Responsive grid layout
- Search-friendly field labels

#### Updated Report Creation Page (`app/routes/app.reports.new.tsx`)

Modified to conditionally render:
- `CustomFieldSelectionForm` for CUSTOM report type
- `FieldSelectionForm` for standard report types

The component automatically switches based on the selected data source.

### 4. Data Fetching (`app/services/shopifyDataFetcher.server.ts`)

Added custom report data fetching with three specialized functions:

#### `fetchCustomReportData()`
Routes to appropriate data source handler based on `filters.dataSource`

#### `fetchCustomOrdersData()`
Fetches comprehensive order data including:
- All financial fields with MoneyBag structures
- Customer information
- Addresses (shipping and billing)
- Status fields
- Metadata and tags
- Tax information

#### `fetchCustomProductsData()`
Fetches comprehensive product data including:
- Product details
- All variants with full information
- Pricing ranges
- SEO data
- Inventory information

#### `fetchCustomCustomersData()`
Fetches comprehensive customer data including:
- Contact information
- Statistics (lifetime value, order count)
- Preferences
- Tags and notes

All functions include:
- Pagination support (up to 20 pages, 250 records per page)
- Retry logic with exponential backoff
- Rate limiting handling

### 5. Data Processing (`app/services/reportDataProcessor.server.ts`)

Added custom report processing with dynamic field extraction:

#### `processCustomReportData()`
- Maps raw Shopify data to selected fields
- Uses `graphqlPath` to extract nested values
- Formats values based on field type

#### `extractValueFromPath()`
- Navigates nested object structures using dot notation
- Handles array fields (e.g., `variants.nodes`)
- Returns null for missing values

#### `formatCustomFieldValue()`
- Formats values based on field type:
  - Currency: Formatted with currency symbol
  - Date/DateTime: Formatted for readability
  - Boolean: "Yes" / "No"
  - Numbers: String representation
  - Others: Direct string conversion

### 6. Database Schema

No schema changes required! The existing flexible filter system supports custom reports:
- `dataSource` stored as a filter (key: "dataSource", value: "ORDERS")
- Selected fields stored in `ReportField` table
- All existing scheduling and recipient functionality works

## User Flow

1. **Select Report Type**: User clicks "Custom Report" from the report selection page
2. **Choose Data Source**: User selects Orders, Products, or Customers
3. **Select Fields**: User browses categories and selects desired fields
4. **Configure Filters**: User sets date range and other filters
5. **Set Schedule**: User configures when the report should run
6. **Add Recipients**: User specifies email recipients
7. **Save**: Report is saved and scheduled

## Example Use Cases

### Sales Analysis Report
- Data Source: Orders
- Selected Fields:
  - Order name, date
  - Total price, tax, discounts
  - Customer email
  - Shipping address (city, state, country)

### Inventory Report
- Data Source: Products
- Selected Fields:
  - Product title, SKU
  - Variant inventory quantity
  - Vendor
  - Product type

### Customer Insights Report
- Data Source: Customers
- Selected Fields:
  - Customer name, email
  - Amount spent
  - Number of orders
  - Tags

## Technical Considerations

### Performance
- Pagination limits to 20 pages (5,000 records max per data source)
- Efficient GraphQL queries fetching only needed data
- CSV generation optimized for large datasets

### Error Handling
- Validation ensures at least one field is selected
- Graceful handling of missing data (returns empty string)
- Retry logic for API rate limits

### Extensibility
- Easy to add new data sources (Inventory, Fulfillments, etc.)
- Simple to add new fields to existing data sources
- Field categories can be customized

## Future Enhancements

1. **Additional Data Sources**:
   - Inventory levels
   - Fulfillments
   - Refunds
   - Draft orders

2. **Advanced Field Selection**:
   - Search/filter fields by name
   - Recently used fields
   - Field templates/presets

3. **Data Transformations**:
   - Calculated fields
   - Aggregations (sum, average, count)
   - Custom formulas

4. **Enhanced Filtering**:
   - Field-specific filters
   - Multiple data sources in one report
   - Join operations

5. **Visualization**:
   - Preview data before scheduling
   - Charts and graphs
   - Dashboard integration

## Testing Recommendations

1. **Unit Tests**:
   - Field extraction logic
   - Value formatting functions
   - Data processing functions

2. **Integration Tests**:
   - GraphQL query execution
   - CSV generation
   - Email delivery

3. **E2E Tests**:
   - Complete report creation flow
   - Field selection UI
   - Report execution and delivery

## Deployment Notes

1. No database migrations required
2. No new environment variables needed
3. Existing Shopify API scopes should cover all fields
4. Test with a variety of field combinations
5. Monitor API rate limits during initial rollout

## Support and Maintenance

- Field catalog should be reviewed quarterly for new Shopify API fields
- Monitor user feedback for most-requested fields
- Track performance metrics for large reports
- Document any field-specific quirks or limitations

