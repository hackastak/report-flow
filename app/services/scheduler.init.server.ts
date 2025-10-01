/**
 * Scheduler Initialization
 * 
 * Starts the background scheduler when the app starts
 * Import this file in entry.server.tsx or server.ts
 */

import { startScheduler } from "./backgroundScheduler.server";

// Start the scheduler when this module is imported
if (process.env.NODE_ENV !== "test") {
  console.log("[Scheduler Init] Initializing background scheduler...");
  
  // Start scheduler after a short delay to ensure app is ready
  setTimeout(() => {
    startScheduler();
  }, 5000); // 5 second delay
}

export { startScheduler, stopScheduler, getSchedulerStatus } from "./backgroundScheduler.server";

