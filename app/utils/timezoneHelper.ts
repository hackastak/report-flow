/**
 * Timezone Helper Utilities
 * 
 * Provides timezone options and utilities for scheduling
 */

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

/**
 * Common timezones for scheduling
 * Organized by region for better UX
 */
export const COMMON_TIMEZONES: TimezoneOption[] = [
  // North America
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5/-4" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6/-5" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7/-6" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8/-7" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9/-8" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)", offset: "UTC-10" },
  
  // Europe
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/+1" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", offset: "UTC+1/+2" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", offset: "UTC+1/+2" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)", offset: "UTC+1/+2" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)", offset: "UTC+1/+2" },
  { value: "Europe/Athens", label: "Athens (EET/EEST)", offset: "UTC+2/+3" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: "UTC+3" },
  
  // Asia
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Shanghai", label: "China (CST)", offset: "UTC+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "UTC+8" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: "UTC+9" },
  
  // Australia & Pacific
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", offset: "UTC+10/+11" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)", offset: "UTC+10/+11" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)", offset: "UTC+10" },
  { value: "Australia/Perth", label: "Perth (AWST)", offset: "UTC+8" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", offset: "UTC+12/+13" },
  
  // South America
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", offset: "UTC-3" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)", offset: "UTC-3" },
  { value: "America/Santiago", label: "Santiago (CLT)", offset: "UTC-3/-4" },
  
  // Africa
  { value: "Africa/Cairo", label: "Cairo (EET)", offset: "UTC+2" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", offset: "UTC+2" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", offset: "UTC+1" },
  
  // UTC
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "UTC+0" },
];

/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return "UTC";
  }
}

/**
 * Get timezone label by value
 */
export function getTimezoneLabel(timezone: string): string {
  const tz = COMMON_TIMEZONES.find((t) => t.value === timezone);
  return tz ? tz.label : timezone;
}

/**
 * Format time for display (HH:MM to 12-hour format)
 */
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get day of week name
 */
export function getDayOfWeekName(day: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day] || "";
}

/**
 * Get ordinal suffix for day of month
 */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Format day of month with ordinal
 */
export function formatDayOfMonth(day: number): string {
  return `${day}${getOrdinalSuffix(day)}`;
}

/**
 * Generate time options for select (every 30 minutes)
 */
export function generateTimeOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const label = formatTimeDisplay(value);
      options.push({ value, label });
    }
  }
  
  return options;
}

/**
 * Generate day of week options
 */
export function generateDayOfWeekOptions(): Array<{
  value: number;
  label: string;
}> {
  return [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];
}

/**
 * Generate day of month options (1-31)
 */
export function generateDayOfMonthOptions(): Array<{
  value: number;
  label: string;
}> {
  const options: Array<{ value: number; label: string }> = [];
  
  for (let day = 1; day <= 31; day++) {
    options.push({
      value: day,
      label: formatDayOfMonth(day),
    });
  }
  
  // Add "Last day of month" option
  options.push({
    value: -1,
    label: "Last day of month",
  });
  
  return options;
}

/**
 * Calculate next run time based on schedule
 */
export function calculateNextRunTime(
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
      // If time has passed today, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case "WEEKLY":
      if (dayOfWeek !== undefined) {
        // Find next occurrence of the specified day
        const currentDay = nextRun.getDay();
        let daysUntilTarget = dayOfWeek - currentDay;
        
        if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      }
      break;
      
    case "MONTHLY":
      if (dayOfMonth !== undefined) {
        if (dayOfMonth === -1) {
          // Last day of month
          nextRun.setMonth(nextRun.getMonth() + 1, 0);
        } else {
          nextRun.setDate(dayOfMonth);
          
          // If date has passed this month, move to next month
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
      }
      break;
  }
  
  return nextRun;
}

/**
 * Format schedule description for display
 */
export function formatScheduleDescription(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number,
  dayOfMonth?: number,
  timezone?: string
): string {
  const time = formatTimeDisplay(timeOfDay);
  const tz = timezone ? getTimezoneLabel(timezone) : "";
  
  switch (frequency) {
    case "DAILY":
      return `Daily at ${time} ${tz}`;
      
    case "WEEKLY":
      if (dayOfWeek !== undefined) {
        const day = getDayOfWeekName(dayOfWeek);
        return `Every ${day} at ${time} ${tz}`;
      }
      return `Weekly at ${time} ${tz}`;
      
    case "MONTHLY":
      if (dayOfMonth !== undefined) {
        const day =
          dayOfMonth === -1 ? "last day" : formatDayOfMonth(dayOfMonth);
        return `Monthly on the ${day} at ${time} ${tz}`;
      }
      return `Monthly at ${time} ${tz}`;
      
    default:
      return `${frequency} at ${time} ${tz}`;
  }
}

