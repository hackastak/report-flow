/**
 * Individual Report API Routes
 * 
 * Handles GET, PUT, DELETE for individual reports
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { isValidReportType } from "../config/reportTypes";
import { calculateNextRunTime } from "../utils/timezoneHelper";

// GET /api/reports/:id - Get single report
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Report ID is required",
        },
      },
      { status: 400 }
    );
  }

  try {
    const report = await prisma.reportSchedule.findFirst({
      where: {
        id: id,
        shop: session.shop,
      },
      include: {
        recipients: true,
        filters: true,
      },
    });

    if (!report) {
      return json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Report not found",
          },
        },
        { status: 404 }
      );
    }

    // Transform filters from database format
    const filters: Record<string, any> = {};
    report.filters.forEach((filter) => {
      try {
        filters[filter.filterKey] = JSON.parse(filter.filterValue);
      } catch (e) {
        filters[filter.filterKey] = filter.filterValue;
      }
    });

    return json({
      success: true,
      report: {
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
        filters: filters,
        recipients: report.recipients.map((r) => ({
          email: r.email,
          name: r.name,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch report",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/reports/:id - Update report
// DELETE /api/reports/:id - Delete report
export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Report ID is required",
        },
      },
      { status: 400 }
    );
  }

  // DELETE
  if (request.method === "DELETE") {
    try {
      // Verify report exists and belongs to this shop
      const report = await prisma.reportSchedule.findFirst({
        where: {
          id: id,
          shop: session.shop,
        },
      });

      if (!report) {
        return json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Report not found",
            },
          },
          { status: 404 }
        );
      }

      // Delete report (cascade will delete filters, recipients, history)
      await prisma.reportSchedule.delete({
        where: {
          id: id,
        },
      });

      return json({
        success: true,
        message: "Report deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete report:", error);
      return json(
        {
          success: false,
          error: {
            code: "DELETE_FAILED",
            message: "Failed to delete report",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }
  }

  // PUT
  if (request.method === "PUT") {
    try {
      const data = await request.json();

      // Verify report exists and belongs to this shop
      const existingReport = await prisma.reportSchedule.findFirst({
        where: {
          id: id,
          shop: session.shop,
        },
      });

      if (!existingReport) {
        return json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Report not found",
            },
          },
          { status: 404 }
        );
      }

      // Validation
      const validation = validateReportData(data);
      if (!validation.isValid) {
        return json(
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

      // Update report (delete and recreate filters and recipients)
      const report = await prisma.reportSchedule.update({
        where: {
          id: id,
        },
        data: {
          name: data.name,
          description: data.description || null,
          reportType: data.reportType,
          frequency: data.schedule.frequency,
          timeOfDay: data.schedule.timeOfDay,
          dayOfWeek: data.schedule.dayOfWeek,
          dayOfMonth: data.schedule.dayOfMonth,
          timezone: data.schedule.timezone,
          nextRunAt: nextRunAt,
          filters: {
            deleteMany: {},
            create: Object.entries(data.filters || {}).map(([key, value]) => ({
              filterKey: key,
              filterValue: JSON.stringify(value),
            })),
          },
          recipients: {
            deleteMany: {},
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

      return json({
        success: true,
        reportId: report.id,
        nextRunAt: report.nextRunAt?.toISOString(),
        message: "Report updated successfully",
      });
    } catch (error) {
      console.error("Failed to update report:", error);
      return json(
        {
          success: false,
          error: {
            code: "UPDATE_FAILED",
            message: "Failed to update report",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }
  }

  return json(
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

// Validation function (same as in api.reports.tsx)
function validateReportData(data: any): { isValid: boolean; error?: string } {
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { isValid: false, error: "Report name is required" };
  }

  if (data.name.length > 100) {
    return { isValid: false, error: "Report name must be 100 characters or less" };
  }

  if (!data.reportType || !isValidReportType(data.reportType)) {
    return { isValid: false, error: "Invalid report type" };
  }

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

