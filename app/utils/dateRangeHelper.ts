/**
 * Date Range Helper Utilities
 *
 * Provides functions to calculate date ranges for reports
 * based on predefined types (TODAY, LAST_7_DAYS, etc.)
 *
 * NOTE: All date calculations use UTC to ensure consistency with Shopify's API
 */

import {
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import type { DateRangeType } from "../config/reportTypes";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Get start of day in UTC
 */
function startOfDayUTC(date: Date): Date {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
  return utcDate;
}

/**
 * Get end of day in UTC
 */
function endOfDayUTC(date: Date): Date {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));
  return utcDate;
}

/**
 * Calculate date range based on DateRangeType
 * All dates are calculated in UTC to match Shopify's API expectations
 */
export function calculateDateRange(
  rangeType: DateRangeType,
  customStart?: Date,
  customEnd?: Date
): DateRange {
  const now = new Date();

  switch (rangeType) {
    case "TODAY":
      return {
        startDate: startOfDayUTC(now),
        endDate: endOfDayUTC(now),
      };

    case "YESTERDAY":
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDayUTC(yesterday),
        endDate: endOfDayUTC(yesterday),
      };

    case "LAST_7_DAYS":
      return {
        startDate: startOfDayUTC(subDays(now, 6)),
        endDate: endOfDayUTC(now),
      };

    case "LAST_30_DAYS":
      return {
        startDate: startOfDayUTC(subDays(now, 29)),
        endDate: endOfDayUTC(now),
      };

    case "LAST_90_DAYS":
      return {
        startDate: startOfDayUTC(subDays(now, 89)),
        endDate: endOfDayUTC(now),
      };

    case "THIS_MONTH":
      return {
        startDate: startOfDayUTC(startOfMonth(now)),
        endDate: endOfDayUTC(now),
      };

    case "LAST_MONTH":
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfDayUTC(startOfMonth(lastMonth)),
        endDate: endOfDayUTC(endOfMonth(lastMonth)),
      };

    case "THIS_QUARTER":
      return {
        startDate: startOfDayUTC(startOfQuarter(now)),
        endDate: endOfDayUTC(now),
      };

    case "LAST_QUARTER":
      const lastQuarter = subQuarters(now, 1);
      return {
        startDate: startOfDayUTC(startOfQuarter(lastQuarter)),
        endDate: endOfDayUTC(endOfQuarter(lastQuarter)),
      };

    case "THIS_YEAR":
      return {
        startDate: startOfDayUTC(startOfYear(now)),
        endDate: endOfDayUTC(now),
      };

    case "LAST_YEAR":
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfDayUTC(startOfYear(lastYear)),
        endDate: endOfDayUTC(endOfYear(lastYear)),
      };

    case "CUSTOM":
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires startDate and endDate");
      }
      return {
        startDate: startOfDayUTC(customStart),
        endDate: endOfDayUTC(customEnd),
      };

    default:
      // Default to last 30 days
      return {
        startDate: startOfDayUTC(subDays(now, 29)),
        endDate: endOfDayUTC(now),
      };
  }
}

/**
 * Format date range for display
 */
export function formatDateRangeForDisplay(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const startStr = range.startDate.toLocaleDateString("en-US", options);
  const endStr = range.endDate.toLocaleDateString("en-US", options);

  return `${startStr} - ${endStr}`;
}

/**
 * Format date range for GraphQL query (ISO 8601)
 */
export function formatDateRangeForQuery(range: DateRange): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
  };
}

/**
 * Get the number of days in a date range
 */
export function getDaysInRange(range: DateRange): number {
  const diffTime = Math.abs(range.endDate.getTime() - range.startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

/**
 * Check if a date range is valid
 */
export function isValidDateRange(range: DateRange): boolean {
  return range.startDate <= range.endDate;
}

/**
 * Get a human-readable description of the date range type
 */
export function getDateRangeDescription(rangeType: DateRangeType): string {
  const descriptions: Record<DateRangeType, string> = {
    TODAY: "Today's data",
    YESTERDAY: "Yesterday's data",
    LAST_7_DAYS: "Last 7 days",
    LAST_30_DAYS: "Last 30 days",
    LAST_90_DAYS: "Last 90 days",
    THIS_MONTH: "This month to date",
    LAST_MONTH: "Last month",
    THIS_QUARTER: "This quarter to date",
    LAST_QUARTER: "Last quarter",
    THIS_YEAR: "This year to date",
    LAST_YEAR: "Last year",
    CUSTOM: "Custom date range",
  };

  return descriptions[rangeType];
}

