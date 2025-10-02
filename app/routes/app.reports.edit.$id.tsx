import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { authenticate } from "../shopify.server";
import { getReportTypeConfig } from "../config/reportTypes";
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
import {
  FieldSelectionForm,
  type SelectedField,
} from "../components/FieldSelectionForm";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const { id } = params;

  if (!id) {
    throw new Response("Report ID is required", { status: 400 });
  }

  // Fetch the existing report
  const response = await fetch(`${new URL(request.url).origin}/api/reports/${id}`, {
    headers: request.headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Response(data.error?.message || "Report not found", { status: 404 });
  }

  const reportConfig = getReportTypeConfig(data.report.reportType);

  return { report: data.report, reportConfig };
};

export default function EditReport() {
  const { report, reportConfig } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const params = useParams();

  // Form state - initialize with existing report data
  const [reportName, setReportName] = useState(report.name);
  const [reportDescription, setReportDescription] = useState(report.description || "");
  const [filterValues, setFilterValues] = useState<Record<string, any>>(report.filters || {});
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: report.frequency,
    timeOfDay: report.timeOfDay,
    dayOfWeek: report.dayOfWeek,
    dayOfMonth: report.dayOfMonth,
    timezone: report.timezone,
  });
  const [recipients, setRecipients] = useState<Recipient[]>(report.recipients || []);
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>(report.selectedFields || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  const handleScheduleChange = (config: ScheduleConfig) => {
    setScheduleConfig(config);
  };

  const handleRecipientsChange = (newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    if (errors.recipients) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.recipients;
        return newErrors;
      });
    }
  };

  const handleFieldsChange = (fields: SelectedField[]) => {
    setSelectedFields(fields);
    if (errors.fields) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.fields;
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validation
    const newErrors: Record<string, string> = {};

    if (!reportName.trim()) {
      newErrors.reportName = "Report name is required";
    }

    const recipientValidation = validateRecipients(recipients, 1);
    if (!recipientValidation.isValid) {
      newErrors.recipients = recipientValidation.error || "Invalid recipients";
    }

    if (selectedFields.length === 0) {
      newErrors.fields = "Please select at least one field to include in the report";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: "PUT",
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
          selectedFields: selectedFields,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Report "${reportName}" updated successfully!`);
        navigate("/app/reports/scheduled");
      } else {
        throw new Error(data.error?.message || "Failed to update report");
      }
    } catch (error) {
      console.error("Failed to update report:", error);
      alert("Failed to update report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <s-page
      heading={`Edit ${reportConfig.name}`}
      backAction={{ content: "Scheduled Reports", url: "/app/reports/scheduled" }}
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
              details="Required"
            />
          </div>

          <div>
            <label htmlFor="reportDescription">
              <s-text weight="bold">Description (Optional)</s-text>
            </label>
            <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              <s-text variant="subdued">
                Add a description to help identify this report
              </s-text>
            </div>
            <textarea
              id="reportDescription"
              name="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="e.g., Weekly sales report for management team"
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "var(--s-border-radius-base)",
                border: "1px solid var(--s-color-border)",
                fontSize: "0.875rem",
                fontFamily: "inherit",
              }}
            />
          </div>
        </s-stack>
      </s-section>

      {/* Filter Configuration */}
      <s-section heading="Configure Filters">
        <s-paragraph>
          Customize the data included in your report by setting filters.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <FilterConfigurationForm
            reportConfig={reportConfig}
            initialValues={filterValues}
            onChange={handleFilterChange}
          />
        </div>
      </s-section>

      {/* Field Selection */}
      <s-section heading="Select Report Fields">
        <s-paragraph>
          Choose which data fields to include in your report. You can customize the columns that will appear in the CSV export.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <FieldSelectionForm
            availableFields={reportConfig.dataFields}
            initialSelectedFields={selectedFields}
            onChange={handleFieldsChange}
          />
        </div>
        {errors.fields && (
          <div style={{ marginTop: "1rem" }}>
            <s-banner variant="critical">
              <s-paragraph>{errors.fields}</s-paragraph>
            </s-banner>
          </div>
        )}
      </s-section>

      {/* Schedule Configuration */}
      <s-section heading="Set Schedule">
        <s-paragraph>
          Choose when and how often this report should run automatically.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <ScheduleConfigurationForm
            initialValues={scheduleConfig}
            onChange={handleScheduleChange}
          />
        </div>
      </s-section>

      {/* Email Recipients Configuration */}
      <s-section heading="Email Recipients">
        <s-paragraph>
          Add email addresses of people who should receive this report.
        </s-paragraph>
        <div style={{ marginTop: "1rem" }}>
          <EmailRecipientsForm
            initialRecipients={recipients}
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

      {/* Save Button */}
      <s-section>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <s-button
            variant="tertiary"
            onClick={() => navigate("/app/reports/scheduled")}
            disabled={saving}
          >
            Cancel
          </s-button>
          <s-button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </s-button>
        </div>
      </s-section>
    </s-page>
  );
}

