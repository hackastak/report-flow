# Report Data Processor Service

## Overview

The Report Data Processor Service processes raw Shopify data, applies filters, formats data fields, and generates CSV files for reports. It transforms the raw GraphQL API responses into structured, formatted data ready for export.

## File Location

`app/services/reportDataProcessor.server.ts`

---

## Main Function

### `processReportData(options: ProcessDataOptions): Promise<ProcessDataResult>`

Main entry point for processing report data and generating CSV files.

**Parameters:**
```typescript
interface ProcessDataOptions {
  reportType: ReportType;
  rawData: any[];
  filters: Record<string, any>;
  reportName: string;
}
```

**Returns:**
```typescript
interface ProcessDataResult {
  success: boolean;
  filePath?: string;
  recordCount: number;
  fileSize?: number;
  error?: string;
}
```

**Example Usage:**
```typescript
import { processReportData } from "~/services/reportDataProcessor.server";

const result = await processReportData({
  reportType: "SALES",
  rawData: shopifyData,
  filters: { dateRange: "LAST_30_DAYS" },
  reportName: "Weekly Sales Report",
});

if (result.success) {
  console.log(`CSV generated: ${result.filePath}`);
  console.log(`Records: ${result.recordCount}, Size: ${result.fileSize} bytes`);
} else {
  console.error(`Error: ${result.error}`);
}
```

---

## Processing Functions

### 1. Sales Report (`processSalesData`)

**Input:** Raw order data from Shopify GraphQL API

**Processing:**
1. Groups orders by date
2. Calculates daily metrics:
   - Order count
   - Total sales
   - Total discounts
   - Total tax
   - Net sales
3. Calculates average order value
4. Sorts by date

**Output Format:**
```typescript
{
  date: "2025-01-15",
  orderCount: 25,
  totalSales: "3750.00",
  averageOrderValue: "150.00",
  totalDiscounts: "375.00",
  totalTax: "300.00",
  netSales: "3675.00"
}
```

**CSV Columns:**
- Date
- Orders
- Total Sales
- Average Order Value
- Total Discounts
- Total Tax
- Net Sales

---

### 2. Orders Report (`processOrdersData`)

**Input:** Raw order data with customer and line item information

**Processing:**
1. Extracts order details
2. Formats customer name
3. Counts line items
4. Formats dates and currency
5. Maps status fields

**Output Format:**
```typescript
{
  orderNumber: "#1001",
  orderDate: "2025-01-15 10:30:00",
  customerName: "John Smith",
  customerEmail: "john@example.com",
  totalPrice: "150.00",
  orderStatus: "OPEN",
  fulfillmentStatus: "FULFILLED",
  financialStatus: "PAID",
  itemCount: 3
}
```

**CSV Columns:**
- Order Number
- Order Date
- Customer Name
- Customer Email
- Total Price
- Order Status
- Fulfillment Status
- Financial Status
- Item Count

---

### 3. Products Report (`processProductsData`)

**Input:** Raw product data with variants

**Processing:**
1. Flattens product variants
2. Extracts SKU and pricing
3. Includes inventory quantity
4. Formats currency values

**Output Format:**
```typescript
{
  productTitle: "T-Shirt - Blue",
  sku: "TSHIRT-BLUE-M",
  vendor: "Acme Clothing",
  productType: "Apparel",
  unitsSold: 0,
  totalRevenue: "0.00",
  averagePrice: "29.99",
  inventoryQuantity: 50
}
```

**CSV Columns:**
- Product Title
- SKU
- Vendor
- Product Type
- Units Sold
- Total Revenue
- Average Price
- Current Inventory

**Note:** Units sold and total revenue require additional order line item data (to be implemented).

---

### 4. Customers Report (`processCustomersData`)

**Input:** Raw customer data with order history

**Processing:**
1. Formats customer names
2. Calculates average order value
3. Formats dates
4. Formats currency values

**Output Format:**
```typescript
{
  customerName: "John Smith",
  email: "john@example.com",
  totalOrders: 5,
  totalSpent: "750.00",
  averageOrderValue: "150.00",
  firstOrderDate: "2024-06-15",
  lastOrderDate: "2025-01-15",
  customerSince: "2024-06-01"
}
```

**CSV Columns:**
- Customer Name
- Email
- Total Orders
- Total Spent
- Average Order Value
- First Order Date
- Last Order Date
- Customer Since

---

### 5. Inventory Report (`processInventoryData`)

**Input:** Flattened inventory data from fetcher

**Processing:**
1. Calculates inventory value (quantity × unit cost)
2. Formats currency values
3. Includes location information

**Output Format:**
```typescript
{
  productTitle: "T-Shirt - Blue",
  sku: "TSHIRT-BLUE-M",
  vendor: "Acme Clothing",
  location: "Default",
  quantityAvailable: 50,
  quantityOnHand: 50,
  quantityCommitted: 0,
  inventoryValue: "1499.50"
}
```

**CSV Columns:**
- Product Title
- SKU
- Vendor
- Location
- Quantity Available
- Quantity On Hand
- Quantity Committed
- Inventory Value

**Note:** Location support and committed quantity calculation to be implemented.

---

### 6. Traffic Report (`processTrafficData`)

**Status:** Not Available

**Reason:** Traffic data is not available via Shopify GraphQL API.

**Returns:** Empty array

---

### 7. Discounts Report (`processDiscountsData`)

**Input:** Raw discount code data

**Processing:**
1. Extracts discount code
2. Determines discount type
3. Formats dates
4. Includes usage count

**Output Format:**
```typescript
{
  discountCode: "SUMMER20",
  discountType: "PERCENTAGE",
  timesUsed: 150,
  totalRevenue: "0.00",
  totalDiscountAmount: "0.00",
  averageOrderValue: "0.00",
  status: "ACTIVE",
  startDate: "2025-01-01",
  endDate: "2025-03-31"
}
```

**CSV Columns:**
- Discount Code
- Discount Type
- Times Used
- Total Revenue
- Total Discount Amount
- Average Order Value
- Status
- Start Date
- End Date

**Note:** Revenue and discount amount calculations require order data (to be implemented).

---

## CSV Generation

### Function: `generateCSV(data, dataFields, reportName)`

**Process:**
1. Creates `reports/` directory if it doesn't exist
2. Generates unique filename with timestamp
3. Sanitizes report name for filename
4. Creates CSV writer with headers from data fields
5. Writes records to file
6. Returns file path

**Filename Format:**
```
{sanitized_report_name}_{timestamp}.csv
```

**Example:**
```
weekly_sales_report_20250115-143022.csv
```

**File Location:**
```
/reports/weekly_sales_report_20250115-143022.csv
```

**CSV Writer Configuration:**
```typescript
const csvWriter = createObjectCsvWriter({
  path: filePath,
  header: dataFields.map((field) => ({
    id: field.key,
    title: field.label,
  })),
});
```

**Example CSV Output:**
```csv
Date,Orders,Total Sales,Average Order Value,Total Discounts,Total Tax,Net Sales
2025-01-01,10,1500.00,150.00,150.00,120.00,1470.00
2025-01-02,15,2250.00,150.00,225.00,180.00,2205.00
2025-01-03,12,1800.00,150.00,180.00,144.00,1764.00
```

---

## Data Formatting Functions

### `formatCurrency(value: number): string`

Formats numeric value as currency string with 2 decimal places.

**Example:**
```typescript
formatCurrency(1234.5)  // "1234.50"
formatCurrency(99.999)  // "100.00"
```

**Note:** Does not include currency symbol. All values are in shop's base currency.

---

### `formatDate(dateString: string): string`

Formats ISO date string to YYYY-MM-DD format.

**Example:**
```typescript
formatDate("2025-01-15T10:30:00Z")  // "2025-01-15"
```

---

### `formatDateTime(dateString: string): string`

Formats ISO date string to YYYY-MM-DD HH:MM:SS format.

**Example:**
```typescript
formatDateTime("2025-01-15T10:30:00Z")  // "2025-01-15 10:30:00"
```

---

## File Storage

### Directory Structure

```
project-root/
├── reports/
│   ├── weekly_sales_report_20250115-143022.csv
│   ├── daily_orders_report_20250115-150000.csv
│   └── monthly_inventory_report_20250115-160000.csv
```

### File Management

**Creation:**
- Files are created in the `reports/` directory
- Directory is created automatically if it doesn't exist
- Unique filenames prevent overwrites

**Retention:**
- Files are temporary and should be deleted after email is sent
- Cleanup should be handled by the execution service
- Consider implementing automatic cleanup for old files

**Security:**
- Files contain sensitive business data
- Should not be publicly accessible
- Should be deleted after use
- Consider encryption for sensitive reports

---

## Data Aggregation

### Sales Report Aggregation

**Daily Grouping:**
```typescript
const salesByDate: Record<string, any> = {};

rawData.forEach((order) => {
  const date = format(new Date(order.createdAt), "yyyy-MM-dd");
  
  if (!salesByDate[date]) {
    salesByDate[date] = {
      date,
      orderCount: 0,
      totalSales: 0,
      totalDiscounts: 0,
      totalTax: 0,
      netSales: 0,
    };
  }
  
  // Accumulate metrics
  salesByDate[date].orderCount += 1;
  salesByDate[date].totalSales += totalPrice;
  // ...
});
```

**Benefits:**
- Reduces data volume
- Provides daily trends
- Easier to analyze
- Better for visualization

---

## Error Handling

### Error Types

1. **Invalid Report Type**
   - Unknown report type
   - Returns error message

2. **Data Processing Errors**
   - Invalid data format
   - Missing required fields
   - Returns error with details

3. **File System Errors**
   - Cannot create directory
   - Cannot write file
   - Disk space issues
   - Returns error message

4. **CSV Generation Errors**
   - Invalid data structure
   - Encoding issues
   - Returns error message

### Error Response Format

```typescript
{
  success: false,
  recordCount: 0,
  error: "Error message describing what went wrong"
}
```

---

## Performance Considerations

### Memory Usage

**Large Datasets:**
- Process data in chunks if needed
- Avoid loading all data into memory
- Stream data to CSV if possible

**Current Limits:**
- Maximum 5000 records from fetcher
- All data loaded into memory
- Suitable for most use cases

### Processing Speed

**Optimization Tips:**
1. Minimize data transformations
2. Use efficient data structures
3. Avoid unnecessary loops
4. Cache calculated values

**Typical Performance:**
- 1000 records: < 1 second
- 5000 records: < 5 seconds

---

## Future Enhancements

### 1. Product Sales Calculation

**Current:** Units sold and revenue are set to 0

**Enhancement:** 
- Fetch order line items for date range
- Match line items to products
- Calculate units sold and revenue
- Aggregate by product/variant

### 2. Location Support

**Current:** All inventory shows "Default" location

**Enhancement:**
- Fetch inventory levels by location
- Include location name in report
- Support multi-location filtering

### 3. Discount Revenue Calculation

**Current:** Revenue metrics are set to 0

**Enhancement:**
- Fetch orders that used discount codes
- Calculate total revenue per discount
- Calculate average order value
- Calculate total discount amount

### 4. Streaming CSV Generation

**Current:** All data loaded into memory

**Enhancement:**
- Stream data to CSV file
- Process data in chunks
- Support larger datasets
- Reduce memory usage

### 5. Data Validation

**Enhancement:**
- Validate data before processing
- Check for required fields
- Handle missing data gracefully
- Provide detailed error messages

---

## Testing

### Unit Tests

**Test Cases:**
1. Process sales data correctly
2. Process orders data correctly
3. Format currency values
4. Format dates and datetimes
5. Generate CSV with correct headers
6. Handle empty data
7. Handle invalid report types
8. Handle file system errors

**Example Test:**
```typescript
describe("processSalesData", () => {
  it("should group orders by date", () => {
    const rawData = [
      { createdAt: "2025-01-15T10:00:00Z", totalPriceSet: { shopMoney: { amount: "100.00" } } },
      { createdAt: "2025-01-15T14:00:00Z", totalPriceSet: { shopMoney: { amount: "150.00" } } },
    ];
    
    const result = processSalesData(rawData, {});
    
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-01-15");
    expect(result[0].orderCount).toBe(2);
    expect(result[0].totalSales).toBe("250.00");
  });
});
```

---

## Related Documentation

- Shopify Data Fetcher: `docs/SHOPIFY_DATA_FETCHER.md`
- Report Types: `app/config/reportTypes.ts`
- Date Range Helper: `app/utils/dateRangeHelper.ts`
- API Routes: `docs/API_ROUTES.md`

