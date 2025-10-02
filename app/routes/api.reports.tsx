/**
 * Report CRUD API Routes
 * 
 * Handles creating, reading, updating, and deleting scheduled reports
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { isValidReportType } from "../config/reportTypes";
import { calculateNextRunTime } from "../utils/timezoneHelper";

// GET /api/reports - List all reports
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const reports = await prisma.reportSchedule.findMany({
      where: {
        shop: session.shop,
      },
      include: {
        recipients: true,
        filters: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for response
    const reportsWithCounts = reports.map((report) => ({
      id: report.id,
      name: report.name,
      description: report.description,
      reportType: report.reportType,
      frequency: report.frequency,
      timeOfDay: report.timeOfDay,
      dayOfWeek: report.dayOfWeek,
      dayOfMonth: report.dayOfMonth,
      timezone: report.timezone,
      isActive: report.isActive,
      lastRunAt: report.lastRunAt?.toISOString() || null,
      nextRunAt: report.nextRunAt?.toISOString() || null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      recipientCount: report.recipients.length,
      filterCount: report.filters.length,
    }));

    return Response.json({
      success: true,
      reports: reportsWithCounts,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch reports",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create new report
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  if (request.method === "POST") {
    try {
      const data = await request.json();

      // Validation
      const validation = validateReportData(data);
      if (!validation.isValid) {
        return Response.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: validation.error,
            },
          },
          { status: 400 }
        );
      }

      // Calculate next run time
      const nextRunAt = calculateNextRunTime(
        data.schedule.frequency,
        data.schedule.timeOfDay,
        data.schedule.dayOfWeek,
        data.schedule.dayOfMonth,
        data.schedule.timezone
      );

      // Create report schedule
      const report = await prisma.reportSchedule.create({
        data: {
          shop: session.shop,
          name: data.name,
          description: data.description || null,
          reportType: data.reportType,
          frequency: data.schedule.frequency,
          timeOfDay: data.schedule.timeOfDay,
          dayOfWeek: data.schedule.dayOfWeek,
          dayOfMonth: data.schedule.dayOfMonth,
          timezone: data.schedule.timezone,
          isActive: true,
          nextRunAt: nextRunAt,
          filters: {
            create: Object.entries(data.filters || {}).map(([key, value]) => ({
              filterKey: key,
              filterValue: JSON.stringify(value),
            })),
          },
          recipients: {
            create: data.recipients.map((recipient: any) => ({
              email: recipient.email,
              name: recipient.name || null,
            })),
          },
        },
        include: {
          recipients: true,
          filters: true,
        },
      });

      return Response.json({
        success: true,
        reportId: report.id,
        nextRunAt: report.nextRunAt?.toISOString(),
        message: "Report schedule created successfully",
      });
    } catch (error) {
      console.error("Failed to create report:", error);
      return Response.json(
        {
          success: false,
          error: {
            code: "CREATE_FAILED",
            message: "Failed to create report",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }
  }

  return Response.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Method not allowed",
      },
    },
    { status: 405 }
  );
}

// Validation function
function validateReportData(data: any): { isValid: boolean; error?: string } {
  // Check required fields
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { isValid: false, error: "Report name is required" };
  }

  if (data.name.length > 100) {
    return { isValid: false, error: "Report name must be 100 characters or less" };
  }

  if (!data.reportType || !isValidReportType(data.reportType)) {
    return { isValid: false, error: "Invalid report type" };
  }

  // Validate schedule
  if (!data.schedule) {
    return { isValid: false, error: "Schedule configuration is required" };
  }

  const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"];
  if (!validFrequencies.includes(data.schedule.frequency)) {
    return { isValid: false, error: "Invalid schedule frequency" };
  }

  if (!data.schedule.timeOfDay || !/^\d{2}:\d{2}$/.test(data.schedule.timeOfDay)) {
    return { isValid: false, error: "Invalid time format (expected HH:MM)" };
  }

  if (!data.schedule.timezone || typeof data.schedule.timezone !== "string") {
    return { isValid: false, error: "Timezone is required" };
  }

  // Validate frequency-specific fields
  if (data.schedule.frequency === "WEEKLY") {
    if (
      data.schedule.dayOfWeek === undefined ||
      data.schedule.dayOfWeek < 0 ||
      data.schedule.dayOfWeek > 6
    ) {
      return { isValid: false, error: "Day of week is required for weekly reports (0-6)" };
    }
  }

  if (data.schedule.frequency === "MONTHLY") {
    if (
      data.schedule.dayOfMonth === undefined ||
      (data.schedule.dayOfMonth < 1 && data.schedule.dayOfMonth !== -1) ||
      data.schedule.dayOfMonth > 31
    ) {
      return {
        isValid: false,
        error: "Day of month is required for monthly reports (1-31 or -1 for last day)",
      };
    }
  }

  // Validate recipients
  if (!data.recipients || !Array.isArray(data.recipients) || data.recipients.length === 0) {
    return { isValid: false, error: "At least one recipient is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const recipient of data.recipients) {
    if (!recipient.email || !emailRegex.test(recipient.email)) {
      return { isValid: false, error: `Invalid email address: ${recipient.email}` };
    }
  }

  return { isValid: true };
}

