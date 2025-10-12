import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getAllReportTypes } from "../config/reportTypes";
import type { ReportTypeConfig } from "../config/reportTypes";
import { getIcon } from "../utils/iconMapper";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const reportTypes = getAllReportTypes();

  // Group reports by category
  const reportsByCategory = {
    sales: reportTypes.filter((r) => r.category === "sales"),
    operations: reportTypes.filter((r) => r.category === "operations"),
    marketing: reportTypes.filter((r) => r.category === "marketing"),
    analytics: reportTypes.filter((r) => r.category === "analytics"),
  };

  return { reportsByCategory };
};

export default function ReportsIndex() {
  const { reportsByCategory } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleSelectReport = (reportType: string) => {
    navigate(`/app/reports/new?type=${reportType}`);
  };

  return (
    <s-page heading="Create Scheduled Report">
      <s-section heading="Choose a report type">
        <s-paragraph>
          Select the type of report you want to schedule. You'll be able to
          customize filters and set up email delivery in the next steps.
        </s-paragraph>
      </s-section>

      {/* Sales Reports */}
      {reportsByCategory.sales.length > 0 && (
        <s-section heading="Sales Reports" >
          <s-stack direction="block" gap="base">
            {reportsByCategory.sales.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onSelect={handleSelectReport}
              />
            ))}
          </s-stack>
        </s-section>
      )}

      {/* Operations Reports */}
      {reportsByCategory.operations.length > 0 && (
        <s-section heading="Operations Reports">
          <s-stack direction="block" gap="base">
            {reportsByCategory.operations.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onSelect={handleSelectReport}
              />
            ))}
          </s-stack>
        </s-section>
      )}

      {/* Marketing Reports */}
      {reportsByCategory.marketing.length > 0 && (
        <s-section heading="Marketing Reports">
          <s-stack direction="block" gap="base">
            {reportsByCategory.marketing.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onSelect={handleSelectReport}
              />
            ))}
          </s-stack>
        </s-section>
      )}

      {/* Analytics Reports */}
      {reportsByCategory.analytics.length > 0 && (
        <s-section heading="Analytics Reports">
          <s-stack direction="block" gap="base">
            {reportsByCategory.analytics.map((report) => (
              <ReportCard
                key={report.type}
                report={report}
                onSelect={handleSelectReport}
              />
            ))}
          </s-stack>
        </s-section>
      )}

      <s-section slot="aside" heading="About Scheduled Reports">
        <s-paragraph>
          Scheduled reports automatically generate and email analytics data to
          your team on a regular basis.
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Choose from 7 report types</s-list-item>
          <s-list-item>Customize filters and date ranges</s-list-item>
          <s-list-item>Schedule daily, weekly, or monthly</s-list-item>
          <s-list-item>Send to multiple email addresses</s-list-item>
          <s-list-item>Export as CSV files</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Need Help?">
        <s-paragraph>
          <s-link
            href="https://github.com/yourusername/report-flow/docs"
            target="_blank"
          >
            View documentation
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

interface ReportCardProps {
  report: ReportTypeConfig;
  onSelect: (reportType: string) => void;
}

function ReportCard({ report, onSelect }: ReportCardProps) {
  // Get the icon component from the icon name string
  const IconComponent = getIcon(report.icon);

  return (
    <div
      role="button"
      tabIndex={0}
      style={{
        padding: "1rem",
        border: "1px solid var(--s-color-border)",
        borderRadius: "var(--s-border-radius-base)",
        backgroundColor: "var(--s-color-surface)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={() => onSelect(report.type)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(report.type);
        }
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = "var(--s-color-border-emphasis)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "2.5rem",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "var(--s-border-radius-base)",
            backgroundColor: "var(--s-color-surface-subdued)",
            color: "var(--s-color-text)",
            flexShrink: 0,
          }}
        >
          <IconComponent size={24} strokeWidth={2} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3 style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--s-color-text)"
            }}>
              {report.name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--s-color-text-subdued)",
              lineHeight: 1.5
            }}>
              {report.description}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.125rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "var(--s-border-radius-base)",
                backgroundColor: "var(--s-color-bg-info)",
                color: "var(--s-color-text-info)",
              }}>
                {report.filters.length} filter{report.filters.length !== 1 ? "s" : ""}
              </span>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.125rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "var(--s-border-radius-base)",
                backgroundColor: "var(--s-color-bg-success)",
                color: "var(--s-color-text-success)",
              }}>
                {report.dataFields.length} field{report.dataFields.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <div style={{ flexShrink: 0, marginLeft: "auto" }}>
          <button
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--s-color-text)",
              backgroundColor: "transparent",
              border: "1px solid var(--s-color-border)",
              borderRadius: "var(--s-border-radius-base)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(report.type);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

