/**
 * Clear all sessions from the database
 * Run this script to force a fresh OAuth flow
 * 
 * Usage: npx tsx scripts/clear-sessions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearSessions() {
  console.log("🗑️  Clearing all sessions from database...");
  
  const result = await prisma.session.deleteMany({});
  
  console.log(`✅ Deleted ${result.count} sessions`);
  console.log("\n📝 Next steps:");
  console.log("1. Reinstall the app on your test store");
  console.log("2. This will create fresh, valid access tokens");
  
  await prisma.$disconnect();
}

clearSessions().catch((error) => {
  console.error("❌ Error clearing sessions:", error);
  process.exit(1);
});

