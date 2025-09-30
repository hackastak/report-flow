import { useState } from "react";
import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getReportTypeConfig, isValidReportType } from "../config/reportTypes";
import { FilterConfigurationForm } from "../components/FilterConfigurationForm";

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

  // Form state
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFilterChange = (filters: Record<string, any>) => {
    setFilterValues(filters);
  };

  const handleSave = () => {
    // Validation
    const newErrors: Record<string, string> = {};

    if (!reportName.trim()) {
      newErrors.reportName = "Report name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Save report configuration
    console.log("Saving report:", {
      name: reportName,
      description: reportDescription,
      type: reportConfig.type,
      filters: filterValues,
    });
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

      {/* Coming Soon Banner */}
      <s-section heading="Next Steps">
        <s-banner variant="info">
          <s-paragraph>
            Schedule configuration and email recipient management will be added in
            the next steps. For now, you can configure the report name and filters.
          </s-paragraph>
        </s-banner>
      </s-section>

      {/* Action Buttons */}
      <s-section>
        <s-stack direction="inline" gap="base">
          <Link to="/app/reports">
            <s-button variant="secondary">Cancel</s-button>
          </Link>
          <s-button variant="primary" onClick={handleSave}>
            Continue to Schedule Setup
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
            Configure your report filters to customize the data that will be
            included. Required filters must be set before saving.
          </s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

