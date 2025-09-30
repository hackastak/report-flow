/**
 * Manual Report Execution API Route
 * 
 * Handles POST /api/reports/:id/run - Run report immediately
 */

import type { ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

// POST /api/reports/:id/run - Run report now
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

  if (request.method !== "POST") {
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

  try {
    // Verify report exists and belongs to this shop
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

    // Create execution history record
    const execution = await prisma.reportHistory.create({
      data: {
        reportScheduleId: report.id,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // TODO: Trigger report execution service
    // This will be implemented in Task 14: Create Report Execution Service
    // For now, we just create the history record
    console.log("Manual report execution triggered:", {
      reportId: report.id,
      executionId: execution.id,
      reportType: report.reportType,
      recipientCount: report.recipients.length,
    });

    // In the future, this will call:
    // await reportExecutionService.execute(report.id, execution.id);

    return json({
      success: true,
      executionId: execution.id,
      message: "Report execution started. You will receive an email when it's complete.",
    });
  } catch (error) {
    console.error("Failed to run report:", error);
    return json(
      {
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: "Failed to start report execution",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

