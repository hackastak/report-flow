/**
 * Background Scheduler Service
 * 
 * Runs scheduled reports automatically using node-cron
 * Checks every 5 minutes for reports that are due to run
 */

import cron from "node-cron";
import { prisma } from "../db.server";
import { executeScheduledReports } from "./reportExecutionService.server";

// Track running jobs to prevent duplicates
const runningJobs = new Set<string>();

// Track scheduler state
let schedulerTask: cron.ScheduledTask | null = null;
let isSchedulerRunning = false;

/**
 * Start the background scheduler
 */
export function startScheduler() {
  if (isSchedulerRunning) {
    console.log("[Scheduler] Already running");
    return;
  }

  console.log("[Scheduler] Starting background scheduler...");

  // Run every 5 minutes: "*/5 * * * *"
  // For testing, you can use "* * * * *" (every minute)
  schedulerTask = cron.schedule("*/5 * * * *", async () => {
    await checkAndExecuteReports();
  });

  isSchedulerRunning = true;
  console.log("[Scheduler] Background scheduler started (runs every 5 minutes)");
}

/**
 * Stop the background scheduler
 */
export function stopScheduler() {
  if (!isSchedulerRunning || !schedulerTask) {
    console.log("[Scheduler] Not running");
    return;
  }

  console.log("[Scheduler] Stopping background scheduler...");
  schedulerTask.stop();
  schedulerTask = null;
  isSchedulerRunning = false;
  console.log("[Scheduler] Background scheduler stopped");
}

/**
 * Check for reports due to run and execute them
 */
async function checkAndExecuteReports() {
  console.log("[Scheduler] Checking for scheduled reports...");

  try {
    const now = new Date();

    // Find all active reports that are due to run
    const dueReports = await prisma.reportSchedule.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now,
        },
      },
      include: {
        filters: true,
        recipients: true,
      },
    });

    if (dueReports.length === 0) {
      console.log("[Scheduler] No reports due to run");
      return;
    }

    console.log(`[Scheduler] Found ${dueReports.length} reports due to run`);

    // Group reports by shop
    const reportsByShop = new Map<string, typeof dueReports>();
    dueReports.forEach((report) => {
      if (!reportsByShop.has(report.shop)) {
        reportsByShop.set(report.shop, []);
      }
      reportsByShop.get(report.shop)!.push(report);
    });

    console.log(`[Scheduler] Processing reports for ${reportsByShop.size} shops`);

    // Execute reports for each shop
    for (const [shop, reports] of reportsByShop.entries()) {
      // Check if already running for this shop
      if (runningJobs.has(shop)) {
        console.log(`[Scheduler] Skipping ${shop} - already running`);
        continue;
      }

      // Mark as running
      runningJobs.add(shop);

      // Execute reports for this shop (don't await - run in background)
      executeReportsForShop(shop, reports)
        .then(() => {
          console.log(`[Scheduler] Completed reports for ${shop}`);
        })
        .catch((error) => {
          console.error(`[Scheduler] Error executing reports for ${shop}:`, error);
        })
        .finally(() => {
          // Remove from running jobs
          runningJobs.delete(shop);
        });
    }
  } catch (error) {
    console.error("[Scheduler] Error checking for scheduled reports:", error);
  }
}

/**
 * Execute all reports for a shop
 */
async function executeReportsForShop(
  shop: string,
  reports: Array<{ id: string; name: string }>
) {
  console.log(`[Scheduler] Executing ${reports.length} reports for ${shop}`);

  // Get shop's access token from session
  // In a real app, you'd store this in the database or retrieve from Shopify
  const session = await getShopSession(shop);
  
  if (!session) {
    console.error(`[Scheduler] No session found for shop: ${shop}`);
    return;
  }

  let succeeded = 0;
  let failed = 0;

  // Execute each report sequentially
  for (const report of reports) {
    try {
      console.log(`[Scheduler] Executing report: ${report.name} (${report.id})`);
      
      const result = await executeScheduledReports(shop, session.accessToken);
      
      succeeded += result.succeeded;
      failed += result.failed;
    } catch (error) {
      console.error(`[Scheduler] Failed to execute report ${report.id}:`, error);
      failed++;
    }
  }

  console.log(`[Scheduler] Completed for ${shop}: ${succeeded} succeeded, ${failed} failed`);
}

/**
 * Get shop session with access token
 *
 * In a production app, you would:
 * 1. Store sessions in database
 * 2. Use Shopify's session storage
 * 3. Refresh tokens if needed
 *
 * For now, we'll use Shopify's session storage
 */
async function getShopSession(shop: string): Promise<{ accessToken: string } | null> {
  try {
    // Import sessionStorage from the server file
    const { sessionStorage } = await import("../shopify.server");

    // Get session from Shopify's session storage
    // Construct offline session ID manually (format: offline_<shop>)
    const sessionId = `offline_${shop}`;
    const session = await sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      console.error(`[Scheduler] No valid session for shop: ${shop}`);
      return null;
    }

    return {
      accessToken: session.accessToken,
    };
  } catch (error) {
    console.error(`[Scheduler] Error getting session for ${shop}:`, error);
    return null;
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning: isSchedulerRunning,
    runningJobs: Array.from(runningJobs),
    jobCount: runningJobs.size,
  };
}

/**
 * Manually trigger scheduler check (for testing)
 */
export async function triggerSchedulerCheck() {
  console.log("[Scheduler] Manual trigger requested");
  await checkAndExecuteReports();
}

