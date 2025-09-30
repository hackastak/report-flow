# Report Flow - Functional Specification Document (FSD)

## Document Information

**Product Name:** Report Flow  
**Version:** 1.0  
**Last Updated:** 2025-09-30  
**Status:** In Development  
**Document Owner:** Development Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [API Specifications](#api-specifications)
5. [Component Specifications](#component-specifications)
6. [Business Logic](#business-logic)
7. [Integration Points](#integration-points)
8. [Error Handling](#error-handling)
9. [Security](#security)
10. [Performance](#performance)

---

## System Overview

### Purpose

Report Flow is a Shopify embedded app that automates the generation and delivery of analytics reports. The system fetches data from Shopify's Admin GraphQL API, processes it according to user-configured filters, generates CSV files, and emails them to specified recipients on a scheduled basis.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (React Router + Shopify Polaris Web Components)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     API Layer (React Router)                 │
│  - Report CRUD endpoints                                     │
│  - Manual execution endpoints                                │
│  - History endpoints                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Business Logic Layer                       │
│  - Report Execution Service                                  │
│  - Data Fetcher Service                                      │
│  - Data Processor Service                                    │
│  - Email Service                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Background Scheduler                        │
│  (node-cron - checks every minute for due reports)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Data Layer (Prisma)                       │
│  - ReportSchedule, ReportFilter, ReportRecipient            │
│  - ReportHistory                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Database (SQLite/PostgreSQL)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  - Shopify Admin GraphQL API                                │
│  - SMTP Server (Email Delivery)                             │
│  - File Storage (Temporary CSV files)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Technology Stack

**Frontend:**
- React Router v7
- Shopify Polaris Web Components
- TypeScript
- Vite (build tool)

**Backend:**
- React Router (server-side)
- Node.js
- Prisma ORM
- SQLite (development)
- PostgreSQL (production)

**External Libraries:**
- `node-cron` - Background job scheduling
- `nodemailer` - Email sending
- `csv-writer` - CSV file generation
- `date-fns` - Date/time manipulation
- `@shopify/shopify-app-react-router` - Shopify app integration

### Deployment Architecture

**Development:**
- Local SQLite database
- Local SMTP server (or test service like Mailtrap)
- Shopify CLI for development server

**Production:**
- PostgreSQL database (Supabase/Railway/Neon)
- Production SMTP service (SendGrid/AWS SES)
- Deployed on Shopify-compatible hosting (Fly.io/Railway/Heroku)

---

## Data Models

### Database Schema

#### ReportSchedule

Primary table storing scheduled report configurations.

```prisma
model ReportSchedule {
  id          String   @id @default(uuid())
  shop        String
  name        String
  description String?
  reportType  String   // SALES, ORDERS, PRODUCTS, etc.
  frequency   String   // DAILY, WEEKLY, MONTHLY, CUSTOM
  timeOfDay   String   // HH:MM format
  dayOfWeek   Int?     // 0-6 (Sunday-Saturday)
  dayOfMonth  Int?     // 1-31 or -1 (last day)
  timezone    String   @default("UTC")
  isActive    Boolean  @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  filters     ReportFilter[]
  recipients  ReportRecipient[]
  history     ReportHistory[]
  
  @@index([shop])
  @@index([isActive, nextRunAt])
}
```

#### ReportFilter

Stores filter configurations for each report.

```prisma
model ReportFilter {
  id               String   @id @default(uuid())
  reportScheduleId String
  reportSchedule   ReportSchedule @relation(fields: [reportScheduleId], references: [id], onDelete: Cascade)
  filterKey        String
  filterValue      String   // JSON string
  createdAt        DateTime @default(now())
  
  @@index([reportScheduleId])
}
```

#### ReportRecipient

Stores email recipients for each report.

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

#### ReportHistory

Tracks execution history for each report.

```prisma
model ReportHistory {
  id               String   @id @default(uuid())
  reportScheduleId String
  reportSchedule   ReportSchedule @relation(fields: [reportScheduleId], references: [id], onDelete: Cascade)
  status           String   // SUCCESS, FAILED, RUNNING
  startedAt        DateTime @default(now())
  completedAt      DateTime?
  recordCount      Int?
  fileSize         Int?
  filePath         String?
  errorMessage     String?
  errorDetails     String?
  emailsSent       Int      @default(0)
  emailsFailed     Int      @default(0)
  
  @@index([reportScheduleId])
  @@index([status])
  @@index([startedAt])
}
```

---

## API Specifications

### Report CRUD Endpoints

#### POST /api/reports

Create a new scheduled report.

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  reportType: ReportType;
  filters: Record<string, any>;
  schedule: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    timeOfDay: string; // HH:MM
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31 or -1
    timezone: string;
  };
  recipients: Array<{
    email: string;
    name?: string;
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  reportId: string;
  nextRunAt: string; // ISO date
}
```

**Validation:**
- name: required, 1-100 characters
- reportType: must be valid type
- filters: must match report type schema
- schedule.frequency: required
- schedule.timeOfDay: required, HH:MM format
- schedule.timezone: required, valid IANA timezone
- recipients: at least one valid email

---

#### GET /api/reports

List all scheduled reports for the current shop.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by active/inactive

**Response:**
```typescript
{
  reports: Array<{
    id: string;
    name: string;
    reportType: string;
    frequency: string;
    isActive: boolean;
    recipientCount: number;
    lastRunAt: string | null;
    nextRunAt: string | null;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

#### GET /api/reports/:id

Get details of a specific report.

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string | null;
  reportType: string;
  frequency: string;
  timeOfDay: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  timezone: string;
  isActive: boolean;
  filters: Array<{
    key: string;
    value: any;
  }>;
  recipients: Array<{
    email: string;
    name: string | null;
  }>;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

#### PUT /api/reports/:id

Update an existing report.

**Request Body:** Same as POST /api/reports

**Response:**
```typescript
{
  success: boolean;
  reportId: string;
  nextRunAt: string;
}
```

---

#### DELETE /api/reports/:id

Delete a scheduled report.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

#### POST /api/reports/:id/run

Manually trigger report execution.

**Response:**
```typescript
{
  success: boolean;
  executionId: string;
  message: string;
}
```

---

#### GET /api/reports/:id/history

Get execution history for a report.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```typescript
{
  history: Array<{
    id: string;
    status: "SUCCESS" | "FAILED" | "RUNNING";
    startedAt: string;
    completedAt: string | null;
    recordCount: number | null;
    fileSize: number | null;
    filePath: string | null;
    errorMessage: string | null;
    emailsSent: number;
    emailsFailed: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

---

## Component Specifications

### Frontend Components

#### FilterField
**Location:** `app/components/FilterField.tsx`

**Purpose:** Renders individual filter inputs based on type

**Props:**
```typescript
interface FilterFieldProps {
  filter: FilterOption;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
}
```

**Supported Types:**
- select (dropdown)
- multiselect (checkbox list)
- text (text input)
- date (date picker)

---

#### FilterConfigurationForm
**Location:** `app/components/FilterConfigurationForm.tsx`

**Purpose:** Orchestrates multiple filters for a report

**Props:**
```typescript
interface FilterConfigurationFormProps {
  reportConfig: ReportTypeConfig;
  initialValues?: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}
```

**Features:**
- Groups required vs optional filters
- Shows active filters summary
- Real-time validation
- Default value handling

---

#### ScheduleConfigurationForm
**Location:** `app/components/ScheduleConfigurationForm.tsx`

**Purpose:** Configure report schedule

**Props:**
```typescript
interface ScheduleConfigurationFormProps {
  initialValues?: Partial<ScheduleConfig>;
  onChange: (config: ScheduleConfig) => void;
}
```

**Features:**
- Frequency selection
- Time picker (30-min intervals)
- Conditional day fields
- Timezone selector
- Next run preview

---

### Backend Services

#### ReportExecutionService
**Location:** `app/services/reportExecution.ts` (to be created)

**Purpose:** Orchestrates report generation and delivery

**Methods:**
```typescript
class ReportExecutionService {
  async executeReport(reportId: string): Promise<ExecutionResult>;
  async executeReportManually(reportId: string): Promise<ExecutionResult>;
}
```

**Execution Flow:**
1. Fetch report configuration
2. Validate configuration
3. Fetch data from Shopify
4. Process and filter data
5. Generate CSV file
6. Send emails to recipients
7. Record execution history
8. Update next run time
9. Clean up temporary files

---

#### DataFetcherService
**Location:** `app/services/dataFetcher.ts` (to be created)

**Purpose:** Fetch data from Shopify GraphQL API

**Methods:**
```typescript
class DataFetcherService {
  async fetchSalesData(filters: any): Promise<any[]>;
  async fetchOrdersData(filters: any): Promise<any[]>;
  async fetchProductsData(filters: any): Promise<any[]>;
  async fetchCustomersData(filters: any): Promise<any[]>;
  async fetchInventoryData(filters: any): Promise<any[]>;
  async fetchTrafficData(filters: any): Promise<any[]>;
  async fetchDiscountsData(filters: any): Promise<any[]>;
}
```

---

#### DataProcessorService
**Location:** `app/services/dataProcessor.ts` (to be created)

**Purpose:** Process and format data for export

**Methods:**
```typescript
class DataProcessorService {
  async processData(
    data: any[],
    reportType: ReportType,
    filters: any
  ): Promise<ProcessedData>;
  
  async generateCSV(
    data: ProcessedData,
    reportConfig: ReportTypeConfig
  ): Promise<string>; // Returns file path
}
```

---

#### EmailService
**Location:** `app/services/email.ts` (to be created)

**Purpose:** Send emails with report attachments

**Methods:**
```typescript
class EmailService {
  async sendReport(
    recipients: Recipient[],
    reportName: string,
    filePath: string,
    metadata: ReportMetadata
  ): Promise<EmailResult>;
}
```

**Email Template:**
- Subject: "[Report Flow] {Report Name} - {Date}"
- Body: HTML template with report summary
- Attachment: CSV file
- Plain text fallback

---

#### SchedulerService
**Location:** `app/services/scheduler.ts` (to be created)

**Purpose:** Background job scheduler using node-cron

**Methods:**
```typescript
class SchedulerService {
  start(): void; // Start the scheduler
  stop(): void; // Stop the scheduler
  async checkDueReports(): Promise<void>; // Check for reports to run
}
```

**Cron Schedule:** `* * * * *` (every minute)

**Logic:**
1. Query reports where `isActive = true` AND `nextRunAt <= now`
2. For each due report, execute via ReportExecutionService
3. Update `lastRunAt` and calculate new `nextRunAt`
4. Handle errors and log failures

---

## Business Logic

### Next Run Time Calculation

**Algorithm:**

```typescript
function calculateNextRunTime(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number,
  dayOfMonth?: number,
  timezone: string = "UTC"
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (frequency) {
    case "DAILY":
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case "WEEKLY":
      const currentDay = nextRun.getDay();
      let daysUntilTarget = dayOfWeek! - currentDay;
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
        daysUntilTarget += 7;
      }
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      break;
      
    case "MONTHLY":
      if (dayOfMonth === -1) {
        // Last day of month
        nextRun.setMonth(nextRun.getMonth() + 1, 0);
      } else {
        nextRun.setDate(dayOfMonth!);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
      }
      break;
  }
  
  return nextRun;
}
```

---

### Filter Application

**Process:**

1. Parse filter values from database (JSON strings)
2. Apply date range filter to GraphQL query
3. Apply additional filters based on report type
4. Handle special cases (e.g., "ALL" means no filter)
5. Validate filter combinations

**Example:**

```typescript
// Date range filter
if (filters.dateRange) {
  const { startDate, endDate } = calculateDateRange(filters.dateRange);
  query.variables.startDate = startDate;
  query.variables.endDate = endDate;
}

// Sales channel filter
if (filters.salesChannel && filters.salesChannel.length > 0) {
  query.variables.salesChannels = filters.salesChannel;
}
```

---

## Integration Points

### Shopify Admin GraphQL API

**Authentication:** OAuth with session tokens

**Rate Limits:**
- 2 requests per second (bucket-based)
- 1000 points per 60 seconds

**Handling:**
- Implement exponential backoff
- Queue requests during high traffic
- Monitor rate limit headers

**Example Query (Sales Data):**

```graphql
query GetSalesData($startDate: DateTime!, $endDate: DateTime!) {
  orders(first: 250, query: "created_at:>=$startDate AND created_at:<=$endDate") {
    edges {
      node {
        id
        name
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          edges {
            node {
              title
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

### SMTP Email Service

**Configuration:**

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

**Recommended Services:**
- SendGrid (99% deliverability)
- AWS SES (cost-effective)
- Mailgun (developer-friendly)
- Postmark (transactional focus)

---

## Error Handling

### Error Categories

1. **Validation Errors** (400)
   - Invalid input data
   - Missing required fields
   - Invalid filter combinations

2. **Authentication Errors** (401)
   - Invalid session
   - Expired token
   - Missing authentication

3. **Authorization Errors** (403)
   - Insufficient permissions
   - Invalid shop access

4. **Not Found Errors** (404)
   - Report not found
   - Resource doesn't exist

5. **Shopify API Errors** (502/503)
   - Rate limit exceeded
   - API unavailable
   - Invalid GraphQL query

6. **Email Errors**
   - SMTP connection failed
   - Invalid recipient
   - Attachment too large

7. **Processing Errors**
   - Data transformation failed
   - CSV generation failed
   - File system errors

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Retry Logic

**Shopify API:**
- Retry up to 3 times
- Exponential backoff: 1s, 2s, 4s
- Log all retry attempts

**Email Sending:**
- Retry up to 2 times
- 5-second delay between retries
- Record failed recipients

---

## Security

### Authentication
- Shopify OAuth 2.0
- Session tokens stored in database
- Token refresh handling

### Authorization
- Shop-based data isolation
- All queries filtered by `shop` field
- No cross-shop data access

### Data Protection
- No sensitive data in logs
- Temporary files deleted after email
- Email addresses encrypted at rest (future)

### Input Validation
- All user inputs sanitized
- Email validation with regex
- SQL injection prevention (Prisma)
- XSS prevention (React)

---

## Performance

### Optimization Strategies

1. **Database Indexes**
   - Index on `shop`, `isActive`, `nextRunAt`
   - Composite indexes for common queries

2. **GraphQL Query Optimization**
   - Request only needed fields
   - Use pagination for large datasets
   - Batch requests when possible

3. **Caching**
   - Cache report configurations
   - Cache Shopify data for preview (5 min TTL)

4. **Background Processing**
   - Async report execution
   - Queue system for concurrent reports
   - Prevent duplicate executions

5. **File Handling**
   - Stream large CSV files
   - Compress attachments > 1MB
   - Clean up files after 24 hours

### Performance Targets

- Report execution: < 30s for 10K records
- API response time: < 200ms
- Email delivery: < 5 min after schedule
- UI page load: < 1s
- Database queries: < 100ms

---

## Appendix

### Related Documents

- Product Requirements: `docs/PRD.md`
- Project Roadmap: `docs/PROJECT_ROADMAP.md`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- Report Types: `docs/REPORT_TYPES.md`

### Version History

- v1.0 (2025-09-30): Initial FSD

