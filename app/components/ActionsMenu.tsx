/**
 * Actions Menu Component
 *
 * A dropdown menu that consolidates multiple action buttons into a single menu.
 * Triggered by an "Actions" button (or "..." button).
 */

import { useState, useRef, useEffect } from "react";
import { MoreVertical, History, Edit, Play, Pause, Trash2 } from "lucide-react";

interface ActionsMenuProps {
  reportId: string;
  reportName: string;
  isActive: boolean;
  onEdit: (reportId: string) => void;
  onRunNow: (reportId: string, reportName: string) => void;
  onToggleActive: (reportId: string, reportName: string, currentStatus: boolean) => void;
  onDelete: (reportId: string) => void;
  onViewHistory: (reportId: string) => void;
  isRunning?: boolean;
  isDeleting?: boolean;
  isToggling?: boolean;
}

export function ActionsMenu({
  reportId,
  reportName,
  isActive,
  onEdit,
  onRunNow,
  onToggleActive,
  onDelete,
  onViewHistory,
  isRunning = false,
  isDeleting = false,
  isToggling = false,
}: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDisabled = isRunning || isDeleting || isToggling;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Actions Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem",
          border: "1px solid var(--s-color-border)",
          borderRadius: "var(--s-border-radius-base)",
          backgroundColor: "var(--s-color-surface)",
          color: "var(--s-color-text)",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
            e.currentTarget.style.borderColor = "var(--s-color-border-emphasis)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--s-color-surface)";
          e.currentTarget.style.borderColor = "var(--s-color-border)";
        }}
        aria-label="Actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical size={18} strokeWidth={2} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: "calc(100% + 0.25rem)",
            right: 0,
            minWidth: "12rem",
            backgroundColor: "white",
            border: "1px solid var(--s-color-border)",
            borderRadius: "var(--s-border-radius-base)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* View History */}
          <button
            onClick={() => handleAction(() => onViewHistory(reportId))}
            disabled={isDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--s-color-text)",
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <History size={16} strokeWidth={2} />
            <span>View History</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => handleAction(() => onEdit(reportId))}
            disabled={isDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--s-color-text)",
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Edit size={16} strokeWidth={2} />
            <span>Edit</span>
          </button>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--s-color-border)",
              margin: "0.25rem 0",
            }}
          />

          {/* Run Now */}
          <button
            onClick={() => handleAction(() => onRunNow(reportId, reportName))}
            disabled={isDisabled || !isActive}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              color: isActive ? "var(--s-color-text)" : "var(--s-color-text-subdued)",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              cursor: isDisabled || !isActive ? "not-allowed" : "pointer",
              opacity: !isActive ? 0.5 : 1,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && isActive) {
                e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Play size={16} strokeWidth={2} />
            <span>{isRunning ? "Running..." : "Run Now"}</span>
          </button>

          {/* Pause/Resume */}
          <button
            onClick={() => handleAction(() => onToggleActive(reportId, reportName, isActive))}
            disabled={isDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--s-color-text)",
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "var(--s-color-surface-subdued)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Pause size={16} strokeWidth={2} />
            <span>{isToggling ? "Updating..." : isActive ? "Pause" : "Resume"}</span>
          </button>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--s-color-border)",
              margin: "0.25rem 0",
            }}
          />

          {/* Delete */}
          <button
            onClick={() => handleAction(() => onDelete(reportId))}
            disabled={isDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--s-color-text-critical)",
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.backgroundColor = "var(--s-color-surface-critical-subdued)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={16} strokeWidth={2} />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

