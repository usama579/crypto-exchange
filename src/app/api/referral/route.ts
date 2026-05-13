import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ReferralService } from '@/lib/referral';
import { logger } from '@/lib/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { validateInput, referralValidationSchema, ValidationError } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    logger.logApiRequest({
      method: 'GET',
      endpoint: '/api/referral',
      ip,
      userAgent
    });

    // Rate limiting
    if (!checkRateLimit(`referral:${ip}`, RATE_LIMITS.referral)) {
      logger.warn('Rate limit exceeded', {
        endpoint: '/api/referral',
        ip,
        userAgent
      });
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);

    logger.debug('Session debug');

    if (!session?.user?.id || !session?.user?.email) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email;

    let stats, userCode;
    try {
      [stats, userCode] = await Promise.all([
        ReferralService.getReferralStats(userId),
        ReferralService.createOrGetReferralCode(userId, email)
      ]);
    } catch (serviceError) {
      logger.warn('Referral service error, checking user existence', {
        endpoint: '/api/referral',
        userId,
        email,
        error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
      });

      // If user not found, the session might be stale - return 401
      if (serviceError instanceof Error && serviceError.message.includes('User not found')) {
        return NextResponse.json(
          { message: 'Session invalid - user not found' },
          { status: 401 }
        );
      }

      // Re-throw other errors to be caught by the outer catch block
      throw serviceError;
    }

    const duration = Date.now() - startTime;

    logger.logApiResponse({
      method: 'GET',
      endpoint: '/api/referral',
      statusCode: 200,
      duration,
      userId,
      email
    });

    return NextResponse.json({
      referralCode: userCode,
      stats
    }, { status: 200 });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.logReferralError('Failed to fetch referral stats', {
      endpoint: '/api/referral',
      ip,
      userAgent,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    logger.logApiRequest({
      method: 'POST',
      endpoint: '/api/referral',
      ip,
      userAgent
    });

    // Rate limiting
    if (!checkRateLimit(`referral:${ip}`, RATE_LIMITS.referral)) {
      logger.warn('Rate limit exceeded', {
        endpoint: '/api/referral',
        ip,
        userAgent
      });
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logger.warn('Unauthorized access attempt', {
        endpoint: '/api/referral',
        ip,
        userAgent
      });
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email || '';

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      logger.warn('Invalid JSON in request body', {
        endpoint: '/api/referral',
        userId,
        ip,
        userAgent
      });
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate input
    let validatedData;
    try {
      validatedData = validateInput(referralValidationSchema, requestBody);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Validation error', {
          endpoint: '/api/referral',
          userId,
          error: error.message,
          field: error.field
        });
        return NextResponse.json(
          { message: error.message, field: error.field },
          { status: 400 }
        );
      }
      throw error;
    }

    const { action, referralCode } = validatedData;

    if (action === 'validate') {
      const result = await ReferralService.validateReferralCode(referralCode || '');

      const duration = Date.now() - startTime;
      logger.logApiResponse({
        method: 'POST',
        endpoint: '/api/referral',
        statusCode: result.success ? 200 : 400,
        duration,
        userId,
        referralCode: referralCode || ''
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (action === 'generate') {
      const code = await ReferralService.createOrGetReferralCode(userId, email);

      const duration = Date.now() - startTime;
      logger.logApiResponse({
        method: 'POST',
        endpoint: '/api/referral',
        statusCode: 200,
        duration,
        userId,
        referralCode: code
      });

      return NextResponse.json({
        success: true,
        referralCode: code
      }, { status: 200 });
    }

    logger.warn('Invalid action in referral request', {
      endpoint: '/api/referral',
      userId,
      action
    });

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.logReferralError('Referral API error', {
      endpoint: '/api/referral',
      ip,
      userAgent,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}