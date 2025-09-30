/**
 * FilterField Component
 * 
 * Renders different filter input types based on the filter configuration
 */

import { useState } from "react";
import type { FilterOption } from "../config/reportTypes";

interface FilterFieldProps {
  filter: FilterOption;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
}

export function FilterField({ filter, value, onChange, error }: FilterFieldProps) {
  const handleChange = (newValue: any) => {
    onChange(filter.key, newValue);
  };

  switch (filter.type) {
    case "select":
      return (
        <SelectFilter
          filter={filter}
          value={value}
          onChange={handleChange}
          error={error}
        />
      );

    case "multiselect":
      return (
        <MultiSelectFilter
          filter={filter}
          value={value}
          onChange={handleChange}
          error={error}
        />
      );

    case "text":
      return (
        <TextFilter
          filter={filter}
          value={value}
          onChange={handleChange}
          error={error}
        />
      );

    case "date":
      return (
        <DateFilter
          filter={filter}
          value={value}
          onChange={handleChange}
          error={error}
        />
      );

    default:
      return null;
  }
}

// Select Filter (Single Selection)
function SelectFilter({ filter, value, onChange, error }: FilterFieldProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={filter.key}>
        <s-text weight="bold">
          {filter.label}
          {filter.required && <span style={{ color: "red" }}> *</span>}
        </s-text>
      </label>
      {filter.description && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued">{filter.description}</s-text>
        </div>
      )}
      <select
        id={filter.key}
        name={filter.key}
        value={value || filter.defaultValue || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginTop: "0.5rem",
          borderRadius: "var(--s-border-radius-base)",
          border: error
            ? "1px solid var(--s-color-border-critical)"
            : "1px solid var(--s-color-border)",
          fontSize: "0.875rem",
        }}
      >
        {!filter.required && <option value="">Select an option</option>}
        {filter.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued" style={{ color: "var(--s-color-text-critical)" }}>
            {error}
          </s-text>
        </div>
      )}
    </div>
  );
}

// Multi-Select Filter (Multiple Selections)
function MultiSelectFilter({ filter, value, onChange, error }: FilterFieldProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : []
  );

  const handleToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newValues);
    onChange(newValues);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>
        <s-text weight="bold">
          {filter.label}
          {filter.required && <span style={{ color: "red" }}> *</span>}
        </s-text>
      </label>
      {filter.description && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued">{filter.description}</s-text>
        </div>
      )}
      <div
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem",
          border: error
            ? "1px solid var(--s-color-border-critical)"
            : "1px solid var(--s-color-border)",
          borderRadius: "var(--s-border-radius-base)",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        {filter.options?.map((option) => (
          <div
            key={option.value}
            style={{
              padding: "0.5rem",
              cursor: "pointer",
              borderRadius: "var(--s-border-radius-base)",
              marginBottom: "0.25rem",
            }}
            onClick={() => handleToggle(option.value)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--s-color-surface-subdued)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
            }}
          >
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                style={{ marginRight: "0.5rem" }}
              />
              <s-text>{option.label}</s-text>
            </label>
          </div>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <s-stack direction="inline" gap="tight">
            {selectedValues.map((val) => {
              const option = filter.options?.find((o) => o.value === val);
              return (
                <s-badge key={val} variant="info">
                  {option?.label || val}
                </s-badge>
              );
            })}
          </s-stack>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued" style={{ color: "var(--s-color-text-critical)" }}>
            {error}
          </s-text>
        </div>
      )}
    </div>
  );
}

// Text Filter
function TextFilter({ filter, value, onChange, error }: FilterFieldProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <s-text-field
        name={filter.key}
        label={filter.label}
        value={value || ""}
        onChange={(e: any) => onChange(e.currentTarget.value)}
        error={error}
        details={filter.description}
      />
    </div>
  );
}

// Date Filter
function DateFilter({ filter, value, onChange, error }: FilterFieldProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={filter.key}>
        <s-text weight="bold">
          {filter.label}
          {filter.required && <span style={{ color: "red" }}> *</span>}
        </s-text>
      </label>
      {filter.description && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued">{filter.description}</s-text>
        </div>
      )}
      <input
        type="date"
        id={filter.key}
        name={filter.key}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginTop: "0.5rem",
          borderRadius: "var(--s-border-radius-base)",
          border: error
            ? "1px solid var(--s-color-border-critical)"
            : "1px solid var(--s-color-border)",
          fontSize: "0.875rem",
        }}
      />
      {error && (
        <div style={{ marginTop: "0.25rem" }}>
          <s-text variant="subdued" style={{ color: "var(--s-color-text-critical)" }}>
            {error}
          </s-text>
        </div>
      )}
    </div>
  );
}

