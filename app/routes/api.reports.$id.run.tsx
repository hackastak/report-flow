/**
 * Manual Report Execution API Route
 * 
 * Handles POST /api/reports/:id/run - Run report immediately
 */

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { executeReportManually } from "../services/reportExecutionService.server";

// POST /api/reports/:id/run - Run report now
export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    return Response.json(
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
      return Response.json(
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

    // Execute report using the execution service
    console.log("\n========== MANUAL REPORT EXECUTION TRIGGERED ==========");
    console.log("Report ID:", report.id);
    console.log("Report Type:", report.reportType);
    console.log("Report Name:", report.name);
    console.log("Shop:", session.shop);
    console.log("Recipient Count:", report.recipients.length);
    console.log("Filter Count:", report.filters.length);
    console.log("Filters:", JSON.stringify(report.filters, null, 2));
    console.log("=======================================================\n");

    // Ensure we have an access token
    if (!session.accessToken) {
      console.error("ERROR: Missing access token!");
      return Response.json(
        {
          success: false,
          error: {
            code: "MISSING_ACCESS_TOKEN",
            message: "Session access token is missing",
          },
        },
        { status: 500 }
      );
    }

    console.log("✅ Access token present, starting execution...");

    // Execute report asynchronously (don't wait for completion)
    executeReportManually(report.id, session.shop, session.accessToken)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Report execution completed successfully: ${result.historyId}`);
          console.log(`   Records: ${result.recordCount}, Emails sent: ${result.emailsSent}`);
        } else {
          console.error(`❌ Report execution failed: ${result.error}`);
        }
      })
      .catch((error) => {
        console.error("❌ Report execution error:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      });

    return Response.json({
      success: true,
      message: "Report execution started. You will receive an email when it's complete.",
    });
  } catch (error) {
    console.error("Failed to run report:", error);
    return Response.json(
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

