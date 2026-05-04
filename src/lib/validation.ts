import { z } from 'zod';

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')
  .transform(email => email.toLowerCase().trim());

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/(?=.*\d)/, 'Password must contain at least one number');

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(name => name.trim());

export const referralCodeSchema = z.string()
  .min(6, 'Referral code must be at least 6 characters')
  .max(12, 'Referral code must be less than 12 characters')
  .regex(/^[A-Z0-9]+$/, 'Referral code can only contain uppercase letters and numbers')
  .optional()
  .or(z.literal(''));

export const amountSchema = z.string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Amount must be a valid number')
  .refine((amount) => {
    const num = parseFloat(amount);
    return num > 0 && num <= 1000000000; // Max 1 billion
  }, 'Amount must be positive and less than 1 billion');

export const currencySchema = z.string()
  .min(3, 'Currency must be at least 3 characters')
  .max(10, 'Currency must be less than 10 characters')
  .regex(/^[A-Z]+$/, 'Currency must be uppercase letters only');

export const txHashSchema = z.string()
  .min(64, 'Transaction hash must be at least 64 characters')
  .max(128, 'Transaction hash must be less than 128 characters')
  .regex(/^[a-fA-F0-9]+$/, 'Transaction hash must be hexadecimal');

export const addressSchema = z.string()
  .min(20, 'Address must be at least 20 characters')
  .max(100, 'Address must be less than 100 characters');

// Signup validation schema
export const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: referralCodeSchema
}).strict();

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
}).strict();

// Referral validation schema
export const referralValidationSchema = z.object({
  action: z.enum(['validate', 'generate']),
  referralCode: referralCodeSchema
}).strict();

// Deposit webhook validation schema
export const depositWebhookSchema = z.object({
  txHash: txHashSchema,
  toAddress: addressSchema,
  amount: amountSchema,
  symbol: currencySchema,
  confirmations: z.number().int().min(0).max(1000),
  fromAddress: addressSchema.optional()
}).strict();

// Balance update validation schema
export const balanceUpdateSchema = z.object({
  walletId: z.string().cuid('Invalid wallet ID'),
  amount: amountSchema,
  type: z.enum(['DEPOSIT', 'WITHDRAWAL'])
}).strict();

export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;

  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.message,
        'VALIDATION_ERROR'
      );
    }
    throw error;
  }
}

export function sanitizeAmount(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount < 0) {
    throw new ValidationError('amount', 'Invalid amount', 'INVALID_AMOUNT');
  }

  // Round to 18 decimal places to avoid floating point issues
  return numAmount.toFixed(18).replace(/\.?0+$/, '');
}

export function isValidReferralCode(code: string): boolean {
  try {
    referralCodeSchema.parse(code);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function isValidPassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}