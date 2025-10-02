# Field Customization Feature

## Overview

This feature allows users to select which data fields to include in their reports when scheduling or editing them. Users can customize the columns that appear in the CSV export, providing much more flexibility to get exactly the information they need.

## Implementation Summary

### Database Changes

**New Model: `ReportField`**
- Stores which fields are selected for each report
- Tracks field order for consistent CSV column ordering
- Linked to `ReportSchedule` via foreign key with cascade delete

**Schema:**
```prisma
model ReportField {
  id               String   @id @default(uuid())
  reportScheduleId String
  reportSchedule   ReportSchedule @relation(fields: [reportScheduleId], references: [id], onDelete: Cascade)
  
  fieldKey         String   // e.g., "date", "totalSales", "orderCount"
  fieldOrder       Int      // Order in which field should appear (0-based)
  
  createdAt        DateTime @default(now())
  
  @@index([reportScheduleId])
  @@unique([reportScheduleId, fieldKey])
}
```

**Migration:** `20251002034415_add_report_fields`

### New Components

#### 1. FieldSelectionForm (`app/components/FieldSelectionForm.tsx`)

**Purpose:** Interactive UI for selecting report fields

**Features:**
- Displays all available fields for a report type
- Checkbox-based selection with visual feedback
- "Select All" and "Clear All" buttons
- Shows field type and description
- Displays count of selected fields
- Warning banner when no fields selected
- Grid layout for easy scanning

**Props:**
```typescript
interface FieldSelectionFormProps {
  availableFields: DataField[];
  initialSelectedFields?: SelectedField[];
  onChange: (selectedFields: SelectedField[]) => void;
}
```

**Default Behavior:** All fields are selected by default for new reports

### Modified Files

#### 1. Report Creation Page (`app/routes/app.reports.new.tsx`)

**Changes:**
- Added import for `FieldSelectionForm` component
- Added `selectedFields` state to track user selection
- Added `handleFieldsChange` handler
- Added field validation (at least one field required)
- Integrated `FieldSelectionForm` component in UI (before schedule section)
- Included `selectedFields` in API request payload

#### 2. Report Edit Page (`app/routes/app.reports.edit.$id.tsx`) - NEW FILE

**Purpose:** Allow users to edit existing scheduled reports

**Features:**
- Loads existing report data from API
- Pre-populates all form fields including selected fields
- Same validation as creation page
- Updates report via PUT request
- Navigates back to scheduled reports on success

**Route:** `/app/reports/edit/:id`

#### 3. API Routes

**POST `/api/reports` (`app/routes/api.reports.tsx`):**
- Accepts `selectedFields` array in request body
- Validates at least one field is selected
- Creates `ReportField` records in database
- Includes fields in response

**PUT `/api/reports/:id` (`app/routes/api.reports.$id.tsx`):**
- Accepts `selectedFields` array in request body
- Validates at least one field is selected
- Deletes existing fields and creates new ones (replace strategy)
- Includes fields in response

**GET `/api/reports/:id` (`app/routes/api.reports.$id.tsx`):**
- Includes `fields` relation in query with ordering
- Transforms fields to `selectedFields` format in response
- Returns fields sorted by `fieldOrder`

#### 4. Report Data Processor (`app/services/reportDataProcessor.server.ts`)

**Changes:**
- Added `selectedFields` optional parameter to `ProcessDataOptions`
- Filters `dataFields` based on selected fields
- Sorts fields according to user-specified order
- Falls back to all fields if none specified (backward compatibility)

**Logic:**
```typescript
if (selectedFields && selectedFields.length > 0) {
  const selectedFieldKeys = new Set(selectedFields.map(f => f.key));
  fieldsToInclude = reportConfig.dataFields
    .filter(field => selectedFieldKeys.has(field.key))
    .sort((a, b) => {
      const orderA = selectedFields.find(f => f.key === a.key)?.order ?? 999;
      const orderB = selectedFields.find(f => f.key === b.key)?.order ?? 999;
      return orderA - orderB;
    });
}
```

#### 5. Report Execution Service (`app/services/reportExecutionService.server.ts`)

**Changes:**
- Includes `fields` relation when fetching report schedule
- Orders fields by `fieldOrder`
- Transforms fields to format expected by processor
- Passes `selectedFields` to `processReportData`

#### 6. Scheduled Reports Page (`app/routes/app.reports.scheduled.tsx`)

**Changes:**
- Updated `handleEdit` to navigate to edit page instead of logging
- Removed TODO comment

### User Flow

#### Creating a Report with Custom Fields

1. User selects report type
2. User configures filters
3. **NEW:** User selects which fields to include (all selected by default)
4. User can use "Select All" or "Clear All" buttons
5. User clicks individual checkboxes to customize
6. System validates at least one field is selected
7. User sets schedule and recipients
8. User saves report
9. Selected fields are stored in database

#### Editing Report Fields

1. User navigates to Scheduled Reports
2. User clicks "Edit" button on a report
3. Edit page loads with existing field selection
4. **NEW:** User can modify field selection
5. User can change any other settings
6. User saves changes
7. Updated field selection is stored

#### Report Execution with Custom Fields

1. Scheduled report runs automatically
2. System fetches report configuration including selected fields
3. Data is fetched from Shopify
4. **NEW:** Data processor filters columns to only selected fields
5. **NEW:** Columns are ordered according to user preference
6. CSV is generated with only selected fields
7. Report is emailed to recipients

### Validation

**Client-Side:**
- Report name required
- At least one recipient required
- **NEW:** At least one field required

**Server-Side:**
- All client-side validations
- Field configuration validation (key must be string)
- Email format validation

### Backward Compatibility

**Existing Reports:**
- Reports created before this feature will have no `fields` records
- System falls back to all fields from report config
- No data migration needed
- Existing reports continue to work as before

**Migration Path:**
- Users can edit existing reports to customize fields
- On first edit, all fields will be selected by default
- User can then customize and save

### Testing Checklist

- [x] Database schema updated and migrated
- [x] FieldSelectionForm component created
- [x] Report creation includes field selection
- [x] Report editing includes field selection
- [x] API endpoints handle selectedFields
- [x] Validation enforces at least one field
- [x] Report processor uses selected fields
- [x] Report execution passes selected fields
- [ ] Manual test: Create report with custom fields
- [ ] Manual test: Edit report field selection
- [ ] Manual test: Run report and verify CSV columns
- [ ] Manual test: Existing reports still work

### Future Enhancements

1. **Field Reordering:** Drag-and-drop to reorder fields
2. **Field Presets:** Save common field selections as templates
3. **Conditional Fields:** Show/hide fields based on filters
4. **Field Descriptions:** Add tooltips with more detailed field info
5. **Preview with Selected Fields:** Update preview to show only selected fields

### Files Created

- `app/components/FieldSelectionForm.tsx` (180 lines)
- `app/routes/app.reports.edit.$id.tsx` (300 lines)
- `prisma/migrations/20251002034415_add_report_fields/migration.sql`
- `docs/FIELD_CUSTOMIZATION_FEATURE.md` (this file)

### Files Modified

- `prisma/schema.prisma` (added ReportField model)
- `app/routes/app.reports.new.tsx` (added field selection)
- `app/routes/api.reports.tsx` (handle selectedFields)
- `app/routes/api.reports.$id.tsx` (handle selectedFields)
- `app/services/reportDataProcessor.server.ts` (filter fields)
- `app/services/reportExecutionService.server.ts` (pass fields)
- `app/routes/app.reports.scheduled.tsx` (enable edit navigation)

### API Changes

**Request Format (POST/PUT):**
```json
{
  "name": "Weekly Sales Report",
  "reportType": "SALES",
  "selectedFields": [
    { "key": "date", "order": 0 },
    { "key": "totalSales", "order": 1 },
    { "key": "orderCount", "order": 2 }
  ],
  "filters": { ... },
  "schedule": { ... },
  "recipients": [ ... ]
}
```

**Response Format (GET):**
```json
{
  "success": true,
  "report": {
    "id": "...",
    "name": "...",
    "selectedFields": [
      { "key": "date", "order": 0 },
      { "key": "totalSales", "order": 1 }
    ],
    ...
  }
}
```

## Summary

This feature provides users with fine-grained control over report content, allowing them to:
- Include only relevant data fields
- Reduce CSV file size
- Improve report readability
- Customize reports for different audiences
- Maintain consistent column ordering

The implementation is backward compatible, well-validated, and follows the existing architecture patterns in the codebase.

