# Report Flow - Email Recipients Guide

## Overview

This document explains how the email recipients system works in Report Flow, allowing users to specify who receives scheduled reports.

## Architecture

### Components

1. **EmailRecipientsForm** (`app/components/EmailRecipientsForm.tsx`)
   - Add/remove recipient functionality
   - Email validation
   - Duplicate prevention
   - Recipient list display
   - Empty state handling

2. **Parent Integration** (`app/routes/app.reports.new.tsx`)
   - Recipients state management
   - Form validation
   - Error display
   - Sidebar recipient count

---

## Recipient Data Structure

### Recipient Interface

```typescript
interface Recipient {
  email: string;      // Required - valid email address
  name?: string;      // Optional - recipient's name
}
```

### Example Recipients

```typescript
const recipients: Recipient[] = [
  {
    email: "john@example.com",
    name: "John Smith"
  },
  {
    email: "sarah@example.com",
    name: "Sarah Johnson"
  },
  {
    email: "reports@company.com"
    // No name provided
  }
];
```

---

## Features

### 1. Add Recipients

**User Flow:**
1. User enters email address (required)
2. User optionally enters recipient name
3. User clicks "Add Recipient" or presses Enter
4. System validates email format
5. System checks for duplicates
6. Recipient is added to list

**Validation Rules:**
- Email address is required
- Email must be valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Email must not already exist in list (case-insensitive)
- Name is optional

**Error Messages:**
- "Email address is required" - Empty email field
- "Please enter a valid email address" - Invalid format
- "This email address has already been added" - Duplicate email

---

### 2. Remove Recipients

**User Flow:**
1. User clicks "Remove" button next to recipient
2. Recipient is immediately removed from list
3. Form state updates
4. Parent component is notified

**Features:**
- Individual removal (one at a time)
- Bulk removal ("Clear All" button when 2+ recipients)
- No confirmation dialog (can re-add if needed)

---

### 3. Email Validation

**Format Validation:**

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Valid Examples:**
- `john@example.com`
- `sarah.johnson@company.co.uk`
- `reports+analytics@shopify.com`
- `user123@sub.domain.com`

**Invalid Examples:**
- `notanemail` (no @ or domain)
- `@example.com` (no local part)
- `user@` (no domain)
- `user @example.com` (space in email)
- `user@domain` (no TLD)

---

### 4. Duplicate Prevention

**Logic:**

```typescript
const isDuplicateEmail = (email: string): boolean => {
  return recipients.some(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  );
};
```

**Features:**
- Case-insensitive comparison
- Prevents exact duplicates
- Shows error message if duplicate detected

**Example:**
- `john@example.com` already exists
- User tries to add `John@Example.com`
- System detects duplicate and shows error

---

### 5. Recipient List Display

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Recipients (3)                    [Clear All]   │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ john@example.com                  [Remove]  │ │
│ │ John Smith                                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ sarah@example.com                 [Remove]  │ │
│ │ Sarah Johnson                               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ reports@company.com               [Remove]  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Features:**
- Email displayed prominently (bold)
- Name displayed below email (subdued)
- Remove button for each recipient
- Recipient count in header
- Clear All button (when 2+ recipients)

---

### 6. Empty State

**Display:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                      📧                         │
│                                                 │
│              No Recipients Added                │
│                                                 │
│   Add at least one email address to receive    │
│              this report                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**When Shown:**
- No recipients have been added yet
- All recipients have been removed
- Initial state of form

---

### 7. Summary Display

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Email Summary                                   │
│                                                 │
│ This report will be sent to 3 recipients        │
└─────────────────────────────────────────────────┘
```

**Features:**
- Shows total recipient count
- Proper pluralization (1 recipient vs 2 recipients)
- Only shown when recipients exist
- Provides confirmation before saving

---

### 8. Validation Warning

**Display:**

```
┌─────────────────────────────────────────────────┐
│ ⚠️ At least 1 recipient is required             │
└─────────────────────────────────────────────────┘
```

**When Shown:**
- Recipients list is below minimum requirement
- Shown inline below recipient list
- Uses attention banner variant

---

## Form Integration

### Parent Component Usage

```typescript
import {
  EmailRecipientsForm,
  type Recipient,
  validateRecipients,
} from "../components/EmailRecipientsForm";

export default function NewReport() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRecipientsChange = (newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    // Clear error when recipients change
    if (errors.recipients) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.recipients;
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    // Validate recipients
    const recipientValidation = validateRecipients(recipients, 1);
    if (!recipientValidation.isValid) {
      setErrors({
        ...errors,
        recipients: recipientValidation.error || "Invalid recipients",
      });
      return;
    }

    // Save report with recipients
    saveReport({ recipients, ...otherData });
  };

  return (
    <EmailRecipientsForm
      onChange={handleRecipientsChange}
      minRecipients={1}
    />
  );
}
```

---

## Validation Function

### validateRecipients

**Purpose:** Validate recipient list before saving

**Signature:**

```typescript
function validateRecipients(
  recipients: Recipient[],
  minRecipients: number = 1
): { isValid: boolean; error?: string }
```

**Parameters:**
- `recipients` - Array of recipients to validate
- `minRecipients` - Minimum number required (default: 1)

**Returns:**
- `isValid` - Boolean indicating if validation passed
- `error` - Error message if validation failed

**Validation Checks:**
1. Minimum recipient count
2. Email format for each recipient

**Example Usage:**

```typescript
const validation = validateRecipients(recipients, 1);

if (!validation.isValid) {
  console.error(validation.error);
  // "At least 1 recipient is required"
  // or "Invalid email address: notanemail"
}
```

---

## User Experience

### Keyboard Shortcuts

**Enter Key:**
- In email field: Add recipient
- In name field: Add recipient

**Tab Key:**
- Navigate between email and name fields
- Navigate to "Add Recipient" button

### Form Behavior

**Real-time Feedback:**
- Email validation on blur
- Error messages clear on input change
- Recipient count updates immediately
- Summary updates automatically

**Error Handling:**
- Inline error messages
- Red border on invalid fields
- Clear error descriptions
- Errors clear when corrected

---

## Database Storage

### ReportRecipient Model

```prisma
model ReportRecipient {
  id               String   @id @default(uuid())
  reportScheduleId String
  reportSchedule   ReportSchedule @relation(fields: [reportScheduleId], references: [id], onDelete: Cascade)
  email            String
  name             String?
  createdAt        DateTime @default(now())
  
  @@index([reportScheduleId])
}
```

**Fields:**
- `id` - Unique identifier (UUID)
- `reportScheduleId` - Foreign key to ReportSchedule
- `email` - Recipient email address
- `name` - Optional recipient name
- `createdAt` - Timestamp of creation

**Relationships:**
- Belongs to ReportSchedule
- Cascade delete when report is deleted

---

## API Integration

### Save Recipients

**Endpoint:** POST /api/reports

**Request Body:**

```typescript
{
  name: "Weekly Sales Report",
  reportType: "SALES",
  // ... other fields
  recipients: [
    {
      email: "john@example.com",
      name: "John Smith"
    },
    {
      email: "sarah@example.com",
      name: "Sarah Johnson"
    }
  ]
}
```

**Backend Processing:**

```typescript
// Create report schedule
const reportSchedule = await prisma.reportSchedule.create({
  data: {
    name: data.name,
    reportType: data.reportType,
    // ... other fields
    recipients: {
      create: data.recipients.map((r) => ({
        email: r.email,
        name: r.name,
      })),
    },
  },
});
```

---

## Email Delivery

### Email Format

**To Field:**
- If name provided: `"John Smith" <john@example.com>`
- If no name: `john@example.com`

**Subject:**
```
[Report Flow] Weekly Sales Report - January 15, 2025
```

**Body:**
```
Hi John,

Your scheduled report "Weekly Sales Report" is ready.

Report Details:
- Report Type: Sales Report
- Date Range: January 8 - January 14, 2025
- Records: 1,234

Please find the report attached as a CSV file.

Best regards,
Report Flow
```

**Attachment:**
- Filename: `weekly-sales-report-2025-01-15.csv`
- Content-Type: `text/csv`

---

## Best Practices

### For Users

1. **Use descriptive names** - Help identify recipients
2. **Add multiple recipients** - Ensure stakeholders get reports
3. **Use distribution lists** - For large teams
4. **Verify email addresses** - Prevent delivery failures
5. **Remove inactive recipients** - Keep list current

### For Developers

1. **Validate on client and server** - Double validation
2. **Sanitize email addresses** - Trim whitespace
3. **Log email failures** - Track delivery issues
4. **Handle bounces** - Monitor invalid addresses
5. **Respect privacy** - Don't expose recipient lists

---

## Error Scenarios

### Scenario 1: No Recipients

**Problem:** User tries to save without adding recipients

**Solution:**
- Show validation error
- Highlight recipients section
- Scroll to error
- Prevent save

---

### Scenario 2: Invalid Email

**Problem:** User enters malformed email

**Solution:**
- Show inline error message
- Prevent adding to list
- Suggest correct format
- Clear error on input change

---

### Scenario 3: Duplicate Email

**Problem:** User tries to add existing email

**Solution:**
- Show duplicate error message
- Prevent adding to list
- Highlight existing recipient
- Clear error on input change

---

### Scenario 4: Email Delivery Failure

**Problem:** Email bounces or fails to send

**Solution:**
- Log failure in ReportHistory
- Increment emailsFailed counter
- Send notification to report owner
- Provide retry option

---

## Testing Checklist

### Functional Tests

- [ ] Add recipient with email only
- [ ] Add recipient with email and name
- [ ] Remove individual recipient
- [ ] Clear all recipients
- [ ] Validate email format
- [ ] Prevent duplicate emails
- [ ] Handle Enter key in email field
- [ ] Handle Enter key in name field
- [ ] Show empty state correctly
- [ ] Show recipient count correctly
- [ ] Show summary correctly
- [ ] Validate minimum recipients
- [ ] Clear errors on input change

### Edge Cases

- [ ] Very long email addresses (100+ chars)
- [ ] Very long names (100+ chars)
- [ ] Special characters in email
- [ ] International characters in name
- [ ] 50+ recipients
- [ ] Rapid add/remove operations
- [ ] Copy/paste email addresses

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader announces errors
- [ ] Focus management correct
- [ ] Labels associated with inputs
- [ ] Error messages descriptive

---

## Future Enhancements

### Planned Features

1. **Recipient Groups** - Save and reuse recipient lists
2. **Import from CSV** - Bulk add recipients
3. **Email Templates** - Customize email content
4. **Recipient Preferences** - Allow unsubscribe
5. **Delivery Confirmation** - Track email opens
6. **CC/BCC Support** - Additional recipient types
7. **Recipient Roles** - Assign roles (owner, viewer)
8. **Email Scheduling** - Send at different times per recipient

---

## Troubleshooting

### Recipients not saving

**Check:**
- Validation passing
- API endpoint working
- Database connection
- Prisma schema correct

### Emails not sending

**Check:**
- SMTP configuration
- Recipient email valid
- Email service limits
- Spam filters

### Duplicate prevention not working

**Check:**
- Case-insensitive comparison
- Email trimming
- State updates correctly

---

## Resources

- Email Validation Regex: [RFC 5322](https://tools.ietf.org/html/rfc5322)
- Nodemailer Documentation: [nodemailer.com](https://nodemailer.com/)
- SMTP Best Practices: [SendGrid Guide](https://sendgrid.com/blog/best-practices-for-email-deliverability/)

---

## Related Documentation

- Product Requirements: `docs/PRD.md`
- Functional Specification: `docs/FSD.md`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- UI Components: `docs/UI_COMPONENTS.md`

