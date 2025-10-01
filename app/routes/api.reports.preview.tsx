/**
 * Report Preview API Endpoint
 * 
 * Generates a preview of report data (first 10 rows) to help users verify their configuration
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getReportTypeConfig, isValidReportType } from "../config/reportTypes";
import { fetchShopifyData } from "../services/shopifyDataFetcher.server";
import { processReportData } from "../services/reportDataProcessor.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Only POST requests are allowed",
        },
      },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const { reportType, filters } = body;

    // Validate report type
    if (!reportType || !isValidReportType(reportType)) {
      return Response.json(
        {
          success: false,
          error: {
            code: "INVALID_REPORT_TYPE",
            message: "Invalid or missing report type",
          },
        },
        { status: 400 }
      );
    }

    const reportConfig = getReportTypeConfig(reportType);

    console.log(`[Preview API] Generating preview for ${reportType} report`);

    // Step 1: Fetch data from Shopify
    const fetchResult = await fetchShopifyData({
      reportType,
      filters: filters || {},
      admin, // Pass the admin GraphQL client
    });

    if (!fetchResult.success) {
      console.error("[Preview API] Failed to fetch data:", fetchResult.error);
      return Response.json(
        {
          success: false,
          error: {
            code: "FETCH_FAILED",
            message: fetchResult.error || "Failed to fetch data from Shopify",
          },
        },
        { status: 500 }
      );
    }

    console.log(`[Preview API] Fetched ${fetchResult.data.length} records`);

    // Step 2: Process data (but don't generate CSV)
    let processedData: any[];
    
    try {
      // Import the processing functions based on report type
      const { processSalesData, processOrdersData, processProductsData, processCustomersData, processInventoryData, processDiscountsData } = await import("../services/reportDataProcessor.server");
      
      switch (reportType) {
        case "SALES":
          processedData = processSalesData(fetchResult.data, filters || {});
          break;
        case "ORDERS":
          processedData = processOrdersData(fetchResult.data, filters || {});
          break;
        case "PRODUCTS":
          processedData = processProductsData(fetchResult.data, filters || {});
          break;
        case "CUSTOMERS":
          processedData = processCustomersData(fetchResult.data, filters || {});
          break;
        case "INVENTORY":
          processedData = processInventoryData(fetchResult.data, filters || {});
          break;
        case "DISCOUNTS":
          processedData = processDiscountsData(fetchResult.data, filters || {});
          break;
        case "TRAFFIC":
          return Response.json(
            {
              success: false,
              error: {
                code: "NOT_AVAILABLE",
                message: "Traffic reports are not available via Shopify API",
              },
            },
            { status: 400 }
          );
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }
    } catch (error: any) {
      console.error("[Preview API] Failed to process data:", error);
      return Response.json(
        {
          success: false,
          error: {
            code: "PROCESSING_FAILED",
            message: error.message || "Failed to process data",
          },
        },
        { status: 500 }
      );
    }

    // Limit to first 10 rows for preview
    const previewData = processedData.slice(0, 10);

    console.log(`[Preview API] Returning ${previewData.length} preview rows`);

    // Step 3: Return preview data with column headers
    return Response.json({
      success: true,
      preview: {
        columns: reportConfig.dataFields.map((field) => ({
          key: field.key,
          label: field.label,
          type: field.type,
        })),
        data: previewData,
        totalRecords: processedData.length,
        previewRecords: previewData.length,
      },
    });
  } catch (error: any) {
    console.error("[Preview API] Unexpected error:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

