# App Navigation Documentation

## Overview

The app navigation provides a clean, intuitive interface for users to access all features of Report Flow. The navigation includes links to the dashboard, report creation, and scheduled reports management.

## Navigation Structure

### Main Navigation

**Location:** Top of every page (via `app.tsx`)

**Links:**
1. **Dashboard** - `/app`
2. **Create Report** - `/app/reports`
3. **Scheduled Reports** - `/app/reports/scheduled`

---

## Pages

### 1. Dashboard (`/app`)

**Purpose:** Welcome page and overview of report activity

**Features:**
- Welcome message
- Statistics cards (Total Reports, Active Reports, Total Executions)
- Recent executions list
- Quick start guide
- Feature highlights
- Quick action buttons

**Statistics Displayed:**
- Total Reports: Count of all reports created
- Active Reports: Count of currently active reports
- Total Executions: Count of all report executions

**Recent Executions:**
- Shows last 5 executions
- Displays report name, type, timestamp
- Status badge (Success/Failed/Running)
- Link to view all reports

---

### 2. Create Report (`/app/reports`)

**Purpose:** Report type selection page

**Features:**
- Grid of 7 report type cards
- Report type descriptions
- "Create Report" buttons
- Visual icons for each type

**Report Types:**
- Sales Reports
- Orders Reports
- Products Reports
- Customers Reports
- Inventory Reports
- Traffic Reports
- Discounts Reports

---

### 3. Scheduled Reports (`/app/reports/scheduled`)

**Purpose:** Manage all scheduled reports

**Features:**
- List of all scheduled reports
- Report details (name, type, frequency, next run)
- Action buttons (History, Run Now, Pause/Resume, Delete)
- Status indicators
- Empty state for no reports

**Actions Available:**
- View execution history
- Run report manually
- Pause/resume report
- Delete report

---

### 4. New Report Configuration (`/app/reports/new`)

**Purpose:** Configure a new scheduled report

**Features:**
- Multi-step form
- Filter configuration
- Report preview
- Schedule configuration
- Email recipients
- Save button

**Steps:**
1. Configure filters
2. Preview report data
3. Set schedule
4. Add recipients
5. Save report

---

### 5. Report History (`/app/reports/:id/history`)

**Purpose:** View execution history for a specific report

**Features:**
- List of last 50 executions
- Execution details (status, timestamp, duration, records)
- Error details for failures
- Email delivery stats
- Back to reports button

---

## Dashboard Statistics

### Implementation

**File:** `app/routes/app._index.tsx`

**Loader Function:**
```typescript
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
    stats: { totalReports, activeReports, totalExecutions },
    recentExecutions,
  };
};
```

---

### Statistics Cards

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Your Reports                                    │
├─────────────────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│ │  Total   │  │  Active  │  │  Total   │      │
│ │ Reports  │  │ Reports  │  │Executions│      │
│ │    12    │  │    8     │  │   156    │      │
│ └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

**Code:**
```tsx
<s-section heading="Your Reports">
  <s-stack direction="inline" gap="base">
    <s-box padding="base" borderWidth="base" borderRadius="base" background="surface" style={{ flex: 1 }}>
      <s-stack direction="block" gap="tight" alignment="center">
        <s-text variant="subdued">Total Reports</s-text>
        <s-heading level={2}>{stats.totalReports}</s-heading>
      </s-stack>
    </s-box>
    {/* ... other cards ... */}
  </s-stack>
</s-section>
```

---

### Recent Executions

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Recent Executions                               │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Weekly Sales Report              [SUCCESS] │ │
│ │ SALES • 10/1/2025, 9:00 AM                 │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Daily Orders Report              [SUCCESS] │ │
│ │ ORDERS • 10/1/2025, 8:00 AM                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [View All Reports]                              │
└─────────────────────────────────────────────────┘
```

**Code:**
```tsx
{recentExecutions.length > 0 && (
  <s-section heading="Recent Executions">
    <s-stack direction="block" gap="base">
      {recentExecutions.map((execution) => (
        <s-box key={execution.id} padding="base" borderWidth="base" borderRadius="base" background="surface">
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
  </s-section>
)}
```

---

## Navigation Component

### Implementation

**File:** `app/routes/app.tsx`

**Code:**
```tsx
export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/reports">Create Report</s-link>
        <s-link href="/app/reports/scheduled">Scheduled Reports</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}
```

**Features:**
- Clean, simple navigation
- Three main links
- Embedded in Shopify admin
- Consistent across all pages

---

## User Flows

### Creating a Report

1. User clicks "Dashboard" in navigation
2. User clicks "Create Scheduled Report" button
3. User selects report type
4. User configures filters
5. User previews data
6. User sets schedule
7. User adds recipients
8. User saves report
9. User redirected to "Scheduled Reports"

---

### Viewing Report History

1. User clicks "Scheduled Reports" in navigation
2. User sees list of all reports
3. User clicks "History" button on a report
4. User sees execution history
5. User can view error details
6. User clicks back to return to list

---

### Running Report Manually

1. User clicks "Scheduled Reports" in navigation
2. User sees list of all reports
3. User clicks "Run Now" button
4. Report executes immediately
5. User sees loading state
6. User sees success/failure toast
7. User can view history to see results

---

## Design Principles

### 1. Simplicity
- Only essential navigation links
- Clear, descriptive labels
- No nested menus

### 2. Consistency
- Same navigation on every page
- Consistent button styles
- Consistent terminology

### 3. Discoverability
- All features accessible from navigation
- Quick actions on dashboard
- Clear call-to-action buttons

### 4. Feedback
- Active state indicators (future enhancement)
- Loading states on actions
- Success/failure notifications

---

## Future Enhancements

### 1. Active State Indicators

**Current:** No visual indication of current page

**Enhancement:**
- Highlight current page in navigation
- Use different color or underline
- Improve user orientation

**Implementation:**
```tsx
import { useLocation } from "react-router";

export default function App() {
  const location = useLocation();
  
  return (
    <s-app-nav>
      <s-link href="/app" active={location.pathname === "/app"}>Dashboard</s-link>
      <s-link href="/app/reports" active={location.pathname.startsWith("/app/reports")}>Create Report</s-link>
      <s-link href="/app/reports/scheduled" active={location.pathname === "/app/reports/scheduled"}>Scheduled Reports</s-link>
    </s-app-nav>
  );
}
```

---

### 2. Breadcrumbs

**Current:** No breadcrumbs

**Enhancement:**
- Show navigation path
- Allow quick navigation to parent pages
- Improve user orientation

**Example:**
```
Dashboard > Scheduled Reports > Weekly Sales Report > History
```

---

### 3. Search Functionality

**Current:** No search

**Enhancement:**
- Search bar in navigation
- Search reports by name
- Filter by report type
- Quick access to reports

---

### 4. Notifications Badge

**Current:** No notification system

**Enhancement:**
- Badge showing failed reports
- Click to see failures
- Quick access to errors

---

### 5. User Profile Menu

**Current:** No user menu

**Enhancement:**
- User profile dropdown
- Settings link
- Help/documentation link
- Logout option

---

## Accessibility

### Current Implementation

**Features:**
- Semantic HTML via Shopify Polaris components
- Keyboard navigation support
- Screen reader friendly

**Best Practices:**
- Use descriptive link text
- Provide alt text for icons
- Ensure sufficient color contrast
- Support keyboard navigation

---

## Mobile Responsiveness

**Current Implementation:**
- Shopify Polaris components are responsive
- Navigation adapts to mobile screens
- Statistics cards stack on mobile
- Tables scroll horizontally

**Considerations:**
- Test on various screen sizes
- Ensure touch targets are large enough
- Optimize for mobile performance

---

## Related Documentation

- Dashboard: `docs/DASHBOARD.md` (this file)
- Report Creation: `docs/REPORT_CREATION_UI.md`
- Scheduled Reports: `docs/SCHEDULED_REPORTS_UI.md`
- Report History: `docs/REPORT_HISTORY_VIEW.md`

