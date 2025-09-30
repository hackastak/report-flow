import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getAllReportTypes } from "../config/reportTypes";
import type { ReportTypeConfig } from "../config/reportTypes";

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
        <s-section heading="💰 Sales Reports">
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
        <s-section heading="📦 Operations Reports">
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
        <s-section heading="🎯 Marketing Reports">
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
        <s-section heading="📈 Analytics Reports">
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
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderRadius="base"
      background="surface"
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={() => onSelect(report.type)}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.borderColor = "var(--s-color-border-emphasis)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <s-stack direction="inline" gap="base" alignment="start">
        <div
          style={{
            fontSize: "2rem",
            lineHeight: 1,
            minWidth: "2.5rem",
          }}
        >
          {report.icon}
        </div>
        <s-stack direction="block" gap="tight" style={{ flex: 1 }}>
          <s-heading level={3}>{report.name}</s-heading>
          <s-text variant="subdued">{report.description}</s-text>
          <s-stack direction="inline" gap="tight" style={{ marginTop: "0.5rem" }}>
            <s-badge variant="info">
              {report.filters.length} filter
              {report.filters.length !== 1 ? "s" : ""}
            </s-badge>
            <s-badge variant="success">
              {report.dataFields.length} field
              {report.dataFields.length !== 1 ? "s" : ""}
            </s-badge>
          </s-stack>
        </s-stack>
        <s-button variant="tertiary" onClick={() => onSelect(report.type)}>
          Select
        </s-button>
      </s-stack>
    </s-box>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

