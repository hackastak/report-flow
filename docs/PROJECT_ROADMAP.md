# Report Flow - Project Roadmap & Task List

## Project Status

**Current Phase:** Development - Additional Features
**Progress:** 17 of 22 tasks complete (77%)
**Last Updated:** 2025-09-30

---

## Task List

### Phase 1: Foundation & Setup ✅ COMPLETE

#### ✅ Task 1: Database Schema Design
**Status:** Complete  
**Description:** Create Prisma models for ReportSchedule, ReportFilter, ReportRecipient, and ReportHistory to store scheduled reports, their configurations, recipients, and execution history

**Deliverables:**
- [x] Prisma schema with 4 models (ReportSchedule, ReportFilter, ReportRecipient, ReportHistory)
- [x] Database migration generated and applied
- [x] Cascade delete relationships configured
- [x] Indexes for performance optimization
- [x] Documentation in `docs/DATABASE_SCHEMA.md`

**Files Created:**
- `prisma/schema.prisma` (updated)
- `prisma/migrations/20250930131932_add_report_scheduling_models/migration.sql`
- `docs/DATABASE_SCHEMA.md`

---

#### ✅ Task 2: Update Shopify Scopes
**Status:** Complete  
**Description:** Update shopify.app.toml to include necessary scopes for reading analytics data (read_reports, read_analytics, read_orders, read_products)

**Deliverables:**
- [x] Updated `shopify.app.toml` with 9 read-only scopes
- [x] Scope documentation created
- [x] Security considerations documented

**Scopes Added:**
- read_orders
- read_products
- read_customers
- read_reports
- read_analytics
- read_inventory
- read_locations
- read_price_rules
- read_discounts

**Files Modified:**
- `shopify.app.toml`
- `docs/SHOPIFY_SCOPES.md` (created)

---

#### ✅ Task 3: Install Required Dependencies
**Status:** Complete  
**Description:** Install node-cron for scheduling, nodemailer for email sending, and CSV generation libraries

**Deliverables:**
- [x] Runtime dependencies installed
- [x] TypeScript type definitions installed
- [x] Zero vulnerabilities confirmed

**Dependencies Installed:**
- `node-cron` - Background job scheduling
- `nodemailer` - Email sending with attachments
- `csv-writer` - CSV file generation
- `date-fns` - Date/time manipulation
- `@types/node-cron` - TypeScript types
- `@types/nodemailer` - TypeScript types

---

#### ✅ Task 4: Create Report Types Configuration
**Status:** Complete  
**Description:** Define available report types (Sales, Orders, Products, Customers, Traffic, Inventory, Discounts) with their available filters and data fields in a configuration file

**Deliverables:**
- [x] Report types configuration with 7 report types
- [x] Filter definitions for each report type
- [x] Data field definitions
- [x] Date range helper utilities
- [x] Comprehensive documentation

**Report Types:**
- Sales Report (💰)
- Orders Report (📦)
- Products Report (🛍️)
- Customers Report (👥)
- Inventory Report (📊)
- Traffic Report (📈)
- Discounts Report (🎯)

**Files Created:**
- `app/config/reportTypes.ts` (498 lines)
- `app/utils/dateRangeHelper.ts`
- `docs/REPORT_TYPES.md`

---

### Phase 2: User Interface ✅ 4/4 COMPLETE

#### ✅ Task 5: Build Report Selection UI
**Status:** Complete  
**Description:** Create a new route /app/reports with a page that displays available report types in cards, allowing users to select and configure a new scheduled report

**Deliverables:**
- [x] Reports selection page with category organization
- [x] Interactive report cards with hover effects
- [x] Updated home page with Report Flow branding
- [x] Navigation links added
- [x] UI documentation

**Files Created:**
- `app/routes/app.reports._index.tsx`
- `app/routes/app.reports.new.tsx` (placeholder)
- `app/styles/reports.css`
- `docs/UI_COMPONENTS.md`

**Files Modified:**
- `app/routes/app.tsx` (navigation)
- `app/routes/app._index.tsx` (home page redesign)

---

#### ✅ Task 6: Build Filter Configuration UI
**Status:** Complete  
**Description:** Create a dynamic filter form component that shows relevant filters based on selected report type (date range picker, product selector, order status filters, etc.)

**Deliverables:**
- [x] FilterField component with 4 filter types
- [x] FilterConfigurationForm orchestrator
- [x] Dynamic rendering based on report type
- [x] Real-time validation
- [x] Active filters summary
- [x] Comprehensive documentation

**Filter Types Supported:**
- Select (single selection dropdown)
- Multiselect (checkbox list)
- Text (free-form input)
- Date (date picker)

**Files Created:**
- `app/components/FilterField.tsx` (270 lines)
- `app/components/FilterConfigurationForm.tsx` (210 lines)
- `docs/FILTER_CONFIGURATION.md`

**Files Modified:**
- `app/routes/app.reports.new.tsx` (integrated filter form)

---

#### ✅ Task 7: Build Schedule Configuration UI
**Status:** Complete  
**Description:** Create schedule configuration component with frequency options (daily, weekly, monthly), time selection, and timezone support

**Deliverables:**
- [x] ScheduleConfigurationForm component
- [x] Timezone helper utilities with 35+ timezones
- [x] Frequency selection (daily, weekly, monthly)
- [x] Conditional day of week/month fields
- [x] Real-time schedule preview
- [x] Next run time calculation
- [x] Comprehensive documentation

**Features:**
- 3 frequency options (Daily, Weekly, Monthly)
- 30-minute interval time selection
- 35+ timezones with auto-detection
- Last day of month support
- Ordinal day formatting (1st, 2nd, 3rd)
- Live schedule summary

**Files Created:**
- `app/utils/timezoneHelper.ts` (300 lines)
- `app/components/ScheduleConfigurationForm.tsx` (280 lines)
- `docs/SCHEDULE_CONFIGURATION.md`

**Files Modified:**
- `app/routes/app.reports.new.tsx` (integrated schedule form)

---

#### ✅ Task 8: Build Email Recipients UI
**Status:** Complete
**Description:** Create a component to add/remove email recipients with validation, supporting multiple email addresses per scheduled report

**Deliverables:**
- [x] EmailRecipientsForm component
- [x] Add/remove recipient functionality
- [x] Email validation
- [x] Recipient list display
- [x] Support for name + email format
- [x] Duplicate prevention
- [x] Documentation

**Features Implemented:**
- Add multiple email addresses
- Optional recipient names
- Email format validation (regex)
- Remove individual recipients
- Recipient count display
- Clear all functionality
- Keyboard shortcuts (Enter to add)
- Real-time error messages
- Empty state display
- Email summary
- Validation warning banner
- Export validation function

**Files Created:**
- `app/components/EmailRecipientsForm.tsx` (300 lines)
- `docs/EMAIL_RECIPIENTS.md`

**Files Modified:**
- `app/routes/app.reports.new.tsx` (integrated recipients form)

---

### Phase 3: Report Management UI ✅ 1/1 COMPLETE

#### ✅ Task 9: Create Report List View
**Status:** Complete
**Description:** Build a page showing all scheduled reports in a table with columns for report name, type, frequency, recipients, last run, next run, and actions (edit, delete, run now)

**Deliverables:**
- [x] Report list page route
- [x] Table with all columns
- [x] Status indicators
- [x] Action buttons (edit, delete, run now)
- [x] Empty state
- [x] Helper functions for formatting
- [x] Navigation integration
- [x] Documentation

**Columns Implemented:**
- Report name (with description)
- Report type (with icon)
- Frequency
- Recipients (count)
- Last run (date/time)
- Next run (date/time)
- Status (active/paused badge)
- Actions (Edit, Run Now, Delete)

**Features Implemented:**
- Table layout with 8 columns
- Empty state with call-to-action
- Action handlers (edit, delete, run now)
- Helper functions (formatDate, formatFrequency, getReportIcon, getReportName)
- Confirmation dialogs for destructive actions
- Loading states for delete action
- Navigation links in main nav and home page
- Quick actions help section

**Files Created:**
- `app/routes/app.reports.scheduled.tsx` (300 lines)
- `docs/REPORT_LIST_VIEW.md`

**Files Modified:**
- `app/routes/app.tsx` (added "Scheduled Reports" link)
- `app/routes/app._index.tsx` (added links to scheduled reports)

**Future Enhancements:**
- Sorting by columns
- Pagination for large lists
- Search functionality
- Bulk actions
- Loading state spinner

---

### Phase 4: Backend API ✅ 3/3 COMPLETE

#### ✅ Task 10: Implement Report CRUD API Routes
**Status:** Complete
**Description:** Create API routes for creating, reading, updating, and deleting scheduled reports with proper validation and error handling

**Deliverables:**
- [x] POST /api/reports - Create new report
- [x] GET /api/reports - List all reports
- [x] GET /api/reports/:id - Get single report
- [x] PUT /api/reports/:id - Update report
- [x] DELETE /api/reports/:id - Delete report
- [x] POST /api/reports/:id/run - Run report manually
- [x] Validation function
- [x] Error handling
- [x] Database integration
- [x] UI integration
- [x] Documentation

**Validation Implemented:**
- Report name required (1-100 characters)
- Report type must be valid
- Schedule frequency must be valid (DAILY, WEEKLY, MONTHLY, CUSTOM)
- Time format validation (HH:MM)
- Timezone required
- Day of week required for weekly (0-6)
- Day of month required for monthly (1-31 or -1)
- At least one recipient required
- Email format validation

**Features Implemented:**
- Full CRUD operations
- Shop-based data isolation
- Cascade delete for related records
- Next run time calculation
- Filter and recipient management
- Error responses with codes
- Success/failure messages

**Files Created:**
- `app/routes/api.reports.tsx` (240 lines)
- `app/routes/api.reports.$id.tsx` (300+ lines)
- `app/routes/api.reports.$id.run.tsx` (100 lines)
- `docs/API_ROUTES.md`

**Files Modified:**
- `app/db.server.ts` (added named export)
- `app/routes/app.reports.new.tsx` (integrated save API)
- `app/routes/app.reports.scheduled.tsx` (integrated list/delete/run APIs)

---

#### ✅ Task 11: Build Shopify Analytics Data Fetcher
**Status:** Complete
**Description:** Create service module to fetch analytics data from Shopify Admin GraphQL API using the appropriate queries for each report type

**Deliverables:**
- [x] GraphQL queries for each report type
- [x] Data fetcher service
- [x] Error handling and retries
- [x] Rate limiting handling
- [x] Pagination support
- [x] Documentation

**GraphQL Queries Implemented:**
- ✅ Sales data (orders, revenue, discounts, tax)
- ✅ Order details (status, fulfillment, customer)
- ✅ Product performance (variants, inventory)
- ✅ Customer analytics (orders, spending, lifetime value)
- ✅ Inventory levels (stock, locations, value)
- ⚠️ Traffic metrics (not available via GraphQL API)
- ✅ Discount usage (codes, status, usage count)

**Features Implemented:**
- Cursor-based pagination (250 records per page)
- Exponential backoff retry logic (3 retries max)
- Rate limit detection and handling
- Query filter building
- Error handling with detailed messages
- Maximum page limit (20 pages = 5000 records)
- Support for all 7 report types

**Files Created:**
- `app/services/shopifyDataFetcher.server.ts` (700+ lines)
- `docs/SHOPIFY_DATA_FETCHER.md` (300+ lines)

**Technical Details:**
- Uses Shopify Admin GraphQL API
- Implements `executeGraphQLWithRetry` for resilience
- Handles THROTTLED errors automatically
- Supports complex filter combinations
- Returns standardized `FetchDataResult` format

---

#### ✅ Task 12: Implement Report Data Processor
**Status:** Complete
**Description:** Create service to process raw Shopify data, apply filters, format data, and prepare it for export (CSV format)

**Deliverables:**
- [x] Data processor service
- [x] Filter application logic
- [x] Data formatting functions
- [x] CSV generation
- [x] File storage
- [x] Documentation

**Processing Functions Implemented:**
- ✅ `processSalesData()` - Daily aggregation with metrics
- ✅ `processOrdersData()` - Order details with customer info
- ✅ `processProductsData()` - Product variants with inventory
- ✅ `processCustomersData()` - Customer analytics and lifetime value
- ✅ `processInventoryData()` - Stock levels and inventory value
- ✅ `processTrafficData()` - Placeholder (not available)
- ✅ `processDiscountsData()` - Discount codes and usage

**Features Implemented:**
- Data aggregation (sales by date)
- Currency formatting (2 decimal places)
- Date formatting (YYYY-MM-DD, YYYY-MM-DD HH:MM:SS)
- CSV generation with headers
- Unique filename generation with timestamp
- File storage in `reports/` directory
- Error handling with detailed messages

**Files Created:**
- `app/services/reportDataProcessor.server.ts` (300+ lines)
- `docs/REPORT_DATA_PROCESSOR.md` (300+ lines)

**Technical Details:**
- Uses `csv-writer` library for CSV generation
- Uses `date-fns` for date formatting
- Automatic directory creation
- Sanitized filenames
- Returns file path, record count, and file size

---

### Phase 5: Email & Execution ✅ 3/3 COMPLETE

#### ✅ Task 13: Build Email Service
**Status:** Complete
**Description:** Implement email service using nodemailer to send reports as attachments with customizable email templates and proper error handling

**Deliverables:**
- [x] Email service with nodemailer
- [x] Email templates (HTML + plain text)
- [x] Attachment handling
- [x] SMTP configuration
- [x] Error handling and per-recipient tracking
- [x] Email logging
- [x] Documentation

**Features Implemented:**
- ✅ Professional HTML email template
- ✅ Plain text fallback template
- ✅ CSV file attachment
- ✅ Report summary in email body
- ✅ Responsive design (mobile-friendly)
- ✅ Shopify-inspired branding
- ✅ Per-recipient error handling
- ✅ File verification before sending
- ✅ SMTP configuration via environment variables
- ✅ Support for Gmail, SendGrid, AWS SES

**Files Created:**
- `app/services/emailService.server.ts` (300+ lines)
- `docs/EMAIL_SERVICE.md` (300+ lines)
- `.env.example` (SMTP configuration examples)

**Technical Details:**
- Uses nodemailer for email delivery
- Sequential sending with individual error tracking
- File size calculation and display
- Recipient name extraction from email
- Configurable from address and name
- Test configuration function included

---

#### ✅ Task 14: Create Report Execution Service
**Status:** Complete
**Description:** Build the core service that orchestrates fetching data, processing it, generating files, and sending emails, with proper logging and error handling

**Deliverables:**
- [x] Report execution orchestrator
- [x] Step-by-step execution flow
- [x] Error handling at each step
- [x] Execution logging
- [x] History recording
- [x] Rollback on failure (file cleanup)
- [x] Documentation

**Features Implemented:**
- ✅ `executeReport()` - Main orchestration function
- ✅ `executeReportManually()` - Manual execution trigger
- ✅ `executeScheduledReports()` - Batch execution for scheduler
- ✅ Complete 9-step execution pipeline
- ✅ Per-step error handling and logging
- ✅ History record creation and updates
- ✅ Next run time calculation
- ✅ Temporary file cleanup
- ✅ Detailed console logging

**Execution Flow:**
1. ✅ Fetch report configuration from database
2. ✅ Create history record with RUNNING status
3. ✅ Fetch data from Shopify (via data fetcher)
4. ✅ Process and format data (via data processor)
5. ✅ Generate CSV file
6. ✅ Send emails to recipients (via email service)
7. ✅ Update history record (SUCCESS/FAILED)
8. ✅ Update next run time
9. ✅ Clean up temporary CSV file

**Files Created:**
- `app/services/reportExecutionService.server.ts` (300+ lines)
- `docs/REPORT_EXECUTION_SERVICE.md` (300+ lines)

**Files Modified:**
- `app/routes/api.reports.$id.run.tsx` (integrated execution service)

**Technical Details:**
- Comprehensive try-catch error handling
- Per-step logging with [Report Execution] prefix
- History record tracks status, timing, results, errors
- File cleanup on both success and failure
- Asynchronous execution for manual triggers
- Sequential execution for scheduled reports

---

#### ✅ Task 15: Implement Background Job Scheduler
**Status:** Complete
**Description:** Set up node-cron or similar to check for scheduled reports that need to run and execute them in the background, with proper error recovery

**Deliverables:**
- [x] Cron job setup with node-cron
- [x] Schedule checker (runs every 5 minutes)
- [x] Concurrent execution handling
- [x] Duplicate prevention per shop
- [x] Error recovery
- [x] Comprehensive logging
- [x] Documentation

**Features Implemented:**
- ✅ `startScheduler()` - Start background scheduler
- ✅ `stopScheduler()` - Stop scheduler
- ✅ `getSchedulerStatus()` - Get current status
- ✅ `triggerSchedulerCheck()` - Manual trigger for testing
- ✅ Automatic initialization on app start
- ✅ Runs every 5 minutes (`*/5 * * * *`)
- ✅ Groups reports by shop
- ✅ Parallel execution per shop
- ✅ Sequential execution per report
- ✅ Duplicate prevention with Set tracking
- ✅ Session management with offline tokens
- ✅ Detailed logging with [Scheduler] prefix

**Files Created:**
- `app/services/backgroundScheduler.server.ts` (220 lines)
- `app/services/scheduler.init.server.ts` (20 lines)
- `app/routes/api.scheduler.tsx` (70 lines)
- `docs/BACKGROUND_SCHEDULER.md` (300+ lines)

**Files Modified:**
- `app/entry.server.tsx` (added scheduler import)

**Technical Details:**
- Uses node-cron for scheduling
- Tracks running jobs to prevent duplicates
- Gets offline sessions from Shopify session storage
- Non-blocking execution per shop
- Comprehensive error handling
- API routes for status and manual trigger

---

### Phase 6: Additional Features 🔄 2/4 COMPLETE

#### ✅ Task 16: Create Manual Report Execution
**Status:** Complete
**Description:** Add 'Run Now' functionality allowing users to manually trigger a report execution for testing or immediate needs

**Deliverables:**
- [x] "Run Now" button in UI
- [x] Manual execution API endpoint (already existed from Task 10)
- [x] Immediate execution (bypass schedule)
- [x] Loading indicators
- [x] Success/failure notifications with toast
- [x] Pause/Resume functionality (bonus)
- [x] Documentation

**Features Implemented:**
- ✅ "Run Now" button with loading state
- ✅ Confirmation dialog with report details
- ✅ Toast notifications for success/error
- ✅ Disabled state when report is paused
- ✅ Loading spinner during execution
- ✅ Pause/Resume toggle button
- ✅ Status badge (Active/Paused)
- ✅ Disabled buttons during operations
- ✅ Graceful error handling

**Files Modified:**
- `app/routes/app.reports.scheduled.tsx` (enhanced UI with loading states and pause/resume)

**Files Created:**
- `docs/MANUAL_REPORT_EXECUTION.md` (300+ lines)

**Technical Details:**
- Uses React state for loading tracking (runningId, togglingId, deletingId)
- Shopify toast notifications for user feedback
- Confirmation dialogs for all actions
- Asynchronous execution with proper error handling
- Page refresh after status toggle
- Disabled states prevent conflicting actions

---

#### ✅ Task 17: Build Report History View
**Status:** Complete
**Description:** Create a page showing execution history for each report with status (success/failed), timestamp, recipients, and error details

**Deliverables:**
- [x] Report history page
- [x] Execution timeline (last 50 executions)
- [x] Status indicators (success/failed/running badges)
- [x] Error details display (expandable)
- [x] Email delivery statistics
- [x] Duration and timing information
- [x] Empty state handling
- [x] Navigation integration
- [x] Documentation

**Features Implemented:**
- ✅ History page route (`/app/reports/:id/history`)
- ✅ Execution table with 7 columns
- ✅ Status badges (green/red/blue)
- ✅ Formatted dates and durations
- ✅ File size formatting (B/KB/MB)
- ✅ Record count with comma separators
- ✅ Email delivery stats (sent/failed)
- ✅ Expandable error details
- ✅ Empty state with helpful message
- ✅ "History" button in scheduled reports
- ✅ Back navigation button

**Files Created:**
- `app/routes/app.reports.$id.history.tsx` (300 lines)
- `docs/REPORT_HISTORY_VIEW.md` (300+ lines)

**Files Modified:**
- `app/routes/app.reports.scheduled.tsx` (added History button)

**Technical Details:**
- Fetches last 50 executions from database
- Orders by startedAt descending (newest first)
- Formats dates, durations, file sizes, record counts
- Expandable error details with styled container
- Shop-based data isolation
- Responsive table layout

---

#### ⏳ Task 18: Add Report Preview Feature
**Status:** Not Started  
**Description:** Implement a preview functionality that shows a sample of the report data before scheduling, helping users verify their filters are correct

**Planned Deliverables:**
- [ ] Preview button in configuration
- [ ] Preview API endpoint
- [ ] Sample data display (first 10 rows)
- [ ] Column headers
- [ ] Loading state
- [ ] Error handling
- [ ] Tests

---

#### ⏳ Task 19: Implement Error Notifications
**Status:** Not Started  
**Description:** Add system to notify users via email when a scheduled report fails to execute, including error details and troubleshooting suggestions

**Planned Deliverables:**
- [ ] Error notification email template
- [ ] Failure detection
- [ ] Error categorization
- [ ] Troubleshooting suggestions
- [ ] Retry instructions
- [ ] Tests

**Error Categories:**
- Shopify API errors
- Data processing errors
- Email sending errors
- File generation errors
- Configuration errors

---

### Phase 7: Polish & Launch 🔄 0/3 COMPLETE

#### ⏳ Task 20: Add App Navigation Updates
**Status:** Partially Complete (Reports link added)  
**Description:** Update app.tsx navigation to include links to Reports, Scheduled Reports, and Report History pages

**Remaining Work:**
- [ ] Add "Scheduled Reports" link
- [ ] Add "Report History" link
- [ ] Add active state indicators
- [ ] Update navigation structure

---

#### ⏳ Task 21: Create Onboarding Flow
**Status:** Not Started  
**Description:** Build a welcome screen for first-time users explaining the app's features and guiding them to create their first scheduled report

**Planned Deliverables:**
- [ ] Welcome modal/page
- [ ] Feature highlights
- [ ] Quick start guide
- [ ] "Create First Report" CTA
- [ ] Skip/dismiss option
- [ ] Don't show again preference

---

#### ⏳ Task 22: Testing and Documentation
**Status:** Partially Complete (Documentation in progress)  
**Description:** Write tests for critical functionality, create user documentation, and test the complete flow end-to-end with various report types and schedules

**Remaining Work:**
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for UI flows
- [ ] User documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## Progress Summary

### By Phase

| Phase | Tasks | Complete | In Progress | Not Started | Progress |
|-------|-------|----------|-------------|-------------|----------|
| Phase 1: Foundation | 4 | 4 | 0 | 0 | 100% ✅ |
| Phase 2: User Interface | 4 | 4 | 0 | 0 | 100% ✅ |
| Phase 3: Report Management | 1 | 1 | 0 | 0 | 100% ✅ |
| Phase 4: Backend API | 3 | 3 | 0 | 0 | 100% ✅ |
| Phase 5: Email & Execution | 3 | 3 | 0 | 0 | 100% ✅ |
| Phase 6: Additional Features | 4 | 2 | 0 | 2 | 50% 🔄 |
| Phase 7: Polish & Launch | 3 | 0 | 0 | 3 | 0% ⏳ |
| **TOTAL** | **22** | **17** | **0** | **5** | **77%** |

### By Category

**✅ Complete:** 17 tasks (77%)
- Database Schema Design
- Update Shopify Scopes
- Install Required Dependencies
- Create Report Types Configuration
- Build Report Selection UI
- Build Filter Configuration UI
- Build Schedule Configuration UI
- Build Email Recipients UI
- Create Report List View
- Implement Report CRUD API Routes
- Build Shopify Analytics Data Fetcher
- Implement Report Data Processor
- Build Email Service
- Create Report Execution Service
- Implement Background Job Scheduler
- Create Manual Report Execution
- Build Report History View

**🔄 In Progress:** 0 tasks (0%)

**⏳ Not Started:** 5 tasks (23%)
- All remaining tasks

---

## Next Immediate Steps

1. **Start Task 18:** Add Report Edit Functionality
2. **Start Task 19:** Add Report Duplication
3. **Start Task 20:** Add Error Notifications
4. **Start Task 21:** Add Usage Analytics

---

## Timeline Estimate

**Completed:** ~17 days (Tasks 1-17)
**Remaining:** ~5-10 days (Tasks 18-22)
**Total Estimated:** ~22-27 days

---

## Risk Assessment

### Low Risk ✅
- UI components (mostly complete)
- Database schema (complete)
- Configuration (complete)

### Medium Risk ⚠️
- Shopify GraphQL queries (API complexity)
- Email delivery (SMTP configuration)
- Timezone handling (edge cases)

### High Risk 🔴
- Background job scheduling (reliability)
- Error handling and recovery (complexity)
- Data processing at scale (performance)

---

## Dependencies

### External Services
- Shopify Admin GraphQL API
- SMTP server for email delivery
- File storage for generated reports

### Internal Dependencies
- Tasks 1-7 must complete before Tasks 10-15
- Task 10 (API) required for Tasks 9, 16, 17
- Tasks 11-14 required for Task 15 (scheduler)

---

## Success Criteria

### MVP (Minimum Viable Product)
- ✅ Users can create scheduled reports
- ✅ Users can configure filters
- ✅ Users can set schedules
- ⏳ Users can add email recipients
- ⏳ Reports execute automatically
- ⏳ Reports are emailed as CSV attachments
- ⏳ Users can view execution history

### Full Launch
- All 22 tasks complete
- All tests passing
- Documentation complete
- No critical bugs
- Performance acceptable
- User feedback positive

---

## Notes

- Focus on completing UI (Phase 2) before moving to backend
- Backend API and services can be developed in parallel
- Testing should be continuous, not just Task 22
- Documentation is being created alongside development
- Consider user feedback after MVP launch for additional features

