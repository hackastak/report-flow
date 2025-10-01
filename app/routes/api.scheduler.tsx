/**
 * Scheduler Management API Route
 * 
 * Handles GET /api/scheduler - Get scheduler status
 * Handles POST /api/scheduler/trigger - Manually trigger scheduler check
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getSchedulerStatus,
  triggerSchedulerCheck,
} from "../services/backgroundScheduler.server";

// GET /api/scheduler - Get scheduler status
export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const status = getSchedulerStatus();

  return Response.json({
    success: true,
    scheduler: status,
  });
}

// POST /api/scheduler/trigger - Manually trigger scheduler check
export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

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
    // Trigger scheduler check
    await triggerSchedulerCheck();

    return Response.json({
      success: true,
      message: "Scheduler check triggered",
    });
  } catch (error) {
    console.error("Failed to trigger scheduler:", error);
    return Response.json(
      {
        success: false,
        error: {
          code: "TRIGGER_FAILED",
          message: "Failed to trigger scheduler",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

