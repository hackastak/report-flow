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
import { sendReportEmail } from "./emailService.server";
import { calculateNextRunTime } from "../utils/timezoneHelper";
import type { ReportType } from "../config/reportTypes";
import { getReportTypeConfig } from "../config/reportTypes";
import * as fs from "fs";

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

  let historyId: string | null = null;
  let filePath: string | null = null;

  try {
    // Step 1: Fetch report configuration
    console.log(`[Report Execution] Starting report ${reportScheduleId}`);
    
    const reportSchedule = await prisma.reportSchedule.findUnique({
      where: { id: reportScheduleId },
      include: {
        filters: true,
        recipients: true,
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
    
    // Convert filters array to object
    const filtersObj: Record<string, any> = {};
    reportSchedule.filters.forEach((filter) => {
      filtersObj[filter.filterKey] = filter.filterValue;
    });

    const fetchResult = await fetchShopifyData({
      shop,
      accessToken,
      reportType: reportSchedule.reportType as ReportType,
      filters: filtersObj,
    });

    if (!fetchResult.success) {
      throw new Error(`Data fetch failed: ${fetchResult.error}`);
    }

    console.log(`[Report Execution] Fetched ${fetchResult.recordCount} records`);

    // Step 3: Process and format data
    console.log(`[Report Execution] Processing data...`);
    
    const processResult = await processReportData({
      reportType: reportSchedule.reportType as ReportType,
      rawData: fetchResult.data,
      filters: filtersObj,
      reportName: reportSchedule.name,
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
      reportSchedule.scheduleTime,
      reportSchedule.scheduleDay,
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
  console.log(`[Report Execution] Manual execution requested for ${reportScheduleId}`);
  
  return executeReport({
    reportScheduleId,
    shop,
    accessToken,
  });
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

