/**
 * Scheduled Reports List Page
 * 
 * Displays all scheduled reports in a table with actions
 */

import { useState } from "react";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, Link, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { REPORT_TYPES } from "../config/reportTypes";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Fetch scheduled reports from database
  const reports = await prisma.reportSchedule.findMany({
    where: {
      shop: session.shop,
    },
    include: {
      recipients: true,
      filters: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform data for UI
  const scheduledReports = reports.map((report) => ({
    id: report.id,
    name: report.name,
    description: report.description,
    reportType: report.reportType,
    frequency: report.frequency,
    isActive: report.isActive,
    lastRunAt: report.lastRunAt?.toISOString() || null,
    nextRunAt: report.nextRunAt?.toISOString() || null,
    recipientCount: report.recipients.length,
  }));

  return {
    scheduledReports,
  };
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

// Helper function to get report type icon
function getReportIcon(reportType: string): string {
  const config = REPORT_TYPES[reportType as keyof typeof REPORT_TYPES];
  return config?.icon || "📊";
}

// Helper function to get report type name
function getReportName(reportType: string): string {
  const config = REPORT_TYPES[reportType as keyof typeof REPORT_TYPES];
  return config?.name || reportType;
}

// Helper function to format date
function formatDate(date: string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Helper function to format frequency
function formatFrequency(frequency: string): string {
  return frequency.charAt(0) + frequency.slice(1).toLowerCase();
}

export default function ScheduledReports() {
  const { scheduledReports } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleEdit = (reportId: string) => {
    navigate(`/app/reports/edit/${reportId}`);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled report?")) {
      return;
    }

    setDeletingId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the page to show updated list
        window.location.reload();
      } else {
        throw new Error(data.error?.message || "Failed to delete report");
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
      alert("Failed to delete report. Please try again.");
      setDeletingId(null);
    }
  };

  const handleRunNow = async (reportId: string, reportName: string) => {
    if (!confirm(`Run "${reportName}" now?\n\nThe report will be generated and emailed to all recipients.`)) {
      return;
    }

    setRunningId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}/run`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        shopify.toast.show("Report execution started! You will receive an email when it's complete.", {
          duration: 5000,
        });
      } else {
        throw new Error(data.error?.message || "Failed to run report");
      }
    } catch (error) {
      console.error("Failed to run report:", error);
      shopify.toast.show("Failed to run report. Please try again.", {
        isError: true,
      });
    } finally {
      setRunningId(null);
    }
  };

  const handleToggleActive = async (reportId: string, reportName: string, currentStatus: boolean) => {
    const action = currentStatus ? "pause" : "resume";
    if (!confirm(`${action === "pause" ? "Pause" : "Resume"} "${reportName}"?\n\n${action === "pause" ? "The report will not run automatically until resumed." : "The report will resume running on its schedule."}`)) {
      return;
    }

    setTogglingId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        shopify.toast.show(`Report ${action === "pause" ? "paused" : "resumed"} successfully!`);
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        throw new Error(data.error?.message || "Failed to update report status");
      }
    } catch (error) {
      console.error("Failed to toggle report status:", error);
      shopify.toast.show("Failed to update report status. Please try again.", {
        isError: true,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <s-page heading="Scheduled Reports">
      {/* Header Actions */}
      <s-section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <s-text variant="subdued">
            Manage your automated report schedules
          </s-text>
          <Link to="/app/reports">
            <s-button variant="primary">Create New Report</s-button>
          </Link>
        </div>
      </s-section>

      {/* Reports Table */}
      {scheduledReports.length > 0 ? (
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
                    <s-text weight="bold">Report Name</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Type</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Frequency</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Recipients</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Last Run</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Next Run</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Status</s-text>
                  </th>
                  <th style={{ padding: "0.75rem", fontWeight: 600 }}>
                    <s-text weight="bold">Actions</s-text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report: any) => (
                  <tr
                    key={report.id}
                    style={{
                      borderBottom: "1px solid var(--s-color-border)",
                    }}
                  >
                    <td style={{ padding: "0.75rem" }}>
                      <div>
                        <s-text weight="bold">{report.name}</s-text>
                      </div>
                      {report.description && (
                        <div style={{ marginTop: "0.25rem" }}>
                          <s-text variant="subdued">{report.description}</s-text>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1.25rem" }}>
                          {getReportIcon(report.reportType)}
                        </span>
                        <s-text>{getReportName(report.reportType)}</s-text>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>{formatFrequency(report.frequency)}</s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>{report.recipientCount || 0}</s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text variant="subdued">{formatDate(report.lastRunAt)}</s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <s-text>{formatDate(report.nextRunAt)}</s-text>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {report.isActive ? (
                        <s-badge variant="success">Active</s-badge>
                      ) : (
                        <s-badge variant="subdued">Paused</s-badge>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Link to={`/app/reports/${report.id}/history`}>
                          <s-button variant="tertiary">History</s-button>
                        </Link>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleEdit(report.id)}
                          disabled={runningId === report.id || deletingId === report.id || togglingId === report.id}
                        >
                          Edit
                        </s-button>
                        <s-button
                          variant="primary"
                          onClick={() => handleRunNow(report.id, report.name)}
                          disabled={runningId === report.id || deletingId === report.id || togglingId === report.id || !report.isActive}
                          loading={runningId === report.id}
                        >
                          {runningId === report.id ? "Running..." : "Run Now"}
                        </s-button>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleToggleActive(report.id, report.name, report.isActive)}
                          disabled={runningId === report.id || deletingId === report.id || togglingId === report.id}
                          loading={togglingId === report.id}
                        >
                          {togglingId === report.id ? "Updating..." : (report.isActive ? "Pause" : "Resume")}
                        </s-button>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id || runningId === report.id || togglingId === report.id}
                          loading={deletingId === report.id}
                        >
                          {deletingId === report.id ? "Deleting..." : "Delete"}
                        </s-button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </s-section>
      ) : (
        /* Empty State */
        <s-section>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface-subdued"
          >
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                📊
              </div>
              <s-heading level={3}>No Scheduled Reports Yet</s-heading>
              <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                <s-text variant="subdued">
                  Create your first automated report to get started
                </s-text>
              </div>
              <Link to="/app/reports">
                <s-button variant="primary">Create Your First Report</s-button>
              </Link>
            </div>
          </s-box>
        </s-section>
      )}

      {/* Help Section */}
      <s-section heading="Quick Actions">
        <s-stack direction="block" gap="base">
          <div>
            <s-text weight="bold">Need Help?</s-text>
            <div style={{ marginTop: "0.5rem" }}>
              <s-text variant="subdued">
                • Click "Edit" to modify a report's configuration
              </s-text>
            </div>
            <div style={{ marginTop: "0.25rem" }}>
              <s-text variant="subdued">
                • Click "Run Now" to execute a report immediately
              </s-text>
            </div>
            <div style={{ marginTop: "0.25rem" }}>
              <s-text variant="subdued">
                • Click "Delete" to remove a scheduled report
              </s-text>
            </div>
          </div>
        </s-stack>
      </s-section>
    </s-page>
  );
}

