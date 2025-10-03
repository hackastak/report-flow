/**
 * Custom Report Fields Configuration
 * 
 * Comprehensive catalog of all available fields from Shopify Admin API
 * for building custom reports. Fields are organized by data source.
 */

export type DataSource = 
  | "ORDERS"
  | "PRODUCTS"
  | "CUSTOMERS"
  | "INVENTORY"
  | "SALES"
  | "FULFILLMENTS";

export interface CustomReportField {
  key: string;
  label: string;
  type: "string" | "number" | "currency" | "date" | "datetime" | "boolean" | "email" | "url";
  description?: string;
  source: DataSource;
  graphqlPath: string; // Path in GraphQL query
  category?: string; // For grouping fields in UI
}

/**
 * Order Fields - Comprehensive list from Shopify Order object
 */
export const ORDER_FIELDS: CustomReportField[] = [
  // Basic Order Information
  { key: "order_id", label: "Order ID", type: "string", source: "ORDERS", graphqlPath: "id", category: "Basic Info" },
  { key: "order_name", label: "Order Name", type: "string", source: "ORDERS", graphqlPath: "name", category: "Basic Info" },
  { key: "confirmation_number", label: "Confirmation Number", type: "string", source: "ORDERS", graphqlPath: "confirmationNumber", category: "Basic Info" },
  { key: "created_at", label: "Created At", type: "datetime", source: "ORDERS", graphqlPath: "createdAt", category: "Dates" },
  { key: "updated_at", label: "Updated At", type: "datetime", source: "ORDERS", graphqlPath: "updatedAt", category: "Dates" },
  { key: "processed_at", label: "Processed At", type: "datetime", source: "ORDERS", graphqlPath: "processedAt", category: "Dates" },
  { key: "cancelled_at", label: "Cancelled At", type: "datetime", source: "ORDERS", graphqlPath: "cancelledAt", category: "Dates" },
  { key: "closed_at", label: "Closed At", type: "datetime", source: "ORDERS", graphqlPath: "closedAt", category: "Dates" },
  
  // Financial Information
  { key: "currency_code", label: "Currency Code", type: "string", source: "ORDERS", graphqlPath: "currencyCode", category: "Financial" },
  { key: "current_subtotal_price", label: "Current Subtotal Price", type: "currency", source: "ORDERS", graphqlPath: "currentSubtotalPriceSet.shopMoney.amount", category: "Financial" },
  { key: "current_total_price", label: "Current Total Price", type: "currency", source: "ORDERS", graphqlPath: "currentTotalPriceSet.shopMoney.amount", category: "Financial" },
  { key: "current_total_tax", label: "Current Total Tax", type: "currency", source: "ORDERS", graphqlPath: "currentTotalTaxSet.shopMoney.amount", category: "Financial" },
  { key: "current_total_discounts", label: "Current Total Discounts", type: "currency", source: "ORDERS", graphqlPath: "currentTotalDiscountsSet.shopMoney.amount", category: "Financial" },
  { key: "current_shipping_price", label: "Current Shipping Price", type: "currency", source: "ORDERS", graphqlPath: "currentShippingPriceSet.shopMoney.amount", category: "Financial" },
  { key: "subtotal_price", label: "Subtotal Price", type: "currency", source: "ORDERS", graphqlPath: "subtotalPriceSet.shopMoney.amount", category: "Financial" },
  { key: "total_price", label: "Total Price", type: "currency", source: "ORDERS", graphqlPath: "totalPriceSet.shopMoney.amount", category: "Financial" },
  { key: "total_tax", label: "Total Tax", type: "currency", source: "ORDERS", graphqlPath: "totalTaxSet.shopMoney.amount", category: "Financial" },
  { key: "total_discounts", label: "Total Discounts", type: "currency", source: "ORDERS", graphqlPath: "totalDiscountsSet.shopMoney.amount", category: "Financial" },
  { key: "total_shipping_price", label: "Total Shipping Price", type: "currency", source: "ORDERS", graphqlPath: "totalShippingPriceSet.shopMoney.amount", category: "Financial" },
  { key: "total_tip_received", label: "Total Tip Received", type: "currency", source: "ORDERS", graphqlPath: "totalTipReceivedSet.shopMoney.amount", category: "Financial" },
  
  // Status Fields
  { key: "display_financial_status", label: "Financial Status", type: "string", source: "ORDERS", graphqlPath: "displayFinancialStatus", category: "Status" },
  { key: "display_fulfillment_status", label: "Fulfillment Status", type: "string", source: "ORDERS", graphqlPath: "displayFulfillmentStatus", category: "Status" },
  { key: "cancel_reason", label: "Cancel Reason", type: "string", source: "ORDERS", graphqlPath: "cancelReason", category: "Status" },
  { key: "confirmed", label: "Confirmed", type: "boolean", source: "ORDERS", graphqlPath: "confirmed", category: "Status" },
  { key: "closed", label: "Closed", type: "boolean", source: "ORDERS", graphqlPath: "closed", category: "Status" },
  { key: "fulfillable", label: "Fulfillable", type: "boolean", source: "ORDERS", graphqlPath: "fulfillable", category: "Status" },
  { key: "capturable", label: "Capturable", type: "boolean", source: "ORDERS", graphqlPath: "capturable", category: "Status" },
  
  // Customer Information
  { key: "customer_email", label: "Customer Email", type: "email", source: "ORDERS", graphqlPath: "email", category: "Customer" },
  { key: "customer_phone", label: "Customer Phone", type: "string", source: "ORDERS", graphqlPath: "phone", category: "Customer" },
  { key: "customer_locale", label: "Customer Locale", type: "string", source: "ORDERS", graphqlPath: "customerLocale", category: "Customer" },
  { key: "customer_accepts_marketing", label: "Customer Accepts Marketing", type: "boolean", source: "ORDERS", graphqlPath: "customerAcceptsMarketing", category: "Customer" },
  { key: "customer_first_name", label: "Customer First Name", type: "string", source: "ORDERS", graphqlPath: "customer.firstName", category: "Customer" },
  { key: "customer_last_name", label: "Customer Last Name", type: "string", source: "ORDERS", graphqlPath: "customer.lastName", category: "Customer" },
  { key: "customer_display_name", label: "Customer Display Name", type: "string", source: "ORDERS", graphqlPath: "customer.displayName", category: "Customer" },
  
  // Shipping Address
  { key: "shipping_address_1", label: "Shipping Address 1", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.address1", category: "Shipping" },
  { key: "shipping_address_2", label: "Shipping Address 2", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.address2", category: "Shipping" },
  { key: "shipping_city", label: "Shipping City", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.city", category: "Shipping" },
  { key: "shipping_province", label: "Shipping Province", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.province", category: "Shipping" },
  { key: "shipping_province_code", label: "Shipping Province Code", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.provinceCode", category: "Shipping" },
  { key: "shipping_country", label: "Shipping Country", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.country", category: "Shipping" },
  { key: "shipping_country_code", label: "Shipping Country Code", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.countryCodeV2", category: "Shipping" },
  { key: "shipping_zip", label: "Shipping Zip", type: "string", source: "ORDERS", graphqlPath: "shippingAddress.zip", category: "Shipping" },
  
  // Billing Address
  { key: "billing_address_1", label: "Billing Address 1", type: "string", source: "ORDERS", graphqlPath: "billingAddress.address1", category: "Billing" },
  { key: "billing_address_2", label: "Billing Address 2", type: "string", source: "ORDERS", graphqlPath: "billingAddress.address2", category: "Billing" },
  { key: "billing_city", label: "Billing City", type: "string", source: "ORDERS", graphqlPath: "billingAddress.city", category: "Billing" },
  { key: "billing_province", label: "Billing Province", type: "string", source: "ORDERS", graphqlPath: "billingAddress.province", category: "Billing" },
  { key: "billing_province_code", label: "Billing Province Code", type: "string", source: "ORDERS", graphqlPath: "billingAddress.provinceCode", category: "Billing" },
  { key: "billing_country", label: "Billing Country", type: "string", source: "ORDERS", graphqlPath: "billingAddress.country", category: "Billing" },
  { key: "billing_country_code", label: "Billing Country Code", type: "string", source: "ORDERS", graphqlPath: "billingAddress.countryCodeV2", category: "Billing" },
  { key: "billing_zip", label: "Billing Zip", type: "string", source: "ORDERS", graphqlPath: "billingAddress.zip", category: "Billing" },
  
  // Additional Information
  { key: "note", label: "Note", type: "string", source: "ORDERS", graphqlPath: "note", category: "Additional" },
  { key: "tags", label: "Tags", type: "string", source: "ORDERS", graphqlPath: "tags", category: "Additional" },
  { key: "source_name", label: "Source Name", type: "string", source: "ORDERS", graphqlPath: "sourceName", category: "Additional" },
  { key: "channel_name", label: "Channel Name", type: "string", source: "ORDERS", graphqlPath: "channelInformation.channelDefinition.handle", category: "Additional" },
  { key: "app_name", label: "App Name", type: "string", source: "ORDERS", graphqlPath: "app.name", category: "Additional" },
  { key: "client_ip", label: "Client IP", type: "string", source: "ORDERS", graphqlPath: "clientIp", category: "Additional" },
  { key: "po_number", label: "PO Number", type: "string", source: "ORDERS", graphqlPath: "poNumber", category: "Additional" },
  
  // Tax Information
  { key: "tax_exempt", label: "Tax Exempt", type: "boolean", source: "ORDERS", graphqlPath: "taxExempt", category: "Tax" },
  { key: "taxes_included", label: "Taxes Included", type: "boolean", source: "ORDERS", graphqlPath: "taxesIncluded", category: "Tax" },
  { key: "estimated_taxes", label: "Estimated Taxes", type: "boolean", source: "ORDERS", graphqlPath: "estimatedTaxes", category: "Tax" },
  
  // Quantities
  { key: "current_subtotal_line_items_quantity", label: "Current Line Items Quantity", type: "number", source: "ORDERS", graphqlPath: "currentSubtotalLineItemsQuantity", category: "Quantities" },
  { key: "current_total_weight", label: "Current Total Weight (g)", type: "number", source: "ORDERS", graphqlPath: "currentTotalWeight", category: "Quantities" },
];

/**
 * Product Fields - Comprehensive list from Shopify Product object
 */
export const PRODUCT_FIELDS: CustomReportField[] = [
  // Basic Product Information
  { key: "product_id", label: "Product ID", type: "string", source: "PRODUCTS", graphqlPath: "id", category: "Basic Info" },
  { key: "product_title", label: "Product Title", type: "string", source: "PRODUCTS", graphqlPath: "title", category: "Basic Info" },
  { key: "product_handle", label: "Product Handle", type: "string", source: "PRODUCTS", graphqlPath: "handle", category: "Basic Info" },
  { key: "product_description", label: "Product Description", type: "string", source: "PRODUCTS", graphqlPath: "description", category: "Basic Info" },
  { key: "product_type", label: "Product Type", type: "string", source: "PRODUCTS", graphqlPath: "productType", category: "Basic Info" },
  { key: "vendor", label: "Vendor", type: "string", source: "PRODUCTS", graphqlPath: "vendor", category: "Basic Info" },
  { key: "product_status", label: "Product Status", type: "string", source: "PRODUCTS", graphqlPath: "status", category: "Basic Info" },
  { key: "product_created_at", label: "Product Created At", type: "datetime", source: "PRODUCTS", graphqlPath: "createdAt", category: "Dates" },
  { key: "product_updated_at", label: "Product Updated At", type: "datetime", source: "PRODUCTS", graphqlPath: "updatedAt", category: "Dates" },
  { key: "product_published_at", label: "Product Published At", type: "datetime", source: "PRODUCTS", graphqlPath: "publishedAt", category: "Dates" },
  
  // Product Variants
  { key: "variant_id", label: "Variant ID", type: "string", source: "PRODUCTS", graphqlPath: "variants.nodes.id", category: "Variants" },
  { key: "variant_title", label: "Variant Title", type: "string", source: "PRODUCTS", graphqlPath: "variants.nodes.title", category: "Variants" },
  { key: "variant_sku", label: "Variant SKU", type: "string", source: "PRODUCTS", graphqlPath: "variants.nodes.sku", category: "Variants" },
  { key: "variant_barcode", label: "Variant Barcode", type: "string", source: "PRODUCTS", graphqlPath: "variants.nodes.barcode", category: "Variants" },
  { key: "variant_price", label: "Variant Price", type: "currency", source: "PRODUCTS", graphqlPath: "variants.nodes.price", category: "Variants" },
  { key: "variant_compare_at_price", label: "Variant Compare At Price", type: "currency", source: "PRODUCTS", graphqlPath: "variants.nodes.compareAtPrice", category: "Variants" },
  { key: "variant_position", label: "Variant Position", type: "number", source: "PRODUCTS", graphqlPath: "variants.nodes.position", category: "Variants" },
  { key: "variant_taxable", label: "Variant Taxable", type: "boolean", source: "PRODUCTS", graphqlPath: "variants.nodes.taxable", category: "Variants" },
  { key: "variant_available_for_sale", label: "Variant Available For Sale", type: "boolean", source: "PRODUCTS", graphqlPath: "variants.nodes.availableForSale", category: "Variants" },
  { key: "variant_inventory_quantity", label: "Variant Inventory Quantity", type: "number", source: "PRODUCTS", graphqlPath: "variants.nodes.inventoryQuantity", category: "Variants" },
  
  // Pricing
  { key: "price_range_min", label: "Price Range Min", type: "currency", source: "PRODUCTS", graphqlPath: "priceRangeV2.minVariantPrice.amount", category: "Pricing" },
  { key: "price_range_max", label: "Price Range Max", type: "currency", source: "PRODUCTS", graphqlPath: "priceRangeV2.maxVariantPrice.amount", category: "Pricing" },
  
  // Additional Information
  { key: "product_tags", label: "Product Tags", type: "string", source: "PRODUCTS", graphqlPath: "tags", category: "Additional" },
  { key: "is_gift_card", label: "Is Gift Card", type: "boolean", source: "PRODUCTS", graphqlPath: "isGiftCard", category: "Additional" },
  { key: "has_only_default_variant", label: "Has Only Default Variant", type: "boolean", source: "PRODUCTS", graphqlPath: "hasOnlyDefaultVariant", category: "Additional" },
  { key: "has_out_of_stock_variants", label: "Has Out Of Stock Variants", type: "boolean", source: "PRODUCTS", graphqlPath: "hasOutOfStockVariants", category: "Additional" },
  { key: "total_inventory", label: "Total Inventory", type: "number", source: "PRODUCTS", graphqlPath: "totalInventory", category: "Additional" },
  { key: "tracks_inventory", label: "Tracks Inventory", type: "boolean", source: "PRODUCTS", graphqlPath: "tracksInventory", category: "Additional" },
  { key: "variants_count", label: "Variants Count", type: "number", source: "PRODUCTS", graphqlPath: "variantsCount.count", category: "Additional" },
  
  // SEO
  { key: "seo_title", label: "SEO Title", type: "string", source: "PRODUCTS", graphqlPath: "seo.title", category: "SEO" },
  { key: "seo_description", label: "SEO Description", type: "string", source: "PRODUCTS", graphqlPath: "seo.description", category: "SEO" },
  
  // URLs
  { key: "online_store_url", label: "Online Store URL", type: "url", source: "PRODUCTS", graphqlPath: "onlineStoreUrl", category: "URLs" },
  { key: "online_store_preview_url", label: "Online Store Preview URL", type: "url", source: "PRODUCTS", graphqlPath: "onlineStorePreviewUrl", category: "URLs" },
];

/**
 * Customer Fields - Comprehensive list from Shopify Customer object
 */
export const CUSTOMER_FIELDS: CustomReportField[] = [
  // Basic Customer Information
  { key: "customer_id", label: "Customer ID", type: "string", source: "CUSTOMERS", graphqlPath: "id", category: "Basic Info" },
  { key: "customer_email", label: "Customer Email", type: "email", source: "CUSTOMERS", graphqlPath: "email", category: "Basic Info" },
  { key: "customer_first_name", label: "Customer First Name", type: "string", source: "CUSTOMERS", graphqlPath: "firstName", category: "Basic Info" },
  { key: "customer_last_name", label: "Customer Last Name", type: "string", source: "CUSTOMERS", graphqlPath: "lastName", category: "Basic Info" },
  { key: "customer_display_name", label: "Customer Display Name", type: "string", source: "CUSTOMERS", graphqlPath: "displayName", category: "Basic Info" },
  { key: "customer_phone", label: "Customer Phone", type: "string", source: "CUSTOMERS", graphqlPath: "phone", category: "Basic Info" },
  { key: "customer_created_at", label: "Customer Created At", type: "datetime", source: "CUSTOMERS", graphqlPath: "createdAt", category: "Dates" },
  { key: "customer_updated_at", label: "Customer Updated At", type: "datetime", source: "CUSTOMERS", graphqlPath: "updatedAt", category: "Dates" },
  
  // Customer Statistics
  { key: "customer_amount_spent", label: "Customer Amount Spent", type: "currency", source: "CUSTOMERS", graphqlPath: "amountSpent.amount", category: "Statistics" },
  { key: "customer_number_of_orders", label: "Customer Number Of Orders", type: "number", source: "CUSTOMERS", graphqlPath: "numberOfOrders", category: "Statistics" },
  { key: "customer_lifetime_duration", label: "Customer Lifetime Duration", type: "string", source: "CUSTOMERS", graphqlPath: "lifetimeDuration", category: "Statistics" },
  
  // Customer Preferences
  { key: "customer_locale", label: "Customer Locale", type: "string", source: "CUSTOMERS", graphqlPath: "locale", category: "Preferences" },
  { key: "customer_state", label: "Customer State", type: "string", source: "CUSTOMERS", graphqlPath: "state", category: "Preferences" },
  { key: "customer_tax_exempt", label: "Customer Tax Exempt", type: "boolean", source: "CUSTOMERS", graphqlPath: "taxExempt", category: "Preferences" },
  { key: "customer_verified_email", label: "Customer Verified Email", type: "boolean", source: "CUSTOMERS", graphqlPath: "verifiedEmail", category: "Preferences" },
  
  // Additional Information
  { key: "customer_note", label: "Customer Note", type: "string", source: "CUSTOMERS", graphqlPath: "note", category: "Additional" },
  { key: "customer_tags", label: "Customer Tags", type: "string", source: "CUSTOMERS", graphqlPath: "tags", category: "Additional" },
];

/**
 * Get all available fields for custom reports
 */
export function getAllCustomReportFields(): CustomReportField[] {
  return [
    ...ORDER_FIELDS,
    ...PRODUCT_FIELDS,
    ...CUSTOMER_FIELDS,
  ];
}

/**
 * Get fields by data source
 */
export function getFieldsBySource(source: DataSource): CustomReportField[] {
  return getAllCustomReportFields().filter(field => field.source === source);
}

/**
 * Get field by key
 */
export function getFieldByKey(key: string): CustomReportField | undefined {
  return getAllCustomReportFields().find(field => field.key === key);
}

/**
 * Get unique categories for a data source
 */
export function getCategoriesBySource(source: DataSource): string[] {
  const fields = getFieldsBySource(source);
  const categories = new Set(fields.map(f => f.category).filter(Boolean));
  return Array.from(categories) as string[];
}

