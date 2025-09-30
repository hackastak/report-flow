/**
 * EmailRecipientsForm Component
 * 
 * Allows users to add/remove email recipients for scheduled reports
 */

import { useState } from "react";

export interface Recipient {
  email: string;
  name?: string;
}

interface EmailRecipientsFormProps {
  initialRecipients?: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  minRecipients?: number;
}

export function EmailRecipientsForm({
  initialRecipients = [],
  onChange,
  minRecipients = 1,
}: EmailRecipientsFormProps) {
  const [recipients, setRecipients] = useState<Recipient[]>(
    initialRecipients.length > 0 ? initialRecipients : []
  );
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [emailError, setEmailError] = useState("");

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check for duplicate email
  const isDuplicateEmail = (email: string): boolean => {
    return recipients.some(
      (r) => r.email.toLowerCase() === email.toLowerCase()
    );
  };

  // Add new recipient
  const handleAddRecipient = () => {
    // Clear previous error
    setEmailError("");

    // Validate email
    if (!newEmail.trim()) {
      setEmailError("Email address is required");
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (isDuplicateEmail(newEmail)) {
      setEmailError("This email address has already been added");
      return;
    }

    // Add recipient
    const newRecipient: Recipient = {
      email: newEmail.trim(),
      name: newName.trim() || undefined,
    };

    const updatedRecipients = [...recipients, newRecipient];
    setRecipients(updatedRecipients);
    onChange(updatedRecipients);

    // Clear form
    setNewEmail("");
    setNewName("");
  };

  // Remove recipient
  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);
    onChange(updatedRecipients);
  };

  // Clear all recipients
  const handleClearAll = () => {
    setRecipients([]);
    onChange([]);
  };

  // Handle Enter key in email field
  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  // Handle Enter key in name field
  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  return (
    <div>
      {/* Add Recipient Form */}
      <div style={{ marginBottom: "1.5rem" }}>
        <s-heading level={4}>Add Recipients</s-heading>
        <s-text variant="subdued">
          Enter email addresses of people who should receive this report
        </s-text>

        <div style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <s-text-field
              name="recipientEmail"
              label="Email Address"
              value={newEmail}
              onChange={(e: any) => {
                setNewEmail(e.currentTarget.value);
                setEmailError("");
              }}
              onKeyPress={handleEmailKeyPress}
              error={emailError}
              details="Required"
              type="email"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="recipientName">
              <s-text weight="bold">Name (Optional)</s-text>
            </label>
            <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              <s-text variant="subdued">
                Recipient's name for personalized emails
              </s-text>
            </div>
            <input
              type="text"
              id="recipientName"
              name="recipientName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleNameKeyPress}
              placeholder="e.g., John Smith"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "var(--s-border-radius-base)",
                border: "1px solid var(--s-color-border)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          <s-button variant="primary" onClick={handleAddRecipient}>
            Add Recipient
          </s-button>
        </div>
      </div>

      {/* Recipients List */}
      {recipients.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <s-heading level={4}>
              Recipients ({recipients.length})
            </s-heading>
            {recipients.length > 1 && (
              <s-button variant="tertiary" onClick={handleClearAll}>
                Clear All
              </s-button>
            )}
          </div>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    borderRadius: "var(--s-border-radius-base)",
                    border: "1px solid var(--s-color-border)",
                    background: "var(--s-color-surface)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "0.25rem" }}>
                      <s-text weight="bold">{recipient.email}</s-text>
                    </div>
                    {recipient.name && (
                      <div>
                        <s-text variant="subdued">{recipient.name}</s-text>
                      </div>
                    )}
                  </div>
                  <s-button
                    variant="tertiary"
                    onClick={() => handleRemoveRecipient(index)}
                  >
                    Remove
                  </s-button>
                </div>
              ))}
            </div>
          </s-box>

          {/* Validation Warning */}
          {recipients.length < minRecipients && (
            <div style={{ marginTop: "0.5rem" }}>
              <s-banner variant="attention">
                <s-paragraph>
                  At least {minRecipients} recipient
                  {minRecipients !== 1 ? "s are" : " is"} required
                </s-paragraph>
              </s-banner>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {recipients.length === 0 && (
        <div style={{ marginTop: "2rem" }}>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface-subdued"
          >
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                📧
              </div>
              <s-heading level={4}>No Recipients Added</s-heading>
              <div style={{ marginTop: "0.5rem" }}>
                <s-text variant="subdued">
                  Add at least one email address to receive this report
                </s-text>
              </div>
            </div>
          </s-box>
        </div>
      )}

      {/* Summary */}
      {recipients.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="surface-subdued"
          >
            <s-heading level={4}>Email Summary</s-heading>
            <div style={{ marginTop: "0.5rem" }}>
              <s-text>
                This report will be sent to{" "}
                <s-text weight="bold">{recipients.length}</s-text>{" "}
                recipient{recipients.length !== 1 ? "s" : ""}
              </s-text>
            </div>
          </s-box>
        </div>
      )}
    </div>
  );
}

// Export validation function
export function validateRecipients(
  recipients: Recipient[],
  minRecipients: number = 1
): { isValid: boolean; error?: string } {
  if (recipients.length < minRecipients) {
    return {
      isValid: false,
      error: `At least ${minRecipients} recipient${minRecipients !== 1 ? "s are" : " is"} required`,
    };
  }

  // Validate each email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const recipient of recipients) {
    if (!emailRegex.test(recipient.email)) {
      return {
        isValid: false,
        error: `Invalid email address: ${recipient.email}`,
      };
    }
  }

  return { isValid: true };
}

