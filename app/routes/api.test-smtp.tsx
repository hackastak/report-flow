/**
 * Test SMTP Connection
 *
 * GET /api/test-smtp
 *
 * Tests the SMTP connection and returns the result
 */

import type { LoaderFunctionArgs } from "react-router";
import { testSMTPConnection } from "../services/emailService.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("\n========== SMTP CONNECTION TEST ==========");

  const result = await testSMTPConnection();

  console.log("Test Result:", result);
  console.log("==========================================\n");

  return Response.json(result);
}

