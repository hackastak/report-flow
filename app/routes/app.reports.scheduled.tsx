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

  const handleEdit = (reportId: string) => {
    // TODO: Navigate to edit page
    console.log("Edit report:", reportId);
    // navigate(`/app/reports/edit/${reportId}`);
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

  const handleRunNow = async (reportId: string) => {
    if (!confirm("Run this report now?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}/run`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Report execution started! You will receive an email when it's complete.");
      } else {
        throw new Error(data.error?.message || "Failed to run report");
      }
    } catch (error) {
      console.error("Failed to run report:", error);
      alert("Failed to run report. Please try again.");
    }
  };

  const handleToggleActive = async (reportId: string, currentStatus: boolean) => {
    try {
      // TODO: Call toggle active API
      console.log("Toggle active:", reportId, !currentStatus);
      // await fetch(`/api/reports/${reportId}`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ isActive: !currentStatus }),
      // });
      // window.location.reload();
    } catch (error) {
      console.error("Failed to toggle report status:", error);
      alert("Failed to update report status. Please try again.");
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
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleEdit(report.id)}
                        >
                          Edit
                        </s-button>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleRunNow(report.id)}
                        >
                          Run Now
                        </s-button>
                        <s-button
                          variant="tertiary"
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
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

