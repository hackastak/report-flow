# Manual Report Execution Documentation

## Overview

Manual Report Execution allows users to trigger report generation immediately without waiting for the scheduled time. This is useful for testing, immediate needs, or on-demand reporting.

## Features

### 1. Run Now Button

**Location:** Scheduled Reports page (`/app/reports/scheduled`)

**Functionality:**
- Triggers immediate report execution
- Bypasses schedule
- Sends to all configured recipients
- Shows loading state during execution
- Displays success/error notifications

---

### 2. Pause/Resume Toggle

**Location:** Scheduled Reports page (`/app/reports/scheduled`)

**Functionality:**
- Pause active reports (stops automatic execution)
- Resume paused reports (restarts automatic execution)
- Shows loading state during update
- Displays success/error notifications

---

## User Interface

### Scheduled Reports Table

**Columns:**
1. Report Name - Name and description
2. Type - Report type with icon
3. Frequency - Daily, Weekly, Monthly
4. Recipients - Number of recipients
5. Last Run - Last execution date/time
6. Next Run - Next scheduled execution
7. Status - Active or Paused badge
8. Actions - Edit, Run Now, Pause/Resume, Delete

**Action Buttons:**

```
┌─────────────────────────────────────────────────┐
│ [Edit] [Run Now] [Pause/Resume] [Delete]       │
└─────────────────────────────────────────────────┘
```

---

## Run Now Functionality

### User Flow

1. **User clicks "Run Now" button**
   - Confirmation dialog appears
   - Shows report name and recipients info

2. **User confirms**
   - Button shows loading state ("Running...")
   - Other buttons disabled
   - API call initiated

3. **Execution starts**
   - Report execution service triggered
   - Runs in background
   - History record created

4. **User receives feedback**
   - Success toast: "Report execution started! You will receive an email when it's complete."
   - Button returns to normal state
   - User can continue using the app

5. **Report completes**
   - Email sent to recipients
   - History record updated
   - User receives email notification

---

### Confirmation Dialog

**Message:**
```
Run "[Report Name]" now?

The report will be generated and emailed to all recipients.

[Cancel] [OK]
```

---

### Loading States

**Button States:**
- **Normal:** "Run Now" (primary button, blue)
- **Loading:** "Running..." (disabled, loading spinner)
- **Disabled:** "Run Now" (grayed out when paused or other action in progress)

**Disabled Conditions:**
- Report is paused (isActive = false)
- Another action is in progress (running, deleting, toggling)

---

### Success Notification

**Toast Message:**
```
✓ Report execution started! You will receive an email when it's complete.
```

**Duration:** 5 seconds

---

### Error Notification

**Toast Message:**
```
✗ Failed to run report. Please try again.
```

**Duration:** Until dismissed

---

## Pause/Resume Functionality

### User Flow

1. **User clicks "Pause" or "Resume" button**
   - Confirmation dialog appears
   - Shows report name and action description

2. **User confirms**
   - Button shows loading state ("Updating...")
   - Other buttons disabled
   - API call initiated

3. **Status updates**
   - Database updated
   - Page refreshes
   - New status displayed

4. **User receives feedback**
   - Success toast: "Report paused successfully!" or "Report resumed successfully!"
   - Status badge updated
   - Button text updated

---

### Confirmation Dialogs

**Pause:**
```
Pause "[Report Name]"?

The report will not run automatically until resumed.

[Cancel] [OK]
```

**Resume:**
```
Resume "[Report Name]"?

The report will resume running on its schedule.

[Cancel] [OK]
```

---

### Button States

**Active Report:**
- Button text: "Pause"
- Action: Pauses the report

**Paused Report:**
- Button text: "Resume"
- Action: Resumes the report

**Loading:**
- Button text: "Updating..."
- State: Disabled with loading spinner

---

### Status Badge

**Active:**
```
[Active] (green badge)
```

**Paused:**
```
[Paused] (gray badge)
```

---

## API Integration

### Run Now Endpoint

**Request:**
```http
POST /api/reports/:id/run
```

**Response:**
```json
{
  "success": true,
  "message": "Report execution started. You will receive an email when it's complete."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_FAILED",
    "message": "Failed to start report execution",
    "details": "Error details..."
  }
}
```

---

### Pause/Resume Endpoint

**Request:**
```http
PUT /api/reports/:id
Content-Type: application/json

{
  "isActive": false  // or true to resume
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "report-123",
    "isActive": false,
    ...
  }
}
```

---

## Implementation Details

### State Management

**React State:**
```typescript
const [runningId, setRunningId] = useState<string | null>(null);
const [togglingId, setTogglingId] = useState<string | null>(null);
const [deletingId, setDeletingId] = useState<string | null>(null);
```

**Purpose:**
- Track which report is currently being acted upon
- Disable buttons during operations
- Show loading states

---

### Handle Run Now

```typescript
const handleRunNow = async (reportId: string, reportName: string) => {
  if (!confirm(`Run "${reportName}" now?...`)) {
    return;
  }

  setRunningId(reportId);

  try {
    const response = await fetch(`/api/reports/${reportId}/run`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      shopify.toast.show("Report execution started!", {
        duration: 5000,
      });
    } else {
      throw new Error(data.error?.message);
    }
  } catch (error) {
    shopify.toast.show("Failed to run report.", {
      isError: true,
    });
  } finally {
    setRunningId(null);
  }
};
```

---

### Handle Toggle Active

```typescript
const handleToggleActive = async (
  reportId: string,
  reportName: string,
  currentStatus: boolean
) => {
  const action = currentStatus ? "pause" : "resume";
  if (!confirm(`${action} "${reportName}"?...`)) {
    return;
  }

  setTogglingId(reportId);

  try {
    const response = await fetch(`/api/reports/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });

    const data = await response.json();

    if (data.success) {
      shopify.toast.show(`Report ${action}d successfully!`);
      window.location.reload();
    } else {
      throw new Error(data.error?.message);
    }
  } catch (error) {
    shopify.toast.show("Failed to update report status.", {
      isError: true,
    });
  } finally {
    setTogglingId(null);
  }
};
```

---

## User Experience

### Benefits

1. **Immediate Testing**
   - Test reports without waiting for schedule
   - Verify configuration changes
   - Check data accuracy

2. **On-Demand Reporting**
   - Generate reports for urgent needs
   - Respond to stakeholder requests
   - Create ad-hoc reports

3. **Flexible Control**
   - Pause reports temporarily
   - Resume when needed
   - No need to delete and recreate

4. **Clear Feedback**
   - Loading states show progress
   - Toast notifications confirm actions
   - Disabled states prevent errors

---

### Best Practices

**For Users:**
1. Test new reports with "Run Now" before relying on schedule
2. Pause reports during maintenance or data issues
3. Resume reports when ready
4. Check email for execution results

**For Developers:**
1. Always show loading states
2. Disable conflicting actions
3. Provide clear confirmation dialogs
4. Show success/error feedback
5. Handle errors gracefully

---

## Error Handling

### Common Errors

1. **Report Not Found**
   - Error: "Report not found"
   - Cause: Report was deleted
   - Solution: Refresh page

2. **Report Inactive**
   - Error: Button disabled
   - Cause: Report is paused
   - Solution: Resume report first

3. **Network Error**
   - Error: "Failed to run report"
   - Cause: Network connection issue
   - Solution: Check connection and retry

4. **Execution Error**
   - Error: "Failed to start report execution"
   - Cause: Server error or invalid configuration
   - Solution: Check report configuration

---

## Testing

### Manual Testing

**Test Run Now:**
1. Navigate to Scheduled Reports page
2. Click "Run Now" on a report
3. Confirm dialog
4. Verify loading state
5. Verify success toast
6. Check email for report

**Test Pause:**
1. Click "Pause" on active report
2. Confirm dialog
3. Verify loading state
4. Verify page refresh
5. Verify status badge changed to "Paused"
6. Verify "Run Now" button disabled

**Test Resume:**
1. Click "Resume" on paused report
2. Confirm dialog
3. Verify loading state
4. Verify page refresh
5. Verify status badge changed to "Active"
6. Verify "Run Now" button enabled

---

## Future Enhancements

### 1. Progress Tracking

**Current:** No progress visibility

**Enhancement:**
- Real-time progress updates
- Step-by-step status
- Estimated completion time
- WebSocket notifications

### 2. Execution History Link

**Current:** No link to history

**Enhancement:**
- "View History" button
- Navigate to execution history
- See past runs
- Download previous reports

### 3. Bulk Actions

**Current:** One report at a time

**Enhancement:**
- Select multiple reports
- Run multiple reports
- Pause/resume multiple reports
- Bulk operations

### 4. Schedule Override

**Current:** Runs immediately

**Enhancement:**
- Schedule for specific time
- Run at next available slot
- Queue for later execution

---

## Related Documentation

- Report Execution Service: `docs/REPORT_EXECUTION_SERVICE.md`
- Background Scheduler: `docs/BACKGROUND_SCHEDULER.md`
- API Routes: `docs/API_ROUTES.md`

