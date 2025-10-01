/**
 * Onboarding API Route
 * 
 * Handles user onboarding preferences
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

/**
 * GET /api/onboarding
 * Check if user has seen onboarding
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { shop: session.shop },
    });

    return Response.json({
      success: true,
      hasSeenOnboarding: preferences?.hasSeenOnboarding || false,
    });
  } catch (error) {
    console.error("[Onboarding API] Error fetching preferences:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch onboarding status",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding
 * Mark onboarding as seen
 */
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    // Upsert user preferences
    await prisma.userPreferences.upsert({
      where: { shop: session.shop },
      update: {
        hasSeenOnboarding: true,
        onboardingDismissedAt: new Date(),
      },
      create: {
        shop: session.shop,
        hasSeenOnboarding: true,
        onboardingDismissedAt: new Date(),
      },
    });

    console.log(`[Onboarding API] Marked onboarding as seen for shop: ${session.shop}`);

    return Response.json({
      success: true,
      message: "Onboarding marked as complete",
    });
  } catch (error) {
    console.error("[Onboarding API] Error updating preferences:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update onboarding status",
      },
      { status: 500 }
    );
  }
}

