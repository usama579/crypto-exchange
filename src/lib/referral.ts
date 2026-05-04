import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export interface ReferralResult {
  success: boolean;
  message: string;
  data?: any;
}

export class ReferralService {

  static generateReferralCode(email: string): string {
    const randomPart = randomBytes(3).toString('hex').toUpperCase();
    const emailPrefix = email.substring(0, 3).toUpperCase();
    return `${emailPrefix}${randomPart}`;
  }

  static async createOrGetReferralCode(userId: string, email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    let referralCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      referralCode = this.generateReferralCode(email);

      const existingUser = await prisma.user.findUnique({
        where: { referralCode }
      });

      if (!existingUser) {
        isUnique = true;
        await prisma.user.update({
          where: { id: userId },
          data: { referralCode }
        });
        return referralCode;
      }
      attempts++;
    }

    throw new Error('Failed to generate unique referral code');
  }

  static async validateReferralCode(code: string): Promise<ReferralResult> {
    try {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: code },
        select: { id: true, email: true, firstName: true, lastName: true }
      });

      if (!referrer) {
        return {
          success: false,
          message: 'Invalid referral code'
        };
      }

      return {
        success: true,
        message: 'Valid referral code',
        data: { referrerId: referrer.id, referrer }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error validating referral code'
      };
    }
  }

  static async processNewUserReferral(newUserId: string, referralCode?: string): Promise<ReferralResult> {
    try {
      if (!referralCode) {
        await this.createSignupBonus(newUserId);
        return {
          success: true,
          message: 'Welcome bonus added'
        };
      }

      const validationResult = await this.validateReferralCode(referralCode);
      if (!validationResult.success) {
        await this.createSignupBonus(newUserId);
        return validationResult;
      }

      const referrerId = validationResult.data.referrerId;

      if (referrerId === newUserId) {
        await this.createSignupBonus(newUserId);
        return {
          success: false,
          message: 'Cannot refer yourself'
        };
      }

      await prisma.user.update({
        where: { id: newUserId },
        data: { referredBy: referrerId }
      });

      const referral = await prisma.referral.create({
        data: {
          referrerId,
          referredUserId: newUserId,
          status: 'PENDING'
        }
      });

      await Promise.all([
        this.createLockedBalance(newUserId, '100', 'SIGNUP_BONUS'),
        this.createLockedBalance(referrerId, '100', 'REFERRAL_BONUS')
      ]);

      return {
        success: true,
        message: 'Referral processed successfully',
        data: { referralId: referral.id }
      };
    } catch (error) {
      console.error('Error processing referral:', error);
      await this.createSignupBonus(newUserId);
      return {
        success: false,
        message: 'Error processing referral'
      };
    }
  }

  static async createSignupBonus(userId: string): Promise<void> {
    await this.createLockedBalance(userId, '100', 'SIGNUP_BONUS');
  }

  static async createLockedBalance(userId: string, amount: string, reason: string): Promise<void> {
    await prisma.lockedBalance.create({
      data: {
        userId,
        amount,
        reason,
        currency: 'USDT',
        isLocked: true
      }
    });
  }

  static async processDeposit(userId: string, transactionId: string, amount: string, currency: string): Promise<void> {
    try {
      await prisma.referralDeposit.create({
        data: {
          userId,
          transactionId,
          amount,
          currency,
          isProcessed: false
        }
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredBy: true }
      });

      if (user?.referredBy) {
        const referral = await prisma.referral.findFirst({
          where: {
            referrerId: user.referredBy,
            referredUserId: userId,
            status: 'PENDING'
          }
        });

        if (referral) {
          await prisma.referral.update({
            where: { id: referral.id },
            data: { status: 'ACTIVE' }
          });

          await this.checkAndUnlockReferralRewards(user.referredBy);
        }
      }

      await this.unlockUserBonuses(userId);
    } catch (error) {
      console.error('Error processing deposit for referral:', error);
    }
  }

  static async checkAndUnlockReferralRewards(referrerId: string): Promise<void> {
    const activeReferrals = await prisma.referral.count({
      where: {
        referrerId,
        status: 'ACTIVE'
      }
    });

    if (activeReferrals >= 2) {
      const lockedBalance = await prisma.lockedBalance.findFirst({
        where: {
          userId: referrerId,
          reason: 'REFERRAL_BONUS',
          isLocked: true
        }
      });

      if (lockedBalance) {
        await Promise.all([
          prisma.lockedBalance.update({
            where: { id: lockedBalance.id },
            data: {
              isLocked: false,
              unlockedAt: new Date()
            }
          }),
          this.addToWalletBalance(referrerId, lockedBalance.amount, 'USDT')
        ]);
      }
    }
  }

  static async unlockUserBonuses(userId: string): Promise<void> {
    const lockedBalances = await prisma.lockedBalance.findMany({
      where: {
        userId,
        isLocked: true
      }
    });

    for (const balance of lockedBalances) {
      await Promise.all([
        prisma.lockedBalance.update({
          where: { id: balance.id },
          data: {
            isLocked: false,
            unlockedAt: new Date()
          }
        }),
        this.addToWalletBalance(userId, balance.amount, balance.currency)
      ]);
    }
  }

  static async addToWalletBalance(userId: string, amount: string, symbol: string): Promise<void> {
    let wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        symbol
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          symbol,
          name: symbol === 'USDT' ? 'Tether USD' : symbol,
          address: `temp_${Date.now()}`,
          balance: '0'
        }
      });
    }

    const currentBalance = parseFloat(wallet.balance);
    const addAmount = parseFloat(amount);
    const newBalance = (currentBalance + addAmount).toString();

    await Promise.all([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount,
          symbol
        }
      })
    ]);
  }

  static async getReferralStats(userId: string) {
    const [referrals, lockedBalances, totalReferred] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referrer: {
            select: { email: true, firstName: true, lastName: true }
          }
        }
      }),
      prisma.lockedBalance.findMany({
        where: { userId }
      }),
      prisma.user.count({
        where: { referredBy: userId }
      })
    ]);

    const activeReferrals = referrals.filter(r => r.status === 'ACTIVE').length;
    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length;
    const totalLocked = lockedBalances
      .filter(b => b.isLocked)
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalUnlocked = lockedBalances
      .filter(b => !b.isLocked)
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    return {
      totalReferred,
      activeReferrals,
      pendingReferrals,
      totalLocked,
      totalUnlocked,
      referrals: referrals.slice(0, 10),
      lockedBalances
    };
  }
}