/**
 * Report Data Processor Service
 * 
 * Processes raw Shopify data, applies filters, formats data fields,
 * and generates CSV files for reports
 */

import { createObjectCsvWriter } from "csv-writer";
import { format } from "date-fns";
import * as fs from "fs";
import * as path from "path";
import type { ReportType } from "../config/reportTypes";
import { getReportTypeConfig } from "../config/reportTypes";

export interface ProcessDataOptions {
  reportType: ReportType;
  rawData: any[];
  filters: Record<string, any>;
  reportName: string;
}

export interface ProcessDataResult {
  success: boolean;
  filePath?: string;
  recordCount: number;
  fileSize?: number;
  error?: string;
}

/**
 * Main function to process data and generate CSV
 */
export async function processReportData(
  options: ProcessDataOptions
): Promise<ProcessDataResult> {
  const { reportType, rawData, filters, reportName } = options;

  try {
    // Get report configuration
    const reportConfig = getReportTypeConfig(reportType);

    // Process data based on report type
    let processedData: any[];
    switch (reportType) {
      case "SALES":
        processedData = processSalesData(rawData, filters);
        break;
      case "ORDERS":
        processedData = processOrdersData(rawData, filters);
        break;
      case "PRODUCTS":
        processedData = processProductsData(rawData, filters);
        break;
      case "CUSTOMERS":
        processedData = processCustomersData(rawData, filters);
        break;
      case "INVENTORY":
        processedData = processInventoryData(rawData, filters);
        break;
      case "TRAFFIC":
        processedData = processTrafficData(rawData, filters);
        break;
      case "DISCOUNTS":
        processedData = processDiscountsData(rawData, filters);
        break;
      case "FINANCE_SUMMARY":
        processedData = processFinanceSummaryData(rawData, filters);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    // Generate CSV file
    const filePath = await generateCSV(
      processedData,
      reportConfig.dataFields,
      reportName
    );

    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    return {
      success: true,
      filePath,
      recordCount: processedData.length,
      fileSize,
    };
  } catch (error) {
    console.error("Failed to process report data:", error);
    return {
      success: false,
      recordCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process Sales Data
 */
function processSalesData(rawData: any[], filters: Record<string, any>): any[] {
  // Group orders by date and calculate metrics
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

    const totalPrice = parseFloat(order.totalPriceSet.shopMoney.amount);
    const discounts = parseFloat(order.totalDiscountsSet?.shopMoney?.amount || "0");
    const tax = parseFloat(order.totalTaxSet?.shopMoney?.amount || "0");
    const netPayment = parseFloat(order.netPaymentSet?.shopMoney?.amount || totalPrice);

    salesByDate[date].orderCount += 1;
    salesByDate[date].totalSales += totalPrice;
    salesByDate[date].totalDiscounts += discounts;
    salesByDate[date].totalTax += tax;
    salesByDate[date].netSales += netPayment;
  });

  // Convert to array and calculate average order value
  const salesData = Object.values(salesByDate).map((day: any) => ({
    date: day.date,
    orderCount: day.orderCount,
    totalSales: formatCurrency(day.totalSales),
    averageOrderValue: formatCurrency(day.totalSales / day.orderCount),
    totalDiscounts: formatCurrency(day.totalDiscounts),
    totalTax: formatCurrency(day.totalTax),
    netSales: formatCurrency(day.netSales),
  }));

  // Sort by date
  salesData.sort((a, b) => a.date.localeCompare(b.date));

  return salesData;
}

/**
 * Process Orders Data
 */
function processOrdersData(rawData: any[], filters: Record<string, any>): any[] {
  return rawData.map((order) => {
    // Count line items
    const itemCount = order.lineItems?.edges?.reduce(
      (sum: number, edge: any) => sum + (edge.node.quantity || 0),
      0
    ) || 0;

    // Get customer name
    const customerName = order.customer
      ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
      : "Guest";

    return {
      orderNumber: order.name,
      orderDate: formatDateTime(order.createdAt),
      customerName,
      customerEmail: order.customer?.email || "",
      totalPrice: formatCurrency(parseFloat(order.totalPriceSet.shopMoney.amount)),
      orderStatus: order.cancelledAt ? "CANCELLED" : "OPEN",
      fulfillmentStatus: order.displayFulfillmentStatus || "UNFULFILLED",
      financialStatus: order.displayFinancialStatus || "PENDING",
      itemCount,
    };
  });
}

/**
 * Process Products Data
 */
function processProductsData(rawData: any[], filters: Record<string, any>): any[] {
  const productData: any[] = [];

  rawData.forEach((product) => {
    product.variants?.edges?.forEach((variantEdge: any) => {
      const variant = variantEdge.node;

      productData.push({
        productTitle: product.title,
        sku: variant.sku || "",
        vendor: product.vendor || "",
        productType: product.productType || "",
        unitsSold: 0, // TODO: Calculate from order line items
        totalRevenue: formatCurrency(0), // TODO: Calculate from order line items
        averagePrice: formatCurrency(parseFloat(variant.price || "0")),
        inventoryQuantity: variant.inventoryQuantity || 0,
      });
    });
  });

  return productData;
}

/**
 * Process Customers Data
 */
function processCustomersData(rawData: any[], filters: Record<string, any>): any[] {
  return rawData.map((customer) => {
    const totalSpent = parseFloat(customer.amountSpent?.amount || "0");
    const totalOrders = customer.numberOfOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "N/A",
      email: customer.email || "",
      totalOrders,
      totalSpent: formatCurrency(totalSpent),
      averageOrderValue: formatCurrency(averageOrderValue),
      firstOrderDate: customer.createdAt ? formatDate(customer.createdAt) : "",
      lastOrderDate: customer.lastOrder?.createdAt
        ? formatDate(customer.lastOrder.createdAt)
        : "",
      customerSince: formatDate(customer.createdAt),
    };
  });
}

/**
 * Process Inventory Data
 */
function processInventoryData(rawData: any[], filters: Record<string, any>): any[] {
  // rawData is already flattened from the fetcher
  return rawData.map((item) => {
    const quantity = item.inventoryQuantity || 0;
    const unitCost = parseFloat(item.unitCost || "0");
    const inventoryValue = quantity * unitCost;

    return {
      productTitle: item.productTitle,
      sku: item.sku || "",
      vendor: item.vendor || "",
      location: "Default", // TODO: Add location support
      quantityAvailable: quantity,
      quantityOnHand: quantity,
      quantityCommitted: 0, // TODO: Calculate committed quantity
      inventoryValue: formatCurrency(inventoryValue),
    };
  });
}

/**
 * Process Traffic Data
 */
function processTrafficData(rawData: any[], filters: Record<string, any>): any[] {
  // Traffic data not available via GraphQL API
  return [];
}

/**
 * Process Discounts Data
 */
function processDiscountsData(rawData: any[], filters: Record<string, any>): any[] {
  return rawData.map((discountNode) => {
    const discount = discountNode.codeDiscount;
    const code = discount.codes?.edges?.[0]?.node?.code || "";

    // Determine discount type
    let discountType = "UNKNOWN";
    if (discount.__typename) {
      if (discount.__typename.includes("Basic")) discountType = "PERCENTAGE";
      if (discount.__typename.includes("Bxgy")) discountType = "BUY_X_GET_Y";
      if (discount.__typename.includes("FreeShipping")) discountType = "FREE_SHIPPING";
    }

    return {
      discountCode: code,
      discountType,
      timesUsed: discount.usageCount || 0,
      totalRevenue: formatCurrency(0), // TODO: Calculate from orders
      totalDiscountAmount: formatCurrency(0), // TODO: Calculate from orders
      averageOrderValue: formatCurrency(0), // TODO: Calculate from orders
      status: discount.status || "UNKNOWN",
      startDate: discount.startsAt ? formatDate(discount.startsAt) : "",
      endDate: discount.endsAt ? formatDate(discount.endsAt) : "",
    };
  });
}

/**
 * Generate CSV file from processed data
 */
async function generateCSV(
  data: any[],
  dataFields: any[],
  reportName: string
): Promise<string> {
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
  const sanitizedName = reportName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${sanitizedName}_${timestamp}.csv`;
  const filePath = path.join(reportsDir, filename);

  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: dataFields.map((field) => ({
      id: field.key,
      title: field.label,
    })),
  });

  // Write data to CSV
  await csvWriter.writeRecords(data);

  return filePath;
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Format date (YYYY-MM-DD)
 */
function formatDate(dateString: string): string {
  return format(new Date(dateString), "yyyy-MM-dd");
}

/**
 * Format datetime (YYYY-MM-DD HH:MM:SS)
 */
function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
}

/**
 * Process Finance Summary Data
 */
function processFinanceSummaryData(rawData: any[], filters: Record<string, any>): any[] {
  // Group orders by date and calculate comprehensive financial metrics
  const financeByDate: Record<string, any> = {};

  rawData.forEach((order) => {
    const date = format(new Date(order.createdAt), "yyyy-MM-dd");

    if (!financeByDate[date]) {
      financeByDate[date] = {
        date,
        grossSales: 0,
        discounts: 0,
        returns: 0,
        netSales: 0,
        shippingCharges: 0,
        returnFees: 0,
        taxes: 0,
        totalSales: 0,
        netSalesWithoutCost: 0,
        netSalesWithCost: 0,
        costOfGoodsSold: 0,
        grossProfit: 0,
        netPayments: 0,
        grossPaymentsShopifyPayments: 0,
        netSalesFromGiftCards: 0,
        outstandingGiftCardBalance: 0,
        tips: 0,
      };
    }

    // Parse financial values
    const totalPrice = parseFloat(order.totalPriceSet.shopMoney.amount);
    const discounts = parseFloat(order.totalDiscountsSet?.shopMoney?.amount || "0");
    const tax = parseFloat(order.totalTaxSet?.shopMoney?.amount || "0");
    const shipping = parseFloat(order.totalShippingPriceSet?.shopMoney?.amount || "0");
    const netPayment = parseFloat(order.netPaymentSet?.shopMoney?.amount || totalPrice);
    const refunded = parseFloat(order.totalRefundedSet?.shopMoney?.amount || "0");
    const refundedShipping = parseFloat(order.totalRefundedShippingSet?.shopMoney?.amount || "0");
    const currentTotal = parseFloat(order.currentTotalPriceSet?.shopMoney?.amount || totalPrice);

    // Calculate gross sales (original order total before discounts)
    const grossSales = totalPrice + discounts;

    // Calculate net sales (after discounts and returns)
    const netSales = currentTotal - tax - shipping;

    // Calculate cost of goods sold and gross profit
    let costOfGoodsSold = 0;
    let netSalesWithCost = 0;
    let netSalesWithoutCost = netSales;

    if (order.lineItems?.edges) {
      order.lineItems.edges.forEach((lineItemEdge: any) => {
        const lineItem = lineItemEdge.node;
        const quantity = lineItem.quantity || 0;
        const unitCost = parseFloat(lineItem.variant?.inventoryItem?.unitCost?.amount || "0");
        const lineItemPrice = parseFloat(lineItem.discountedUnitPriceSet?.shopMoney?.amount || "0");

        if (unitCost > 0) {
          costOfGoodsSold += unitCost * quantity;
          netSalesWithCost += lineItemPrice * quantity;
        } else {
          netSalesWithoutCost += lineItemPrice * quantity;
        }
      });
    }

    const grossProfit = netSalesWithCost - costOfGoodsSold;

    // Calculate Shopify Payments transactions
    let shopifyPaymentsTotal = 0;
    if (order.transactions) {
      order.transactions.forEach((transaction: any) => {
        if (transaction.gateway?.toLowerCase().includes("shopify") &&
            transaction.status === "SUCCESS" &&
            transaction.kind === "SALE") {
          shopifyPaymentsTotal += parseFloat(transaction.amountSet?.shopMoney?.amount || "0");
        }
      });
    }

    // Accumulate metrics
    financeByDate[date].grossSales += grossSales;
    financeByDate[date].discounts += discounts;
    financeByDate[date].returns += refunded;
    financeByDate[date].netSales += netSales;
    financeByDate[date].shippingCharges += shipping;
    financeByDate[date].returnFees += refundedShipping;
    financeByDate[date].taxes += tax;
    financeByDate[date].totalSales += currentTotal;
    financeByDate[date].netSalesWithoutCost += netSalesWithoutCost;
    financeByDate[date].netSalesWithCost += netSalesWithCost;
    financeByDate[date].costOfGoodsSold += costOfGoodsSold;
    financeByDate[date].grossProfit += grossProfit;
    financeByDate[date].netPayments += netPayment;
    financeByDate[date].grossPaymentsShopifyPayments += shopifyPaymentsTotal;
    // Note: Gift card and tips data would require additional API calls
  });

  // Convert to array and format currency
  const financeData = Object.values(financeByDate).map((day: any) => ({
    date: day.date,
    grossSales: formatCurrency(day.grossSales),
    discounts: formatCurrency(day.discounts),
    returns: formatCurrency(day.returns),
    netSales: formatCurrency(day.netSales),
    shippingCharges: formatCurrency(day.shippingCharges),
    returnFees: formatCurrency(day.returnFees),
    taxes: formatCurrency(day.taxes),
    totalSales: formatCurrency(day.totalSales),
    netSalesWithoutCost: formatCurrency(day.netSalesWithoutCost),
    netSalesWithCost: formatCurrency(day.netSalesWithCost),
    costOfGoodsSold: formatCurrency(day.costOfGoodsSold),
    grossProfit: formatCurrency(day.grossProfit),
    netPayments: formatCurrency(day.netPayments),
    grossPaymentsShopifyPayments: formatCurrency(day.grossPaymentsShopifyPayments),
    netSalesFromGiftCards: formatCurrency(day.netSalesFromGiftCards),
    outstandingGiftCardBalance: formatCurrency(day.outstandingGiftCardBalance),
    tips: formatCurrency(day.tips),
  }));

  // Sort by date
  financeData.sort((a, b) => a.date.localeCompare(b.date));

  return financeData;
}

