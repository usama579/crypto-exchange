import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate password reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpires: resetTokenExpires,
      },
    });

    // Send password reset email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const subject = 'Reset your password - CryptoExchange';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
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
            <img src="${baseUrl}/logo.png" alt="CryptoExchange" width="64" height="64" style="display:block;margin:0 auto;border-radius:12px;" />
            <div class="logo">CryptoExchange</div>
          </div>

          <h1 class="title">Reset Your Password</h1>

          <p class="message">
            We received a request to reset your password for your CryptoExchange account.
            If you made this request, click the button below to reset your password.
          </p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p class="message">
            If the button doesn't work, you can also copy and paste this link into your browser:
            <br><br>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>

          <div class="warning">
            <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
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
      Reset Your Password - CryptoExchange

      We received a request to reset your password for your CryptoExchange account.

      To reset your password, please visit:
      ${resetUrl}

      This password reset link will expire in 1 hour.

      If you didn't request a password reset, please ignore this email.

      © 2026 CryptoExchange
    `;

    const emailSent = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    if (!emailSent) {
      console.error('Failed to send password reset email');
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}