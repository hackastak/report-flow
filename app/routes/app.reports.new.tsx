import { useState } from "react";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useSearchParams, Link, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getReportTypeConfig, isValidReportType } from "../config/reportTypes";
import { FilterConfigurationForm } from "../components/FilterConfigurationForm";
import {
  ScheduleConfigurationForm,
  type ScheduleConfig,
} from "../components/ScheduleConfigurationForm";
import {
  EmailRecipientsForm,
  type Recipient,
  validateRecipients,
} from "../components/EmailRecipientsForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const reportType = url.searchParams.get("type");

  if (!reportType || !isValidReportType(reportType)) {
    throw new Response("Invalid report type", { status: 400 });
  }

  const reportConfig = getReportTypeConfig(reportType);

  return { reportConfig };
};

export default function NewReport() {
  const { reportConfig } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: "DAILY",
    timeOfDay: "09:00",
    timezone: "UTC",
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  const handleScheduleChange = (config: ScheduleConfig) => {
    setScheduleConfig(config);
  };

  const handleRecipientsChange = (newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    // Clear recipients error if any
    if (errors.recipients) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.recipients;
        return newErrors;
      });
    }
  };

  const handlePreview = async () => {
    setLoadingPreview(true);
    setPreviewError(null);
    setPreviewData(null);

    try {
      const response = await fetch("/api/reports/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType: searchParams.get("type"),
          filters: filterValues,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.preview);
      } else {
        setPreviewError(data.error?.message || "Failed to generate preview");
      }
    } catch (error) {
      console.error("Preview error:", error);
      setPreviewError("Failed to generate preview. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSave = async () => {
    // Validation
    const newErrors: Record<string, string> = {};

    if (!reportName.trim()) {
      newErrors.reportName = "Report name is required";
    }

    // Validate recipients
    const recipientValidation = validateRecipients(recipients, 1);
    if (!recipientValidation.isValid) {
      newErrors.recipients = recipientValidation.error || "Invalid recipients";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      // Save report configuration
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: reportName,
          description: reportDescription,
          reportType: reportConfig.type,
          filters: filterValues,
          schedule: scheduleConfig,
          recipients: recipients,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message and redirect
        alert(`Report "${reportName}" created successfully! Next run: ${new Date(data.nextRunAt).toLocaleString()}`);
        navigate("/app/reports/scheduled");
      } else {
        throw new Error(data.error?.message || "Failed to create report");
      }
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <s-page
      heading={`Configure ${reportConfig.name}`}
      backAction={{ content: "Reports", url: "/app/reports" }}
    >
      <s-section heading="Report Information">
        <s-stack direction="block" gap="base">
          {/* Report Type Display */}
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <s-stack direction="inline" gap="base" alignment="start">
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>
                {reportConfig.icon}
              </div>
              <s-stack direction="block" gap="tight">
                <s-heading level={3}>{reportConfig.name}</s-heading>
                <s-text variant="subdued">{reportConfig.description}</s-text>
              </s-stack>
            </s-stack>
          </s-box>

          {/* Report Name & Description */}
          <div>
            <s-text-field
              name="reportName"
              label="Report Name"
              value={reportName}
              onChange={(e: any) => {
                setReportName(e.currentTarget.value);
                if (errors.reportName) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.reportName;
                    return newErrors;
                  });
                }
              }}
              error={errors.reportName}
              details="Give your report a descriptive name"
            />
          </div>

          <div>
            <label htmlFor="reportDescription">
              <s-text weight="bold">Description (Optional)</s-text>
            </label>
            <textarea
              id="reportDescription"
              name="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Add notes about this report..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.5rem",
                borderRadius: "var(--s-border-radius-base)",
                border: "1px solid var(--s-color-border)",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>
        </s-stack>
      </s-section>

      {/* Filter Configuration */}
      <s-section heading="Configure Filters">
        <s-paragraph>
          Set up filters to customize what data is included in your report.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <FilterConfigurationForm
            reportConfig={reportConfig}
            onChange={handleFilterChange}
          />
        </div>
      </s-section>

      {/* Preview Section */}
      <s-section heading="Preview Report Data">
        <s-paragraph>
          Preview a sample of your report data to verify your filters are working correctly.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <s-button
            variant="secondary"
            onClick={handlePreview}
            disabled={loadingPreview}
            loading={loadingPreview}
          >
            {loadingPreview ? "Loading Preview..." : "Preview Report"}
          </s-button>
        </div>

        {/* Preview Error */}
        {previewError && (
          <div style={{ marginTop: "1rem" }}>
            <s-banner variant="critical">
              <s-paragraph>{previewError}</s-paragraph>
            </s-banner>
          </div>
        )}

        {/* Preview Data */}
        {previewData && (
          <div style={{ marginTop: "1rem" }}>
            <s-banner variant="success">
              <s-paragraph>
                Showing {previewData.previewRecords} of {previewData.totalRecords} records
              </s-paragraph>
            </s-banner>

            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
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
                    {previewData.columns.map((column: any) => (
                      <th
                        key={column.key}
                        style={{ padding: "0.75rem", fontWeight: 600 }}
                      >
                        <s-text weight="bold">{column.label}</s-text>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.map((row: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid var(--s-color-border)",
                      }}
                    >
                      {previewData.columns.map((column: any) => (
                        <td key={column.key} style={{ padding: "0.75rem" }}>
                          <s-text>
                            {row[column.key] !== null && row[column.key] !== undefined
                              ? String(row[column.key])
                              : "—"}
                          </s-text>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </s-section>

      {/* Schedule Configuration */}
      <s-section heading="Set Schedule">
        <s-paragraph>
          Choose when and how often this report should run automatically.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <ScheduleConfigurationForm onChange={handleScheduleChange} />
        </div>
      </s-section>

      {/* Email Recipients Configuration */}
      <s-section heading="Email Recipients">
        <s-paragraph>
          Add email addresses of people who should receive this report.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <EmailRecipientsForm
            onChange={handleRecipientsChange}
            minRecipients={1}
          />
        </div>
        {errors.recipients && (
          <div style={{ marginTop: "1rem" }}>
            <s-banner variant="critical">
              <s-paragraph>{errors.recipients}</s-paragraph>
            </s-banner>
          </div>
        )}
      </s-section>

      {/* Action Buttons */}
      <s-section>
        <s-stack direction="inline" gap="base">
          <Link to="/app/reports">
            <s-button variant="secondary">Cancel</s-button>
          </Link>
          <s-button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Report Schedule"}
          </s-button>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Report Details">
        <s-stack direction="block" gap="base">
          <div>
            <s-text weight="bold">Report Type:</s-text>
            <div style={{ marginTop: "0.25rem" }}>
              <s-badge variant="info">{reportConfig.category}</s-badge>
            </div>
          </div>

          <div>
            <s-text weight="bold">Available Filters:</s-text>
            <div style={{ marginTop: "0.5rem" }}>
              <s-text variant="subdued">
                {reportConfig.filters.length} filter
                {reportConfig.filters.length !== 1 ? "s" : ""} available
              </s-text>
            </div>
          </div>

          <div>
            <s-text weight="bold">Data Fields:</s-text>
            <div style={{ marginTop: "0.5rem" }}>
              <s-text variant="subdued">
                {reportConfig.dataFields.length} field
                {reportConfig.dataFields.length !== 1 ? "s" : ""} will be included
              </s-text>
            </div>
          </div>

          <div>
            <s-text weight="bold">Recipients:</s-text>
            <div style={{ marginTop: "0.5rem" }}>
              {recipients.length > 0 ? (
                <s-text variant="subdued">
                  {recipients.length} recipient
                  {recipients.length !== 1 ? "s" : ""} added
                </s-text>
              ) : (
                <s-text variant="subdued">No recipients yet</s-text>
              )}
            </div>
          </div>

          <div>
            <s-text weight="bold">Export Format:</s-text>
            <div style={{ marginTop: "0.25rem" }}>
              <s-badge variant="success">CSV</s-badge>
            </div>
          </div>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Help">
        <s-paragraph>
          <s-text variant="subdued">
            Configure your report settings, filters, schedule, and recipients.
            All required fields must be completed before saving.
          </s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

