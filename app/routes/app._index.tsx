import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Fetch statistics
  const totalReports = await prisma.reportSchedule.count({
    where: { shop: session.shop },
  });

  const activeReports = await prisma.reportSchedule.count({
    where: { shop: session.shop, isActive: true },
  });

  const totalExecutions = await prisma.reportHistory.count({
    where: { reportSchedule: { shop: session.shop } },
  });

  const recentExecutions = await prisma.reportHistory.findMany({
    where: { reportSchedule: { shop: session.shop } },
    orderBy: { startedAt: "desc" },
    take: 5,
    include: {
      reportSchedule: {
        select: { name: true, reportType: true },
      },
    },
  });

  return {
    stats: {
      totalReports,
      activeReports,
      totalExecutions,
    },
    recentExecutions,
  };
};

export default function Index() {
  const { stats, recentExecutions } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Report Flow">
      <s-link slot="primary-action" href="/app/reports">
        <s-button variant="primary">Create Scheduled Report</s-button>
      </s-link>

      <s-section heading="Welcome to Report Flow 📊">
        <s-paragraph>
          Automate your Shopify analytics reporting. Schedule reports to be
          generated and emailed to your team automatically - no more manual
          exports!
        </s-paragraph>
      </s-section>

      {/* Statistics Section */}
      <s-section heading="Your Reports">
        <s-stack direction="inline" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
            style={{ flex: 1 }}
          >
            <s-stack direction="block" gap="tight" alignment="center">
              <s-text variant="subdued">Total Reports</s-text>
              <s-heading level={2}>{stats.totalReports}</s-heading>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
            style={{ flex: 1 }}
          >
            <s-stack direction="block" gap="tight" alignment="center">
              <s-text variant="subdued">Active Reports</s-text>
              <s-heading level={2}>{stats.activeReports}</s-heading>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
            style={{ flex: 1 }}
          >
            <s-stack direction="block" gap="tight" alignment="center">
              <s-text variant="subdued">Total Executions</s-text>
              <s-heading level={2}>{stats.totalExecutions}</s-heading>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      {/* Recent Executions */}
      {recentExecutions.length > 0 && (
        <s-section heading="Recent Executions">
          <s-stack direction="block" gap="base">
            {recentExecutions.map((execution) => (
              <s-box
                key={execution.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="surface"
              >
                <s-stack direction="inline" gap="base" alignment="space-between">
                  <s-stack direction="block" gap="tight">
                    <s-text weight="bold">{execution.reportSchedule.name}</s-text>
                    <s-text variant="subdued">
                      {execution.reportSchedule.reportType} • {new Date(execution.startedAt).toLocaleString()}
                    </s-text>
                  </s-stack>
                  <s-badge variant={execution.status === "SUCCESS" ? "success" : execution.status === "FAILED" ? "critical" : "info"}>
                    {execution.status}
                  </s-badge>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
          <div style={{ marginTop: "1rem" }}>
            <s-link href="/app/reports/scheduled">
              <s-button variant="secondary">View All Reports</s-button>
            </s-link>
          </div>
        </s-section>
      )}

      <s-section heading="Quick Start">
        <s-stack direction="block" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <s-stack direction="inline" gap="base" alignment="start">
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>1️⃣</div>
              <s-stack direction="block" gap="tight">
                <s-heading level={3}>Choose a Report Type</s-heading>
                <s-text variant="subdued">
                  Select from Sales, Orders, Products, Customers, Inventory,
                  Traffic, or Discounts reports
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <s-stack direction="inline" gap="base" alignment="start">
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>2️⃣</div>
              <s-stack direction="block" gap="tight">
                <s-heading level={3}>Configure Filters</s-heading>
                <s-text variant="subdued">
                  Set up date ranges, product filters, order status, and more
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <s-stack direction="inline" gap="base" alignment="start">
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>3️⃣</div>
              <s-stack direction="block" gap="tight">
                <s-heading level={3}>Set Schedule & Recipients</s-heading>
                <s-text variant="subdued">
                  Choose when to send (daily, weekly, monthly) and who receives
                  the reports
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <s-stack direction="inline" gap="base" alignment="start">
              <div style={{ fontSize: "2rem", lineHeight: 1 }}>✅</div>
              <s-stack direction="block" gap="tight">
                <s-heading level={3}>Sit Back & Relax</s-heading>
                <s-text variant="subdued">
                  Reports are automatically generated and emailed on schedule
                </s-text>
              </s-stack>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Features">
        <s-stack direction="block" gap="base">
          <s-unordered-list>
            <s-list-item>
              <s-text weight="bold">7 Report Types</s-text> - Sales, Orders,
              Products, Customers, Inventory, Traffic, and Discounts
            </s-list-item>
            <s-list-item>
              <s-text weight="bold">Flexible Scheduling</s-text> - Daily,
              weekly, or monthly delivery
            </s-list-item>
            <s-list-item>
              <s-text weight="bold">Custom Filters</s-text> - Date ranges,
              product types, order status, and more
            </s-list-item>
            <s-list-item>
              <s-text weight="bold">Multiple Recipients</s-text> - Send to your
              entire team
            </s-list-item>
            <s-list-item>
              <s-text weight="bold">CSV Export</s-text> - Easy to import into
              Excel or Google Sheets
            </s-list-item>
            <s-list-item>
              <s-text weight="bold">Execution History</s-text> - Track when
              reports were sent and their status
            </s-list-item>
          </s-unordered-list>
        </s-stack>
      </s-section>


      <s-section slot="aside" heading="Getting Started">
        <s-stack direction="block" gap="base">
          <s-link href="/app/reports">
            <s-button variant="primary" style={{ width: "100%" }}>
              Create Your First Report
            </s-button>
          </s-link>
          <s-link href="/app/reports/scheduled">
            <s-button variant="secondary" style={{ width: "100%" }}>
              View Scheduled Reports
            </s-button>
          </s-link>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Resources">
        <s-unordered-list>
          <s-list-item>
            <s-link href="/app/reports">View all report types</s-link>
          </s-list-item>
          <s-list-item>
            <s-link href="/app/reports/scheduled">Manage scheduled reports</s-link>
          </s-list-item>
          <s-list-item>
            <s-link
              href="https://shopify.dev/docs/api/admin-graphql"
              target="_blank"
            >
              Shopify GraphQL API
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
