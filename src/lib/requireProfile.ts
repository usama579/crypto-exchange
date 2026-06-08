import { prisma } from '@/lib/prisma';

// Authoritative check (reads the DB, not the possibly-stale JWT) used by
// mutating routes to enforce that a user has completed KYC before they can
// deposit, withdraw, or trade.
export async function isProfileCompleted(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isProfileCompleted: true },
  });
  return !!user?.isProfileCompleted;
}

export const PROFILE_INCOMPLETE_MESSAGE =
  'Please complete your profile (ID verification and mobile number) to unlock trading, deposits and withdrawals.';
