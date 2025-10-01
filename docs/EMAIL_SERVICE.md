# Email Service Documentation

## Overview

The Email Service handles sending report emails with CSV attachments using nodemailer. It supports HTML and plain text email templates, SMTP configuration, and error handling.

## File Location

`app/services/emailService.server.ts`

---

## Main Function

### `sendReportEmail(options: SendReportEmailOptions): Promise<SendEmailResult>`

Sends report emails to multiple recipients with CSV attachment.

**Parameters:**
```typescript
interface SendReportEmailOptions {
  recipients: Array<{ email: string; name?: string | null }>;
  reportName: string;
  reportType: string;
  filePath: string;
  recordCount: number;
  dateRange?: string;
  shopName?: string;
}
```

**Returns:**
```typescript
interface SendEmailResult {
  success: boolean;
  emailsSent: number;
  emailsFailed: number;
  errors?: string[];
}
```

**Example Usage:**
```typescript
import { sendReportEmail } from "~/services/emailService.server";

const result = await sendReportEmail({
  recipients: [
    { email: "john@example.com", name: "John Smith" },
    { email: "sarah@example.com", name: "Sarah Johnson" },
  ],
  reportName: "Weekly Sales Report",
  reportType: "SALES",
  filePath: "/reports/weekly_sales_report_20250115-143022.csv",
  recordCount: 150,
  dateRange: "Jan 8, 2025 - Jan 15, 2025",
  shopName: "My Store",
});

if (result.success) {
  console.log(`Sent to ${result.emailsSent} recipients`);
  if (result.emailsFailed > 0) {
    console.log(`Failed: ${result.emailsFailed}`);
    console.log(`Errors: ${result.errors?.join(", ")}`);
  }
}
```

---

## SMTP Configuration

### Environment Variables

**Required:**
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (usually 587 or 465)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASSWORD` - SMTP password or API key

**Optional:**
- `SMTP_SECURE` - Use SSL/TLS (true for port 465, false for 587)
- `SMTP_FROM` - From email address (defaults to SMTP_USER)
- `SMTP_FROM_NAME` - From name (defaults to "Report Flow")

### Configuration Object

```typescript
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
};
```

---

## Email Providers

### Gmail

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Setup:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password as `SMTP_PASSWORD`

**Limitations:**
- 500 emails per day for free accounts
- 2000 emails per day for Google Workspace accounts

---

### SendGrid

**Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Setup:**
1. Sign up at https://sendgrid.com
2. Create an API key in Settings > API Keys
3. Use "apikey" as username and your API key as password

**Limitations:**
- 100 emails per day on free plan
- Paid plans start at $19.95/month for 50,000 emails

---

### AWS SES

**Configuration:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-access-key-id
SMTP_PASSWORD=your-aws-secret-access-key
```

**Setup:**
1. Create SMTP credentials in AWS SES console
2. Verify your sender email address or domain
3. Request production access (starts in sandbox mode)

**Limitations:**
- 200 emails per day in sandbox mode
- 62,000 emails per month free tier (production)
- $0.10 per 1,000 emails after free tier

---

## Email Templates

### HTML Template

**Features:**
- Professional design with Shopify-inspired colors
- Responsive layout (mobile-friendly)
- Report summary table
- Attachment notice
- Branding header and footer

**Preview:**
```
┌─────────────────────────────────────┐
│       📊 Report Flow                │
│   Weekly Sales Report               │
│   Automated Report Delivery         │
├─────────────────────────────────────┤
│                                     │
│ Hi John,                            │
│                                     │
│ Your scheduled report is ready!     │
│                                     │
│ ┌─ Report Summary ────────────┐    │
│ │ Report Name: Weekly Sales   │    │
│ │ Report Type: SALES          │    │
│ │ Date Range: Jan 8-15, 2025  │    │
│ │ Records: 150                │    │
│ │ File Size: 12.5 KB          │    │
│ │ Generated: Jan 15, 10:30 AM │    │
│ └─────────────────────────────┘    │
│                                     │
│ 📎 Attachment: CSV file attached    │
│                                     │
│ Best regards,                       │
│ The Report Flow Team                │
│                                     │
├─────────────────────────────────────┤
│ © 2025 Report Flow                  │
└─────────────────────────────────────┘
```

**Styling:**
- Font: System fonts (Apple, Segoe UI, Roboto)
- Primary color: #5c6ac4 (Shopify purple)
- Background: #f5f5f5
- Container: White with shadow
- Responsive: Max-width 600px

---

### Plain Text Template

**Features:**
- Clean, readable format
- All information from HTML version
- Works in any email client
- Fallback for HTML-disabled clients

**Example:**
```
Hi John,

Your scheduled report is ready!

REPORT SUMMARY
==============

Report Name: Weekly Sales Report
Report Type: SALES
Date Range: Jan 8, 2025 - Jan 15, 2025
Store: My Store
Records: 150
File Size: 12.5 KB
Generated: Jan 15, 2025, 10:30:00 AM

ATTACHMENT
==========

The report is attached to this email as a CSV file.

Best regards,
The Report Flow Team

---
© 2025 Report Flow. All rights reserved.
```

---

## Attachment Handling

### File Verification

Before sending, the service verifies the file exists:

```typescript
if (!fs.existsSync(filePath)) {
  return {
    success: false,
    emailsSent: 0,
    emailsFailed: recipients.length,
    errors: [`Report file not found: ${filePath}`],
  };
}
```

### File Information

The service reads file metadata:

```typescript
const fileName = path.basename(filePath);
const fileStats = fs.statSync(filePath);
const fileSizeKB = (fileStats.size / 1024).toFixed(2);
```

### Attachment Configuration

```typescript
attachments: [
  {
    filename: fileName,
    path: filePath,
  },
]
```

**Supported Formats:**
- CSV (primary)
- Any file type supported by nodemailer

**Size Limits:**
- Most SMTP providers: 25 MB
- Gmail: 25 MB
- SendGrid: 30 MB
- AWS SES: 10 MB

---

## Error Handling

### Per-Recipient Error Handling

The service sends emails individually and tracks success/failure:

```typescript
for (const recipient of recipients) {
  try {
    await transporter.sendMail({ ... });
    emailsSent++;
  } catch (error) {
    emailsFailed++;
    errors.push(`Failed to send to ${recipient.email}: ${error.message}`);
  }
}
```

**Benefits:**
- One failed email doesn't stop others
- Detailed error tracking per recipient
- Partial success is possible

### Error Types

1. **File Not Found**
   - Report file doesn't exist
   - Returns immediately with error

2. **SMTP Connection Errors**
   - Cannot connect to SMTP server
   - Invalid credentials
   - Network issues

3. **Invalid Recipient**
   - Invalid email address
   - Recipient rejected by server

4. **Attachment Errors**
   - File too large
   - Cannot read file

5. **Rate Limiting**
   - Too many emails sent
   - Provider limits exceeded

### Error Response

```typescript
{
  success: false,
  emailsSent: 2,
  emailsFailed: 1,
  errors: [
    "Failed to send email to invalid@example: Invalid recipient"
  ]
}
```

---

## Testing

### Test Email Configuration

```typescript
import { testEmailConfiguration } from "~/services/emailService.server";

const result = await testEmailConfiguration();

if (result.success) {
  console.log("SMTP configuration is valid");
} else {
  console.error(`SMTP error: ${result.error}`);
}
```

**What it tests:**
- SMTP connection
- Authentication
- Server availability

**What it doesn't test:**
- Actual email delivery
- Attachment handling
- Template rendering

### Manual Testing

**Test Script:**
```typescript
import { sendReportEmail } from "~/services/emailService.server";

const result = await sendReportEmail({
  recipients: [{ email: "your-email@example.com", name: "Test User" }],
  reportName: "Test Report",
  reportType: "SALES",
  filePath: "/path/to/test.csv",
  recordCount: 10,
  dateRange: "Test Range",
  shopName: "Test Shop",
});

console.log(result);
```

---

## Performance Considerations

### Sequential Sending

**Current Implementation:**
- Sends emails one at a time
- Waits for each to complete before next

**Pros:**
- Simple error handling
- Respects rate limits
- Easy to debug

**Cons:**
- Slower for many recipients
- Blocks execution

### Optimization Options

**1. Parallel Sending:**
```typescript
await Promise.all(
  recipients.map(recipient => sendToRecipient(recipient))
);
```

**2. Batch Sending:**
```typescript
const batches = chunk(recipients, 10);
for (const batch of batches) {
  await Promise.all(batch.map(r => sendToRecipient(r)));
  await sleep(1000); // Rate limiting
}
```

**3. Queue-Based:**
- Use job queue (Bull, BullMQ)
- Process emails in background
- Better for large recipient lists

---

## Security Considerations

### Credential Storage

**✅ Do:**
- Store SMTP credentials in environment variables
- Use app-specific passwords (Gmail)
- Use API keys instead of passwords when possible
- Rotate credentials regularly

**❌ Don't:**
- Hardcode credentials in code
- Commit credentials to version control
- Share credentials in plain text
- Use personal email passwords

### Email Content

**✅ Do:**
- Sanitize recipient names
- Validate email addresses
- Use secure SMTP connections (TLS)
- Include unsubscribe option (future)

**❌ Don't:**
- Include sensitive data in email body
- Send passwords or API keys
- Include clickable links without HTTPS
- Send to unverified addresses

---

## Future Enhancements

### 1. Email Retry Logic

**Current:** No automatic retries

**Enhancement:**
- Retry failed emails with exponential backoff
- Maximum 3 retry attempts
- Track retry count in database

### 2. Email Queue

**Current:** Synchronous sending

**Enhancement:**
- Queue emails for background processing
- Better for large recipient lists
- Prevents timeout issues

### 3. Email Templates

**Current:** Hardcoded templates

**Enhancement:**
- Customizable templates
- Template variables
- Multiple template options
- Admin UI for template editing

### 4. Email Tracking

**Current:** Basic success/failure tracking

**Enhancement:**
- Track email opens
- Track link clicks
- Delivery confirmation
- Bounce handling

### 5. Unsubscribe Functionality

**Current:** No unsubscribe option

**Enhancement:**
- Unsubscribe link in emails
- Preference management
- Compliance with email regulations

---

## Related Documentation

- Report Data Processor: `docs/REPORT_DATA_PROCESSOR.md`
- Shopify Data Fetcher: `docs/SHOPIFY_DATA_FETCHER.md`
- Environment Variables: `.env.example`

