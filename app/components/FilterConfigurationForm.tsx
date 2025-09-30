/**
 * FilterConfigurationForm Component
 * 
 * Dynamic form that renders filters based on report type configuration
 */

import { useState, useEffect } from "react";
import type { ReportTypeConfig } from "../config/reportTypes";
import { FilterField } from "./FilterField";

interface FilterConfigurationFormProps {
  reportConfig: ReportTypeConfig;
  initialValues?: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}

export function FilterConfigurationForm({
  reportConfig,
  initialValues = {},
  onChange,
}: FilterConfigurationFormProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    // Initialize with default values from config
    const defaults: Record<string, any> = {};
    
    reportConfig.filters.forEach((filter) => {
      if (initialValues[filter.key] !== undefined) {
        defaults[filter.key] = initialValues[filter.key];
      } else if (filter.defaultValue !== undefined) {
        defaults[filter.key] = filter.defaultValue;
      } else if (reportConfig.defaultFilters?.[filter.key] !== undefined) {
        defaults[filter.key] = reportConfig.defaultFilters[filter.key];
      }
    });

    return defaults;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Notify parent of changes
  useEffect(() => {
    onChange(filterValues);
  }, [filterValues, onChange]);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateFilters = (): boolean => {
    const newErrors: Record<string, string> = {};

    reportConfig.filters.forEach((filter) => {
      if (filter.required) {
        const value = filterValues[filter.key];
        
        if (value === undefined || value === null || value === "") {
          newErrors[filter.key] = `${filter.label} is required`;
        } else if (Array.isArray(value) && value.length === 0) {
          newErrors[filter.key] = `Please select at least one ${filter.label.toLowerCase()}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Group filters by category if needed (for now, show all in order)
  const requiredFilters = reportConfig.filters.filter((f) => f.required);
  const optionalFilters = reportConfig.filters.filter((f) => !f.required);

  return (
    <div>
      {/* Required Filters Section */}
      {requiredFilters.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <s-heading level={3}>Required Filters</s-heading>
          <div style={{ marginTop: "1rem" }}>
            {requiredFilters.map((filter) => (
              <FilterField
                key={filter.key}
                filter={filter}
                value={filterValues[filter.key]}
                onChange={handleFilterChange}
                error={errors[filter.key]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Filters Section */}
      {optionalFilters.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <s-heading level={3}>Optional Filters</s-heading>
          <s-text variant="subdued">
            Refine your report with additional filters
          </s-text>
          <div style={{ marginTop: "1rem" }}>
            {optionalFilters.map((filter) => (
              <FilterField
                key={filter.key}
                filter={filter}
                value={filterValues[filter.key]}
                onChange={handleFilterChange}
                error={errors[filter.key]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {Object.keys(filterValues).length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface-subdued"
          >
            <s-heading level={4}>Active Filters Summary</s-heading>
            <div style={{ marginTop: "0.5rem" }}>
              {reportConfig.filters.map((filter) => {
                const value = filterValues[filter.key];
                if (value === undefined || value === null || value === "") {
                  return null;
                }

                let displayValue: string;
                if (Array.isArray(value)) {
                  if (value.length === 0) return null;
                  const labels = value
                    .map((v) => filter.options?.find((o) => o.value === v)?.label || v)
                    .join(", ");
                  displayValue = labels;
                } else {
                  const option = filter.options?.find((o) => o.value === value);
                  displayValue = option?.label || value;
                }

                return (
                  <div
                    key={filter.key}
                    style={{
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--s-color-border)",
                    }}
                  >
                    <s-stack direction="inline" gap="tight" alignment="space-between">
                      <s-text weight="bold">{filter.label}:</s-text>
                      <s-text>{displayValue}</s-text>
                    </s-stack>
                  </div>
                );
              })}
            </div>
          </s-box>
        </div>
      )}
    </div>
  );
}

// Export validation function for use in parent components
export function validateFilterConfiguration(
  reportConfig: ReportTypeConfig,
  filterValues: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  reportConfig.filters.forEach((filter) => {
    if (filter.required) {
      const value = filterValues[filter.key];
      
      if (value === undefined || value === null || value === "") {
        errors[filter.key] = `${filter.label} is required`;
      } else if (Array.isArray(value) && value.length === 0) {
        errors[filter.key] = `Please select at least one ${filter.label.toLowerCase()}`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

