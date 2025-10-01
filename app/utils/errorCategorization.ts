/**
 * Error Categorization Utility
 * 
 * Categorizes errors and provides troubleshooting tips
 */

export interface ErrorAnalysis {
  category: string;
  troubleshootingTips: string[];
}

/**
 * Categorize error and provide troubleshooting tips
 */
export function categorizeError(errorMessage: string, errorDetails?: string): ErrorAnalysis {
  const lowerError = errorMessage.toLowerCase();
  const lowerDetails = errorDetails?.toLowerCase() || "";

  // Shopify API Errors
  if (
    lowerError.includes("shopify") ||
    lowerError.includes("graphql") ||
    lowerError.includes("api") ||
    lowerError.includes("throttled") ||
    lowerError.includes("rate limit")
  ) {
    if (lowerError.includes("throttled") || lowerError.includes("rate limit")) {
      return {
        category: "Shopify API Rate Limit",
        troubleshootingTips: [
          "Shopify has temporarily rate-limited your requests",
          "The report will automatically retry on the next scheduled run",
          "Consider reducing the frequency of your reports if this happens often",
          "Large date ranges may trigger rate limits - try using smaller date ranges",
        ],
      };
    }

    if (lowerError.includes("authentication") || lowerError.includes("unauthorized")) {
      return {
        category: "Shopify Authentication Error",
        troubleshootingTips: [
          "Your Shopify app connection may have expired",
          "Try reinstalling the app from your Shopify admin",
          "Ensure the app has the required permissions (read_orders, read_products, etc.)",
          "Contact support if the issue persists",
        ],
      };
    }

    if (lowerError.includes("not found") || lowerError.includes("404")) {
      return {
        category: "Shopify Data Not Found",
        troubleshootingTips: [
          "The requested data may not exist in your Shopify store",
          "Check your filter settings to ensure they match available data",
          "Verify your date range includes periods with data",
          "Some data types may not be available for your Shopify plan",
        ],
      };
    }

    return {
      category: "Shopify API Error",
      troubleshootingTips: [
        "There was an issue communicating with Shopify's API",
        "This is usually temporary - the report will retry automatically",
        "Check Shopify's status page if the issue persists: status.shopify.com",
        "Verify your Shopify store is active and accessible",
      ],
    };
  }

  // Data Processing Errors
  if (
    lowerError.includes("process") ||
    lowerError.includes("transform") ||
    lowerError.includes("format") ||
    lowerError.includes("invalid data")
  ) {
    return {
      category: "Data Processing Error",
      troubleshootingTips: [
        "There was an issue processing the data from Shopify",
        "This may be due to unexpected data formats or missing fields",
        "Try running the report with a smaller date range",
        "Preview the report to see if specific filters cause issues",
        "Contact support with the execution ID if this continues",
      ],
    };
  }

  // File Generation Errors
  if (
    lowerError.includes("file") ||
    lowerError.includes("csv") ||
    lowerError.includes("write") ||
    lowerError.includes("disk") ||
    lowerError.includes("storage")
  ) {
    return {
      category: "File Generation Error",
      troubleshootingTips: [
        "There was an issue creating the report file",
        "This may be due to temporary server issues",
        "The report will automatically retry on the next scheduled run",
        "If this persists, contact support - there may be a storage issue",
      ],
    };
  }

  // Email Sending Errors
  if (
    lowerError.includes("email") ||
    lowerError.includes("smtp") ||
    lowerError.includes("mail") ||
    lowerError.includes("recipient")
  ) {
    if (lowerError.includes("invalid") && lowerError.includes("email")) {
      return {
        category: "Invalid Email Address",
        troubleshootingTips: [
          "One or more recipient email addresses are invalid",
          "Check your recipient list and remove any invalid addresses",
          "Ensure all email addresses are properly formatted",
          "Update the report configuration with valid email addresses",
        ],
      };
    }

    return {
      category: "Email Delivery Error",
      troubleshootingTips: [
        "There was an issue sending the report email",
        "This may be due to temporary email server issues",
        "Verify all recipient email addresses are correct",
        "Check your email service configuration",
        "The report was generated successfully but couldn't be delivered",
      ],
    };
  }

  // Configuration Errors
  if (
    lowerError.includes("config") ||
    lowerError.includes("setting") ||
    lowerError.includes("invalid") ||
    lowerError.includes("missing")
  ) {
    return {
      category: "Configuration Error",
      troubleshootingTips: [
        "There's an issue with your report configuration",
        "Review your report settings and filters",
        "Ensure all required fields are filled in",
        "Try creating a new report with similar settings",
        "Contact support if you need help with configuration",
      ],
    };
  }

  // Network/Timeout Errors
  if (
    lowerError.includes("timeout") ||
    lowerError.includes("network") ||
    lowerError.includes("connection") ||
    lowerError.includes("econnrefused") ||
    lowerError.includes("enotfound")
  ) {
    return {
      category: "Network/Timeout Error",
      troubleshootingTips: [
        "The request timed out or couldn't connect to the server",
        "This is usually temporary due to network issues",
        "The report will automatically retry on the next scheduled run",
        "Try reducing your date range if you're querying large amounts of data",
        "Check your internet connection if running manually",
      ],
    };
  }

  // Database Errors
  if (
    lowerError.includes("database") ||
    lowerError.includes("prisma") ||
    lowerError.includes("query") ||
    lowerError.includes("sql")
  ) {
    return {
      category: "Database Error",
      troubleshootingTips: [
        "There was an issue accessing the database",
        "This is usually temporary and will resolve automatically",
        "The report will retry on the next scheduled run",
        "Contact support if this error persists",
      ],
    };
  }

  // Generic/Unknown Errors
  return {
    category: "Unknown Error",
    troubleshootingTips: [
      "An unexpected error occurred during report execution",
      "The report will automatically retry on the next scheduled run",
      "Try running the report manually to see if the issue persists",
      "Preview the report to verify your configuration",
      "Contact support with the execution ID for assistance",
    ],
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(errorMessage: string): string {
  const lowerError = errorMessage.toLowerCase();

  // Shopify API errors
  if (lowerError.includes("throttled") || lowerError.includes("rate limit")) {
    return "Shopify API rate limit exceeded. The report will retry automatically.";
  }

  if (lowerError.includes("authentication") || lowerError.includes("unauthorized")) {
    return "Shopify authentication failed. Please reconnect your store.";
  }

  if (lowerError.includes("not found") || lowerError.includes("404")) {
    return "Requested data not found in Shopify. Check your filters and date range.";
  }

  // Data processing errors
  if (lowerError.includes("process") || lowerError.includes("transform")) {
    return "Failed to process data from Shopify. Try a smaller date range.";
  }

  // File errors
  if (lowerError.includes("file") || lowerError.includes("csv")) {
    return "Failed to generate report file. This is usually temporary.";
  }

  // Email errors
  if (lowerError.includes("email") || lowerError.includes("smtp")) {
    return "Failed to send report email. Check recipient addresses.";
  }

  // Network errors
  if (lowerError.includes("timeout") || lowerError.includes("network")) {
    return "Request timed out. Try reducing your date range.";
  }

  // Return original message if no match
  return errorMessage;
}

