# Report Flow - API Routes Documentation

## Overview

This document describes the REST API endpoints for managing scheduled reports in Report Flow.

## Base URL

All API routes are prefixed with `/api`

## Authentication

All endpoints require Shopify OAuth authentication. The session is validated using `authenticate.admin(request)`.

---

## Endpoints

### 1. List All Reports

**Endpoint:** `GET /api/reports`

**Description:** Retrieve all scheduled reports for the authenticated shop

**Request:**
```http
GET /api/reports HTTP/1.1
Host: your-app.com
```

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "name": "Weekly Sales Report",
      "description": "Sales performance for the past week",
      "reportType": "SALES",
      "frequency": "WEEKLY",
      "timeOfDay": "09:00",
      "dayOfWeek": 1,
      "dayOfMonth": null,
      "timezone": "America/New_York",
      "isActive": true,
      "lastRunAt": "2025-01-15T09:00:00Z",
      "nextRunAt": "2025-01-22T09:00:00Z",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-01T10:00:00Z",
      "recipientCount": 3,
      "filterCount": 2
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "FETCH_FAILED",
    "message": "Failed to fetch reports",
    "details": "Error details"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Create New Report

**Endpoint:** `POST /api/reports`

**Description:** Create a new scheduled report

**Request:**
```http
POST /api/reports HTTP/1.1
Host: your-app.com
Content-Type: application/json

{
  "name": "Weekly Sales Report",
  "description": "Sales performance for the past week",
  "reportType": "SALES",
  "filters": {
    "dateRange": "LAST_7_DAYS",
    "salesChannel": ["online_store"]
  },
  "schedule": {
    "frequency": "WEEKLY",
    "timeOfDay": "09:00",
    "dayOfWeek": 1,
    "timezone": "America/New_York"
  },
  "recipients": [
    {
      "email": "john@example.com",
      "name": "John Smith"
    },
    {
      "email": "sarah@example.com",
      "name": "Sarah Johnson"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "uuid",
  "nextRunAt": "2025-01-22T09:00:00Z",
  "message": "Report schedule created successfully"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Report name is required"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error

**Validation Rules:**
- `name` - Required, 1-100 characters
- `reportType` - Required, must be valid type (SALES, ORDERS, PRODUCTS, etc.)
- `schedule.frequency` - Required, must be DAILY, WEEKLY, MONTHLY, or CUSTOM
- `schedule.timeOfDay` - Required, must be HH:MM format
- `schedule.timezone` - Required, valid IANA timezone
- `schedule.dayOfWeek` - Required for WEEKLY (0-6)
- `schedule.dayOfMonth` - Required for MONTHLY (1-31 or -1)
- `recipients` - Required, at least one valid email

---

### 3. Get Single Report

**Endpoint:** `GET /api/reports/:id`

**Description:** Retrieve details of a specific report

**Request:**
```http
GET /api/reports/uuid HTTP/1.1
Host: your-app.com
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "uuid",
    "name": "Weekly Sales Report",
    "description": "Sales performance for the past week",
    "reportType": "SALES",
    "frequency": "WEEKLY",
    "timeOfDay": "09:00",
    "dayOfWeek": 1,
    "dayOfMonth": null,
    "timezone": "America/New_York",
    "isActive": true,
    "lastRunAt": "2025-01-15T09:00:00Z",
    "nextRunAt": "2025-01-22T09:00:00Z",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z",
    "filters": {
      "dateRange": "LAST_7_DAYS",
      "salesChannel": ["online_store"]
    },
    "recipients": [
      {
        "email": "john@example.com",
        "name": "John Smith"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Report not found
- `500 Internal Server Error` - Server error

---

### 4. Update Report

**Endpoint:** `PUT /api/reports/:id`

**Description:** Update an existing report

**Request:**
```http
PUT /api/reports/uuid HTTP/1.1
Host: your-app.com
Content-Type: application/json

{
  "name": "Updated Weekly Sales Report",
  "description": "Updated description",
  "reportType": "SALES",
  "filters": {
    "dateRange": "LAST_7_DAYS"
  },
  "schedule": {
    "frequency": "WEEKLY",
    "timeOfDay": "10:00",
    "dayOfWeek": 2,
    "timezone": "America/New_York"
  },
  "recipients": [
    {
      "email": "john@example.com",
      "name": "John Smith"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "uuid",
  "nextRunAt": "2025-01-23T10:00:00Z",
  "message": "Report updated successfully"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error or invalid ID
- `404 Not Found` - Report not found
- `500 Internal Server Error` - Server error

**Notes:**
- All fields are required (full replacement)
- Filters and recipients are replaced, not merged
- Next run time is recalculated

---

### 5. Delete Report

**Endpoint:** `DELETE /api/reports/:id`

**Description:** Delete a scheduled report

**Request:**
```http
DELETE /api/reports/uuid HTTP/1.1
Host: your-app.com
```

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Report not found
- `500 Internal Server Error` - Server error

**Notes:**
- Cascade deletes all related records (filters, recipients, history)
- Cannot be undone

---

### 6. Run Report Now

**Endpoint:** `POST /api/reports/:id/run`

**Description:** Manually trigger report execution

**Request:**
```http
POST /api/reports/uuid/run HTTP/1.1
Host: your-app.com
```

**Response:**
```json
{
  "success": true,
  "executionId": "uuid",
  "message": "Report execution started. You will receive an email when it's complete."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Report not found
- `405 Method Not Allowed` - Wrong HTTP method
- `500 Internal Server Error` - Server error

**Notes:**
- Creates a ReportHistory record with status "RUNNING"
- Actual execution happens asynchronously (Task 14)
- Does not affect scheduled next run time

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data failed validation |
| `INVALID_ID` | Report ID is missing or invalid |
| `NOT_FOUND` | Report not found or doesn't belong to shop |
| `FETCH_FAILED` | Failed to retrieve data from database |
| `CREATE_FAILED` | Failed to create report |
| `UPDATE_FAILED` | Failed to update report |
| `DELETE_FAILED` | Failed to delete report |
| `EXECUTION_FAILED` | Failed to start report execution |
| `METHOD_NOT_ALLOWED` | HTTP method not supported |

---

## Data Models

### ReportSchedule

```typescript
{
  id: string;
  shop: string;
  name: string;
  description: string | null;
  reportType: string;
  frequency: string;
  timeOfDay: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  timezone: string;
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### ReportFilter

```typescript
{
  id: string;
  reportScheduleId: string;
  filterKey: string;
  filterValue: string; // JSON string
  createdAt: Date;
}
```

### ReportRecipient

```typescript
{
  id: string;
  reportScheduleId: string;
  email: string;
  name: string | null;
  createdAt: Date;
}
```

### ReportHistory

```typescript
{
  id: string;
  reportScheduleId: string;
  status: string; // SUCCESS, FAILED, RUNNING
  startedAt: Date;
  completedAt: Date | null;
  recordCount: number | null;
  fileSize: number | null;
  filePath: string | null;
  errorMessage: string | null;
  errorDetails: string | null;
  emailsSent: number;
  emailsFailed: number;
}
```

---

## Implementation Details

### Database Queries

**List Reports:**
```typescript
await prisma.reportSchedule.findMany({
  where: { shop: session.shop },
  include: { recipients: true, filters: true },
  orderBy: { createdAt: "desc" },
});
```

**Create Report:**
```typescript
await prisma.reportSchedule.create({
  data: {
    shop: session.shop,
    name: data.name,
    // ... other fields
    filters: {
      create: Object.entries(data.filters).map(([key, value]) => ({
        filterKey: key,
        filterValue: JSON.stringify(value),
      })),
    },
    recipients: {
      create: data.recipients.map((r) => ({
        email: r.email,
        name: r.name,
      })),
    },
  },
});
```

**Update Report:**
```typescript
await prisma.reportSchedule.update({
  where: { id: id },
  data: {
    name: data.name,
    // ... other fields
    filters: {
      deleteMany: {},
      create: [...],
    },
    recipients: {
      deleteMany: {},
      create: [...],
    },
  },
});
```

---

## Testing

### Manual Testing with cURL

**Create Report:**
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Report",
    "reportType": "SALES",
    "schedule": {
      "frequency": "DAILY",
      "timeOfDay": "09:00",
      "timezone": "UTC"
    },
    "recipients": [
      {"email": "test@example.com"}
    ]
  }'
```

**List Reports:**
```bash
curl http://localhost:3000/api/reports
```

**Delete Report:**
```bash
curl -X DELETE http://localhost:3000/api/reports/uuid
```

---

## Related Documentation

- Database Schema: `docs/DATABASE_SCHEMA.md`
- Report Types: `docs/REPORT_TYPES.md`
- Functional Specification: `docs/FSD.md`

