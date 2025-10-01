# Error Notifications Documentation

## Overview

The Error Notifications system automatically sends email notifications to report recipients when a scheduled report fails to execute. Notifications include error details, categorization, and troubleshooting tips to help users resolve issues quickly.

## Features

### 1. Automatic Failure Detection

**Triggers:**
- Report execution fails at any step
- Shopify API errors
- Data processing errors
- File generation errors
- Email delivery errors

---

### 2. Error Categorization

**Categories:**
- Shopify API Rate Limit
- Shopify Authentication Error
- Shopify Data Not Found
- Shopify API Error
- Data Processing Error
- File Generation Error
- Email Delivery Error
- Invalid Email Address
- Configuration Error
- Network/Timeout Error
- Database Error
- Unknown Error

---

### 3. Troubleshooting Suggestions

**Provides:**
- Category-specific tips
- Action items for users
- Retry information
- Configuration guidance
- Support contact info

---

### 4. Email Notification

**Includes:**
- Error details
- Error category
- Troubleshooting tips
- Execution ID
- Next steps
- Link to dashboard

---

## User Interface

### Email Template

**Subject:** `⚠️ Report Failed: [Report Name]`

**HTML Email:**
```
┌─────────────────────────────────────────────────┐
│                    ⚠️                           │
│         Report Execution Failed                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Hello,                                          │
│                                                 │
│ Your scheduled report "Weekly Sales Report"    │
│ failed to execute.                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Error Details                               │ │
│ │                                             │ │
│ │ Report Name: Weekly Sales Report           │ │
│ │ Report Type: SALES                          │ │
│ │ Error Category: Shopify API Rate Limit     │ │
│ │ Error Message: Rate limit exceeded         │ │
│ │ Execution ID: abc-123                       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 💡 Troubleshooting Tips                     │ │
│ │                                             │ │
│ │ • Shopify has temporarily rate-limited...  │ │
│ │ • The report will automatically retry...   │ │
│ │ • Consider reducing frequency...           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ What happens next?                              │
│ • Report will retry on next scheduled run      │
│ • You can manually run from dashboard          │
│ • Check report history for details             │
│                                                 │
│ [View Report Dashboard]                         │
└─────────────────────────────────────────────────┘
```

---

## Error Categories

### 1. Shopify API Rate Limit

**Triggers:**
- "throttled" in error message
- "rate limit" in error message

**Troubleshooting Tips:**
- Shopify has temporarily rate-limited your requests
- The report will automatically retry on the next scheduled run
- Consider reducing the frequency of your reports if this happens often
- Large date ranges may trigger rate limits - try using smaller date ranges

---

### 2. Shopify Authentication Error

**Triggers:**
- "authentication" in error message
- "unauthorized" in error message

**Troubleshooting Tips:**
- Your Shopify app connection may have expired
- Try reinstalling the app from your Shopify admin
- Ensure the app has the required permissions
- Contact support if the issue persists

---

### 3. Shopify Data Not Found

**Triggers:**
- "not found" in error message
- "404" in error message

**Troubleshooting Tips:**
- The requested data may not exist in your Shopify store
- Check your filter settings to ensure they match available data
- Verify your date range includes periods with data
- Some data types may not be available for your Shopify plan

---

### 4. Data Processing Error

**Triggers:**
- "process" in error message
- "transform" in error message
- "format" in error message

**Troubleshooting Tips:**
- There was an issue processing the data from Shopify
- This may be due to unexpected data formats or missing fields
- Try running the report with a smaller date range
- Preview the report to see if specific filters cause issues
- Contact support with the execution ID if this continues

---

### 5. File Generation Error

**Triggers:**
- "file" in error message
- "csv" in error message
- "write" in error message
- "storage" in error message

**Troubleshooting Tips:**
- There was an issue creating the report file
- This may be due to temporary server issues
- The report will automatically retry on the next scheduled run
- If this persists, contact support - there may be a storage issue

---

### 6. Email Delivery Error

**Triggers:**
- "email" in error message
- "smtp" in error message
- "mail" in error message

**Troubleshooting Tips:**
- There was an issue sending the report email
- This may be due to temporary email server issues
- Verify all recipient email addresses are correct
- Check your email service configuration
- The report was generated successfully but couldn't be delivered

---

### 7. Network/Timeout Error

**Triggers:**
- "timeout" in error message
- "network" in error message
- "connection" in error message

**Troubleshooting Tips:**
- The request timed out or couldn't connect to the server
- This is usually temporary due to network issues
- The report will automatically retry on the next scheduled run
- Try reducing your date range if you're querying large amounts of data
- Check your internet connection if running manually

---

## Implementation Details

### Error Categorization Utility

**File:** `app/utils/errorCategorization.ts`

**Function:**
```typescript
export function categorizeError(
  errorMessage: string,
  errorDetails?: string
): ErrorAnalysis {
  // Analyzes error message and details
  // Returns category and troubleshooting tips
}
```

**Returns:**
```typescript
interface ErrorAnalysis {
  category: string;
  troubleshootingTips: string[];
}
```

---

### Email Service Integration

**File:** `app/services/emailService.server.ts`

**Function:**
```typescript
export async function sendErrorNotification(
  options: SendErrorNotificationOptions
): Promise<SendEmailResult>
```

**Options:**
```typescript
interface SendErrorNotificationOptions {
  recipients: Array<{ email: string; name?: string | null }>;
  reportName: string;
  reportType: string;
  errorMessage: string;
  errorCategory: string;
  troubleshootingTips: string[];
  executionId: string;
  shopName?: string;
}
```

---

### Report Execution Integration

**File:** `app/services/reportExecutionService.server.ts`

**Integration Point:**
```typescript
try {
  // Execute report...
} catch (error) {
  // Update history with failure
  
  // Send error notification
  if (reportSchedule && reportSchedule.recipients.length > 0) {
    const errorAnalysis = categorizeError(errorMessage, errorDetails);
    
    await sendErrorNotification({
      recipients: reportSchedule.recipients,
      reportName: reportSchedule.name,
      reportType: reportSchedule.reportType,
      errorMessage,
      errorCategory: errorAnalysis.category,
      troubleshootingTips: errorAnalysis.troubleshootingTips,
      executionId: historyId || "unknown",
      shopName: shop,
    });
  }
}
```

---

## Email Templates

### HTML Template

**Features:**
- Professional design
- Color-coded sections
- Responsive layout
- Clear call-to-action button
- Troubleshooting section with bullet points
- Footer with branding

**Styling:**
- Red header for error indication
- Yellow background for troubleshooting tips
- Blue button for dashboard link
- Clean typography
- Mobile-friendly

---

### Plain Text Template

**Features:**
- ASCII art separators
- Clear section headers
- Numbered troubleshooting tips
- Dashboard link
- Footer with branding

**Format:**
```
⚠️ REPORT EXECUTION FAILED

Hello,

We're writing to inform you that your scheduled report...

ERROR DETAILS
─────────────────────────────────────────
Report Name: ...
Report Type: ...
Error Category: ...
Error Message: ...

TROUBLESHOOTING TIPS
─────────────────────────────────────────
1. Tip one
2. Tip two
3. Tip three

WHAT HAPPENS NEXT?
─────────────────────────────────────────
• The report will automatically retry...
• You can manually run the report...
• Check the report history...
```

---

## User Experience

### Benefits

1. **Immediate Awareness**
   - Users know immediately when reports fail
   - No need to check dashboard constantly
   - Proactive problem notification

2. **Actionable Information**
   - Clear error categorization
   - Specific troubleshooting steps
   - Links to relevant resources

3. **Reduced Support Load**
   - Self-service troubleshooting
   - Common issues explained
   - Clear next steps provided

4. **Transparency**
   - Full error details provided
   - Execution ID for tracking
   - Automatic retry information

---

### Best Practices

**For Users:**
1. Read the troubleshooting tips carefully
2. Check the report history for patterns
3. Try the suggested fixes before contacting support
4. Keep execution IDs for support requests

**For Developers:**
1. Categorize errors accurately
2. Provide actionable troubleshooting tips
3. Include all relevant error details
4. Test email templates thoroughly
5. Handle notification failures gracefully

---

## Error Handling

### Notification Failures

**Behavior:**
- Notification failures don't affect report execution status
- Errors are logged but don't throw
- Report history still updated correctly
- Users can still see errors in dashboard

**Logging:**
```typescript
try {
  await sendErrorNotification(...);
  console.log("Error notification sent successfully");
} catch (notificationError) {
  console.error("Failed to send error notification:", notificationError);
  // Don't fail the whole execution
}
```

---

### Missing Recipients

**Behavior:**
- Check if recipients exist before sending
- Skip notification if no recipients configured
- Log skip reason

**Code:**
```typescript
if (reportSchedule && reportSchedule.recipients.length > 0) {
  // Send notification
} else {
  console.log("Skipping error notification - no recipients configured");
}
```

---

## Testing

### Manual Testing

**Test Error Notification:**
1. Create a report with invalid configuration
2. Run the report manually
3. Verify error notification email received
4. Check email content and formatting
5. Verify troubleshooting tips are relevant

**Test Different Error Types:**
1. Trigger Shopify API error
2. Trigger data processing error
3. Trigger file generation error
4. Trigger email delivery error
5. Verify correct categorization for each

---

### Automated Testing

**Unit Tests:**
```typescript
describe("categorizeError", () => {
  it("should categorize rate limit errors", () => {
    const result = categorizeError("Rate limit exceeded");
    expect(result.category).toBe("Shopify API Rate Limit");
    expect(result.troubleshootingTips.length).toBeGreaterThan(0);
  });
  
  it("should categorize authentication errors", () => {
    const result = categorizeError("Authentication failed");
    expect(result.category).toBe("Shopify Authentication Error");
  });
});
```

---

## Future Enhancements

### 1. Error Severity Levels

**Current:** All errors treated equally

**Enhancement:**
- Critical, Warning, Info levels
- Different notification styles
- Escalation for repeated failures

### 2. Error Aggregation

**Current:** One email per failure

**Enhancement:**
- Batch multiple failures
- Daily/weekly error summaries
- Reduce email fatigue

### 3. Notification Preferences

**Current:** All recipients get all notifications

**Enhancement:**
- User preferences for notifications
- Opt-in/opt-out options
- Notification frequency settings

### 4. Slack/Teams Integration

**Current:** Email only

**Enhancement:**
- Slack notifications
- Microsoft Teams notifications
- Webhook support

### 5. Error Analytics

**Current:** No analytics

**Enhancement:**
- Error rate tracking
- Common error patterns
- Trend analysis
- Dashboard widgets

---

## Related Documentation

- Email Service: `docs/EMAIL_SERVICE.md`
- Report Execution Service: `docs/REPORT_EXECUTION_SERVICE.md`
- Report History View: `docs/REPORT_HISTORY_VIEW.md`

