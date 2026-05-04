import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature (implement based on your blockchain service provider)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!authHeader || !expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { message: 'Unauthorized webhook' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const { txHash, toAddress, amount, symbol, confirmations, fromAddress } = payload;

    if (!txHash || !toAddress || !amount || !symbol) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the wallet by deposit address
    const wallet = await prisma.wallet.findUnique({
      where: { address: toAddress },
      include: { user: true }
    });

    if (!wallet) {
      console.log(`No wallet found for address: ${toAddress}`);
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        txHash_symbol: {
          txHash,
          symbol: symbol.toUpperCase()
        }
      }
    });

    if (existingTransaction) {
      // Update confirmations if transaction exists
      if (confirmations > existingTransaction.confirmations) {
        await prisma.transaction.update({
          where: { id: existingTransaction.id },
          data: {
            confirmations,
            status: confirmations >= 3 ? 'COMPLETED' : 'CONFIRMING'
          }
        });
      }
      return NextResponse.json({ message: 'Transaction updated' }, { status: 200 });
    }

    // Create new transaction and update wallet balance
    const amountFloat = parseFloat(amount);
    const currentBalance = parseFloat(wallet.balance);
    const newBalance = currentBalance + amountFloat;

    const status = confirmations >= 3 ? 'COMPLETED' : 'CONFIRMING';

    await prisma.$transaction([
      // Create transaction record
      prisma.transaction.create({
        data: {
          userId: wallet.userId,
          walletId: wallet.id,
          txHash,
          type: 'DEPOSIT',
          status,
          amount: amount.toString(),
          symbol: symbol.toUpperCase(),
          fromAddress,
          toAddress,
          confirmations
        }
      }),
      // Update wallet balance only if transaction is completed
      ...(status === 'COMPLETED' ? [
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance.toString() }
        })
      ] : [])
    ]);

    console.log(`Deposit processed: ${amount} ${symbol} to ${wallet.user.email}`);

    return NextResponse.json(
      {
        message: 'Deposit processed successfully',
        status,
        amount,
        symbol,
        confirmations
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}