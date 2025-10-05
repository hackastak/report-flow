/**
 * FieldSelectionForm Component
 * 
 * Allows users to select which fields to include in their report.
 * Displays all available fields with checkboxes and supports select all/none.
 */

import { useState, useEffect } from "react";
import type { DataField } from "../config/reportTypes";

export interface SelectedField {
  key: string;
  order: number;
}

interface FieldSelectionFormProps {
  availableFields: DataField[];
  initialSelectedFields?: SelectedField[];
  onChange: (selectedFields: SelectedField[]) => void;
}

export function FieldSelectionForm({
  availableFields,
  initialSelectedFields = [],
  onChange,
}: FieldSelectionFormProps) {
  // Initialize selected fields - if none provided, select all by default
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<string>>(() => {
    if (initialSelectedFields.length > 0) {
      return new Set(initialSelectedFields.map(f => f.key));
    }
    // Default: select all fields
    return new Set(availableFields.map(f => f.key));
  });

  // Notify parent of changes
  useEffect(() => {
    const selectedFields: SelectedField[] = availableFields
      .filter(field => selectedFieldKeys.has(field.key))
      .map((field, index) => ({
        key: field.key,
        order: index,
      }));
    onChange(selectedFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldKeys, availableFields]);

  const handleToggleField = (fieldKey: string) => {
    setSelectedFieldKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedFieldKeys(new Set(availableFields.map(f => f.key)));
  };

  const handleSelectNone = () => {
    setSelectedFieldKeys(new Set());
  };

  const selectedCount = selectedFieldKeys.size;
  const totalCount = availableFields.length;

  return (
    <div>
      {/* Header with Select All/None buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--s-color-border)"
      }}>
        <div>
          <s-text weight="bold">
            Select Fields to Include
          </s-text>
          <div style={{ marginTop: "0.25rem" }}>
            <s-text variant="subdued">
              {selectedCount} of {totalCount} fields selected
            </s-text>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <s-button 
            variant="tertiary" 
            onClick={handleSelectAll}
            disabled={selectedCount === totalCount}
          >
            Select All
          </s-button>
          <s-button 
            variant="tertiary" 
            onClick={handleSelectNone}
            disabled={selectedCount === 0}
          >
            Clear All
          </s-button>
        </div>
      </div>

      {/* Warning if no fields selected */}
      {selectedCount === 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <s-banner variant="warning">
            <s-paragraph>
              Please select at least one field to include in your report.
            </s-paragraph>
          </s-banner>
        </div>
      )}

      {/* Field checkboxes */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "0.75rem"
      }}>
        {availableFields.map((field) => {
          const isSelected = selectedFieldKeys.has(field.key);
          return (
            <div
              key={field.key}
              style={{
                padding: "0.75rem",
                border: "1px solid var(--s-color-border)",
                borderRadius: "var(--s-border-radius-base)",
                backgroundColor: isSelected 
                  ? "var(--s-color-bg-surface-selected)" 
                  : "var(--s-color-bg-surface)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => handleToggleField(field.key)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleField(field.key)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: "0.125rem",
                    cursor: "pointer",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "0.25rem" }}>
                    <s-text weight="bold">{field.label}</s-text>
                  </div>
                  <div>
                    <s-text variant="subdued" size="small">
                      Type: {field.type}
                      {field.description && ` • ${field.description}`}
                    </s-text>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div style={{ marginTop: "1rem" }}>
        <s-banner variant="info">
          <s-paragraph>
            Fields will appear in the report in the order shown above. You can customize which data columns are included in your CSV export.
          </s-paragraph>
        </s-banner>
      </div>
    </div>
  );
}

