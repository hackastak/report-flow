/**
 * CustomFieldSelectionForm Component
 * 
 * Allows users to select a data source and then choose from all available
 * fields for that data source when creating a custom report.
 */

import { useState, useEffect } from "react";
import type { DataSource, CustomReportField } from "../config/customReportFields";
import { 
  getFieldsBySource, 
  getCategoriesBySource 
} from "../config/customReportFields";
import type { SelectedField } from "./FieldSelectionForm";

interface CustomFieldSelectionFormProps {
  dataSource: DataSource;
  initialSelectedFields?: SelectedField[];
  onChange: (selectedFields: SelectedField[]) => void;
}

export function CustomFieldSelectionForm({
  dataSource,
  initialSelectedFields = [],
  onChange,
}: CustomFieldSelectionFormProps) {
  const availableFields = getFieldsBySource(dataSource);
  const categories = getCategoriesBySource(dataSource);
  
  // Initialize selected fields - if none provided, select none by default for custom reports
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<string>>(() => {
    if (initialSelectedFields.length > 0) {
      return new Set(initialSelectedFields.map(f => f.key));
    }
    return new Set();
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories)
  );

  // Notify parent of changes
  useEffect(() => {
    const selectedFields: SelectedField[] = availableFields
      .filter(field => selectedFieldKeys.has(field.key))
      .map((field, index) => ({
        key: field.key,
        order: index,
      }));
    onChange(selectedFields);
  }, [selectedFieldKeys, availableFields, onChange]);

  const handleFieldToggle = (fieldKey: string) => {
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

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (category: string) => {
    const categoryFields = availableFields.filter(f => f.category === category);
    const allSelected = categoryFields.every(f => selectedFieldKeys.has(f.key));
    
    setSelectedFieldKeys(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in category
        categoryFields.forEach(f => newSet.delete(f.key));
      } else {
        // Select all in category
        categoryFields.forEach(f => newSet.add(f.key));
      }
      return newSet;
    });
  };

  const selectedCount = selectedFieldKeys.size;
  const totalCount = availableFields.length;

  // Group fields by category
  const fieldsByCategory = categories.reduce((acc, category) => {
    acc[category] = availableFields.filter(f => f.category === category);
    return acc;
  }, {} as Record<string, CustomReportField[]>);

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
              Please select at least one field to include in your custom report.
            </s-paragraph>
          </s-banner>
        </div>
      )}

      {/* Info banner about data source */}
      <div style={{ marginBottom: "1rem" }}>
        <s-banner variant="info">
          <s-paragraph>
            Showing all available fields for <strong>{dataSource}</strong> data source. 
            Fields are organized by category for easier selection.
          </s-paragraph>
        </s-banner>
      </div>

      {/* Fields organized by category */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {categories.map((category) => {
          const categoryFields = fieldsByCategory[category] || [];
          const isExpanded = expandedCategories.has(category);
          const selectedInCategory = categoryFields.filter(f => selectedFieldKeys.has(f.key)).length;
          const allSelected = selectedInCategory === categoryFields.length;
          
          return (
            <div
              key={category}
              style={{
                border: "1px solid var(--s-color-border)",
                borderRadius: "var(--s-border-radius-base)",
                overflow: "hidden",
              }}
            >
              {/* Category Header */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--s-color-bg-surface-secondary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => handleCategoryToggle(category)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {isExpanded ? "▼" : "▶"}
                  </span>
                  <s-text weight="bold">{category}</s-text>
                  <s-badge variant={selectedInCategory > 0 ? "success" : "default"}>
                    {selectedInCategory} / {categoryFields.length}
                  </s-badge>
                </div>
                <s-button
                  variant="tertiary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleSelectCategory(category);
                  }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </s-button>
              </div>

              {/* Category Fields */}
              {isExpanded && (
                <div style={{ 
                  padding: "1rem",
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "0.75rem"
                }}>
                  {categoryFields.map((field) => {
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
                        onClick={() => handleFieldToggle(field.key)}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFieldToggle(field.key)}
                            style={{ marginTop: "0.25rem", cursor: "pointer" }}
                          />
                          <div style={{ flex: 1 }}>
                            <s-text weight="bold">{field.label}</s-text>
                            <div style={{ marginTop: "0.25rem" }}>
                              <s-badge variant="default">{field.type}</s-badge>
                            </div>
                            {field.description && (
                              <div style={{ marginTop: "0.25rem" }}>
                                <s-text variant="subdued" size="small">
                                  {field.description}
                                </s-text>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

