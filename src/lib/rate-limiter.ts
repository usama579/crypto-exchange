interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

export function rateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs
    });
    return true;
  }

  if (now > existing.resetTime) {
    existing.count = 1;
    existing.resetTime = now + options.windowMs;
    return true;
  }

  if (existing.count >= options.maxRequests) {
    return false;
  }

  existing.count++;
  return true;
}

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, store] of rateLimitMap.entries()) {
    if (now > store.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60000);

export const RATE_LIMITS = {
  signup: { windowMs: 15 * 60 * 1000, maxRequests: 3 }, // 3 requests per 15 minutes
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  referral: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  deposit: { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 requests per 5 minutes
} as const;