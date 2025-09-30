/**
 * ScheduleConfigurationForm Component
 * 
 * Allows users to configure when and how often reports should run
 */

import { useState, useEffect } from "react";
import {
  COMMON_TIMEZONES,
  getBrowserTimezone,
  generateTimeOptions,
  generateDayOfWeekOptions,
  generateDayOfMonthOptions,
  calculateNextRunTime,
  formatScheduleDescription,
} from "../utils/timezoneHelper";

export interface ScheduleConfig {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
}

interface ScheduleConfigurationFormProps {
  initialValues?: Partial<ScheduleConfig>;
  onChange: (config: ScheduleConfig) => void;
}

export function ScheduleConfigurationForm({
  initialValues = {},
  onChange,
}: ScheduleConfigurationFormProps) {
  const [frequency, setFrequency] = useState<ScheduleConfig["frequency"]>(
    initialValues.frequency || "DAILY"
  );
  const [timeOfDay, setTimeOfDay] = useState(
    initialValues.timeOfDay || "09:00"
  );
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(
    initialValues.dayOfWeek !== undefined ? initialValues.dayOfWeek : 1
  );
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(
    initialValues.dayOfMonth !== undefined ? initialValues.dayOfMonth : 1
  );
  const [timezone, setTimezone] = useState(
    initialValues.timezone || getBrowserTimezone()
  );

  const timeOptions = generateTimeOptions();
  const dayOfWeekOptions = generateDayOfWeekOptions();
  const dayOfMonthOptions = generateDayOfMonthOptions();

  // Notify parent of changes
  useEffect(() => {
    const config: ScheduleConfig = {
      frequency,
      timeOfDay,
      timezone,
    };

    if (frequency === "WEEKLY") {
      config.dayOfWeek = dayOfWeek;
    }

    if (frequency === "MONTHLY") {
      config.dayOfMonth = dayOfMonth;
    }

    onChange(config);
  }, [frequency, timeOfDay, dayOfWeek, dayOfMonth, timezone, onChange]);

  // Calculate next run time
  const nextRunTime = calculateNextRunTime(
    frequency,
    timeOfDay,
    dayOfWeek,
    dayOfMonth,
    timezone
  );

  const scheduleDescription = formatScheduleDescription(
    frequency,
    timeOfDay,
    dayOfWeek,
    dayOfMonth,
    timezone
  );

  return (
    <div>
      {/* Frequency Selection */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="frequency">
          <s-text weight="bold">
            Frequency <span style={{ color: "red" }}>*</span>
          </s-text>
        </label>
        <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
          <s-text variant="subdued">How often should this report run?</s-text>
        </div>
        <select
          id="frequency"
          name="frequency"
          value={frequency}
          onChange={(e) =>
            setFrequency(e.target.value as ScheduleConfig["frequency"])
          }
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "var(--s-border-radius-base)",
            border: "1px solid var(--s-color-border)",
            fontSize: "0.875rem",
          }}
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </div>

      {/* Time of Day Selection */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="timeOfDay">
          <s-text weight="bold">
            Time of Day <span style={{ color: "red" }}>*</span>
          </s-text>
        </label>
        <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
          <s-text variant="subdued">What time should the report run?</s-text>
        </div>
        <select
          id="timeOfDay"
          name="timeOfDay"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "var(--s-border-radius-base)",
            border: "1px solid var(--s-color-border)",
            fontSize: "0.875rem",
          }}
        >
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Day of Week (for Weekly) */}
      {frequency === "WEEKLY" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="dayOfWeek">
            <s-text weight="bold">
              Day of Week <span style={{ color: "red" }}>*</span>
            </s-text>
          </label>
          <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
            <s-text variant="subdued">Which day of the week?</s-text>
          </div>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "var(--s-border-radius-base)",
              border: "1px solid var(--s-color-border)",
              fontSize: "0.875rem",
            }}
          >
            {dayOfWeekOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Day of Month (for Monthly) */}
      {frequency === "MONTHLY" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="dayOfMonth">
            <s-text weight="bold">
              Day of Month <span style={{ color: "red" }}>*</span>
            </s-text>
          </label>
          <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
            <s-text variant="subdued">Which day of the month?</s-text>
          </div>
          <select
            id="dayOfMonth"
            name="dayOfMonth"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "var(--s-border-radius-base)",
              border: "1px solid var(--s-color-border)",
              fontSize: "0.875rem",
            }}
          >
            {dayOfMonthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Timezone Selection */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="timezone">
          <s-text weight="bold">
            Timezone <span style={{ color: "red" }}>*</span>
          </s-text>
        </label>
        <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
          <s-text variant="subdued">
            Reports will run according to this timezone
          </s-text>
        </div>
        <select
          id="timezone"
          name="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "var(--s-border-radius-base)",
            border: "1px solid var(--s-color-border)",
            fontSize: "0.875rem",
          }}
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label} ({tz.offset})
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Summary */}
      <div style={{ marginTop: "2rem" }}>
        <s-box
          padding="base"
          borderWidth="base"
          borderRadius="base"
          background="surface-subdued"
        >
          <s-heading level={4}>Schedule Summary</s-heading>
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <s-text weight="bold">Schedule:</s-text>
              <div style={{ marginTop: "0.25rem" }}>
                <s-text>{scheduleDescription}</s-text>
              </div>
            </div>
            <div>
              <s-text weight="bold">Next Run:</s-text>
              <div style={{ marginTop: "0.25rem" }}>
                <s-text>
                  {nextRunTime.toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </s-text>
              </div>
            </div>
          </div>
        </s-box>
      </div>
    </div>
  );
}

