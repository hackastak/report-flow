# Report Flow - Report List View Guide

## Overview

This document explains the Scheduled Reports list page, which displays all scheduled reports in a table format with management actions.

## Architecture

### Components

1. **Scheduled Reports Page** (`app/routes/app.reports.scheduled.tsx`)
   - Main list view with table
   - Action buttons (Edit, Run Now, Delete)
   - Empty state
   - Helper functions for formatting

2. **Navigation Integration** (`app/routes/app.tsx`)
   - "Scheduled Reports" link in main navigation
   - Accessible from all pages

3. **Home Page Integration** (`app/routes/app._index.tsx`)
   - "View Scheduled Reports" button in sidebar
   - Link in resources section

---

## Page Structure

### Route

**URL:** `/app/reports/scheduled`

**Loader Function:**
```typescript
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // TODO: Fetch scheduled reports from database
  const scheduledReports = await prisma.reportSchedule.findMany({
    where: { shop: session.shop },
    include: {
      recipients: true,
      filters: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { scheduledReports };
};
```

---

## Table Columns

### 1. Report Name

**Display:**
- Report name (bold)
- Description (subdued, below name)

**Example:**
```
Weekly Sales Report
Sales performance for the past week
```

---

### 2. Type

**Display:**
- Report icon (emoji)
- Report type name

**Icons:**
- 💰 Sales Report
- 📦 Orders Report
- 🛍️ Products Report
- 👥 Customers Report
- 📊 Inventory Report
- 📈 Traffic Report
- 🎯 Discounts Report

**Example:**
```
💰 Sales Report
```

---

### 3. Frequency

**Display:**
- Formatted frequency string

**Values:**
- Daily
- Weekly
- Monthly
- Custom

**Example:**
```
Weekly
```

---

### 4. Recipients

**Display:**
- Count of recipients

**Example:**
```
3
```

---

### 5. Last Run

**Display:**
- Formatted date/time
- "Never" if not yet run

**Format:**
```
Jan 15, 2025, 9:00 AM
```

**Example:**
```
Never
```

---

### 6. Next Run

**Display:**
- Formatted date/time
- Calculated based on schedule

**Format:**
```
Jan 22, 2025, 9:00 AM
```

---

### 7. Status

**Display:**
- Badge with status

**Values:**
- Active (green badge)
- Paused (gray badge)

**Example:**
```
[Active]
```

---

### 8. Actions

**Buttons:**
- Edit
- Run Now
- Delete

**Layout:**
```
[Edit] [Run Now] [Delete]
```

---

## Actions

### Edit Report

**Trigger:** Click "Edit" button

**Behavior:**
```typescript
const handleEdit = (reportId: string) => {
  navigate(`/app/reports/edit/${reportId}`);
};
```

**Future Implementation:**
- Navigate to edit page
- Pre-populate form with existing data
- Save updates to database

---

### Run Now

**Trigger:** Click "Run Now" button

**Behavior:**
```typescript
const handleRunNow = async (reportId: string) => {
  if (!confirm("Run this report now?")) {
    return;
  }

  await fetch(`/api/reports/${reportId}/run`, { method: "POST" });
  alert("Report execution started!");
};
```

**Flow:**
1. Show confirmation dialog
2. Call API to trigger execution
3. Show success message
4. Report runs in background
5. User receives email when complete

---

### Delete Report

**Trigger:** Click "Delete" button

**Behavior:**
```typescript
const handleDelete = async (reportId: string) => {
  if (!confirm("Are you sure you want to delete this scheduled report?")) {
    return;
  }

  setDeletingId(reportId);

  try {
    await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
    window.location.reload();
  } catch (error) {
    alert("Failed to delete report. Please try again.");
  } finally {
    setDeletingId(null);
  }
};
```

**Flow:**
1. Show confirmation dialog
2. Set deleting state (disable button)
3. Call API to delete report
4. Refresh page on success
5. Show error on failure

---

### Toggle Active Status

**Trigger:** Click status badge (future feature)

**Behavior:**
```typescript
const handleToggleActive = async (reportId: string, currentStatus: boolean) => {
  await fetch(`/api/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: !currentStatus }),
  });
  window.location.reload();
};
```

**Flow:**
1. Toggle isActive field
2. Update database
3. Refresh page
4. Badge updates to reflect new status

---

## Empty State

### Display

**When Shown:**
- No scheduled reports exist

**Layout:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                      📊                         │
│                                                 │
│           No Scheduled Reports Yet              │
│                                                 │
│   Create your first automated report to get    │
│                   started                       │
│                                                 │
│        [Create Your First Report]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Components:**
- Large icon (📊)
- Heading: "No Scheduled Reports Yet"
- Description: "Create your first automated report to get started"
- Primary action button: "Create Your First Report"

---

## Helper Functions

### getReportIcon

**Purpose:** Get emoji icon for report type

```typescript
function getReportIcon(reportType: string): string {
  const config = REPORT_TYPES[reportType as keyof typeof REPORT_TYPES];
  return config?.icon || "📊";
}
```

---

### getReportName

**Purpose:** Get human-readable report type name

```typescript
function getReportName(reportType: string): string {
  const config = REPORT_TYPES[reportType as keyof typeof REPORT_TYPES];
  return config?.name || reportType;
}
```

---

### formatDate

**Purpose:** Format date for display

```typescript
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
```

**Examples:**
- `null` → "Never"
- `"2025-01-15T09:00:00Z"` → "Jan 15, 2025, 9:00 AM"

---

### formatFrequency

**Purpose:** Format frequency for display

```typescript
function formatFrequency(frequency: string): string {
  return frequency.charAt(0) + frequency.slice(1).toLowerCase();
}
```

**Examples:**
- `"DAILY"` → "Daily"
- `"WEEKLY"` → "Weekly"
- `"MONTHLY"` → "Monthly"

---

## Database Integration

### Query Structure

```typescript
const scheduledReports = await prisma.reportSchedule.findMany({
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
```

### Data Transformation

```typescript
const reportsWithCounts = scheduledReports.map((report) => ({
  ...report,
  recipientCount: report.recipients.length,
}));
```

---

## User Experience

### Loading State

**Future Implementation:**
```typescript
const [loading, setLoading] = useState(true);

// Show loading spinner while fetching
{loading ? (
  <s-spinner size="large" />
) : (
  <table>...</table>
)}
```

---

### Pagination

**Future Implementation:**
```typescript
const [page, setPage] = useState(1);
const [limit] = useState(20);

// Fetch paginated data
const { reports, total } = await fetchReports({ page, limit });

// Show pagination controls
<s-pagination
  current={page}
  total={Math.ceil(total / limit)}
  onChange={setPage}
/>
```

---

### Sorting

**Future Implementation:**
```typescript
const [sortBy, setSortBy] = useState("createdAt");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

// Clickable column headers
<th onClick={() => handleSort("name")}>
  Report Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
</th>
```

---

### Filtering

**Future Implementation:**
```typescript
const [filterType, setFilterType] = useState<string | null>(null);
const [filterStatus, setFilterStatus] = useState<boolean | null>(null);

// Filter controls
<s-select
  label="Filter by Type"
  value={filterType}
  onChange={setFilterType}
  options={reportTypes}
/>
```

---

## Navigation Flow

### From Home Page

1. User clicks "View Scheduled Reports" button
2. Navigate to `/app/reports/scheduled`
3. Show list of reports

### From Main Navigation

1. User clicks "Scheduled Reports" link
2. Navigate to `/app/reports/scheduled`
3. Show list of reports

### To Create Report

1. User clicks "Create New Report" button
2. Navigate to `/app/reports`
3. Show report type selection

### To Edit Report

1. User clicks "Edit" button on a report
2. Navigate to `/app/reports/edit/:id`
3. Show edit form with pre-populated data

---

## Error Handling

### Delete Failure

```typescript
try {
  await deleteReport(reportId);
} catch (error) {
  console.error("Failed to delete report:", error);
  alert("Failed to delete report. Please try again.");
}
```

### Run Now Failure

```typescript
try {
  await runReport(reportId);
  alert("Report execution started!");
} catch (error) {
  console.error("Failed to run report:", error);
  alert("Failed to run report. Please try again.");
}
```

---

## Future Enhancements

### Planned Features

1. **Bulk Actions** - Select multiple reports and delete/pause
2. **Search** - Search reports by name
3. **Advanced Filters** - Filter by type, status, frequency
4. **Sorting** - Sort by any column
5. **Pagination** - Handle large numbers of reports
6. **Quick View** - Preview report details in modal
7. **Duplicate Report** - Clone existing report
8. **Export List** - Export report list as CSV
9. **Report Groups** - Organize reports into folders
10. **Favorites** - Star important reports

---

## Testing Checklist

### Functional Tests

- [ ] Page loads without errors
- [ ] Empty state shows when no reports
- [ ] Table displays when reports exist
- [ ] All columns show correct data
- [ ] Edit button navigates correctly
- [ ] Run Now button triggers execution
- [ ] Delete button removes report
- [ ] Confirmation dialogs work
- [ ] Status badges display correctly
- [ ] Icons display correctly

### Edge Cases

- [ ] Very long report names
- [ ] Reports with no description
- [ ] Reports never run (lastRunAt = null)
- [ ] Reports with 0 recipients
- [ ] Reports with 100+ recipients
- [ ] Future next run dates
- [ ] Past next run dates

---

## Related Documentation

- Product Requirements: `docs/PRD.md`
- Functional Specification: `docs/FSD.md`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- Report Types: `docs/REPORT_TYPES.md`

