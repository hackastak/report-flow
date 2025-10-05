/**
 * SMTP Connection Test Script
 * 
 * This script tests your SMTP configuration to ensure emails can be sent
 * Run with: node test-smtp.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER;
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Report Flow';

console.log('🔍 Testing SMTP Configuration...\n');
console.log('Configuration:');
console.log(`  Host: ${SMTP_CONFIG.host}`);
console.log(`  Port: ${SMTP_CONFIG.port}`);
console.log(`  Secure: ${SMTP_CONFIG.secure}`);
console.log(`  User: ${SMTP_CONFIG.auth.user}`);
console.log(`  From: ${FROM_NAME} <${FROM_EMAIL}>\n`);

async function testSMTP() {
  try {
    // Create transporter
    console.log('📧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    // Verify connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: FROM_EMAIL, // Send to yourself for testing
      subject: '✅ Report Flow - SMTP Test Successful',
      text: `This is a test email from Report Flow.

Your SMTP configuration is working correctly!

Configuration Details:
- Host: ${SMTP_CONFIG.host}
- Port: ${SMTP_CONFIG.port}
- From: ${FROM_EMAIL}

You can now use Report Flow to send automated reports.

---
This is an automated test email from Report Flow.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #008060;">✅ Report Flow - SMTP Test Successful</h2>
          <p>This is a test email from Report Flow.</p>
          <p><strong>Your SMTP configuration is working correctly!</strong></p>
          
          <div style="background-color: #f6f6f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li>📧 <strong>Host:</strong> ${SMTP_CONFIG.host}</li>
              <li>🔌 <strong>Port:</strong> ${SMTP_CONFIG.port}</li>
              <li>📤 <strong>From:</strong> ${FROM_EMAIL}</li>
            </ul>
          </div>
          
          <p>You can now use Report Flow to send automated reports.</p>
          
          <hr style="border: none; border-top: 1px solid #e1e3e5; margin: 20px 0;">
          <p style="color: #6d7175; font-size: 12px;">This is an automated test email from Report Flow.</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);
    console.log('🎉 SMTP configuration is working perfectly!');
    console.log(`📬 Check your inbox at: ${FROM_EMAIL}\n`);

  } catch (error) {
    console.error('❌ SMTP Test Failed!\n');
    console.error('Error Details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   - SMTP_USER is correct');
      console.error('   - SMTP_PASSWORD is correct');
      console.error('   - Your SMTP2Go account is active');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection failed. Please check:');
      console.error('   - SMTP_HOST is correct (mail.smtp2go.com)');
      console.error('   - SMTP_PORT is correct (2525)');
      console.error('   - Your firewall allows outbound connections');
    } else {
      console.error('\n💡 Please check your .env file configuration');
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testSMTP();

