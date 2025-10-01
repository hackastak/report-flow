# Report Preview Feature Documentation

## Overview

The Report Preview feature allows users to see a sample of their report data before scheduling it. This helps verify that filters are configured correctly and shows what data will be included in the report.

## Features

### 1. Preview Button

**Location:** Report creation page, after filter configuration

**Functionality:**
- Fetches sample data from Shopify
- Processes data with current filters
- Displays first 10 rows
- Shows column headers
- Displays loading state
- Shows error messages

---

### 2. Sample Data Display

**Display:**
- First 10 rows of data
- All configured columns
- Formatted data values
- Record count information

---

### 3. Loading State

**Indicators:**
- Button shows "Loading Preview..."
- Loading spinner on button
- Button disabled during load

---

### 4. Error Handling

**Error Display:**
- Red banner with error message
- Clear error descriptions
- Retry capability

---

## User Interface

### Preview Section Layout

```
┌─────────────────────────────────────────────────┐
│ Preview Report Data                             │
├─────────────────────────────────────────────────┤
│ Preview a sample of your report data to verify  │
│ your filters are working correctly.             │
│                                                 │
│ [Preview Report]                                │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ✓ Showing 10 of 234 records                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Date       │ Revenue  │ Orders │ ...        │ │
│ │────────────┼──────────┼────────┼───────────│ │
│ │ 2025-01-15 │ $1,234   │ 45     │ ...        │ │
│ │ 2025-01-14 │ $2,345   │ 67     │ ...        │ │
│ │ ...        │ ...      │ ...    │ ...        │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

### Button States

**Normal:**
```
[Preview Report]
```

**Loading:**
```
[⟳ Loading Preview...]
```

**Disabled:**
```
[Preview Report] (grayed out)
```

---

### Success Banner

**Message:**
```
┌─────────────────────────────────────────┐
│ ✓ Showing 10 of 234 records             │
└─────────────────────────────────────────┘
```

---

### Error Banner

**Message:**
```
┌─────────────────────────────────────────┐
│ ✗ Failed to generate preview            │
│   [Error details]                       │
└─────────────────────────────────────────┘
```

---

## User Flow

### Generating Preview

1. **User configures filters**
   - Select date range
   - Choose filter options
   - Set filter values

2. **User clicks "Preview Report"**
   - Button shows loading state
   - API request initiated
   - Data fetched from Shopify

3. **Preview displays**
   - Success banner shows record count
   - Table displays with data
   - User can verify filters

4. **User continues or adjusts**
   - If data looks good, continue to schedule
   - If not, adjust filters and preview again

---

### Error Handling

**Common Errors:**
1. **Invalid report type** - Report type not recognized
2. **Fetch failed** - Shopify API error
3. **Processing failed** - Data processing error
4. **Not available** - Traffic reports not supported

**User Actions:**
- Read error message
- Adjust configuration
- Try preview again

---

## API Integration

### Preview Endpoint

**Route:** `POST /api/reports/preview`

**Request Body:**
```json
{
  "reportType": "SALES",
  "filters": {
    "dateRange": "LAST_30_DAYS",
    "salesChannel": ["online_store"]
  }
}
```

**Success Response:**
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
        "label": "Revenue",
        "type": "currency"
      }
    ],
    "data": [
      {
        "date": "2025-01-15",
        "revenue": "1234.56"
      },
      {
        "date": "2025-01-14",
        "revenue": "2345.67"
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
    "code": "FETCH_FAILED",
    "message": "Failed to fetch data from Shopify"
  }
}
```

---

## Implementation Details

### API Route

**File:** `app/routes/api.reports.preview.tsx`

**Process:**
1. Authenticate request
2. Validate report type
3. Fetch data from Shopify (via admin GraphQL client)
4. Process data with filters
5. Limit to first 10 rows
6. Return columns and data

**Key Code:**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  const body = await request.json();
  const { reportType, filters } = body;

  // Fetch data from Shopify
  const fetchResult = await fetchShopifyData({
    reportType,
    filters: filters || {},
    admin,
  });

  // Process data
  let processedData: any[];
  switch (reportType) {
    case "SALES":
      processedData = processSalesData(fetchResult.data, filters || {});
      break;
    // ... other types
  }

  // Limit to first 10 rows
  const previewData = processedData.slice(0, 10);

  return Response.json({
    success: true,
    preview: {
      columns: reportConfig.dataFields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
      })),
      data: previewData,
      totalRecords: processedData.length,
      previewRecords: previewData.length,
    },
  });
}
```

---

### UI Component

**File:** `app/routes/app.reports.new.tsx`

**State Management:**
```typescript
const [previewData, setPreviewData] = useState<any>(null);
const [loadingPreview, setLoadingPreview] = useState(false);
const [previewError, setPreviewError] = useState<string | null>(null);
```

**Preview Handler:**
```typescript
const handlePreview = async () => {
  setLoadingPreview(true);
  setPreviewError(null);
  setPreviewData(null);

  try {
    const response = await fetch("/api/reports/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportType: searchParams.get("type"),
        filters: filterValues,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setPreviewData(data.preview);
    } else {
      setPreviewError(data.error?.message || "Failed to generate preview");
    }
  } catch (error) {
    setPreviewError("Failed to generate preview. Please try again.");
  } finally {
    setLoadingPreview(false);
  }
};
```

**Preview Display:**
```tsx
{previewData && (
  <div>
    <s-banner variant="success">
      <s-paragraph>
        Showing {previewData.previewRecords} of {previewData.totalRecords} records
      </s-paragraph>
    </s-banner>
    
    <table>
      <thead>
        <tr>
          {previewData.columns.map((column: any) => (
            <th key={column.key}>
              <s-text weight="bold">{column.label}</s-text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {previewData.data.map((row: any, index: number) => (
          <tr key={index}>
            {previewData.columns.map((column: any) => (
              <td key={column.key}>
                <s-text>
                  {row[column.key] !== null ? String(row[column.key]) : "—"}
                </s-text>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

---

## Data Processing

### Fetch Data

**Uses:** `fetchShopifyData()` from shopifyDataFetcher service

**Process:**
- Queries Shopify GraphQL API
- Applies date range filters
- Applies other filters
- Returns raw data

---

### Process Data

**Uses:** Processing functions from reportDataProcessor service

**Functions:**
- `processSalesData()` - Aggregates sales by date
- `processOrdersData()` - Formats order details
- `processProductsData()` - Formats product data
- `processCustomersData()` - Formats customer data
- `processInventoryData()` - Formats inventory data
- `processDiscountsData()` - Formats discount data

**Process:**
- Transforms raw API data
- Applies additional filters
- Formats values (currency, dates)
- Returns processed array

---

### Limit Results

**Implementation:**
```typescript
const previewData = processedData.slice(0, 10);
```

**Purpose:**
- Show only first 10 rows
- Keep preview fast
- Reduce data transfer

---

## User Experience

### Benefits

1. **Verification**
   - Verify filters are correct
   - See actual data before scheduling
   - Catch configuration errors early

2. **Confidence**
   - Know what data will be included
   - Understand report format
   - Trust the scheduled report

3. **Efficiency**
   - No need to wait for scheduled run
   - Quick feedback on configuration
   - Iterate on filters quickly

4. **Learning**
   - Understand available data
   - Learn filter effects
   - Explore data structure

---

### Best Practices

**For Users:**
1. Always preview before scheduling
2. Test different filter combinations
3. Verify date ranges are correct
4. Check that expected data appears

**For Developers:**
1. Keep preview fast (limit to 10 rows)
2. Show clear error messages
3. Display loading states
4. Handle all error cases

---

## Performance Considerations

### Optimization

**Data Limiting:**
- Only fetch necessary data
- Limit to 10 rows for display
- Use same pagination as full reports

**Caching:**
- No caching (always fresh data)
- Each preview is a new request
- Ensures current data

**Error Handling:**
- Timeout after reasonable period
- Retry on transient errors
- Clear error messages

---

## Future Enhancements

### 1. Adjustable Preview Size

**Current:** Fixed 10 rows

**Enhancement:**
- Allow user to choose preview size
- Options: 10, 25, 50, 100 rows
- Balance between speed and detail

### 2. Export Preview

**Current:** View only

**Enhancement:**
- Download preview as CSV
- Test full export process
- Verify formatting

### 3. Column Selection

**Current:** All columns shown

**Enhancement:**
- Choose which columns to preview
- Customize column order
- Hide unnecessary columns

### 4. Real-time Preview

**Current:** Manual button click

**Enhancement:**
- Auto-preview on filter change
- Debounced updates
- Live data refresh

### 5. Preview History

**Current:** No history

**Enhancement:**
- Save previous previews
- Compare filter results
- Track configuration changes

---

## Related Documentation

- Shopify Data Fetcher: `docs/SHOPIFY_DATA_FETCHER.md`
- Report Data Processor: `docs/REPORT_DATA_PROCESSOR.md`
- Filter Configuration: `docs/FILTER_CONFIGURATION.md`

