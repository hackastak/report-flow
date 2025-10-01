# Report Flow - API Documentation

## Overview

This document describes the internal API routes used by Report Flow. All routes require Shopify authentication and are scoped to the authenticated shop.

**Base URL:** `https://your-app-url.com`

**Authentication:** Shopify OAuth (handled automatically by Shopify App Bridge)

---

## Table of Contents

1. [Reports API](#reports-api)
2. [Report Execution API](#report-execution-api)
3. [Report Preview API](#report-preview-api)
4. [Scheduler API](#scheduler-api)
5. [Onboarding API](#onboarding-api)
6. [Error Responses](#error-responses)

---

## Reports API

### List All Reports

**Endpoint:** `GET /api/reports`

**Description:** Retrieve all scheduled reports for the authenticated shop.

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "clx123abc",
      "name": "Weekly Sales Report",
      "reportType": "SALES",
      "frequency": "WEEKLY",
      "scheduleTime": "09:00",
      "scheduleDay": 1,
      "timezone": "America/New_York",
      "isActive": true,
      "nextRunAt": "2025-10-08T09:00:00Z",
      "createdAt": "2025-10-01T10:00:00Z",
      "filters": [
        {
          "filterKey": "dateRange",
          "filterValue": "last_7_days"
        }
      ],
      "recipients": [
        {
          "email": "user@example.com",
          "name": "John Doe"
        }
      ]
    }
  ]
}
```

---

### Get Single Report

**Endpoint:** `GET /api/reports/:id`

**Description:** Retrieve a specific report by ID.

**Parameters:**
- `id` (path): Report ID

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "clx123abc",
    "name": "Weekly Sales Report",
    "reportType": "SALES",
    "frequency": "WEEKLY",
    "scheduleTime": "09:00",
    "scheduleDay": 1,
    "timezone": "America/New_York",
    "isActive": true,
    "nextRunAt": "2025-10-08T09:00:00Z",
    "createdAt": "2025-10-01T10:00:00Z",
    "filters": [...],
    "recipients": [...]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Report not found"
}
```

---

### Create Report

**Endpoint:** `POST /api/reports`

**Description:** Create a new scheduled report.

**Request Body:**
```json
{
  "name": "Weekly Sales Report",
  "reportType": "SALES",
  "frequency": "WEEKLY",
  "scheduleTime": "09:00",
  "scheduleDay": 1,
  "timezone": "America/New_York",
  "filters": {
    "dateRange": "last_7_days",
    "minOrderValue": "50"
  },
  "recipients": [
    {
      "email": "user@example.com",
      "name": "John Doe"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "clx123abc",
    "name": "Weekly Sales Report",
    ...
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Report name is required",
    "recipients": "At least one recipient is required"
  }
}
```

---

### Update Report

**Endpoint:** `PUT /api/reports/:id`

**Description:** Update an existing report.

**Parameters:**
- `id` (path): Report ID

**Request Body:** Same as Create Report

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "clx123abc",
    ...
  }
}
```

---

### Delete Report

**Endpoint:** `DELETE /api/reports/:id`

**Description:** Delete a report and all its history.

**Parameters:**
- `id` (path): Report ID

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Report Execution API

### Run Report Manually

**Endpoint:** `POST /api/reports/:id/run`

**Description:** Execute a report immediately, bypassing the schedule.

**Parameters:**
- `id` (path): Report ID

**Response:**
```json
{
  "success": true,
  "execution": {
    "historyId": "clx456def",
    "status": "RUNNING",
    "startedAt": "2025-10-01T14:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Report is not active"
}
```

---

### Pause Report

**Endpoint:** `POST /api/reports/:id/pause`

**Description:** Pause a scheduled report.

**Parameters:**
- `id` (path): Report ID

**Response:**
```json
{
  "success": true,
  "message": "Report paused successfully"
}
```

---

### Resume Report

**Endpoint:** `POST /api/reports/:id/resume`

**Description:** Resume a paused report.

**Parameters:**
- `id` (path): Report ID

**Response:**
```json
{
  "success": true,
  "message": "Report resumed successfully"
}
```

---

### Get Report History

**Endpoint:** `GET /api/reports/:id/history`

**Description:** Get execution history for a report.

**Parameters:**
- `id` (path): Report ID
- `limit` (query, optional): Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": "clx789ghi",
      "status": "SUCCESS",
      "startedAt": "2025-10-01T09:00:00Z",
      "completedAt": "2025-10-01T09:02:30Z",
      "recordCount": 234,
      "fileSize": 45678,
      "emailsSent": 3,
      "emailsFailed": 0,
      "errorMessage": null
    }
  ]
}
```

---

## Report Preview API

### Preview Report Data

**Endpoint:** `POST /api/reports/preview`

**Description:** Generate a preview of report data (first 10 rows).

**Request Body:**
```json
{
  "reportType": "SALES",
  "filters": {
    "dateRange": "last_7_days"
  }
}
```

**Response:**
```json
{
  "success": true,
  "preview": {
    "columns": [
      {
        "key": "date",
        "label": "Date",
        "type": "date"
      },
      {
        "key": "revenue",
        "label": "Total Revenue",
        "type": "currency"
      }
    ],
    "data": [
      {
        "date": "2025-10-01",
        "revenue": "1234.56",
        "orders": 45
      }
    ],
    "totalRecords": 234,
    "previewRecords": 10
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "SHOPIFY_API_ERROR",
    "message": "Failed to fetch data from Shopify"
  }
}
```

---

## Scheduler API

### Get Scheduler Status

**Endpoint:** `GET /api/scheduler`

**Description:** Get the current status of the background scheduler.

**Response:**
```json
{
  "success": true,
  "scheduler": {
    "isRunning": true,
    "lastCheck": "2025-10-01T14:25:00Z",
    "nextCheck": "2025-10-01T14:30:00Z",
    "activeJobs": 2
  }
}
```

---

### Trigger Scheduler Check

**Endpoint:** `POST /api/scheduler/trigger`

**Description:** Manually trigger a scheduler check (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Scheduler check triggered",
  "reportsChecked": 15,
  "reportsExecuted": 3
}
```

---

## Onboarding API

### Check Onboarding Status

**Endpoint:** `GET /api/onboarding`

**Description:** Check if the user has seen the onboarding flow.

**Response:**
```json
{
  "success": true,
  "hasSeenOnboarding": false
}
```

---

### Mark Onboarding Complete

**Endpoint:** `POST /api/onboarding`

**Description:** Mark the onboarding flow as complete for the user.

**Response:**
```json
{
  "success": true,
  "message": "Onboarding marked as complete"
}
```

---

## Error Responses

### Standard Error Format

All API errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

**Authentication Errors:**
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Not authorized to access resource

**Validation Errors:**
- `VALIDATION_ERROR` (400): Invalid input data
- `MISSING_REQUIRED_FIELD` (400): Required field missing

**Resource Errors:**
- `NOT_FOUND` (404): Resource not found
- `ALREADY_EXISTS` (409): Resource already exists

**Server Errors:**
- `INTERNAL_ERROR` (500): Internal server error
- `SHOPIFY_API_ERROR` (502): Shopify API error
- `DATABASE_ERROR` (500): Database error

---

## Rate Limiting

**Limits:**
- 100 requests per minute per shop
- 1000 requests per hour per shop

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 50): Items per page

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "pages": 5
  }
}
```

---

## Webhooks (Future)

Future versions will support webhooks for:
- Report execution completed
- Report execution failed
- Report created
- Report deleted

---

## SDK (Future)

Future versions will provide official SDKs for:
- JavaScript/TypeScript
- Python
- Ruby
- PHP

---

## Support

For API questions or issues:
- Email: api@reportflow.app
- Documentation: https://docs.reportflow.app/api
- GitHub: https://github.com/reportflow/api-issues

