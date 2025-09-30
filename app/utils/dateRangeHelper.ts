/**
 * Date Range Helper Utilities
 * 
 * Provides functions to calculate date ranges for reports
 * based on predefined types (TODAY, LAST_7_DAYS, etc.)
 */

import {
  startOfDay,
  endOfDay,
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
 * Calculate date range based on DateRangeType
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
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };

    case "YESTERDAY":
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };

    case "LAST_7_DAYS":
      return {
        startDate: startOfDay(subDays(now, 6)),
        endDate: endOfDay(now),
      };

    case "LAST_30_DAYS":
      return {
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now),
      };

    case "LAST_90_DAYS":
      return {
        startDate: startOfDay(subDays(now, 89)),
        endDate: endOfDay(now),
      };

    case "THIS_MONTH":
      return {
        startDate: startOfMonth(now),
        endDate: endOfDay(now),
      };

    case "LAST_MONTH":
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      };

    case "THIS_QUARTER":
      return {
        startDate: startOfQuarter(now),
        endDate: endOfDay(now),
      };

    case "LAST_QUARTER":
      const lastQuarter = subQuarters(now, 1);
      return {
        startDate: startOfQuarter(lastQuarter),
        endDate: endOfQuarter(lastQuarter),
      };

    case "THIS_YEAR":
      return {
        startDate: startOfYear(now),
        endDate: endOfDay(now),
      };

    case "LAST_YEAR":
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      };

    case "CUSTOM":
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires startDate and endDate");
      }
      return {
        startDate: startOfDay(customStart),
        endDate: endOfDay(customEnd),
      };

    default:
      // Default to last 30 days
      return {
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now),
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

