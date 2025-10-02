# Finance Summary Report

## Overview

The **Finance Summary** report provides comprehensive financial data matching Shopify's native "Finances summary" report. This report includes detailed breakdowns of sales, gross profit, payments, and other financial metrics.

## Report Type

- **Type**: `FINANCE_SUMMARY`
- **Name**: Finance Summary
- **Icon**: 💵
- **Category**: Sales

## Description

Comprehensive financial report with sales breakdown, gross profit, payments, and gift cards. This report aggregates all financial data by date to provide a complete picture of your store's financial performance.

## Filters

### Date Range (Required)
Select the time period for the financial analysis:
- Today
- Yesterday
- Last 7 days
- Last 30 days (default)
- Last 90 days
- This month
- Last month
- This quarter
- Last quarter
- This year
- Last year
- Custom date range

### Sales Channel (Optional)
Filter by specific sales channels:
- Online Store
- Point of Sale
- Mobile
- Facebook
- Instagram

## Data Fields

The Finance Summary report includes the following data fields, organized by category:

### Total Sales Breakdown

| Field | Type | Description |
|-------|------|-------------|
| Date | Date | Transaction date |
| Gross Sales | Currency | Total sales before discounts |
| Discounts | Currency | Total discount amount applied |
| Returns | Currency | Total amount refunded |
| Net Sales | Currency | Sales after discounts and returns (excluding tax and shipping) |
| Shipping Charges | Currency | Total shipping charges |
| Return Fees | Currency | Fees from returned shipping |
| Taxes | Currency | Total tax collected |
| Total Sales | Currency | Final total including all charges |

### Gross Profit Breakdown

| Field | Type | Description |
|-------|------|-------------|
| Net Sales Without Cost Recorded | Currency | Net sales for items without cost data |
| Net Sales With Cost Recorded | Currency | Net sales for items with cost data |
| Cost of Goods Sold | Currency | Total cost of items sold (COGS) |
| Gross Profit | Currency | Net sales with cost minus COGS |

### Payment Information

| Field | Type | Description |
|-------|------|-------------|
| Net Payments | Currency | Total payments received |
| Gross Payments from Shopify Payments | Currency | Total processed through Shopify Payments |
| Net Sales from Gift Cards | Currency | Sales paid with gift cards |
| Outstanding Gift Card Balance | Currency | Remaining gift card balance |
| Tips | Currency | Total tips received |

## Data Source

The report fetches data from the Shopify Admin GraphQL API, including:

- **Orders**: Complete order data with financial details
- **Line Items**: Product-level data including cost information
- **Transactions**: Payment gateway and transaction details
- **Refunds**: Return and refund information

## Calculations

### Gross Sales
```
Gross Sales = Total Price + Discounts
```

### Net Sales
```
Net Sales = Current Total - Tax - Shipping
```

### Cost of Goods Sold (COGS)
```
COGS = Σ(Unit Cost × Quantity) for all line items with cost data
```

### Gross Profit
```
Gross Profit = Net Sales With Cost - COGS
```

### Net Payments
```
Net Payments = Total received after refunds and adjustments
```

## Use Cases

### Daily Financial Tracking
Schedule this report to run daily to monitor:
- Daily revenue and sales trends
- Discount effectiveness
- Return rates
- Gross profit margins

### Weekly Financial Summaries
Run weekly to analyze:
- Week-over-week performance
- Payment method distribution
- Cost of goods sold trends
- Shipping revenue

### Monthly Financial Reports
Generate monthly reports for:
- Month-end closing
- Financial statements
- Profit and loss analysis
- Tax preparation

### Quarterly Business Reviews
Use quarterly reports to:
- Analyze seasonal trends
- Review gross profit margins
- Evaluate discount strategies
- Plan inventory purchases

## Example Output

```csv
Date,Gross Sales,Discounts,Returns,Net Sales,Shipping Charges,Return Fees,Taxes,Total Sales,Net Sales Without Cost,Net Sales With Cost,Cost of Goods Sold,Gross Profit,Net Payments,Gross Payments Shopify Payments,Net Sales Gift Cards,Outstanding Gift Card Balance,Tips
2025-10-01,3750.00,375.00,0.00,3375.00,182.00,0.00,300.00,3857.00,500.00,2875.00,1725.00,1150.00,3058.29,3058.29,0.00,0.00,0.00
2025-10-02,4200.00,420.00,150.00,3630.00,210.00,15.00,330.00,4185.00,600.00,3030.00,1818.00,1212.00,3500.00,3500.00,0.00,0.00,0.00
```

## Scheduling

The Finance Summary report can be scheduled to run:
- **Daily**: At a specific time each day
- **Weekly**: On a specific day of the week
- **Monthly**: On a specific day of the month
- **Custom**: Define your own schedule

## Email Delivery

Reports are automatically delivered via email to configured recipients with:
- CSV file attachment
- Summary of key metrics
- Date range covered
- Record count

## Notes

- **Gift Card Data**: Currently, gift card sales and outstanding balances require additional API calls and may show as $0.00 in the initial implementation
- **Tips Data**: Tips information requires additional API calls and may show as $0.00 in the initial implementation
- **Cost Data**: Gross profit calculations only include items with cost data recorded in Shopify
- **Payment Gateway**: Shopify Payments transactions are identified by gateway name
- **Refunds**: Returns include both product refunds and shipping refunds

## Comparison with Shopify's Native Report

This report matches the data structure of Shopify's native "Finances summary" report, including:

✅ Total sales breakdown (Gross sales, Discounts, Returns, Net sales, etc.)
✅ Gross profit breakdown (Net sales with/without cost, COGS, Gross profit)
✅ Payment information (Net payments, Shopify Payments, etc.)
⚠️ Gift card data (requires additional implementation)
⚠️ Tips data (requires additional implementation)
⚠️ Payment method breakdown charts (data available, visualization not included in CSV)

## Future Enhancements

Potential improvements for this report:

1. **Gift Card Integration**: Add dedicated API calls to fetch gift card sales and balances
2. **Tips Integration**: Add API calls to fetch tip data from POS and online orders
3. **Payment Method Breakdown**: Include detailed breakdown by payment method
4. **Staff Member Tips**: Track tips by individual staff members
5. **Multi-Currency Support**: Handle stores with multiple currencies
6. **Profit Margin Calculations**: Add percentage-based profit margin fields
7. **Comparison Periods**: Include previous period comparison data

