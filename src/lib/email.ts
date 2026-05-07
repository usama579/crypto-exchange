import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'CryptoExchange'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

  const subject = 'Verify your email address - CryptoExchange';

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
        .logo { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
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
          <div class="logo">🚀 CryptoExchange</div>
        </div>

        <h1 class="title">Verify Your Email Address</h1>

        <p class="message">
          Thank you for signing up with CryptoExchange! To complete your registration and start trading,
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
          <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with CryptoExchange, please ignore this email.
        </div>

        <div class="footer">
          <p>© 2026 CryptoExchange. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address - CryptoExchange

    Thank you for signing up with CryptoExchange!

    To complete your registration, please verify your email address by visiting:
    ${verificationUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with CryptoExchange, please ignore this email.

    © 2026 CryptoExchange
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}