import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    console.log(`Starting cleanup for shop: ${shop}`);

    // Delete all scheduled reports (cascade deletes will handle related records:
    // ReportFilter, ReportRecipient, ReportField, ReportHistory)
    const deletedReports = await db.reportSchedule.deleteMany({
      where: { shop },
    });
    console.log(`Deleted ${deletedReports.count} scheduled reports for ${shop}`);

    // Delete user preferences
    const deletedPreferences = await db.userPreferences.deleteMany({
      where: { shop },
    });
    console.log(`Deleted ${deletedPreferences.count} user preferences for ${shop}`);

    // Delete sessions
    const deletedSessions = await db.session.deleteMany({
      where: { shop },
    });
    console.log(`Deleted ${deletedSessions.count} sessions for ${shop}`);

    console.log(`Cleanup completed for shop: ${shop}`);
  } else {
    console.log(`Webhook already processed for ${shop} - session already deleted`);
  }

  return new Response();
};
