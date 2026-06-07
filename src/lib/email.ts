import { BrevoClient } from '@getbrevo/brevo';

// Initialize Brevo client
let brevoClient: BrevoClient | null = null;

if (process.env.BREVO_API_KEY) {
  brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    console.log('Attempting to send email to:', to);
    console.log('API Key configured:', !!process.env.BREVO_API_KEY);

    if (!process.env.BREVO_API_KEY || !brevoClient) {
      console.error('Brevo API key not configured or client not initialized');
      return false;
    }

    const emailData = {
      to: [{ email: to }],
      sender: {
        name: process.env.EMAIL_FROM_NAME || 'Coindexy',
        email: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'
      },
      subject: subject,
      htmlContent: html,
      ...(text && { textContent: text })
    };

    const result = await brevoClient.transactionalEmails.sendTransacEmail(emailData);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

  const subject = 'Verify your email address - Coindexy';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #1f2937; font-size: 24px; font-weight: bold; margin-top: 12px; }
        .title { color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
        .message { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background-color: #1d4ed8; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.png" alt="Coindexy" width="64" height="64" style="display:block;margin:0 auto;border-radius:12px;" />
          <div class="logo">Coindexy</div>
        </div>

        <h1 class="title">Verify Your Email Address</h1>

        <p class="message">
          Thank you for signing up with Coindexy! To complete your registration and start trading,
          please verify your email address by clicking the button below.
        </p>

        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>

        <p class="message">
          If the button doesn't work, you can also copy and paste this link into your browser:
          <br><br>
          <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
        </p>

        <div class="warning">
          <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with Coindexy, please ignore this email.
        </div>

        <div class="footer">
          <p>© 2026 Coindexy. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address - Coindexy

    Thank you for signing up with Coindexy!

    To complete your registration, please verify your email address by visiting:
    ${verificationUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with Coindexy, please ignore this email.

    © 2026 Coindexy
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}