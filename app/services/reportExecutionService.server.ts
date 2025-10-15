/**
 * Report Execution Service
 * 
 * Orchestrates the complete report generation and delivery flow:
 * 1. Fetch report configuration
 * 2. Fetch data from Shopify
 * 3. Process and format data
 * 4. Generate CSV file
 * 5. Send emails to recipients
 * 6. Record execution history
 * 7. Clean up temporary files
 */

import { prisma } from "../db.server";
import { fetchShopifyData } from "./shopifyDataFetcher.server";
import { processReportData } from "./reportDataProcessor.server";
import { sendReportEmail, sendErrorNotification } from "./emailService.server";
import { calculateNextRunTime } from "../utils/timezoneHelper";
import type { ReportType } from "../config/reportTypes";
import { getReportTypeConfig } from "../config/reportTypes";
import { categorizeError } from "../utils/errorCategorization";
import * as fs from "fs";
import shopify, { apiVersion } from "../shopify.server";

export interface ExecuteReportOptions {
  reportScheduleId: string;
  shop: string;
  accessToken: string;
}

export interface ExecuteReportResult {
  success: boolean;
  historyId: string;
  recordCount?: number;
  emailsSent?: number;
  error?: string;
}

/**
 * Execute a scheduled report
 */
export async function executeReport(
  options: ExecuteReportOptions
): Promise<ExecuteReportResult> {
  const { reportScheduleId, shop, accessToken } = options;

  console.log(`\n🚀 ========== [EXECUTE REPORT] START ==========`);
  console.log(`Report Schedule ID: ${reportScheduleId}`);
  console.log(`Shop: ${shop}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`================================================\n`);

  let historyId: string | null = null;
  let filePath: string | null = null;
  let reportSchedule: any = null; // Store for error notification

  try {
    // Step 1: Fetch report configuration
    console.log(`[Report Execution] Step 1: Fetching report configuration...`);

    reportSchedule = await prisma.reportSchedule.findUnique({
      where: { id: reportScheduleId },
      include: {
        filters: true,
        recipients: true,
        fields: {
          orderBy: {
            fieldOrder: 'asc',
          },
        },
      },
    });

    if (!reportSchedule) {
      throw new Error(`Report schedule not found: ${reportScheduleId}`);
    }

    if (!reportSchedule.isActive) {
      throw new Error(`Report is not active: ${reportScheduleId}`);
    }

    // Create history record with RUNNING status
    const history = await prisma.reportHistory.create({
      data: {
        reportScheduleId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
    historyId = history.id;

    console.log(`[Report Execution] Created history record: ${historyId}`);

    // Step 2: Fetch data from Shopify
    console.log(`[Report Execution] Fetching data from Shopify...`);

    // Convert filters array to object and parse JSON values
    const filtersObj: Record<string, any> = {};
    reportSchedule.filters.forEach((filter) => {
      try {
        // Parse the JSON string back to its original type (array, string, etc.)
        filtersObj[filter.filterKey] = JSON.parse(filter.filterValue);
      } catch (error) {
        // If parsing fails, use the raw value
        filtersObj[filter.filterKey] = filter.filterValue;
      }
    });

    console.log(`[Report Execution] Filters:`, JSON.stringify(filtersObj, null, 2));

    // Create authenticated admin GraphQL client for background jobs
    console.log(`[Report Execution] Creating authenticated admin client for shop: ${shop}`);

    // Load the offline session from storage
    const sessionId = `offline_${shop}`;
    console.log(`[Report Execution] Loading session with ID: ${sessionId}`);

    const session = await shopify.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Error(`No session found for shop: ${shop}. Session ID tried: ${sessionId}. Please reinstall the app.`);
    }

    if (!session.accessToken) {
      throw new Error(`Session found but no access token for shop: ${shop}. Please reinstall the app.`);
    }

    console.log(`[Report Execution] Session loaded successfully`);
    console.log(`[Report Execution] Session ID: ${session.id}`);
    console.log(`[Report Execution] Session shop: ${session.shop}`);
    console.log(`[Report Execution] Session isOnline: ${session.isOnline}`);
    console.log(`[Report Execution] Access token present: ${!!session.accessToken}`);
    console.log(`[Report Execution] Access token length: ${session.accessToken?.length}`);
    console.log(`[Report Execution] Access token prefix: ${session.accessToken?.substring(0, 10)}...`);
    console.log(`[Report Execution] API Version: ${apiVersion}`);

    // Create a custom admin client that uses the access token directly
    // This is a workaround for background jobs where unauthenticated.admin() doesn't work properly
    const admin = {
      graphql: async (query: string, options?: { variables?: any }) => {
        const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

        console.log(`[Report Execution] Making GraphQL request to: ${url}`);
        console.log(`[Report Execution] Using access token: ${session.accessToken.substring(0, 10)}...`);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken,
          },
          body: JSON.stringify({
            query,
            variables: options?.variables || {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GraphQL request failed (${response.status}): ${errorText}`);
        }

        return {
          json: async () => response.json(),
        };
      },
    };

    const fetchResult = await fetchShopifyData({
      reportType: reportSchedule.reportType as ReportType,
      filters: filtersObj,
      admin,
    });

    if (!fetchResult.success) {
      throw new Error(`Data fetch failed: ${fetchResult.error}`);
    }

    console.log(`[Report Execution] Fetched ${fetchResult.recordCount} records`);

    // Step 3: Process and format data
    console.log(`[Report Execution] Processing data...`);

    // Convert fields array to the format expected by processReportData
    const selectedFields = reportSchedule.fields?.map((field: any) => ({
      key: field.fieldKey,
      order: field.fieldOrder,
    }));

    const processResult = await processReportData({
      reportType: reportSchedule.reportType as ReportType,
      rawData: fetchResult.data,
      filters: filtersObj,
      reportName: reportSchedule.name,
      selectedFields: selectedFields,
    });

    if (!processResult.success) {
      throw new Error(`Data processing failed: ${processResult.error}`);
    }

    filePath = processResult.filePath!;
    console.log(`[Report Execution] Generated CSV: ${filePath}`);
    console.log(`[Report Execution] Processed ${processResult.recordCount} records`);

    // Step 4: Send emails to recipients
    console.log(`[Report Execution] Sending emails to ${reportSchedule.recipients.length} recipients...`);
    
    const reportConfig = getReportTypeConfig(reportSchedule.reportType as ReportType);
    
    // Format date range for email
    let dateRange: string | undefined;
    const dateRangeFilter = reportSchedule.filters.find(f => f.filterKey === "dateRange");
    if (dateRangeFilter) {
      dateRange = formatDateRangeForEmail(dateRangeFilter.filterValue);
    }

    const emailResult = await sendReportEmail({
      recipients: reportSchedule.recipients.map(r => ({
        email: r.email,
        name: r.name,
      })),
      reportName: reportSchedule.name,
      reportType: reportConfig.name,
      filePath,
      recordCount: processResult.recordCount,
      dateRange,
      shopName: shop,
    });

    console.log(`[Report Execution] Emails sent: ${emailResult.emailsSent}, failed: ${emailResult.emailsFailed}`);

    // Step 5: Record execution history
    const completedAt = new Date();
    await prisma.reportHistory.update({
      where: { id: historyId },
      data: {
        status: "SUCCESS",
        completedAt,
        recordCount: processResult.recordCount,
        fileSize: processResult.fileSize,
        filePath,
        emailsSent: emailResult.emailsSent,
        emailsFailed: emailResult.emailsFailed,
      },
    });

    console.log(`[Report Execution] Updated history record: SUCCESS`);

    // Step 6: Update next run time
    const nextRunAt = calculateNextRunTime(
      reportSchedule.frequency,
      reportSchedule.timeOfDay,
      reportSchedule.dayOfWeek ?? undefined,
      reportSchedule.dayOfMonth ?? undefined,
      reportSchedule.timezone
    );

    await prisma.reportSchedule.update({
      where: { id: reportScheduleId },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });

    console.log(`[Report Execution] Updated next run time: ${nextRunAt}`);

    // Step 7: Clean up temporary file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Report Execution] Cleaned up file: ${filePath}`);
      } catch (error) {
        console.error(`[Report Execution] Failed to clean up file: ${error}`);
        // Don't fail the execution if cleanup fails
      }
    }

    console.log(`[Report Execution] Completed successfully`);

    return {
      success: true,
      historyId,
      recordCount: processResult.recordCount,
      emailsSent: emailResult.emailsSent,
    };

  } catch (error) {
    console.error(`[Report Execution] Error:`, error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : undefined;

    // Update history record with failure
    if (historyId) {
      await prisma.reportHistory.update({
        where: { id: historyId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage,
          errorDetails,
        },
      });
    }

    // Clean up temporary file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Report Execution] Cleaned up file after error: ${filePath}`);
      } catch (cleanupError) {
        console.error(`[Report Execution] Failed to clean up file: ${cleanupError}`);
      }
    }

    // Send error notification to recipients
    if (reportSchedule && reportSchedule.recipients && reportSchedule.recipients.length > 0) {
      try {
        const errorAnalysis = categorizeError(errorMessage, errorDetails);

        console.log(`[Report Execution] Sending error notification to ${reportSchedule.recipients.length} recipients`);

        await sendErrorNotification({
          recipients: reportSchedule.recipients,
          reportName: reportSchedule.name,
          reportType: reportSchedule.reportType,
          errorMessage,
          errorCategory: errorAnalysis.category,
          troubleshootingTips: errorAnalysis.troubleshootingTips,
          executionId: historyId || "unknown",
          shopName: shop,
        });

        console.log(`[Report Execution] Error notification sent successfully`);
      } catch (notificationError) {
        console.error(`[Report Execution] Failed to send error notification:`, notificationError);
        // Don't fail the whole execution if notification fails
      }
    } else {
      console.log(`[Report Execution] Skipping error notification - no recipients configured`);
    }

    return {
      success: false,
      historyId: historyId || "unknown",
      error: errorMessage,
    };
  }
}

/**
 * Execute a report manually (triggered by user)
 */
export async function executeReportManually(
  reportScheduleId: string,
  shop: string,
  accessToken: string
): Promise<ExecuteReportResult> {
  console.log(`\n========== [MANUAL EXECUTION] START ==========`);
  console.log(`Report Schedule ID: ${reportScheduleId}`);
  console.log(`Shop: ${shop}`);
  console.log(`Access Token: ${accessToken ? 'Present' : 'Missing'}`);
  console.log(`==============================================\n`);

  try {
    const result = await executeReport({
      reportScheduleId,
      shop,
      accessToken,
    });

    console.log(`\n========== [MANUAL EXECUTION] END ==========`);
    console.log(`Success: ${result.success}`);
    console.log(`History ID: ${result.historyId}`);
    console.log(`Record Count: ${result.recordCount}`);
    console.log(`Emails Sent: ${result.emailsSent}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    console.log(`============================================\n`);

    return result;
  } catch (error) {
    console.error(`\n========== [MANUAL EXECUTION] ERROR ==========`);
    console.error(`Error:`, error);
    console.error(`Stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.error(`==============================================\n`);
    throw error;
  }
}

/**
 * Execute all reports that are due to run
 */
export async function executeScheduledReports(
  shop: string,
  accessToken: string
): Promise<{ executed: number; succeeded: number; failed: number }> {
  console.log(`[Report Execution] Checking for scheduled reports...`);

  const now = new Date();

  // Find all active reports that are due to run
  const dueReports = await prisma.reportSchedule.findMany({
    where: {
      shop,
      isActive: true,
      nextRunAt: {
        lte: now,
      },
    },
  });

  console.log(`[Report Execution] Found ${dueReports.length} reports due to run`);

  let succeeded = 0;
  let failed = 0;

  // Execute each report
  for (const report of dueReports) {
    try {
      const result = await executeReport({
        reportScheduleId: report.id,
        shop,
        accessToken,
      });

      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`[Report Execution] Failed to execute report ${report.id}:`, error);
      failed++;
    }
  }

  console.log(`[Report Execution] Completed: ${succeeded} succeeded, ${failed} failed`);

  return {
    executed: dueReports.length,
    succeeded,
    failed,
  };
}

/**
 * Format date range for email display
 */
function formatDateRangeForEmail(dateRangeValue: string): string {
  const dateRangeMap: Record<string, string> = {
    TODAY: "Today",
    YESTERDAY: "Yesterday",
    LAST_7_DAYS: "Last 7 Days",
    LAST_30_DAYS: "Last 30 Days",
    LAST_90_DAYS: "Last 90 Days",
    THIS_WEEK: "This Week",
    LAST_WEEK: "Last Week",
    THIS_MONTH: "This Month",
    LAST_MONTH: "Last Month",
    THIS_QUARTER: "This Quarter",
    LAST_QUARTER: "Last Quarter",
    THIS_YEAR: "This Year",
    LAST_YEAR: "Last Year",
  };

  return dateRangeMap[dateRangeValue] || dateRangeValue;
}

