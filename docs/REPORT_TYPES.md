# Report Flow - Report Types Configuration

## Overview

This document describes all available report types in the Report Flow app, their filters, data fields, and use cases.

## Report Categories

Reports are organized into four categories:

1. **Sales** - Revenue and sales performance
2. **Operations** - Order fulfillment and inventory
3. **Marketing** - Promotions and customer acquisition
4. **Analytics** - Traffic and customer behavior

---

## Available Report Types

### 1. Sales Report 💰

**Category:** Sales  
**Purpose:** Analyze sales performance, revenue, and trends over time

#### Filters:
- **Date Range** (Required) - Select time period for analysis
- **Sales Channel** - Filter by online store, POS, mobile, Facebook, Instagram
- **Location** - Filter by store location (for multi-location stores)

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Date | Date | Transaction date |
| Orders | Number | Total number of orders |
| Total Sales | Currency | Gross sales amount |
| Average Order Value | Currency | Average value per order |
| Total Discounts | Currency | Total discount amount applied |
| Total Tax | Currency | Total tax collected |
| Net Sales | Currency | Sales after discounts and refunds |

#### Use Cases:
- Daily/weekly/monthly sales tracking
- Compare sales across different channels
- Identify sales trends and patterns
- Calculate revenue metrics for reporting

---

### 2. Orders Report 📦

**Category:** Operations  
**Purpose:** Track order details, status, and fulfillment information

#### Filters:
- **Date Range** (Required) - Select time period
- **Order Status** - Open, Archived, Cancelled
- **Fulfillment Status** - Fulfilled, Unfulfilled, Partially fulfilled, etc.
- **Financial Status** - Paid, Pending, Refunded, etc.

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Order Number | String | Unique order identifier |
| Order Date | DateTime | When order was placed |
| Customer Name | String | Customer's full name |
| Customer Email | String | Customer's email address |
| Total Price | Currency | Order total amount |
| Order Status | String | Current order status |
| Fulfillment Status | String | Fulfillment progress |
| Financial Status | String | Payment status |
| Item Count | Number | Number of items in order |

#### Use Cases:
- Track unfulfilled orders
- Monitor order processing times
- Identify payment issues
- Export order lists for accounting

---

### 3. Products Report 🛍️

**Category:** Sales  
**Purpose:** View product performance, sales, and inventory metrics

#### Filters:
- **Date Range** (Required) - Select time period
- **Product Type** - Filter by product category
- **Vendor** - Filter by product vendor/supplier
- **Collection** - Filter by product collection

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Product Title | String | Product name |
| SKU | String | Stock keeping unit |
| Vendor | String | Product vendor/supplier |
| Product Type | String | Product category |
| Units Sold | Number | Total units sold |
| Total Revenue | Currency | Revenue generated |
| Average Price | Currency | Average selling price |
| Current Inventory | Number | Current stock level |

#### Use Cases:
- Identify best-selling products
- Track product performance over time
- Analyze inventory turnover
- Plan restocking based on sales velocity

---

### 4. Customers Report 👥

**Category:** Analytics  
**Purpose:** Analyze customer behavior, lifetime value, and segmentation

#### Filters:
- **Date Range** (Required) - Select time period
- **Customer Type** - All, New, or Returning customers

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Customer Name | String | Customer's full name |
| Email | String | Customer's email |
| Total Orders | Number | Lifetime order count |
| Total Spent | Currency | Lifetime value |
| Average Order Value | Currency | Average per order |
| First Order Date | Date | Date of first purchase |
| Last Order Date | Date | Date of most recent purchase |
| Customer Since | Date | Account creation date |

#### Use Cases:
- Identify high-value customers
- Segment customers by behavior
- Track customer acquisition
- Calculate customer lifetime value (CLV)

---

### 5. Inventory Report 📊

**Category:** Operations  
**Purpose:** Monitor stock levels, inventory value, and product availability

#### Filters:
- **Location** - Filter by warehouse/store location
- **Product Type** - Filter by product category
- **Vendor** - Filter by supplier
- **Stock Level** - All, In stock, Low stock, Out of stock

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Product Title | String | Product name |
| SKU | String | Stock keeping unit |
| Vendor | String | Product vendor |
| Location | String | Storage location |
| Quantity Available | Number | Available for sale |
| Quantity On Hand | Number | Physical inventory |
| Quantity Committed | Number | Reserved for orders |
| Inventory Value | Currency | Total value at cost |

#### Use Cases:
- Monitor stock levels across locations
- Identify low stock items
- Calculate inventory value
- Plan purchasing and restocking

---

### 6. Traffic Report 📈

**Category:** Analytics  
**Purpose:** Track website traffic, sessions, and conversion metrics

#### Filters:
- **Date Range** (Required) - Select time period
- **Sales Channel** - Online store, Mobile

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Date | Date | Traffic date |
| Sessions | Number | Total sessions |
| Unique Visitors | Number | Unique visitor count |
| Page Views | Number | Total page views |
| Conversion Rate | Number | Purchase conversion % |
| Added to Cart | Number | Add-to-cart actions |
| Reached Checkout | Number | Checkout initiations |
| Completed Purchase | Number | Completed orders |

#### Use Cases:
- Track website traffic trends
- Analyze conversion funnel
- Identify drop-off points
- Measure marketing campaign effectiveness

---

### 7. Discounts Report 🎯

**Category:** Marketing  
**Purpose:** Analyze discount code usage, performance, and ROI

#### Filters:
- **Date Range** (Required) - Select time period
- **Discount Type** - Percentage, Fixed amount, Free shipping, Buy X Get Y
- **Status** - All, Active, Expired, Scheduled

#### Data Fields:
| Field | Type | Description |
|-------|------|-------------|
| Discount Code | String | Discount code name |
| Discount Type | String | Type of discount |
| Times Used | Number | Usage count |
| Total Revenue | Currency | Revenue from discounted orders |
| Total Discount Amount | Currency | Total discount given |
| Average Order Value | Currency | AOV with discount |
| Status | String | Current status |
| Start Date | Date | Discount start date |
| End Date | Date | Discount end date |

#### Use Cases:
- Track discount code performance
- Calculate discount ROI
- Identify most effective promotions
- Monitor discount budget

---

## Date Range Options

All reports support the following date range options:

| Option | Description |
|--------|-------------|
| Today | Current day |
| Yesterday | Previous day |
| Last 7 days | Rolling 7-day window |
| Last 30 days | Rolling 30-day window |
| Last 90 days | Rolling 90-day window |
| This month | Month to date |
| Last month | Previous calendar month |
| This quarter | Quarter to date |
| Last quarter | Previous calendar quarter |
| This year | Year to date |
| Last year | Previous calendar year |
| Custom | User-defined date range |

---

## Filter Types

### Select
Single selection from a dropdown list.

### Multiselect
Multiple selections from a list (e.g., multiple order statuses).

### Date
Single date picker.

### Date Range
Start and end date selection.

### Text
Free-form text input (for search/filter).

---

## Data Field Types

| Type | Description | Example |
|------|-------------|---------|
| String | Text value | "Product Name" |
| Number | Numeric value | 42 |
| Currency | Monetary value | $1,234.56 |
| Date | Date only | 2025-09-30 |
| DateTime | Date and time | 2025-09-30 14:30:00 |
| Boolean | True/false | true |

---

## Adding New Report Types

To add a new report type:

1. **Define the type** in `app/config/reportTypes.ts`
2. **Add filters** appropriate for the data
3. **Define data fields** to include in the export
4. **Create GraphQL queries** to fetch the data
5. **Update documentation** in this file

---

## Dynamic Filter Options

Some filters have options that are populated dynamically from the store:

- **Locations** - Fetched from store's location settings
- **Product Types** - Unique product types from catalog
- **Vendors** - Unique vendors from catalog
- **Collections** - Store's product collections

These are loaded when the user creates/edits a report schedule.

---

## Future Report Types

Potential report types for future releases:

- **Fulfillment Report** - Detailed fulfillment metrics
- **Shipping Report** - Shipping costs and delivery times
- **Returns Report** - Return rates and reasons
- **Marketing Campaign Report** - Campaign performance
- **Abandoned Cart Report** - Cart abandonment analysis
- **Product Recommendations Report** - Recommendation effectiveness

