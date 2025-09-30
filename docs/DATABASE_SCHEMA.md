# Report Flow - Database Schema Documentation

## Overview

The Report Flow app uses a relational database structure to manage scheduled analytics reports, their configurations, recipients, and execution history. The schema is designed to work with both SQLite (development) and PostgreSQL (production).

## Entity Relationship Diagram

```
┌─────────────────┐
│  ReportSchedule │ (Main entity - stores report configurations)
└────────┬────────┘
         │
         ├──────────┬──────────────┬──────────────┐
         │          │              │              │
         ▼          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ReportFilter │ │ReportRecipient│ │ReportHistory │ │   (Future)   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## Models

### 1. ReportSchedule

The core model that stores all scheduled report configurations.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `shop` | String | Shopify store domain (e.g., "mystore.myshopify.com") |
| `name` | String | User-defined name for the report |
| `description` | String? | Optional description |
| `reportType` | String | Type of report: `SALES`, `ORDERS`, `PRODUCTS`, `CUSTOMERS`, `TRAFFIC`, `INVENTORY` |
| `frequency` | String | Schedule frequency: `DAILY`, `WEEKLY`, `MONTHLY`, `CUSTOM` |
| `timeOfDay` | String | Time to run in HH:MM format (24-hour) |
| `dayOfWeek` | Int? | For weekly reports: 0=Sunday, 1=Monday, ..., 6=Saturday |
| `dayOfMonth` | Int? | For monthly reports: 1-31 |
| `timezone` | String | Timezone for scheduling (default: "UTC") |
| `isActive` | Boolean | Whether the schedule is active (default: true) |
| `lastRunAt` | DateTime? | Timestamp of last execution |
| `nextRunAt` | DateTime? | Calculated timestamp for next execution |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record last update timestamp |

**Indexes:**
- `shop` - Fast lookup of reports by store
- `isActive, nextRunAt` - Efficient querying for scheduler to find reports to run

**Relations:**
- One-to-many with `ReportFilter`
- One-to-many with `ReportRecipient`
- One-to-many with `ReportHistory`

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shop": "mystore.myshopify.com",
  "name": "Weekly Sales Report",
  "description": "Sales summary for management team",
  "reportType": "SALES",
  "frequency": "WEEKLY",
  "timeOfDay": "09:00",
  "dayOfWeek": 1,
  "timezone": "America/New_York",
  "isActive": true,
  "nextRunAt": "2025-10-06T09:00:00Z"
}
```

---

### 2. ReportFilter

Stores filter configurations for each scheduled report. Uses a flexible key-value structure to support different filter types.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `reportScheduleId` | String | Foreign key to ReportSchedule |
| `filterKey` | String | Filter identifier (e.g., "dateRange", "productType", "orderStatus") |
| `filterValue` | String | JSON string containing filter value(s) |
| `createdAt` | DateTime | Record creation timestamp |

**Indexes:**
- `reportScheduleId` - Fast lookup of filters for a report

**Relations:**
- Many-to-one with `ReportSchedule` (CASCADE delete)

**Common Filter Keys:**

| Filter Key | Description | Example Value |
|------------|-------------|---------------|
| `dateRange` | Date range for report | `{"type": "last_7_days"}` or `{"type": "custom", "start": "2025-01-01", "end": "2025-01-31"}` |
| `productType` | Filter by product type | `{"types": ["physical", "digital"]}` |
| `productVendor` | Filter by vendor | `{"vendors": ["Nike", "Adidas"]}` |
| `orderStatus` | Filter by order status | `{"statuses": ["fulfilled", "pending"]}` |
| `customerType` | New vs returning | `{"type": "returning"}` |
| `salesChannel` | Online store, POS, etc. | `{"channels": ["online_store"]}` |

**Example:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "reportScheduleId": "550e8400-e29b-41d4-a716-446655440000",
  "filterKey": "dateRange",
  "filterValue": "{\"type\": \"last_7_days\"}"
}
```

---

### 3. ReportRecipient

Stores email recipients for each scheduled report.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `reportScheduleId` | String | Foreign key to ReportSchedule |
| `email` | String | Recipient email address |
| `name` | String? | Optional recipient name |
| `createdAt` | DateTime | Record creation timestamp |

**Indexes:**
- `reportScheduleId` - Fast lookup of recipients for a report

**Relations:**
- Many-to-one with `ReportSchedule` (CASCADE delete)

**Example:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "reportScheduleId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "ceo@company.com",
  "name": "John Doe"
}
```

---

### 4. ReportHistory

Tracks execution history for scheduled reports, including success/failure status and metrics.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Primary key |
| `reportScheduleId` | String | Foreign key to ReportSchedule |
| `status` | String | Execution status: `SUCCESS`, `FAILED`, `RUNNING` |
| `startedAt` | DateTime | When execution started |
| `completedAt` | DateTime? | When execution completed |
| `recordCount` | Int? | Number of records in the generated report |
| `fileSize` | Int? | Size of generated file in bytes |
| `filePath` | String? | Path to generated file (if stored) |
| `errorMessage` | String? | Human-readable error message |
| `errorDetails` | String? | JSON string with detailed error information |
| `emailsSent` | Int | Number of emails successfully sent (default: 0) |
| `emailsFailed` | Int | Number of emails that failed to send (default: 0) |

**Indexes:**
- `reportScheduleId` - Fast lookup of history for a report
- `status` - Query by execution status
- `startedAt` - Query by execution time

**Relations:**
- Many-to-one with `ReportSchedule` (CASCADE delete)

**Example:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "reportScheduleId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "SUCCESS",
  "startedAt": "2025-09-30T09:00:00Z",
  "completedAt": "2025-09-30T09:02:15Z",
  "recordCount": 1247,
  "fileSize": 52480,
  "filePath": "/tmp/reports/weekly-sales-2025-09-30.csv",
  "emailsSent": 3,
  "emailsFailed": 0
}
```

---

## Design Decisions

### 1. **Flexible Filter Storage**
Filters are stored as key-value pairs with JSON values, allowing for:
- Different filter types per report type
- Complex filter configurations
- Easy extensibility without schema changes

### 2. **Cascade Deletes**
All child records (filters, recipients, history) use `onDelete: Cascade`, ensuring:
- Clean deletion of reports removes all related data
- No orphaned records
- Simplified data management

### 3. **Timezone Support**
Each schedule stores its timezone, enabling:
- Accurate scheduling across different regions
- User-friendly time display
- Proper handling of daylight saving time

### 4. **Comprehensive History Tracking**
ReportHistory captures detailed metrics for:
- Debugging failed executions
- Performance monitoring
- User transparency
- Audit trails

### 5. **Indexes for Performance**
Strategic indexes on:
- Foreign keys (fast joins)
- Query patterns (scheduler lookups)
- Common filters (status, dates)

---

## Migration to PostgreSQL

When moving to production with PostgreSQL, only one change is needed:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

All models and relations work identically on both databases.

---

## Future Enhancements

Potential schema additions:

1. **ReportTemplate** - Pre-configured report templates
2. **ReportShare** - Share reports with team members
3. **ReportNotification** - Custom notification preferences
4. **ReportAttachment** - Store generated files in cloud storage
5. **ReportMetrics** - Aggregate statistics across executions

