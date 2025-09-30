# Report Flow - Schedule Configuration Guide

## Overview

This document explains how the schedule configuration system works in Report Flow, allowing users to set up automated report generation and delivery.

## Architecture

### Components

1. **timezoneHelper** (`app/utils/timezoneHelper.ts`)
   - Timezone options and utilities
   - Time formatting functions
   - Next run time calculation
   - Schedule description formatting

2. **ScheduleConfigurationForm** (`app/components/ScheduleConfigurationForm.tsx`)
   - Schedule configuration UI
   - Frequency selection (daily, weekly, monthly)
   - Time and timezone selection
   - Real-time schedule preview

---

## Schedule Frequencies

### 1. Daily

**Description:** Report runs every day at the specified time

**Configuration:**
- Time of day (required)
- Timezone (required)

**Example:**
```typescript
{
  frequency: "DAILY",
  timeOfDay: "09:00",
  timezone: "America/New_York"
}
```

**Schedule Display:** "Daily at 9:00 AM Eastern Time (ET)"

---

### 2. Weekly

**Description:** Report runs once per week on a specific day

**Configuration:**
- Day of week (required) - 0 (Sunday) to 6 (Saturday)
- Time of day (required)
- Timezone (required)

**Example:**
```typescript
{
  frequency: "WEEKLY",
  timeOfDay: "10:00",
  dayOfWeek: 1, // Monday
  timezone: "America/Los_Angeles"
}
```

**Schedule Display:** "Every Monday at 10:00 AM Pacific Time (PT)"

---

### 3. Monthly

**Description:** Report runs once per month on a specific day

**Configuration:**
- Day of month (required) - 1-31 or -1 (last day)
- Time of day (required)
- Timezone (required)

**Example:**
```typescript
{
  frequency: "MONTHLY",
  timeOfDay: "08:00",
  dayOfMonth: 1,
  timezone: "UTC"
}
```

**Schedule Display:** "Monthly on the 1st at 8:00 AM UTC"

**Special Case - Last Day:**
```typescript
{
  frequency: "MONTHLY",
  dayOfMonth: -1, // Last day of month
}
```

**Schedule Display:** "Monthly on the last day at 8:00 AM UTC"

---

## Time Selection

### Time Options

Reports can be scheduled at 30-minute intervals:
- 12:00 AM (00:00)
- 12:30 AM (00:30)
- 1:00 AM (01:00)
- ...
- 11:30 PM (23:30)

### Time Format

**Internal Storage:** 24-hour format (HH:MM)
- Example: "09:00", "14:30", "23:00"

**Display Format:** 12-hour format with AM/PM
- Example: "9:00 AM", "2:30 PM", "11:00 PM"

### Time Conversion

```typescript
import { formatTimeDisplay } from "../utils/timezoneHelper";

formatTimeDisplay("09:00"); // "9:00 AM"
formatTimeDisplay("14:30"); // "2:30 PM"
formatTimeDisplay("00:00"); // "12:00 AM"
```

---

## Timezone Support

### Supported Timezones

The app supports 35+ common timezones across all major regions:

**North America:**
- Eastern Time (ET) - America/New_York
- Central Time (CT) - America/Chicago
- Mountain Time (MT) - America/Denver
- Pacific Time (PT) - America/Los_Angeles
- Alaska Time (AKT) - America/Anchorage
- Hawaii Time (HT) - Pacific/Honolulu

**Europe:**
- London (GMT/BST) - Europe/London
- Paris (CET/CEST) - Europe/Paris
- Berlin (CET/CEST) - Europe/Berlin
- Moscow (MSK) - Europe/Moscow

**Asia:**
- Dubai (GST) - Asia/Dubai
- India (IST) - Asia/Kolkata
- China (CST) - Asia/Shanghai
- Tokyo (JST) - Asia/Tokyo
- Singapore (SGT) - Asia/Singapore

**Australia & Pacific:**
- Sydney (AEDT/AEST) - Australia/Sydney
- Auckland (NZDT/NZST) - Pacific/Auckland

**And more...**

### Browser Timezone Detection

The form automatically detects the user's browser timezone:

```typescript
import { getBrowserTimezone } from "../utils/timezoneHelper";

const userTimezone = getBrowserTimezone();
// Returns: "America/New_York" (or user's actual timezone)
```

### Timezone Display

Each timezone shows:
- **Label:** Human-readable name (e.g., "Eastern Time (ET)")
- **Offset:** UTC offset (e.g., "UTC-5/-4")

**Example:**
```
Eastern Time (ET) (UTC-5/-4)
Pacific Time (PT) (UTC-8/-7)
```

---

## Next Run Time Calculation

### Algorithm

The system calculates the next run time based on:
1. Current date/time
2. Schedule frequency
3. Configured time of day
4. Day of week/month (if applicable)
5. Timezone

### Daily Schedule

```typescript
// If time hasn't passed today, run today
// Otherwise, run tomorrow at the specified time
```

**Example:**
- Current: Monday 2:00 PM
- Schedule: Daily at 9:00 AM
- Next Run: Tuesday 9:00 AM

### Weekly Schedule

```typescript
// Find next occurrence of the specified day of week
// If that day is today but time has passed, schedule for next week
```

**Example:**
- Current: Monday 2:00 PM
- Schedule: Every Monday at 9:00 AM
- Next Run: Next Monday 9:00 AM (7 days from now)

### Monthly Schedule

```typescript
// Schedule for the specified day of the current month
// If that day has passed, schedule for next month
// Handle "last day of month" special case
```

**Example:**
- Current: January 15th
- Schedule: Monthly on the 1st at 9:00 AM
- Next Run: February 1st 9:00 AM

---

## Schedule Summary Display

### Real-time Preview

The form shows a live preview of:
1. **Schedule Description** - Human-readable schedule
2. **Next Run Time** - Exact date/time of next execution

**Example Display:**
```
Schedule Summary
━━━━━━━━━━━━━━━━
Schedule: Every Monday at 9:00 AM Eastern Time (ET)
Next Run: Monday, January 6, 2025, 9:00 AM EST
```

### Format Functions

```typescript
import {
  formatScheduleDescription,
  calculateNextRunTime,
} from "../utils/timezoneHelper";

// Get human-readable description
const description = formatScheduleDescription(
  "WEEKLY",
  "09:00",
  1, // Monday
  undefined,
  "America/New_York"
);
// Returns: "Every Monday at 9:00 AM Eastern Time (ET)"

// Calculate next run
const nextRun = calculateNextRunTime(
  "WEEKLY",
  "09:00",
  1, // Monday
  undefined,
  "America/New_York"
);
// Returns: Date object for next Monday at 9:00 AM ET
```

---

## Form State Management

### Parent Component Integration

```typescript
import {
  ScheduleConfigurationForm,
  type ScheduleConfig,
} from "../components/ScheduleConfigurationForm";

const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
  frequency: "DAILY",
  timeOfDay: "09:00",
  timezone: "UTC",
});

const handleScheduleChange = (config: ScheduleConfig) => {
  setScheduleConfig(config);
};

<ScheduleConfigurationForm onChange={handleScheduleChange} />
```

### Schedule Config Structure

```typescript
interface ScheduleConfig {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  timeOfDay: string; // HH:MM format
  dayOfWeek?: number; // 0-6 (only for WEEKLY)
  dayOfMonth?: number; // 1-31 or -1 (only for MONTHLY)
  timezone: string; // IANA timezone identifier
}
```

---

## Validation

### Required Fields

All schedule configurations require:
- ✅ Frequency
- ✅ Time of day
- ✅ Timezone

**Additional requirements:**
- Weekly: Day of week
- Monthly: Day of month

### Automatic Validation

The form automatically:
- Shows/hides conditional fields
- Validates required fields
- Prevents invalid configurations
- Updates preview in real-time

---

## Day of Week Options

```typescript
0 - Sunday
1 - Monday
2 - Tuesday
3 - Wednesday
4 - Thursday
5 - Friday
6 - Saturday
```

**Display:**
```
Sunday
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
```

---

## Day of Month Options

**Regular Days:** 1st, 2nd, 3rd, ..., 31st

**Special Option:** Last day of month (-1)

**Ordinal Formatting:**
- 1st, 2nd, 3rd
- 4th, 5th, 6th, ...
- 21st, 22nd, 23rd
- 31st

**Note:** If a month doesn't have the specified day (e.g., February 31st), the report will run on the last available day of that month.

---

## Examples

### Example 1: Daily Morning Report

```typescript
{
  frequency: "DAILY",
  timeOfDay: "08:00",
  timezone: "America/New_York"
}
```

**Result:** Report runs every day at 8:00 AM Eastern Time

---

### Example 2: Weekly Monday Report

```typescript
{
  frequency: "WEEKLY",
  timeOfDay: "09:00",
  dayOfWeek: 1,
  timezone: "America/Los_Angeles"
}
```

**Result:** Report runs every Monday at 9:00 AM Pacific Time

---

### Example 3: Monthly First-of-Month Report

```typescript
{
  frequency: "MONTHLY",
  timeOfDay: "07:00",
  dayOfMonth: 1,
  timezone: "UTC"
}
```

**Result:** Report runs on the 1st of every month at 7:00 AM UTC

---

### Example 4: End-of-Month Report

```typescript
{
  frequency: "MONTHLY",
  timeOfDay: "23:00",
  dayOfMonth: -1,
  timezone: "Europe/London"
}
```

**Result:** Report runs on the last day of every month at 11:00 PM London time

---

## Future Enhancements

### Planned Features

1. **Custom Frequency** - Specify exact intervals (e.g., every 3 days)
2. **Multiple Times** - Run report multiple times per day
3. **Date Range Restrictions** - Only run between specific dates
4. **Holiday Handling** - Skip holidays or run on next business day
5. **Retry Logic** - Automatic retry on failure
6. **Pause/Resume** - Temporarily pause scheduled reports

---

## Testing

### Manual Testing Checklist

- [ ] Daily schedule calculates correct next run
- [ ] Weekly schedule finds correct day of week
- [ ] Monthly schedule handles all days (1-31)
- [ ] Last day of month works correctly
- [ ] Timezone selection updates preview
- [ ] Time selection shows 12-hour format
- [ ] Schedule summary displays correctly
- [ ] Next run time is accurate

---

## Troubleshooting

### Next run time is incorrect

- Verify timezone is set correctly
- Check browser timezone detection
- Ensure time is in HH:MM format
- Validate day of week/month values

### Schedule not showing correctly

- Check frequency value is valid
- Verify all required fields are set
- Ensure conditional fields (dayOfWeek, dayOfMonth) are provided

### Timezone not detected

- Browser may not support Intl API
- Falls back to UTC if detection fails
- User can manually select timezone

---

## Resources

- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Cron Expression Format](https://crontab.guru/) (for future custom schedules)

