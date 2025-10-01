/**
 * Email Service
 * 
 * Sends report emails with attachments using nodemailer
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import * as fs from "fs";
import * as path from "path";

export interface SendReportEmailOptions {
  recipients: Array<{ email: string; name?: string | null }>;
  reportName: string;
  reportType: string;
  filePath: string;
  recordCount: number;
  dateRange?: string;
  shopName?: string;
}

export interface SendEmailResult {
  success: boolean;
  emailsSent: number;
  emailsFailed: number;
  errors?: string[];
}

export interface SendErrorNotificationOptions {
  recipients: Array<{ email: string; name?: string | null }>;
  reportName: string;
  reportType: string;
  errorMessage: string;
  errorCategory: string;
  troubleshootingTips: string[];
  executionId: string;
  shopName?: string;
}

/**
 * SMTP Configuration from environment variables
 */
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@reportflow.app";
const FROM_NAME = process.env.SMTP_FROM_NAME || "Report Flow";

/**
 * Create nodemailer transporter
 */
function createTransporter(): Transporter {
  return nodemailer.createTransport(SMTP_CONFIG);
}

/**
 * Send report email to recipients
 */
export async function sendReportEmail(
  options: SendReportEmailOptions
): Promise<SendEmailResult> {
  const { recipients, reportName, reportType, filePath, recordCount, dateRange, shopName } = options;

  let emailsSent = 0;
  let emailsFailed = 0;
  const errors: string[] = [];

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      emailsSent: 0,
      emailsFailed: recipients.length,
      errors: [`Report file not found: ${filePath}`],
    };
  }

  // Create transporter
  const transporter = createTransporter();

  // Get file info
  const fileName = path.basename(filePath);
  const fileStats = fs.statSync(filePath);
  const fileSizeKB = (fileStats.size / 1024).toFixed(2);

  // Send email to each recipient
  for (const recipient of recipients) {
    try {
      const recipientName = recipient.name || recipient.email.split("@")[0];

      // Generate email content
      const htmlContent = generateHTMLEmail({
        recipientName,
        reportName,
        reportType,
        recordCount,
        dateRange,
        shopName,
        fileSizeKB,
      });

      const textContent = generatePlainTextEmail({
        recipientName,
        reportName,
        reportType,
        recordCount,
        dateRange,
        shopName,
        fileSizeKB,
      });

      // Send email
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: recipient.email,
        subject: `${reportName} - ${new Date().toLocaleDateString()}`,
        text: textContent,
        html: htmlContent,
        attachments: [
          {
            filename: fileName,
            path: filePath,
          },
        ],
      });

      emailsSent++;
      console.log(`Email sent successfully to ${recipient.email}`);
    } catch (error) {
      emailsFailed++;
      const errorMessage = `Failed to send email to ${recipient.email}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  return {
    success: emailsSent > 0,
    emailsSent,
    emailsFailed,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Generate HTML email template
 */
function generateHTMLEmail(params: {
  recipientName: string;
  reportName: string;
  reportType: string;
  recordCount: number;
  dateRange?: string;
  shopName?: string;
  fileSizeKB: string;
}): string {
  const { recipientName, reportName, reportType, recordCount, dateRange, shopName, fileSizeKB } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #5c6ac4;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #5c6ac4;
      margin-bottom: 10px;
    }
    h1 {
      color: #202223;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .subtitle {
      color: #6d7175;
      font-size: 14px;
    }
    .content {
      margin: 30px 0;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .report-info {
      background-color: #f9fafb;
      border-left: 4px solid #5c6ac4;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .report-info h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #202223;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e1e3e5;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6d7175;
    }
    .info-value {
      color: #202223;
    }
    .attachment-notice {
      background-color: #fff4e5;
      border: 1px solid #ffc453;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .attachment-notice strong {
      color: #996a13;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e1e3e5;
      text-align: center;
      font-size: 12px;
      color: #6d7175;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #5c6ac4;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📊 Report Flow</div>
      <h1>${reportName}</h1>
      <div class="subtitle">Automated Report Delivery</div>
    </div>

    <div class="content">
      <div class="greeting">
        Hi ${recipientName},
      </div>

      <p>Your scheduled report is ready! Please find the details below:</p>

      <div class="report-info">
        <h2>Report Summary</h2>
        <div class="info-row">
          <span class="info-label">Report Name:</span>
          <span class="info-value">${reportName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Report Type:</span>
          <span class="info-value">${reportType}</span>
        </div>
        ${dateRange ? `
        <div class="info-row">
          <span class="info-label">Date Range:</span>
          <span class="info-value">${dateRange}</span>
        </div>
        ` : ''}
        ${shopName ? `
        <div class="info-row">
          <span class="info-label">Store:</span>
          <span class="info-value">${shopName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Records:</span>
          <span class="info-value">${recordCount.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">File Size:</span>
          <span class="info-value">${fileSizeKB} KB</span>
        </div>
        <div class="info-row">
          <span class="info-label">Generated:</span>
          <span class="info-value">${new Date().toLocaleString()}</span>
        </div>
      </div>

      <div class="attachment-notice">
        <strong>📎 Attachment:</strong> The report is attached to this email as a CSV file. You can open it with Excel, Google Sheets, or any spreadsheet application.
      </div>

      <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>

      <p>Best regards,<br>The Report Flow Team</p>
    </div>

    <div class="footer">
      <p>This is an automated email from Report Flow.</p>
      <p>© ${new Date().getFullYear()} Report Flow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template
 */
function generatePlainTextEmail(params: {
  recipientName: string;
  reportName: string;
  reportType: string;
  recordCount: number;
  dateRange?: string;
  shopName?: string;
  fileSizeKB: string;
}): string {
  const { recipientName, reportName, reportType, recordCount, dateRange, shopName, fileSizeKB } = params;

  return `
Hi ${recipientName},

Your scheduled report is ready!

REPORT SUMMARY
==============

Report Name: ${reportName}
Report Type: ${reportType}
${dateRange ? `Date Range: ${dateRange}` : ''}
${shopName ? `Store: ${shopName}` : ''}
Records: ${recordCount.toLocaleString()}
File Size: ${fileSizeKB} KB
Generated: ${new Date().toLocaleString()}

ATTACHMENT
==========

The report is attached to this email as a CSV file. You can open it with Excel, Google Sheets, or any spreadsheet application.

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
The Report Flow Team

---
This is an automated email from Report Flow.
© ${new Date().getFullYear()} Report Flow. All rights reserved.
  `.trim();
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send error notification email to recipients
 */
export async function sendErrorNotification(
  options: SendErrorNotificationOptions
): Promise<SendEmailResult> {
  const {
    recipients,
    reportName,
    reportType,
    errorMessage,
    errorCategory,
    troubleshootingTips,
    executionId,
    shopName,
  } = options;

  let emailsSent = 0;
  let emailsFailed = 0;
  const errors: string[] = [];

  // Create transporter
  const transporter = createTransporter();

  console.log(`[Email Service] Sending error notification for report: ${reportName}`);

  // Send email to each recipient
  for (const recipient of recipients) {
    try {
      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: recipient.email,
        subject: `⚠️ Report Failed: ${reportName}`,
        text: generateErrorNotificationPlainText(options),
        html: generateErrorNotificationHTML(options),
      };

      await transporter.sendMail(mailOptions);
      emailsSent++;
      console.log(`[Email Service] Error notification sent to: ${recipient.email}`);
    } catch (error) {
      emailsFailed++;
      const errorMsg = `Failed to send error notification to ${recipient.email}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      errors.push(errorMsg);
      console.error(`[Email Service] ${errorMsg}`);
    }
  }

  const success = emailsSent > 0;

  console.log(
    `[Email Service] Error notification complete. Sent: ${emailsSent}, Failed: ${emailsFailed}`
  );

  return {
    success,
    emailsSent,
    emailsFailed,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Generate HTML email for error notification
 */
function generateErrorNotificationHTML(options: SendErrorNotificationOptions): string {
  const {
    reportName,
    reportType,
    errorMessage,
    errorCategory,
    troubleshootingTips,
    executionId,
    shopName,
  } = options;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Execution Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e74c3c;
    }
    .header h1 {
      color: #e74c3c;
      margin: 0;
      font-size: 24px;
    }
    .alert-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 20px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #e74c3c;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin-top: 0;
      color: #e74c3c;
      font-size: 16px;
    }
    .info-box p {
      margin: 5px 0;
      color: #666;
    }
    .troubleshooting {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .troubleshooting h3 {
      margin-top: 0;
      color: #856404;
      font-size: 16px;
    }
    .troubleshooting ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .troubleshooting li {
      margin: 8px 0;
      color: #856404;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .details {
      font-size: 14px;
      color: #666;
    }
    .details strong {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="alert-icon">⚠️</div>
      <h1>Report Execution Failed</h1>
    </div>

    <div class="content">
      <p>Hello,</p>

      <p>We're writing to inform you that your scheduled report <strong>"${reportName}"</strong> failed to execute.</p>

      <div class="info-box">
        <h3>Error Details</h3>
        <p class="details"><strong>Report Name:</strong> ${reportName}</p>
        <p class="details"><strong>Report Type:</strong> ${reportType}</p>
        <p class="details"><strong>Error Category:</strong> ${errorCategory}</p>
        <p class="details"><strong>Error Message:</strong> ${errorMessage}</p>
        <p class="details"><strong>Execution ID:</strong> ${executionId}</p>
        ${shopName ? `<p class="details"><strong>Shop:</strong> ${shopName}</p>` : ""}
      </div>

      ${
        troubleshootingTips.length > 0
          ? `
      <div class="troubleshooting">
        <h3>💡 Troubleshooting Tips</h3>
        <ul>
          ${troubleshootingTips.map((tip) => `<li>${tip}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>The report will automatically retry on its next scheduled run</li>
        <li>You can manually run the report from the dashboard to test</li>
        <li>Check the report history for more details</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.SHOPIFY_APP_URL || ""}/app/reports/scheduled" class="button">
          View Report Dashboard
        </a>
      </div>

      <p>If this issue persists, please contact support or review your report configuration.</p>
    </div>

    <div class="footer">
      <p>This is an automated notification from Report Flow.</p>
      <p>© ${new Date().getFullYear()} Report Flow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for error notification
 */
function generateErrorNotificationPlainText(options: SendErrorNotificationOptions): string {
  const {
    reportName,
    reportType,
    errorMessage,
    errorCategory,
    troubleshootingTips,
    executionId,
    shopName,
  } = options;

  return `
⚠️ REPORT EXECUTION FAILED

Hello,

We're writing to inform you that your scheduled report "${reportName}" failed to execute.

ERROR DETAILS
─────────────────────────────────────────
Report Name: ${reportName}
Report Type: ${reportType}
Error Category: ${errorCategory}
Error Message: ${errorMessage}
Execution ID: ${executionId}
${shopName ? `Shop: ${shopName}` : ""}

${
  troubleshootingTips.length > 0
    ? `
TROUBLESHOOTING TIPS
─────────────────────────────────────────
${troubleshootingTips.map((tip, index) => `${index + 1}. ${tip}`).join("\n")}
`
    : ""
}

WHAT HAPPENS NEXT?
─────────────────────────────────────────
• The report will automatically retry on its next scheduled run
• You can manually run the report from the dashboard to test
• Check the report history for more details

View your report dashboard:
${process.env.SHOPIFY_APP_URL || ""}/app/reports/scheduled

If this issue persists, please contact support or review your report configuration.

---
This is an automated notification from Report Flow.
© ${new Date().getFullYear()} Report Flow. All rights reserved.
  `.trim();
}

