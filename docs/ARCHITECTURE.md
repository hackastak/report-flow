# Report Flow - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [Service Layer](#service-layer)
7. [Key Features Implementation](#key-features-implementation)
8. [Design Patterns](#design-patterns)
9. [Performance Considerations](#performance-considerations)
10. [Security Architecture](#security-architecture)

---

## System Overview

Report Flow is a Shopify embedded app that automates analytics report generation and delivery. The application follows a service-oriented architecture with clear separation of concerns between UI, business logic, and data layers.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│         (React Router + Shopify Polaris Components)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      API Layer                               │
│              (React Router Server Actions)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Report Execution Service (Orchestrator)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Data Fetcher │  │ Data Processor│  │ Email Service│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Background Scheduler                          │
│              (node-cron - 5 min intervals)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Data Layer (Prisma ORM)                    │
│  ReportSchedule | ReportFilter | ReportRecipient            │
│  ReportHistory  | UserPreferences | Session                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Database (PostgreSQL/SQLite)                    │
└─────────────────────────────────────────────────────────────┘

External Integrations:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ Shopify Admin    │  │  SMTP Server     │  │ File Storage │
│  GraphQL API     │  │  (Email)         │  │  (CSV Files) │
└──────────────────┘  └──────────────────┘  └──────────────┘
```

---

## Architecture Decisions

### 1. Service-Oriented Architecture

**Decision:** Separate business logic into distinct service modules.

**Rationale:**
- **Maintainability:** Each service has a single responsibility
- **Testability:** Services can be tested in isolation
- **Reusability:** Services can be called from multiple routes
- **Scalability:** Services can be extracted to microservices if needed

**Services:**
- `reportExecutionService` - Orchestrates the complete report flow
- `shopifyDataFetcher` - Fetches data from Shopify API
- `reportDataProcessor` - Processes and formats data, generates CSV
- `emailService` - Handles email delivery with SMTP
- `backgroundScheduler` - Manages automated report execution

### 2. React Router v7 (Full-Stack Framework)

**Decision:** Use React Router v7 instead of traditional Express.js backend.

**Rationale:**
- **Unified Codebase:** Single framework for frontend and backend
- **Type Safety:** Shared TypeScript types between client and server
- **Modern DX:** Built-in support for loaders, actions, and server functions
- **Shopify Integration:** Official Shopify app template uses React Router
- **Performance:** Optimized for server-side rendering and streaming

### 3. Prisma ORM

**Decision:** Use Prisma for database access instead of raw SQL.

**Rationale:**
- **Type Safety:** Auto-generated TypeScript types from schema
- **Migration Management:** Built-in migration system
- **Developer Experience:** Intuitive query API
- **Database Agnostic:** Easy to switch between SQLite (dev) and PostgreSQL (prod)
- **Relationship Management:** Handles complex relationships automatically

### 4. Background Scheduler with node-cron

**Decision:** Use node-cron for scheduling instead of external job queue.

**Rationale:**
- **Simplicity:** No external dependencies (Redis, RabbitMQ)
- **Cost Effective:** No additional infrastructure needed
- **Sufficient for Use Case:** 5-minute intervals meet requirements
- **Easy Deployment:** Works on any Node.js hosting platform
- **Future Migration Path:** Can migrate to Bull/BullMQ if needed

**Trade-offs:**
- Single-instance limitation (addressed with database locking)
- No built-in retry mechanism (implemented custom retry logic)
- No job queue visualization (added custom history tracking)

### 5. SMTP for Email Delivery

**Decision:** Use nodemailer with SMTP instead of third-party email services.

**Rationale:**
- **Flexibility:** Works with any SMTP provider (Gmail, SendGrid, AWS SES)
- **Cost Control:** No per-email charges
- **Privacy:** Email credentials stay with merchant
- **Reliability:** Direct SMTP connection
- **Attachments:** Native support for CSV attachments

### 6. CSV File Generation

**Decision:** Generate CSV files on-demand and store temporarily.

**Rationale:**
- **Email Compatibility:** CSV is universally supported
- **Data Portability:** Easy to import into Excel, Google Sheets
- **File Size:** Efficient for large datasets
- **Storage:** Temporary storage reduces costs
- **Cleanup:** Automatic deletion after 30 days

---

## Technology Stack

### Frontend
- **React Router v7** - Full-stack web framework
- **Shopify Polaris Web Components** - UI component library
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and dev server

### Backend
- **Node.js 18+** - Runtime environment
- **React Router** - Server-side routing and actions
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Production database
- **SQLite** - Development database

### External Services
- **Shopify Admin GraphQL API** - Data source
- **SMTP Server** - Email delivery
- **node-cron** - Background job scheduling

### Libraries
- **nodemailer** - Email sending
- **csv-writer** - CSV file generation
- **date-fns** - Date/time manipulation
- **@shopify/shopify-api** - Shopify API client

---

## System Components

### 1. Report Execution Service
**File:** `app/services/reportExecutionService.server.ts`

**Purpose:** Orchestrates the complete report generation and delivery flow.

**Responsibilities:**
- Fetch report configuration from database
- Create execution history record
- Coordinate data fetching, processing, and email delivery
- Handle errors and send notifications
- Update next run time for scheduled reports
- Clean up temporary files

**Key Functions:**
- `executeReport()` - Main execution function
- `executeReportManually()` - Manual execution wrapper
- `executeScheduledReports()` - Batch execution for scheduler

### 2. Shopify Data Fetcher
**File:** `app/services/shopifyDataFetcher.server.ts`

**Purpose:** Fetch data from Shopify Admin GraphQL API.

**Responsibilities:**
- Build GraphQL queries based on report type
- Handle pagination (cursor-based)
- Implement rate limiting with exponential backoff
- Parse and normalize API responses
- Handle API errors gracefully

**Report Types Supported:**
- Sales Reports
- Orders Reports
- Products Reports
- Customers Reports
- Inventory Reports
- Discounts Reports
- Traffic Reports
- Finance Summary Reports
- Custom Reports

**Key Features:**
- Automatic retry with exponential backoff
- Rate limit detection and handling
- Cursor-based pagination for large datasets
- Query optimization to minimize API calls

### 3. Report Data Processor
**File:** `app/services/reportDataProcessor.server.ts`

**Purpose:** Process raw Shopify data and generate CSV files.

**Responsibilities:**
- Apply filters to raw data
- Format data fields (dates, currency, etc.)
- Generate CSV files with proper headers
- Calculate aggregations (for Finance Summary)
- Handle custom field selection

**Key Functions:**
- `processReportData()` - Main processing function
- `generateCSV()` - CSV file generation
- `formatCurrency()` - Currency formatting
- `formatDate()` - Date formatting

### 4. Email Service
**File:** `app/services/emailService.server.ts`

**Purpose:** Send report emails with CSV attachments.

**Responsibilities:**
- Create SMTP transporter
- Generate HTML and plain text email content
- Attach CSV files
- Send to multiple recipients
- Track delivery success/failure
- Send error notifications

**Email Types:**
- Report delivery emails (with CSV attachment)
- Error notification emails (with troubleshooting tips)

**Key Features:**
- HTML and plain text versions
- Professional email templates
- Error categorization and troubleshooting tips
- Delivery tracking

### 5. Background Scheduler
**File:** `app/services/backgroundScheduler.server.ts`

**Purpose:** Automatically execute scheduled reports.

**Responsibilities:**
- Run cron job every 5 minutes
- Query database for due reports
- Execute reports in sequence
- Track execution status
- Prevent duplicate executions

**Key Features:**
- Automatic startup on server launch
- Graceful shutdown handling
- Execution tracking to prevent duplicates
- Error handling and logging

---

## Data Flow

### Report Creation Flow
```
1. User selects report type
   ↓
2. User configures filters
   ↓
3. User sets schedule (daily/weekly/monthly)
   ↓
4. User adds email recipients
   ↓
5. User previews report (optional)
   ↓
6. Report saved to database
   ↓
7. Next run time calculated
```

### Report Execution Flow
```
1. Trigger (Manual or Scheduled)
   ↓
2. Create history record (RUNNING status)
   ↓
3. Fetch data from Shopify API
   ├─ Build GraphQL query
   ├─ Handle pagination
   └─ Parse response
   ↓
4. Process data
   ├─ Apply filters
   ├─ Format fields
   └─ Generate CSV file
   ↓
5. Send emails
   ├─ Create email content
   ├─ Attach CSV file
   └─ Send to each recipient
   ↓
6. Update history record (SUCCESS/FAILED)
   ↓
7. Calculate next run time
   ↓
8. Clean up CSV file
```

### Error Handling Flow
```
1. Error occurs during execution
   ↓
2. Categorize error (12 categories)
   ↓
3. Generate troubleshooting tips
   ↓
4. Update history record (FAILED status)
   ↓
5. Send error notification email
   ↓
6. Log error details
   ↓
7. Calculate next run time (continue schedule)
```

---

## Service Layer

### Service Communication Pattern

Services follow a **unidirectional dependency** pattern:

```
reportExecutionService (Orchestrator)
    ├─→ shopifyDataFetcher
    ├─→ reportDataProcessor
    └─→ emailService
```

**Rules:**
- Services never call back to the orchestrator
- Services don't call each other directly
- All coordination happens in the orchestrator
- Services return structured results (success/error)

### Error Handling Strategy

**Principle:** Fail gracefully and provide actionable feedback.

**Implementation:**
1. **Try-Catch Blocks:** Wrap all service calls
2. **Error Categorization:** 12 predefined error categories
3. **Troubleshooting Tips:** Context-specific guidance
4. **Error Notifications:** Email alerts with details
5. **Logging:** Comprehensive console logging
6. **History Tracking:** All executions recorded

**Error Categories:**
- API_ERROR - Shopify API issues
- RATE_LIMIT - API rate limiting
- AUTHENTICATION_ERROR - Auth failures
- DATA_PROCESSING_ERROR - Data formatting issues
- EMAIL_ERROR - Email delivery failures
- CONFIGURATION_ERROR - Invalid settings
- NETWORK_ERROR - Connection issues
- TIMEOUT_ERROR - Request timeouts
- VALIDATION_ERROR - Input validation failures
- DATABASE_ERROR - Database issues
- FILE_SYSTEM_ERROR - File operations
- UNKNOWN_ERROR - Unexpected errors

---

## Key Features Implementation

### 1. Finance Summary Report

**Challenge:** Shopify doesn't provide pre-aggregated financial metrics via public API.

**Solution:** Calculate metrics from individual order data.

**Implementation:**
```typescript
// Fetch orders with financial data
const orders = await fetchOrders(dateRange);

// Calculate metrics
const metrics = {
  grossSales: sum(orders.map(o => o.totalPrice + o.discounts)),
  netSales: sum(orders.map(o => o.totalPrice - o.tax - o.shipping)),
  discounts: sum(orders.map(o => o.discounts)),
  taxes: sum(orders.map(o => o.tax)),
  shipping: sum(orders.map(o => o.shipping)),
  // ... more metrics
};

// Group by date
const dailyMetrics = groupByDate(orders, metrics);
```

**Why This Approach:**
- ShopifyQL Analytics API is in closed beta
- Order-based calculation is the standard approach
- Provides same data as Shopify's native reports
- Available to all apps with `read_orders` scope

### 2. Custom Reports Feature

**Challenge:** Allow users to create reports with any fields from Shopify API.

**Solution:** Dynamic field selection with GraphQL path mapping.

**Implementation:**
- Define available fields with GraphQL paths
- User selects fields in UI
- Build dynamic GraphQL query
- Extract values using path traversal
- Generate CSV with selected columns

**Key Files:**
- `app/config/customReportFields.ts` - Field definitions
- `app/services/shopifyDataFetcher.server.ts` - Dynamic query building
- `app/services/reportDataProcessor.server.ts` - Path-based value extraction

### 3. Starter Reports

**Decision:** Provide pre-configured reports instead of just templates.

**Rationale:**
- Users want quick start, not configuration
- "Starter Reports" are full-featured, ready to use
- Users can still customize filters and fields
- Reduces onboarding friction

**Starter Reports:**
1. Finance Summary - Complete financial overview
2. Total Sales - Revenue tracking
3. US Sales Tax - Tax reporting by state
4. Taxes by County - Detailed tax breakdown

### 4. Field Customization

**Feature:** Users can add/remove fields from reports.

**Implementation:**
- Each report has default fields
- User can customize when scheduling
- User can edit field selection later
- Field order is preserved
- Custom field selection stored in database

**Benefits:**
- Flexibility without complexity
- Maintains report structure
- Easy to understand
- Supports diverse use cases

### 5. All Channels Support

**Challenge:** Initial implementation filtered by sales channel, causing empty reports.

**Solution:** Default to "All Channels" unless user specifies.

**Implementation:**
```typescript
// If no sales channel filter, fetch from all channels
if (!filters.salesChannel || filters.salesChannel.length === 0) {
  // Don't add channel filter to query
} else {
  // Add specific channel filter
  query += ` AND channel:${filters.salesChannel.join(',')}`;
}
```

**Lesson Learned:** Default to inclusive filters, not exclusive.

---

## Design Patterns

### 1. Service Layer Pattern
- Business logic separated from routes
- Services are reusable and testable
- Clear interfaces and contracts

### 2. Repository Pattern (via Prisma)
- Database access abstracted through Prisma
- Type-safe queries
- Easy to mock for testing

### 3. Factory Pattern
- Report type configuration factory
- Email template factory
- GraphQL query builder factory

### 4. Strategy Pattern
- Different data fetching strategies per report type
- Different processing strategies per data source
- Different email templates per notification type

### 5. Observer Pattern
- Background scheduler observes database for due reports
- History tracking observes execution events

---

## Performance Considerations

### 1. Database Optimization
- Indexes on frequently queried fields
- Efficient relationship loading with Prisma
- Connection pooling

### 2. API Rate Limiting
- Exponential backoff for retries
- Cursor-based pagination
- Batch requests where possible
- Rate limit detection and handling

### 3. Memory Management
- Stream large CSV files
- Clean up temporary files
- Limit result set sizes

### 4. Caching Strategy
- Report type configurations cached in memory
- Session data cached
- No caching of report data (always fresh)

---

## Security Architecture

### 1. Authentication
- Shopify OAuth 2.0
- Session-based authentication
- Secure session storage

### 2. Authorization
- Shop-based data isolation
- All queries filtered by shop
- No cross-shop data access

### 3. Input Validation
- All user inputs validated
- SQL injection prevention (Prisma)
- XSS prevention (React)
- CSRF protection

### 4. Data Protection
- Environment variables for secrets
- No sensitive data in logs
- Secure SMTP credentials
- Temporary file cleanup

### 5. API Security
- Rate limiting
- Request validation
- Error message sanitization
- Secure GraphQL queries

---

## Deployment Architecture

### Development
- SQLite database
- Local file storage
- Gmail SMTP (testing)
- Single instance

### Production
- PostgreSQL database
- Cloud file storage (optional)
- Production SMTP service
- Horizontal scaling ready (with database locking)

### Monitoring
- Console logging
- Error tracking in database
- Email delivery tracking
- Execution history

---

## Future Enhancements

### Planned Improvements
1. **Job Queue:** Migrate to Bull/BullMQ for better scalability
2. **Caching:** Add Redis for session and configuration caching
3. **File Storage:** Move to S3/GCS for CSV files
4. **Monitoring:** Add APM and error tracking service
5. **Testing:** Add comprehensive test suite
6. **API:** Expose REST API for external integrations

### Scalability Path
1. Extract services to separate processes
2. Add message queue for async processing
3. Implement horizontal scaling with load balancer
4. Add database read replicas
5. Implement caching layer

---

**Document Version:** 1.0  
**Last Updated:** October 6, 2025  
**Status:** Production Ready

