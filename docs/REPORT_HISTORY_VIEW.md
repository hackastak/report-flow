# Report History View Documentation

## Overview

The Report History View displays the execution history for a specific report, showing all past executions with their status, timing, results, and error details. This helps users monitor report performance, troubleshoot issues, and verify successful deliveries.

## Features

### 1. Execution Timeline

**Display:**
- Last 50 executions (most recent first)
- Chronological order (newest to oldest)
- Complete execution details

---

### 2. Status Indicators

**Status Types:**
- **SUCCESS** - Green badge, report completed successfully
- **FAILED** - Red badge, report execution failed
- **RUNNING** - Blue badge, report currently executing

---

### 3. Execution Details

**Information Displayed:**
- Status (success/failed/running)
- Start date/time
- Duration (time to complete)
- Record count (number of records in report)
- File size (size of generated CSV)
- Email delivery (sent/failed counts)
- Error details (for failed executions)

---

### 4. Error Details Display

**For Failed Executions:**
- Expandable error details
- Error message displayed
- Styled error container
- Easy to read format

---

## User Interface

### Page Layout

```
┌─────────────────────────────────────────────────┐
│ History: [Report Name]                          │
├─────────────────────────────────────────────────┤
│ [← Back to Reports]                             │
├─────────────────────────────────────────────────┤
│ Report Name                                     │
│ Description                                     │
│ Showing last X executions                       │
├─────────────────────────────────────────────────┤
│ Status | Started | Duration | Records | ...     │
│ ────────────────────────────────────────────────│
│ Success | Jan 15 | 2m 30s  | 1,234   | ...     │
│ Failed  | Jan 14 | 45s     | 0       | ...     │
│ Success | Jan 13 | 3m 15s  | 1,189   | ...     │
└─────────────────────────────────────────────────┘
```

---

### Table Columns

1. **Status** - Badge showing execution status
2. **Started** - Date and time execution began
3. **Duration** - Time taken to complete
4. **Records** - Number of records in report
5. **File Size** - Size of generated CSV file
6. **Emails** - Email delivery statistics
7. **Details** - Error details or status info

---

### Status Badges

**Success:**
```
[Success] (green badge)
```

**Failed:**
```
[Failed] (red badge)
```

**Running:**
```
[Running] (blue badge)
```

---

### Email Delivery Display

**All Successful:**
```
✓ 3
```

**Some Failed:**
```
✓ 2 / ✗ 1
```

**None Sent:**
```
N/A
```

---

### Error Details

**Expandable Section:**
```
[View Error ▼]

┌─────────────────────────────────────────┐
│ Failed to fetch data from Shopify API  │
│ Rate limit exceeded                     │
└─────────────────────────────────────────┘
```

---

## User Flow

### Accessing History

1. **Navigate to Scheduled Reports**
   - Go to `/app/reports/scheduled`

2. **Click "History" button**
   - Located in actions column
   - Opens history page for that report

3. **View execution history**
   - See all past executions
   - Review status and details
   - Expand error details if needed

4. **Return to reports**
   - Click "Back to Reports" button
   - Returns to scheduled reports list

---

### Empty State

**When No History:**
```
┌─────────────────────────────────────────┐
│              📊                         │
│                                         │
│      No Execution History               │
│                                         │
│  This report hasn't been executed yet.  │
│  Use "Run Now" to execute it manually.  │
│                                         │
│      [Back to Reports]                  │
└─────────────────────────────────────────┘
```

---

## Data Display

### Date Formatting

**Format:** `MMM DD, YYYY HH:MM AM/PM`

**Examples:**
- `Jan 15, 2025 2:30 PM`
- `Dec 31, 2024 11:59 PM`

---

### Duration Formatting

**Formats:**
- Under 60 seconds: `45s`
- Over 60 seconds: `2m 30s`
- Still running: `In progress...`

**Calculation:**
```typescript
const start = new Date(startedAt).getTime();
const end = new Date(completedAt).getTime();
const durationMs = end - start;
const seconds = Math.floor(durationMs / 1000);

if (seconds < 60) return `${seconds}s`;
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
return `${minutes}m ${remainingSeconds}s`;
```

---

### File Size Formatting

**Formats:**
- Bytes: `512 B`
- Kilobytes: `45.23 KB`
- Megabytes: `2.45 MB`

**Calculation:**
```typescript
if (bytes < 1024) return `${bytes} B`;
if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
```

---

### Record Count Formatting

**Format:** Comma-separated thousands

**Examples:**
- `1,234`
- `10,567`
- `123,456`

---

## API Integration

### Loader Function

**Route:** `/app/reports/:id/history`

**Data Fetched:**
1. Report details (name, description, type)
2. Execution history (last 50 executions)

**Query:**
```typescript
const report = await prisma.reportSchedule.findFirst({
  where: {
    id,
    shop: session.shop,
  },
});

const history = await prisma.reportHistory.findMany({
  where: {
    reportScheduleId: id,
  },
  orderBy: {
    startedAt: "desc",
  },
  take: 50,
});
```

---

### Data Transformation

**Transform for UI:**
```typescript
const executionHistory = history.map((execution) => ({
  id: execution.id,
  status: execution.status,
  startedAt: execution.startedAt.toISOString(),
  completedAt: execution.completedAt?.toISOString() || null,
  recordCount: execution.recordCount,
  fileSize: execution.fileSize,
  filePath: execution.filePath,
  errorMessage: execution.errorMessage,
  errorDetails: execution.errorDetails,
  emailsSent: execution.emailsSent,
  emailsFailed: execution.emailsFailed,
}));
```

---

## Implementation Details

### Route File

**File:** `app/routes/app.reports.$id.history.tsx`

**Key Components:**
- Loader function for data fetching
- Helper functions for formatting
- Table component for history display
- Empty state component

---

### Helper Functions

**formatDate:**
```typescript
function formatDate(date: string | null): string {
  if (!date) return "N/A";
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

**formatDuration:**
```typescript
function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "In progress...";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const durationMs = end - start;
  const seconds = Math.floor(durationMs / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
```

**formatFileSize:**
```typescript
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
```

---

### Error Details Component

**Expandable Details:**
```tsx
{execution.status === "FAILED" && execution.errorMessage && (
  <details>
    <summary
      style={{
        cursor: "pointer",
        color: "var(--s-color-text-critical)",
      }}
    >
      View Error
    </summary>
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.5rem",
        backgroundColor: "var(--s-color-bg-surface-critical)",
        borderRadius: "4px",
        fontSize: "0.75rem",
      }}
    >
      <s-text>{execution.errorMessage}</s-text>
    </div>
  </details>
)}
```

---

## Navigation

### From Scheduled Reports

**Button Added:**
```tsx
<Link to={`/app/reports/${report.id}/history`}>
  <s-button variant="tertiary">History</s-button>
</Link>
```

**Location:** First button in actions column

---

### Back to Reports

**Button:**
```tsx
<Link to="/app/reports/scheduled">
  <s-button variant="tertiary">← Back to Reports</s-button>
</Link>
```

**Location:** Top of history page

---

## User Experience

### Benefits

1. **Transparency**
   - See all execution attempts
   - Verify successful deliveries
   - Monitor report performance

2. **Troubleshooting**
   - Identify failed executions
   - View error messages
   - Understand failure reasons

3. **Performance Monitoring**
   - Track execution duration
   - Monitor record counts
   - Check file sizes

4. **Delivery Verification**
   - Confirm email delivery
   - See recipient counts
   - Identify delivery failures

---

### Best Practices

**For Users:**
1. Check history after creating new reports
2. Review failed executions for errors
3. Monitor execution duration trends
4. Verify email delivery success

**For Developers:**
1. Store detailed error information
2. Format data for readability
3. Provide clear status indicators
4. Make error details accessible

---

## Database Schema

### ReportHistory Model

```prisma
model ReportHistory {
  id               String   @id @default(uuid())
  reportScheduleId String
  reportSchedule   ReportSchedule @relation(fields: [reportScheduleId], references: [id], onDelete: Cascade)

  // Execution details
  status           String   // SUCCESS, FAILED, RUNNING
  startedAt        DateTime @default(now())
  completedAt      DateTime?

  // Results
  recordCount      Int?
  fileSize         Int?
  filePath         String?

  // Error tracking
  errorMessage     String?
  errorDetails     String?

  // Email delivery
  emailsSent       Int      @default(0)
  emailsFailed     Int      @default(0)

  @@index([reportScheduleId])
  @@index([status])
  @@index([startedAt])
}
```

---

## Future Enhancements

### 1. Date Range Filter

**Current:** Shows last 50 executions

**Enhancement:**
- Filter by date range
- Custom date picker
- Preset ranges (last 7 days, last 30 days, etc.)

### 2. Download Past Reports

**Current:** No download functionality

**Enhancement:**
- Store CSV files permanently
- Add download button
- Link to file storage

### 3. Pagination

**Current:** Limit to 50 executions

**Enhancement:**
- Paginated results
- Load more button
- Infinite scroll

### 4. Export History

**Current:** View only

**Enhancement:**
- Export history to CSV
- Include all execution details
- Download history report

### 5. Real-time Updates

**Current:** Static page load

**Enhancement:**
- WebSocket updates
- Live status changes
- Auto-refresh running executions

### 6. Execution Comparison

**Current:** Individual execution view

**Enhancement:**
- Compare multiple executions
- Trend analysis
- Performance graphs

---

## Related Documentation

- Manual Report Execution: `docs/MANUAL_REPORT_EXECUTION.md`
- Report Execution Service: `docs/REPORT_EXECUTION_SERVICE.md`
- Background Scheduler: `docs/BACKGROUND_SCHEDULER.md`

