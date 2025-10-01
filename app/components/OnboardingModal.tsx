/**
 * Onboarding Modal Component
 * 
 * Displays a welcome modal for first-time users
 */

import { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function OnboardingModal({ isOpen, onClose, onGetStarted }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Report Flow! 🎉",
      content: (
        <>
          <s-paragraph>
            Automate your Shopify analytics reporting and save hours of manual work every week.
          </s-paragraph>
          <s-paragraph>
            Schedule reports to be generated and emailed to your team automatically - no more manual exports!
          </s-paragraph>
        </>
      ),
      icon: "📊",
    },
    {
      title: "7 Powerful Report Types",
      content: (
        <>
          <s-paragraph>Choose from a variety of report types to track your business:</s-paragraph>
          <s-unordered-list>
            <s-list-item><s-text weight="bold">Sales Reports</s-text> - Track revenue, discounts, and net sales</s-list-item>
            <s-list-item><s-text weight="bold">Orders Reports</s-text> - Monitor order details and fulfillment</s-list-item>
            <s-list-item><s-text weight="bold">Products Reports</s-text> - Analyze product performance</s-list-item>
            <s-list-item><s-text weight="bold">Customers Reports</s-text> - Understand customer behavior</s-list-item>
            <s-list-item><s-text weight="bold">Inventory Reports</s-text> - Track stock levels</s-list-item>
            <s-list-item><s-text weight="bold">Discounts Reports</s-text> - Monitor discount usage</s-list-item>
          </s-unordered-list>
        </>
      ),
      icon: "📈",
    },
    {
      title: "Flexible Scheduling",
      content: (
        <>
          <s-paragraph>Set up reports to run automatically on your schedule:</s-paragraph>
          <s-stack direction="block" gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>📅</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Daily Reports</s-text>
                  <s-text variant="subdued">Get fresh data every morning</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>📆</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Weekly Reports</s-text>
                  <s-text variant="subdued">Perfect for team meetings</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>🗓️</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Monthly Reports</s-text>
                  <s-text variant="subdued">Great for executive summaries</s-text>
                </s-stack>
              </s-stack>
            </s-box>
          </s-stack>
        </>
      ),
      icon: "⏰",
    },
    {
      title: "Powerful Features",
      content: (
        <>
          <s-paragraph>Everything you need to automate your reporting:</s-paragraph>
          <s-stack direction="block" gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>🔍</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Custom Filters</s-text>
                  <s-text variant="subdued">Date ranges, product types, order status, and more</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>👥</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Multiple Recipients</s-text>
                  <s-text variant="subdued">Send reports to your entire team</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>👁️</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Preview Reports</s-text>
                  <s-text variant="subdued">See sample data before scheduling</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>📧</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Email Delivery</s-text>
                  <s-text variant="subdued">CSV files delivered right to your inbox</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>📊</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Execution History</s-text>
                  <s-text variant="subdued">Track when reports were sent and their status</s-text>
                </s-stack>
              </s-stack>
            </s-box>
          </s-stack>
        </>
      ),
      icon: "✨",
    },
    {
      title: "Ready to Get Started?",
      content: (
        <>
          <s-paragraph>
            Creating your first report takes just a few minutes:
          </s-paragraph>
          <s-stack direction="block" gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>1️⃣</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Choose a Report Type</s-text>
                  <s-text variant="subdued">Select from 7 different report types</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>2️⃣</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Configure Filters</s-text>
                  <s-text variant="subdued">Set date ranges and other filters</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>3️⃣</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Preview Your Data</s-text>
                  <s-text variant="subdued">See a sample before scheduling</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>4️⃣</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Set Schedule & Recipients</s-text>
                  <s-text variant="subdued">Choose when and who receives reports</s-text>
                </s-stack>
              </s-stack>
            </s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="surface">
              <s-stack direction="inline" gap="base" alignment="start">
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>✅</div>
                <s-stack direction="block" gap="tight">
                  <s-text weight="bold">Sit Back & Relax</s-text>
                  <s-text variant="subdued">Reports are sent automatically</s-text>
                </s-stack>
              </s-stack>
            </s-box>
          </s-stack>
          <s-paragraph style={{ marginTop: "1rem" }}>
            Let's create your first automated report!
          </s-paragraph>
        </>
      ),
      icon: "🚀",
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onGetStarted();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            {currentStepData.icon}
          </div>
          <s-heading level={2}>{currentStepData.title}</s-heading>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {currentStepData.content}
        </div>

        {/* Progress Indicator */}
        <div style={{ padding: "0 1.5rem" }}>
          <s-stack direction="inline" gap="tight" alignment="center">
            {steps.map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: "4px",
                  backgroundColor: index <= currentStep ? "#008060" : "#e0e0e0",
                  borderRadius: "2px",
                  transition: "background-color 0.3s",
                }}
              />
            ))}
          </s-stack>
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <s-text variant="subdued">
              Step {currentStep + 1} of {steps.length}
            </s-text>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <s-button variant="tertiary" onClick={onClose}>
            Skip for now
          </s-button>
          <s-stack direction="inline" gap="base">
            {!isFirstStep && (
              <s-button variant="secondary" onClick={handlePrevious}>
                Previous
              </s-button>
            )}
            <s-button variant="primary" onClick={handleNext}>
              {isLastStep ? "Create First Report" : "Next"}
            </s-button>
          </s-stack>
        </div>
      </div>
    </div>
  );
}

