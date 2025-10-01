# Report Execution Service Documentation

## Overview

The Report Execution Service orchestrates the complete report generation and delivery flow. It coordinates all services (data fetcher, data processor, email service) and handles errors, logging, and history recording.

## File Location

`app/services/reportExecutionService.server.ts`

---

## Main Functions

### `executeReport(options: ExecuteReportOptions): Promise<ExecuteReportResult>`

Executes a scheduled report through the complete pipeline.

**Parameters:**
```typescript
interface ExecuteReportOptions {
  reportScheduleId: string;
  shop: string;
  accessToken: string;
}
```

**Returns:**
```typescript
interface ExecuteReportResult {
  success: boolean;
  historyId: string;
  recordCount?: number;
  emailsSent?: number;
  error?: string;
}
```

**Example Usage:**
```typescript
import { executeReport } from "~/services/reportExecutionService.server";

const result = await executeReport({
  reportScheduleId: "report-123",
  shop: "my-store.myshopify.com",
  accessToken: "shpat_xxxxx",
});

if (result.success) {
  console.log(`Report executed: ${result.historyId}`);
  console.log(`Records: ${result.recordCount}, Emails: ${result.emailsSent}`);
} else {
  console.error(`Execution failed: ${result.error}`);
}
```

---

### `executeReportManually(reportScheduleId, shop, accessToken): Promise<ExecuteReportResult>`

Executes a report manually (triggered by user clicking "Run Now").

**Example Usage:**
```typescript
import { executeReportManually } from "~/services/reportExecutionService.server";

const result = await executeReportManually(
  "report-123",
  "my-store.myshopify.com",
  "shpat_xxxxx"
);
```

**Difference from `executeReport`:**
- Same functionality
- Different function name for clarity
- Used in API route for manual execution

---

### `executeScheduledReports(shop, accessToken): Promise<{ executed, succeeded, failed }>`

Executes all reports that are due to run for a shop.

**Returns:**
```typescript
{
  executed: number;   // Total reports executed
  succeeded: number;  // Successfully completed
  failed: number;     // Failed executions
}
```

**Example Usage:**
```typescript
import { executeScheduledReports } from "~/services/reportExecutionService.server";

const result = await executeScheduledReports(
  "my-store.myshopify.com",
  "shpat_xxxxx"
);

console.log(`Executed ${result.executed} reports`);
console.log(`Success: ${result.succeeded}, Failed: ${result.failed}`);
```

**Use Case:**
- Called by background scheduler (Task 15)
- Runs periodically (e.g., every 5 minutes)
- Finds all reports where `nextRunAt <= now`
- Executes each report sequentially

---

## Execution Flow

### Step-by-Step Process

```
1. Fetch Report Configuration
   ↓
2. Create History Record (RUNNING)
   ↓
3. Fetch Data from Shopify
   ↓
4. Process and Format Data
   ↓
5. Generate CSV File
   ↓
6. Send Emails to Recipients
   ↓
7. Update History Record (SUCCESS/FAILED)
   ↓
8. Update Next Run Time
   ↓
9. Clean Up Temporary File
```

---

### Step 1: Fetch Report Configuration

**Action:**
```typescript
const reportSchedule = await prisma.reportSchedule.findUnique({
  where: { id: reportScheduleId },
  include: {
    filters: true,
    recipients: true,
  },
});
```

**Validations:**
- Report exists
- Report belongs to shop
- Report is active

**Error Handling:**
- Throws error if report not found
- Throws error if report is inactive

---

### Step 2: Create History Record

**Action:**
```typescript
const history = await prisma.reportHistory.create({
  data: {
    reportScheduleId,
    status: "RUNNING",
    startedAt: new Date(),
  },
});
```

**Purpose:**
- Track execution start time
- Provide execution ID for logging
- Allow users to see execution status

**Status Values:**
- `RUNNING` - Execution in progress
- `SUCCESS` - Completed successfully
- `FAILED` - Execution failed

---

### Step 3: Fetch Data from Shopify

**Action:**
```typescript
const fetchResult = await fetchShopifyData({
  shop,
  accessToken,
  reportType: reportSchedule.reportType,
  filters: filtersObj,
});
```

**Error Handling:**
- Catches Shopify API errors
- Handles rate limiting
- Retries on transient failures

**Logging:**
```
[Report Execution] Fetching data from Shopify...
[Report Execution] Fetched 150 records
```

---

### Step 4: Process and Format Data

**Action:**
```typescript
const processResult = await processReportData({
  reportType: reportSchedule.reportType,
  rawData: fetchResult.data,
  filters: filtersObj,
  reportName: reportSchedule.name,
});
```

**Error Handling:**
- Catches data processing errors
- Validates data structure
- Handles empty datasets

**Logging:**
```
[Report Execution] Processing data...
[Report Execution] Generated CSV: /reports/report_20250115-143022.csv
[Report Execution] Processed 150 records
```

---

### Step 5: Send Emails

**Action:**
```typescript
const emailResult = await sendReportEmail({
  recipients: reportSchedule.recipients,
  reportName: reportSchedule.name,
  reportType: reportConfig.name,
  filePath,
  recordCount: processResult.recordCount,
  dateRange,
  shopName: shop,
});
```

**Error Handling:**
- Per-recipient error tracking
- Partial success allowed
- Detailed error messages

**Logging:**
```
[Report Execution] Sending emails to 5 recipients...
[Report Execution] Emails sent: 5, failed: 0
```

---

### Step 6: Update History Record

**Success:**
```typescript
await prisma.reportHistory.update({
  where: { id: historyId },
  data: {
    status: "SUCCESS",
    completedAt: new Date(),
    recordCount: processResult.recordCount,
    fileSize: processResult.fileSize,
    filePath,
    emailsSent: emailResult.emailsSent,
    emailsFailed: emailResult.emailsFailed,
  },
});
```

**Failure:**
```typescript
await prisma.reportHistory.update({
  where: { id: historyId },
  data: {
    status: "FAILED",
    completedAt: new Date(),
    errorMessage,
    errorDetails,
  },
});
```

---

### Step 7: Update Next Run Time

**Action:**
```typescript
const nextRunAt = calculateNextRunTime(
  reportSchedule.frequency,
  reportSchedule.scheduleTime,
  reportSchedule.scheduleDay,
  reportSchedule.timezone
);

await prisma.reportSchedule.update({
  where: { id: reportScheduleId },
  data: {
    lastRunAt: new Date(),
    nextRunAt,
  },
});
```

**Purpose:**
- Schedule next execution
- Track last execution time
- Enable scheduler to find due reports

---

### Step 8: Clean Up Temporary File

**Action:**
```typescript
if (filePath && fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}
```

**Purpose:**
- Free disk space
- Remove sensitive data
- Prevent file accumulation

**Error Handling:**
- Catches cleanup errors
- Doesn't fail execution if cleanup fails
- Logs cleanup errors

---

## Error Handling

### Try-Catch Structure

```typescript
try {
  // Step 1-8: Execute report
  return { success: true, ... };
} catch (error) {
  // Update history with failure
  // Clean up temporary file
  return { success: false, error: ... };
}
```

### Error Types

1. **Configuration Errors**
   - Report not found
   - Report not active
   - Invalid configuration

2. **Data Fetch Errors**
   - Shopify API errors
   - Rate limiting
   - Network errors

3. **Processing Errors**
   - Invalid data format
   - Processing failures
   - CSV generation errors

4. **Email Errors**
   - SMTP connection errors
   - Invalid recipients
   - Attachment errors

5. **Database Errors**
   - Connection errors
   - Query failures
   - Constraint violations

### Error Recording

**History Record:**
```typescript
{
  status: "FAILED",
  errorMessage: "Data fetch failed: Rate limit exceeded",
  errorDetails: "Error stack trace...",
}
```

**Console Logging:**
```
[Report Execution] Error: Data fetch failed: Rate limit exceeded
```

---

## Logging

### Log Levels

**Info Logs:**
```
[Report Execution] Starting report report-123
[Report Execution] Created history record: history-456
[Report Execution] Fetched 150 records
[Report Execution] Processed 150 records
[Report Execution] Emails sent: 5, failed: 0
[Report Execution] Completed successfully
```

**Error Logs:**
```
[Report Execution] Error: Data fetch failed
[Report Execution] Failed to clean up file: /reports/report.csv
```

### Log Format

**Pattern:**
```
[Report Execution] <Action>: <Details>
```

**Benefits:**
- Easy to search logs
- Clear execution flow
- Debugging information

---

## Integration with API Routes

### Manual Execution (Run Now)

**File:** `app/routes/api.reports.$id.run.tsx`

**Implementation:**
```typescript
import { executeReportManually } from "~/services/reportExecutionService.server";

// Execute asynchronously (don't wait for completion)
executeReportManually(report.id, session.shop, session.accessToken)
  .then((result) => {
    if (result.success) {
      console.log(`Report execution completed: ${result.historyId}`);
    } else {
      console.error(`Report execution failed: ${result.error}`);
    }
  })
  .catch((error) => {
    console.error("Report execution error:", error);
  });

return json({
  success: true,
  message: "Report execution started. You will receive an email when it's complete.",
});
```

**Benefits:**
- Non-blocking response
- User gets immediate feedback
- Execution continues in background

---

## Performance Considerations

### Sequential Execution

**Current Implementation:**
- Executes one report at a time
- Waits for each step to complete

**Pros:**
- Simple error handling
- Easy to debug
- Predictable resource usage

**Cons:**
- Slower for multiple reports
- Blocks other executions

### Optimization Options

**1. Parallel Execution:**
```typescript
await Promise.all(
  dueReports.map(report => executeReport(report))
);
```

**2. Queue-Based:**
- Use job queue (Bull, BullMQ)
- Process reports in background workers
- Better for high volume

**3. Batch Processing:**
- Group reports by shop
- Execute in batches
- Rate limiting per shop

---

## Database Transactions

### Current Implementation

**No Transactions:**
- Each database operation is independent
- History record created before execution
- Updated after completion

**Pros:**
- Simple implementation
- History record always exists
- Can track partial failures

**Cons:**
- No rollback on failure
- Orphaned history records possible

### Future Enhancement

**With Transactions:**
```typescript
await prisma.$transaction(async (tx) => {
  // Create history
  // Update report schedule
  // All or nothing
});
```

---

## Testing

### Unit Tests

**Test Cases:**
1. Execute report successfully
2. Handle report not found
3. Handle inactive report
4. Handle data fetch failure
5. Handle processing failure
6. Handle email failure
7. Clean up file on success
8. Clean up file on failure
9. Update next run time
10. Record execution history

**Example Test:**
```typescript
describe("executeReport", () => {
  it("should execute report successfully", async () => {
    const result = await executeReport({
      reportScheduleId: "test-report",
      shop: "test-shop.myshopify.com",
      accessToken: "test-token",
    });

    expect(result.success).toBe(true);
    expect(result.historyId).toBeDefined();
    expect(result.recordCount).toBeGreaterThan(0);
  });
});
```

---

## Future Enhancements

### 1. Retry Logic

**Current:** No automatic retries

**Enhancement:**
- Retry failed executions
- Exponential backoff
- Maximum retry count
- Track retry attempts

### 2. Execution Queue

**Current:** Synchronous execution

**Enhancement:**
- Queue-based execution
- Background workers
- Priority queue
- Concurrency control

### 3. Execution Timeout

**Current:** No timeout

**Enhancement:**
- Maximum execution time
- Timeout handling
- Graceful termination
- Partial results

### 4. Progress Tracking

**Current:** Binary status (RUNNING/SUCCESS/FAILED)

**Enhancement:**
- Step-by-step progress
- Percentage complete
- Real-time updates
- WebSocket notifications

### 5. Execution Metrics

**Current:** Basic logging

**Enhancement:**
- Execution duration
- Data volume metrics
- Performance tracking
- Alerting on failures

---

## Related Documentation

- Shopify Data Fetcher: `docs/SHOPIFY_DATA_FETCHER.md`
- Report Data Processor: `docs/REPORT_DATA_PROCESSOR.md`
- Email Service: `docs/EMAIL_SERVICE.md`
- API Routes: `docs/API_ROUTES.md`

