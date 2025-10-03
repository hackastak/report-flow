/**
 * Report Types Configuration
 * 
 * Defines all available report types, their filters, data fields,
 * and metadata for the Report Flow app.
 */

export type ReportType =
  | "SALES"
  | "ORDERS"
  | "PRODUCTS"
  | "CUSTOMERS"
  | "INVENTORY"
  | "TRAFFIC"
  | "DISCOUNTS"
  | "FINANCE_SUMMARY"
  | "CUSTOM";

export type FilterType =
  | "DATE_RANGE"
  | "PRODUCT_TYPE"
  | "PRODUCT_VENDOR"
  | "PRODUCT_COLLECTION"
  | "ORDER_STATUS"
  | "FULFILLMENT_STATUS"
  | "FINANCIAL_STATUS"
  | "CUSTOMER_TYPE"
  | "SALES_CHANNEL"
  | "LOCATION"
  | "DISCOUNT_TYPE";

export type DateRangeType =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "LAST_QUARTER"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "CUSTOM";

export interface FilterOption {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange" | "text";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: any;
}

export interface DataField {
  key: string;
  label: string;
  type: "string" | "number" | "currency" | "date" | "datetime" | "boolean";
  description?: string;
}

export interface ReportTypeConfig {
  type: ReportType;
  name: string;
  description: string;
  icon: string;
  category: "sales" | "operations" | "marketing" | "analytics";
  filters: FilterOption[];
  dataFields: DataField[];
  defaultFilters?: Record<string, any>;
}

/**
 * Date Range Filter Options
 */
export const DATE_RANGE_OPTIONS: Array<{ value: DateRangeType; label: string }> = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "LAST_MONTH", label: "Last month" },
  { value: "THIS_QUARTER", label: "This quarter" },
  { value: "LAST_QUARTER", label: "Last quarter" },
  { value: "THIS_YEAR", label: "This year" },
  { value: "LAST_YEAR", label: "Last year" },
  { value: "CUSTOM", label: "Custom date range" },
];

/**
 * Order Status Options
 */
export const ORDER_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "CANCELLED", label: "Cancelled" },
];

/**
 * Fulfillment Status Options
 */
export const FULFILLMENT_STATUS_OPTIONS = [
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "UNFULFILLED", label: "Unfulfilled" },
  { value: "PARTIALLY_FULFILLED", label: "Partially fulfilled" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ON_HOLD", label: "On hold" },
];

/**
 * Financial Status Options
 */
export const FINANCIAL_STATUS_OPTIONS = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially paid" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "VOIDED", label: "Voided" },
  { value: "PARTIALLY_REFUNDED", label: "Partially refunded" },
];

/**
 * Customer Type Options
 */
export const CUSTOMER_TYPE_OPTIONS = [
  { value: "ALL", label: "All customers" },
  { value: "NEW", label: "New customers" },
  { value: "RETURNING", label: "Returning customers" },
];

/**
 * Report Type Configurations
 */
export const REPORT_TYPES: Record<ReportType, ReportTypeConfig> = {
  SALES: {
    type: "SALES",
    name: "Sales Report",
    description: "Analyze sales performance, revenue, and trends over time",
    icon: "💰",
    category: "sales",
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
          { value: "mobile", label: "Mobile" },
          { value: "facebook", label: "Facebook" },
          { value: "instagram", label: "Instagram" },
        ],
      },
      {
        key: "location",
        label: "Location",
        type: "multiselect",
        options: [], // Will be populated dynamically from store locations
      },
    ],
    dataFields: [
      { key: "date", label: "Date", type: "date" },
      { key: "orderCount", label: "Orders", type: "number" },
      { key: "totalSales", label: "Total Sales", type: "currency" },
      { key: "averageOrderValue", label: "Average Order Value", type: "currency" },
      { key: "totalDiscounts", label: "Total Discounts", type: "currency" },
      { key: "totalTax", label: "Total Tax", type: "currency" },
      { key: "netSales", label: "Net Sales", type: "currency" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
    },
  },

  ORDERS: {
    type: "ORDERS",
    name: "Orders Report",
    description: "Track order details, status, and fulfillment information",
    icon: "📦",
    category: "operations",
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
        key: "orderStatus",
        label: "Order Status",
        type: "multiselect",
        options: ORDER_STATUS_OPTIONS,
      },
      {
        key: "fulfillmentStatus",
        label: "Fulfillment Status",
        type: "multiselect",
        options: FULFILLMENT_STATUS_OPTIONS,
      },
      {
        key: "financialStatus",
        label: "Financial Status",
        type: "multiselect",
        options: FINANCIAL_STATUS_OPTIONS,
      },
    ],
    dataFields: [
      { key: "orderNumber", label: "Order Number", type: "string" },
      { key: "orderDate", label: "Order Date", type: "datetime" },
      { key: "customerName", label: "Customer Name", type: "string" },
      { key: "customerEmail", label: "Customer Email", type: "string" },
      { key: "totalPrice", label: "Total Price", type: "currency" },
      { key: "orderStatus", label: "Order Status", type: "string" },
      { key: "fulfillmentStatus", label: "Fulfillment Status", type: "string" },
      { key: "financialStatus", label: "Financial Status", type: "string" },
      { key: "itemCount", label: "Item Count", type: "number" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
    },
  },

  PRODUCTS: {
    type: "PRODUCTS",
    name: "Products Report",
    description: "View product performance, sales, and inventory metrics",
    icon: "🛍️",
    category: "sales",
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
        key: "productType",
        label: "Product Type",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
      {
        key: "vendor",
        label: "Vendor",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
      {
        key: "collection",
        label: "Collection",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
    ],
    dataFields: [
      { key: "productTitle", label: "Product Title", type: "string" },
      { key: "sku", label: "SKU", type: "string" },
      { key: "vendor", label: "Vendor", type: "string" },
      { key: "productType", label: "Product Type", type: "string" },
      { key: "unitsSold", label: "Units Sold", type: "number" },
      { key: "totalRevenue", label: "Total Revenue", type: "currency" },
      { key: "averagePrice", label: "Average Price", type: "currency" },
      { key: "inventoryQuantity", label: "Current Inventory", type: "number" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
    },
  },

  CUSTOMERS: {
    type: "CUSTOMERS",
    name: "Customers Report",
    description: "Analyze customer behavior, lifetime value, and segmentation",
    icon: "👥",
    category: "analytics",
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
        key: "customerType",
        label: "Customer Type",
        type: "select",
        options: CUSTOMER_TYPE_OPTIONS,
        defaultValue: "ALL",
      },
    ],
    dataFields: [
      { key: "customerName", label: "Customer Name", type: "string" },
      { key: "email", label: "Email", type: "string" },
      { key: "totalOrders", label: "Total Orders", type: "number" },
      { key: "totalSpent", label: "Total Spent", type: "currency" },
      { key: "averageOrderValue", label: "Average Order Value", type: "currency" },
      { key: "firstOrderDate", label: "First Order Date", type: "date" },
      { key: "lastOrderDate", label: "Last Order Date", type: "date" },
      { key: "customerSince", label: "Customer Since", type: "date" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
      customerType: "ALL",
    },
  },

  INVENTORY: {
    type: "INVENTORY",
    name: "Inventory Report",
    description: "Monitor stock levels, inventory value, and product availability",
    icon: "📊",
    category: "operations",
    filters: [
      {
        key: "location",
        label: "Location",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
      {
        key: "productType",
        label: "Product Type",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
      {
        key: "vendor",
        label: "Vendor",
        type: "multiselect",
        options: [], // Will be populated dynamically
      },
      {
        key: "stockLevel",
        label: "Stock Level",
        type: "select",
        options: [
          { value: "ALL", label: "All products" },
          { value: "IN_STOCK", label: "In stock" },
          { value: "LOW_STOCK", label: "Low stock (< 10 units)" },
          { value: "OUT_OF_STOCK", label: "Out of stock" },
        ],
        defaultValue: "ALL",
      },
    ],
    dataFields: [
      { key: "productTitle", label: "Product Title", type: "string" },
      { key: "sku", label: "SKU", type: "string" },
      { key: "vendor", label: "Vendor", type: "string" },
      { key: "location", label: "Location", type: "string" },
      { key: "quantityAvailable", label: "Quantity Available", type: "number" },
      { key: "quantityOnHand", label: "Quantity On Hand", type: "number" },
      { key: "quantityCommitted", label: "Quantity Committed", type: "number" },
      { key: "inventoryValue", label: "Inventory Value", type: "currency" },
    ],
    defaultFilters: {
      stockLevel: "ALL",
    },
  },

  TRAFFIC: {
    type: "TRAFFIC",
    name: "Traffic Report",
    description: "Track website traffic, sessions, and conversion metrics",
    icon: "📈",
    category: "analytics",
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
          { value: "mobile", label: "Mobile" },
        ],
      },
    ],
    dataFields: [
      { key: "date", label: "Date", type: "date" },
      { key: "sessions", label: "Sessions", type: "number" },
      { key: "uniqueVisitors", label: "Unique Visitors", type: "number" },
      { key: "pageViews", label: "Page Views", type: "number" },
      { key: "conversionRate", label: "Conversion Rate", type: "number", description: "Percentage" },
      { key: "addedToCart", label: "Added to Cart", type: "number" },
      { key: "reachedCheckout", label: "Reached Checkout", type: "number" },
      { key: "completedPurchase", label: "Completed Purchase", type: "number" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
    },
  },

  DISCOUNTS: {
    type: "DISCOUNTS",
    name: "Discounts Report",
    description: "Analyze discount code usage, performance, and ROI",
    icon: "🎯",
    category: "marketing",
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
        key: "discountType",
        label: "Discount Type",
        type: "multiselect",
        options: [
          { value: "PERCENTAGE", label: "Percentage" },
          { value: "FIXED_AMOUNT", label: "Fixed Amount" },
          { value: "FREE_SHIPPING", label: "Free Shipping" },
          { value: "BUY_X_GET_Y", label: "Buy X Get Y" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ALL", label: "All" },
          { value: "ACTIVE", label: "Active" },
          { value: "EXPIRED", label: "Expired" },
          { value: "SCHEDULED", label: "Scheduled" },
        ],
        defaultValue: "ALL",
      },
    ],
    dataFields: [
      { key: "discountCode", label: "Discount Code", type: "string" },
      { key: "discountType", label: "Discount Type", type: "string" },
      { key: "timesUsed", label: "Times Used", type: "number" },
      { key: "totalRevenue", label: "Total Revenue", type: "currency" },
      { key: "totalDiscountAmount", label: "Total Discount Amount", type: "currency" },
      { key: "averageOrderValue", label: "Average Order Value", type: "currency" },
      { key: "status", label: "Status", type: "string" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
      status: "ALL",
    },
  },

  FINANCE_SUMMARY: {
    type: "FINANCE_SUMMARY",
    name: "Finance Summary",
    description: "Comprehensive financial report with sales breakdown, gross profit, payments, and gift cards",
    icon: "💵",
    category: "sales",
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
          { value: "mobile", label: "Mobile" },
          { value: "facebook", label: "Facebook" },
          { value: "instagram", label: "Instagram" },
        ],
      },
    ],
    dataFields: [
      { key: "date", label: "Date", type: "date" },
      // Total sales breakdown
      { key: "grossSales", label: "Gross Sales", type: "currency" },
      { key: "discounts", label: "Discounts", type: "currency" },
      { key: "returns", label: "Returns", type: "currency" },
      { key: "netSales", label: "Net Sales", type: "currency" },
      { key: "shippingCharges", label: "Shipping Charges", type: "currency" },
      { key: "returnFees", label: "Return Fees", type: "currency" },
      { key: "taxes", label: "Taxes", type: "currency" },
      { key: "totalSales", label: "Total Sales", type: "currency" },
      // Gross profit breakdown
      { key: "netSalesWithoutCost", label: "Net Sales Without Cost Recorded", type: "currency" },
      { key: "netSalesWithCost", label: "Net Sales With Cost Recorded", type: "currency" },
      { key: "costOfGoodsSold", label: "Cost of Goods Sold", type: "currency" },
      { key: "grossProfit", label: "Gross Profit", type: "currency" },
      // Payment information
      { key: "netPayments", label: "Net Payments", type: "currency" },
      { key: "grossPaymentsShopifyPayments", label: "Gross Payments from Shopify Payments", type: "currency" },
      { key: "netSalesFromGiftCards", label: "Net Sales from Gift Cards", type: "currency" },
      { key: "outstandingGiftCardBalance", label: "Outstanding Gift Card Balance", type: "currency" },
      { key: "tips", label: "Tips", type: "currency" },
    ],
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
    },
  },

  CUSTOM: {
    type: "CUSTOM",
    name: "Custom Report",
    description: "Create your own custom report with any fields available from the Shopify API",
    icon: "⚙️",
    category: "analytics",
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
        key: "dataSource",
        label: "Data Source",
        type: "select",
        options: [
          { value: "ORDERS", label: "Orders" },
          { value: "PRODUCTS", label: "Products" },
          { value: "CUSTOMERS", label: "Customers" },
        ],
        required: true,
        defaultValue: "ORDERS",
      },
    ],
    dataFields: [], // Fields will be dynamically selected by the user
    defaultFilters: {
      dateRange: "LAST_30_DAYS",
      dataSource: "ORDERS",
    },
  },
};

/**
 * Get report type configuration by type
 */
export function getReportTypeConfig(type: ReportType): ReportTypeConfig {
  return REPORT_TYPES[type];
}

/**
 * Get all report types as an array
 */
export function getAllReportTypes(): ReportTypeConfig[] {
  return Object.values(REPORT_TYPES);
}

/**
 * Get report types by category
 */
export function getReportTypesByCategory(
  category: "sales" | "operations" | "marketing" | "analytics"
): ReportTypeConfig[] {
  return getAllReportTypes().filter((report) => report.category === category);
}

/**
 * Validate if a report type exists
 */
export function isValidReportType(type: string): type is ReportType {
  return type in REPORT_TYPES;
}

