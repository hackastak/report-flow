/**
 * Shopify Data Fetcher Service
 *
 * Fetches analytics data from Shopify Admin GraphQL API
 * for each report type with pagination and error handling
 */

import type { ReportType } from "../config/reportTypes";
import { calculateDateRange } from "../utils/dateRangeHelper";

export interface FetchDataOptions {
  reportType: ReportType;
  filters: Record<string, any>;
  admin: any; // Shopify admin GraphQL client
}

export interface FetchDataResult {
  success: boolean;
  data: any[];
  recordCount: number;
  error?: string;
}

/**
 * Rate limiting and retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute GraphQL query with retry logic and rate limiting
 */
async function executeGraphQLWithRetry(
  admin: any,
  query: string,
  variables: any,
  retryCount = 0
): Promise<any> {
  try {
    const response = await admin.graphql(query, { variables });
    const result = await response.json();

    // Check for rate limiting errors
    if (result.errors) {
      const rateLimitError = result.errors.find(
        (err: any) => err.extensions?.code === "THROTTLED"
      );

      if (rateLimitError && retryCount < RETRY_CONFIG.maxRetries) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
          RETRY_CONFIG.maxDelayMs
        );

        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
        await sleep(delay);
        return executeGraphQLWithRetry(admin, query, variables, retryCount + 1);
      }

      // If not a rate limit error or max retries reached, throw
      throw new Error(result.errors[0].message);
    }

    return result;
  } catch (error) {
    // Network errors or other exceptions
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelayMs
      );

      console.log(`Request failed. Retrying in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      await sleep(delay);
      return executeGraphQLWithRetry(admin, query, variables, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Main function to fetch data based on report type
 */
export async function fetchShopifyData(
  options: FetchDataOptions
): Promise<FetchDataResult> {
  const { reportType, filters, admin } = options;

  try {
    switch (reportType) {
      case "SALES":
        return await fetchSalesData(admin, filters);
      case "ORDERS":
        return await fetchOrdersData(admin, filters);
      case "PRODUCTS":
        return await fetchProductsData(admin, filters);
      case "CUSTOMERS":
        return await fetchCustomersData(admin, filters);
      case "INVENTORY":
        return await fetchInventoryData(admin, filters);
      case "TRAFFIC":
        return await fetchTrafficData(admin, filters);
      case "DISCOUNTS":
        return await fetchDiscountsData(admin, filters);
      default:
        return {
          success: false,
          data: [],
          recordCount: 0,
          error: `Unknown report type: ${reportType}`,
        };
    }
  } catch (error) {
    console.error("Failed to fetch Shopify data:", error);
    return {
      success: false,
      data: [],
      recordCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch Sales Data
 */
async function fetchSalesData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  const { startDate, endDate } = calculateDateRange(
    filters.dateRange || "LAST_30_DAYS",
    filters.customStartDate,
    filters.customEndDate
  );

  // Build query filter
  let queryFilter = `created_at:>='${startDate.toISOString()}' AND created_at:<='${endDate.toISOString()}'`;
  
  if (filters.salesChannel && filters.salesChannel.length > 0) {
    const channels = filters.salesChannel.join(" OR ");
    queryFilter += ` AND (${channels})`;
  }

  const allOrders: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20; // Limit to prevent infinite loops
  let pageCount = 0;

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
      query GetOrders($query: String!, $cursor: String) {
        orders(first: 250, query: $query, after: $cursor) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalDiscountsSet {
                shopMoney {
                  amount
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                }
              }
              netPaymentSet {
                shopMoney {
                  amount
                }
              }
              lineItems(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        query: queryFilter,
        cursor: cursor,
      }
    );

    const orders = result.data.orders.edges.map((edge: any) => edge.node);
    allOrders.push(...orders);

    hasNextPage = result.data.orders.pageInfo.hasNextPage;
    cursor = result.data.orders.pageInfo.endCursor;
    pageCount++;
  }

  return {
    success: true,
    data: allOrders,
    recordCount: allOrders.length,
  };
}

/**
 * Fetch Orders Data
 */
async function fetchOrdersData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  const { startDate, endDate } = calculateDateRange(
    filters.dateRange || "LAST_30_DAYS",
    filters.customStartDate,
    filters.customEndDate
  );

  let queryFilter = `created_at:>='${startDate.toISOString()}' AND created_at:<='${endDate.toISOString()}'`;

  // Add status filters
  if (filters.orderStatus && filters.orderStatus.length > 0) {
    const statuses = filters.orderStatus.map((s: string) => `status:${s}`).join(" OR ");
    queryFilter += ` AND (${statuses})`;
  }

  if (filters.fulfillmentStatus && filters.fulfillmentStatus.length > 0) {
    const statuses = filters.fulfillmentStatus.map((s: string) => `fulfillment_status:${s}`).join(" OR ");
    queryFilter += ` AND (${statuses})`;
  }

  if (filters.financialStatus && filters.financialStatus.length > 0) {
    const statuses = filters.financialStatus.map((s: string) => `financial_status:${s}`).join(" OR ");
    queryFilter += ` AND (${statuses})`;
  }

  const allOrders: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20;
  let pageCount = 0;

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
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
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                firstName
                lastName
                email
              }
              lineItems(first: 100) {
                edges {
                  node {
                    id
                    quantity
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        query: queryFilter,
        cursor: cursor,
      }
    );

    const orders = result.data.orders.edges.map((edge: any) => edge.node);
    allOrders.push(...orders);

    hasNextPage = result.data.orders.pageInfo.hasNextPage;
    cursor = result.data.orders.pageInfo.endCursor;
    pageCount++;
  }

  return {
    success: true,
    data: allOrders,
    recordCount: allOrders.length,
  };
}

/**
 * Fetch Products Data
 */
async function fetchProductsData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  const { startDate, endDate } = calculateDateRange(
    filters.dateRange || "LAST_30_DAYS",
    filters.customStartDate,
    filters.customEndDate
  );

  // First, fetch products
  const allProducts: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20;
  let pageCount = 0;

  let queryFilter = "";
  if (filters.productType && filters.productType.length > 0) {
    const types = filters.productType.map((t: string) => `product_type:'${t}'`).join(" OR ");
    queryFilter = types;
  }

  if (filters.vendor && filters.vendor.length > 0) {
    const vendors = filters.vendor.map((v: string) => `vendor:'${v}'`).join(" OR ");
    queryFilter += queryFilter ? ` AND (${vendors})` : vendors;
  }

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
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
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        query: queryFilter || null,
        cursor: cursor,
      }
    );

    const products = result.data.products.edges.map((edge: any) => edge.node);
    allProducts.push(...products);

    hasNextPage = result.data.products.pageInfo.hasNextPage;
    cursor = result.data.products.pageInfo.endCursor;
    pageCount++;
  }

  // TODO: Fetch order line items for the date range to calculate sales
  // This would require a separate query to get line items by date

  return {
    success: true,
    data: allProducts,
    recordCount: allProducts.length,
  };
}

/**
 * Fetch Customers Data
 */
async function fetchCustomersData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  const { startDate, endDate } = calculateDateRange(
    filters.dateRange || "LAST_30_DAYS",
    filters.customStartDate,
    filters.customEndDate
  );

  // Build query based on customer type
  let queryFilter = "";
  if (filters.customerType === "NEW") {
    queryFilter = `created_at:>='${startDate.toISOString()}' AND created_at:<='${endDate.toISOString()}'`;
  } else if (filters.customerType === "RETURNING") {
    queryFilter = `orders_count:>1`;
  }

  const allCustomers: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20;
  let pageCount = 0;

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
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
              amountSpent {
                amount
                currencyCode
              }
              lastOrder {
                createdAt
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        query: queryFilter || null,
        cursor: cursor,
      }
    );

    const customers = result.data.customers.edges.map((edge: any) => edge.node);
    allCustomers.push(...customers);

    hasNextPage = result.data.customers.pageInfo.hasNextPage;
    cursor = result.data.customers.pageInfo.endCursor;
    pageCount++;
  }

  return {
    success: true,
    data: allCustomers,
    recordCount: allCustomers.length,
  };
}

/**
 * Fetch Inventory Data
 */
async function fetchInventoryData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  let queryFilter = "";

  if (filters.productType && filters.productType.length > 0) {
    const types = filters.productType.map((t: string) => `product_type:'${t}'`).join(" OR ");
    queryFilter = types;
  }

  if (filters.vendor && filters.vendor.length > 0) {
    const vendors = filters.vendor.map((v: string) => `vendor:'${v}'`).join(" OR ");
    queryFilter += queryFilter ? ` AND (${vendors})` : vendors;
  }

  const allInventoryItems: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20;
  let pageCount = 0;

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
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
                      unitCost {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        query: queryFilter || null,
        cursor: cursor,
      }
    );

    const products = result.data.products.edges.map((edge: any) => edge.node);

    // Flatten variants into inventory items
    products.forEach((product: any) => {
      product.variants.edges.forEach((variantEdge: any) => {
        const variant = variantEdge.node;
        allInventoryItems.push({
          productId: product.id,
          productTitle: product.title,
          vendor: product.vendor,
          productType: product.productType,
          variantId: variant.id,
          sku: variant.sku,
          price: variant.price,
          inventoryQuantity: variant.inventoryQuantity,
          unitCost: variant.inventoryItem?.unitCost?.amount || 0,
        });
      });
    });

    hasNextPage = result.data.products.pageInfo.hasNextPage;
    cursor = result.data.products.pageInfo.endCursor;
    pageCount++;
  }

  // Apply stock level filter
  let filteredItems = allInventoryItems;
  if (filters.stockLevel) {
    switch (filters.stockLevel) {
      case "IN_STOCK":
        filteredItems = allInventoryItems.filter((item) => item.inventoryQuantity > 0);
        break;
      case "LOW_STOCK":
        filteredItems = allInventoryItems.filter((item) => item.inventoryQuantity > 0 && item.inventoryQuantity < 10);
        break;
      case "OUT_OF_STOCK":
        filteredItems = allInventoryItems.filter((item) => item.inventoryQuantity === 0);
        break;
    }
  }

  return {
    success: true,
    data: filteredItems,
    recordCount: filteredItems.length,
  };
}

/**
 * Fetch Traffic Data
 * Note: Shopify doesn't provide traffic data via GraphQL API
 * This would require Shopify Analytics API or Google Analytics integration
 */
async function fetchTrafficData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  // Traffic data is not available via GraphQL API
  // Would need to use Shopify Analytics API or integrate with Google Analytics

  return {
    success: false,
    data: [],
    recordCount: 0,
    error: "Traffic data is not available via Shopify GraphQL API. Consider integrating with Google Analytics or using Shopify Analytics API.",
  };
}

/**
 * Fetch Discounts Data
 */
async function fetchDiscountsData(
  admin: any,
  filters: Record<string, any>
): Promise<FetchDataResult> {
  const allDiscounts: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const maxPages = 20;
  let pageCount = 0;

  while (hasNextPage && pageCount < maxPages) {
    const result = await executeGraphQLWithRetry(
      admin,
      `#graphql
      query GetDiscounts($cursor: String) {
        codeDiscountNodes(first: 250, after: $cursor) {
          edges {
            node {
              id
              codeDiscount {
                ... on DiscountCodeBasic {
                  title
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  status
                  usageCount
                  customerSelection {
                    __typename
                  }
                }
                ... on DiscountCodeBxgy {
                  title
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  status
                  usageCount
                }
                ... on DiscountCodeFreeShipping {
                  title
                  codes(first: 1) {
                    edges {
                      node {
                        code
                      }
                    }
                  }
                  startsAt
                  endsAt
                  status
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        cursor: cursor,
      }
    );

    const discounts = result.data.codeDiscountNodes.edges.map((edge: any) => edge.node);
    allDiscounts.push(...discounts);

    hasNextPage = result.data.codeDiscountNodes.pageInfo.hasNextPage;
    cursor = result.data.codeDiscountNodes.pageInfo.endCursor;
    pageCount++;
  }

  return {
    success: true,
    data: allDiscounts,
    recordCount: allDiscounts.length,
  };
}

