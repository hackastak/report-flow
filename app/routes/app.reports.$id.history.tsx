/**
 * Report History Page
 * 
 * Displays execution history for a specific report
 */

import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, Link, useParams } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { prisma } from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response("Report ID is required", { status: 400 });
  }

  // Fetch report details
  const report = await prisma.reportSchedule.findFirst({
    where: {
      id,
      shop: session.shop,
    },
  });

  if (!report) {
    throw new Response("Report not found", { status: 404 });
  }

  // Fetch execution history
  const history = await prisma.reportHistory.findMany({
    where: {
      reportScheduleId: id,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 50, // Limit to last 50 executions
  });

  // Transform data for UI
  const executionHistory = history.map((execution) => ({
    id: execution.id,
    status: execution.status,
    startedAt: execution.startedAt.toISOString(),
    completedAt: execution.completedAt?.toISOString() || null,
    recordCount: execution.recordCount,
    fileSize: execution.fileSize,
    filePath: execution.filePath,
    errorMessage: execution.errorMessage,
    errorDetails: execution.errorDetails,
    emailsSent: execution.emailsSent,
    emailsFailed: execution.emailsFailed,
  }));

  return {
    report: {
      id: report.id,
      name: report.name,
      description: report.description,
      reportType: report.reportType,
    },
    executionHistory,
  };
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

// Helper function to format date
function formatDate(date: string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Helper function to format duration
function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "In progress...";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const durationMs = end - start;
  const seconds = Math.floor(durationMs / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ReportHistory() {
  const { report, executionHistory } = useLoaderData<typeof loader>();
  const params = useParams();

  return (
    <s-page heading={`History: ${report.name}`}>
      {/* Back Button */}
      <s-section>
        <Link to="/app/reports/scheduled">
          <s-button variant="tertiary">← Back to Reports</s-button>
        </Link>
      </s-section>

      {/* Report Info */}
      <s-section>
        <div style={{ marginBottom: "1rem" }}>
          <s-text variant="heading-md">{report.name}</s-text>
        </div>
        {report.description && (
          <div style={{ marginBottom: "1rem" }}>
            <s-text variant="subdued">{report.description}</s-text>
          </div>
        )}
        <div>
          <s-text variant="subdued">
            Showing last {executionHistory.length} executions
          </s-text>
        </div>
      </s-section>

      {/* Execution History */}
      {executionHistory.length > 0 ? (
        <s-section>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--s-color-border)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Status</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Started</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Duration</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Records</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">File Size</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Emails</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Details</s-text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {executionHistory.map((execution) => (
                  <tr
                    key={execution.id}
                    style={{
                      borderBottom: "1px solid var(--s-color-border)",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>
                      {execution.status === "SUCCESS" && (
                        <s-badge variant="success">Success</s-badge>
                      )}
                      {execution.status === "FAILED" && (
                        <s-badge variant="critical">Failed</s-badge>
                      )}
                      {execution.status === "RUNNING" && (
                        <s-badge variant="info">Running</s-badge>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>{formatDate(execution.startedAt)}</s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text variant="subdued">
                        {formatDuration(execution.startedAt, execution.completedAt)}
                      </s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>
                        {execution.recordCount?.toLocaleString() || "N/A"}
                      </s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text variant="subdued">
                        {formatFileSize(execution.fileSize)}
                      </s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>
                        {execution.emailsSent > 0 ? (
                          <>
                            ✓ {execution.emailsSent}
                            {execution.emailsFailed > 0 && (
                              <span style={{ color: "var(--s-color-text-critical)" }}>
                                {" "}/ ✗ {execution.emailsFailed}
                              </span>
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {execution.status === "FAILED" && execution.errorMessage && (
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              color: "var(--s-color-text-critical)",
                            }}
                          >
                            View Error
                          </summary>
                          <div
                            style={{
                              marginTop: "0.5rem",
                              padding: "0.5rem",
                              backgroundColor: "var(--s-color-bg-surface-critical)",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            <s-text>{execution.errorMessage}</s-text>
                          </div>
                        </details>
                      )}
                      {execution.status === "SUCCESS" && (
                        <s-text variant="subdued">—</s-text>
                      )}
                      {execution.status === "RUNNING" && (
                        <s-text variant="subdued">In progress...</s-text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </s-section>
      ) : (
        <s-section>
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <div style={{ marginBottom: "0.5rem" }}>
              <s-text variant="heading-md">No Execution History</s-text>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <s-text variant="subdued">
                This report hasn't been executed yet. Use "Run Now" to execute it manually.
              </s-text>
            </div>
            <Link to="/app/reports/scheduled">
              <s-button variant="primary">Back to Reports</s-button>
            </Link>
          </div>
        </s-section>
      )}
    </s-page>
  );
}

