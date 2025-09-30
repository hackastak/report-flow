# Shopify Data Fetcher Service

## Overview

The Shopify Data Fetcher Service is responsible for retrieving analytics data from the Shopify Admin GraphQL API for each report type. It handles pagination, rate limiting, retries, and error handling.

## File Location

`app/services/shopifyDataFetcher.server.ts`

---

## Main Function

### `fetchShopifyData(options: FetchDataOptions): Promise<FetchDataResult>`

Main entry point for fetching data based on report type.

**Parameters:**
```typescript
interface FetchDataOptions {
  reportType: ReportType;
  filters: Record<string, any>;
  admin: any; // Shopify admin GraphQL client
}
```

**Returns:**
```typescript
interface FetchDataResult {
  success: boolean;
  data: any[];
  recordCount: number;
  error?: string;
}
```

**Example Usage:**
```typescript
import { fetchShopifyData } from "~/services/shopifyDataFetcher.server";

const result = await fetchShopifyData({
  reportType: "SALES",
  filters: {
    dateRange: "LAST_30_DAYS",
    salesChannel: ["online_store"],
  },
  admin: admin, // From authenticate.admin(request)
});

if (result.success) {
  console.log(`Fetched ${result.recordCount} records`);
  // Process result.data
} else {
  console.error(`Error: ${result.error}`);
}
```

---

## Report Type Functions

### 1. Sales Report (`fetchSalesData`)

**Data Fetched:**
- Order ID and name
- Created date
- Total price (with currency)
- Total discounts
- Total tax
- Net payment
- Line item count

**Filters Supported:**
- `dateRange` - Date range for orders (required)
- `salesChannel` - Filter by sales channel (optional)
- `location` - Filter by location (optional)

**GraphQL Query:**
```graphql
query GetOrders($query: String!, $cursor: String) {
  orders(first: 250, query: $query, after: $cursor) {
    edges {
      node {
        id
        name
        createdAt
        totalPriceSet { shopMoney { amount currencyCode } }
        totalDiscountsSet { shopMoney { amount } }
        totalTaxSet { shopMoney { amount } }
        netPaymentSet { shopMoney { amount } }
        lineItems(first: 1) { edges { node { id } } }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Example Data:**
```json
{
  "id": "gid://shopify/Order/123",
  "name": "#1001",
  "createdAt": "2025-01-15T10:00:00Z",
  "totalPriceSet": {
    "shopMoney": { "amount": "150.00", "currencyCode": "USD" }
  },
  "totalDiscountsSet": { "shopMoney": { "amount": "15.00" } },
  "totalTaxSet": { "shopMoney": { "amount": "12.00" } },
  "netPaymentSet": { "shopMoney": { "amount": "147.00" } }
}
```

---

### 2. Orders Report (`fetchOrdersData`)

**Data Fetched:**
- Order ID and name
- Created date
- Financial status
- Fulfillment status
- Cancelled date
- Total price
- Customer info (name, email)
- Line item count

**Filters Supported:**
- `dateRange` - Date range for orders (required)
- `orderStatus` - Filter by order status (optional)
- `fulfillmentStatus` - Filter by fulfillment status (optional)
- `financialStatus` - Filter by financial status (optional)

**GraphQL Query:**
```graphql
query GetOrderDetails($query: String!, $cursor: String) {
  orders(first: 250, query: $query, after: $cursor) {
    edges {
      node {
        id
        name
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        cancelledAt
        totalPriceSet { shopMoney { amount currencyCode } }
        customer { firstName lastName email }
        lineItems(first: 100) { edges { node { id quantity } } }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

---

### 3. Products Report (`fetchProductsData`)

**Data Fetched:**
- Product ID and title
- Vendor
- Product type
- Variants (SKU, price, inventory)

**Filters Supported:**
- `dateRange` - Date range for sales data (required)
- `productType` - Filter by product type (optional)
- `vendor` - Filter by vendor (optional)
- `collection` - Filter by collection (optional)

**GraphQL Query:**
```graphql
query GetProducts($query: String, $cursor: String) {
  products(first: 250, query: $query, after: $cursor) {
    edges {
      node {
        id
        title
        vendor
        productType
        variants(first: 100) {
          edges {
            node {
              id
              sku
              price
              inventoryQuantity
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Note:** Sales data for products requires a separate query to fetch order line items within the date range. This is handled in the data processor service.

---

### 4. Customers Report (`fetchCustomersData`)

**Data Fetched:**
- Customer ID
- Name (first, last)
- Email
- Created date
- Number of orders
- Amount spent
- Last order date

**Filters Supported:**
- `dateRange` - Date range for filtering (required)
- `customerType` - Filter by customer type (ALL, NEW, RETURNING)

**GraphQL Query:**
```graphql
query GetCustomers($query: String, $cursor: String) {
  customers(first: 250, query: $query, after: $cursor) {
    edges {
      node {
        id
        firstName
        lastName
        email
        createdAt
        numberOfOrders
        amountSpent { amount currencyCode }
        lastOrder { createdAt }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

---

### 5. Inventory Report (`fetchInventoryData`)

**Data Fetched:**
- Product ID and title
- Vendor
- Product type
- Variant details (SKU, price)
- Inventory quantity
- Unit cost
- Inventory value (calculated)

**Filters Supported:**
- `location` - Filter by location (optional)
- `productType` - Filter by product type (optional)
- `vendor` - Filter by vendor (optional)
- `stockLevel` - Filter by stock level (ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK)

**GraphQL Query:**
```graphql
query GetInventory($query: String, $cursor: String) {
  products(first: 250, query: $query, after: $cursor) {
    edges {
      node {
        id
        title
        vendor
        productType
        variants(first: 100) {
          edges {
            node {
              id
              sku
              price
              inventoryQuantity
              inventoryItem {
                id
                unitCost { amount }
              }
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Post-Processing:**
- Flattens variants into individual inventory items
- Applies stock level filter (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
- Calculates inventory value (quantity × unit cost)

---

### 6. Traffic Report (`fetchTrafficData`)

**Status:** Not Available

**Reason:** Shopify GraphQL API does not provide traffic/analytics data. This would require:
- Shopify Analytics API (separate API)
- Google Analytics integration
- Custom tracking implementation

**Returns:**
```json
{
  "success": false,
  "data": [],
  "recordCount": 0,
  "error": "Traffic data is not available via Shopify GraphQL API..."
}
```

---

### 7. Discounts Report (`fetchDiscountsData`)

**Data Fetched:**
- Discount ID
- Discount code
- Title
- Start/end dates
- Status
- Usage count
- Discount type

**Filters Supported:**
- `dateRange` - Date range for filtering (optional)
- `discountType` - Filter by discount type (optional)
- `status` - Filter by status (ALL, ACTIVE, EXPIRED, SCHEDULED)

**GraphQL Query:**
```graphql
query GetDiscounts($cursor: String) {
  codeDiscountNodes(first: 250, after: $cursor) {
    edges {
      node {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            codes(first: 1) { edges { node { code } } }
            startsAt
            endsAt
            status
            usageCount
          }
          ... on DiscountCodeBxgy {
            title
            codes(first: 1) { edges { node { code } } }
            startsAt
            endsAt
            status
            usageCount
          }
          ... on DiscountCodeFreeShipping {
            title
            codes(first: 1) { edges { node { code } } }
            startsAt
            endsAt
            status
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

---

## Rate Limiting & Retry Logic

### Configuration

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};
```

### Retry Strategy

**Exponential Backoff:**
- Attempt 1: 1000ms delay
- Attempt 2: 2000ms delay
- Attempt 3: 4000ms delay
- Max delay: 10000ms

**Triggers:**
- Rate limit errors (THROTTLED)
- Network errors
- Temporary server errors

**Example:**
```typescript
async function executeGraphQLWithRetry(
  admin: any,
  query: string,
  variables: any,
  retryCount = 0
): Promise<any> {
  try {
    const response = await admin.graphql(query, { variables });
    const result = await response.json();

    if (result.errors) {
      const rateLimitError = result.errors.find(
        (err: any) => err.extensions?.code === "THROTTLED"
      );

      if (rateLimitError && retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
          RETRY_CONFIG.maxDelayMs
        );
        await sleep(delay);
        return executeGraphQLWithRetry(admin, query, variables, retryCount + 1);
      }

      throw new Error(result.errors[0].message);
    }

    return result;
  } catch (error) {
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = ...;
      await sleep(delay);
      return executeGraphQLWithRetry(admin, query, variables, retryCount + 1);
    }
    throw error;
  }
}
```

---

## Pagination

### Strategy

All queries use cursor-based pagination with a maximum of 250 records per page.

**Configuration:**
- `first: 250` - Maximum records per page
- `maxPages: 20` - Maximum pages to fetch (5000 records total)
- `after: cursor` - Cursor for next page

**Example:**
```typescript
let hasNextPage = true;
let cursor: string | null = null;
const maxPages = 20;
let pageCount = 0;

while (hasNextPage && pageCount < maxPages) {
  const result = await executeGraphQLWithRetry(admin, query, {
    query: queryFilter,
    cursor: cursor,
  });

  const items = result.data.orders.edges.map((edge: any) => edge.node);
  allItems.push(...items);

  hasNextPage = result.data.orders.pageInfo.hasNextPage;
  cursor = result.data.orders.pageInfo.endCursor;
  pageCount++;
}
```

**Safety Limits:**
- Maximum 20 pages per report
- Maximum 5000 records per report
- Prevents infinite loops
- Prevents excessive API usage

---

## Error Handling

### Error Types

1. **Rate Limiting Errors**
   - Code: `THROTTLED`
   - Action: Retry with exponential backoff

2. **GraphQL Errors**
   - Invalid query syntax
   - Permission errors
   - Action: Return error to caller

3. **Network Errors**
   - Connection timeout
   - DNS errors
   - Action: Retry with exponential backoff

4. **Data Errors**
   - Invalid filter values
   - Missing required fields
   - Action: Return error to caller

### Error Response Format

```typescript
{
  success: false,
  data: [],
  recordCount: 0,
  error: "Error message describing what went wrong"
}
```

---

## Performance Considerations

### API Rate Limits

**Shopify GraphQL API Limits:**
- 2 requests per second (bucket-based)
- 1000 cost points per 60 seconds
- Each query has a cost (typically 1-10 points)

**Our Approach:**
- Fetch 250 records per request (maximum allowed)
- Use cursor pagination for efficiency
- Implement retry logic for rate limit errors
- Limit to 20 pages (5000 records) per report

### Optimization Tips

1. **Reduce Field Selection:**
   - Only request fields needed for the report
   - Avoid nested queries when possible

2. **Use Query Filters:**
   - Filter data at the API level
   - Reduces data transfer and processing

3. **Batch Processing:**
   - Process data in chunks
   - Avoid loading all data into memory

4. **Caching:**
   - Cache frequently accessed data
   - Reduce API calls for repeated reports

---

## Related Documentation

- API Routes: `docs/API_ROUTES.md`
- Report Types: `app/config/reportTypes.ts`
- Date Range Helper: `app/utils/dateRangeHelper.ts`
- Shopify Scopes: `docs/SHOPIFY_SCOPES.md`

