import { NextResponse } from 'next/server';
import { generateMonthlyInsight } from '@/lib/ai/gemini';
import { adminAuth } from '@/lib/firebase/firebase-admin';

export const runtime = 'nodejs';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders },
      );
    }

    if (decodedToken.uid !== process.env.OWNER_UID) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403, headers: corsHeaders },
      );
    }

    const {
      monthLabel,
      currency,
      totalIncome,
      totalExpenses,
      balance,
      topCategories,
      locale = 'pt',
    } = body ?? {};

    if (
      typeof monthLabel !== 'string' ||
      typeof currency !== 'string' ||
      typeof totalIncome !== 'number' ||
      typeof totalExpenses !== 'number' ||
      typeof balance !== 'number' ||
      !Array.isArray(topCategories)
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: corsHeaders },
      );
    }

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const { insights } = await generateMonthlyInsight(
      {
        monthLabel,
        currency,
        totalIncome: round2(totalIncome),
        totalExpenses: round2(totalExpenses),
        balance: round2(balance),
        topCategories: topCategories.map(
          (c: {
            key?: string;
            label?: string;
            amount?: number;
            percent?: number;
          }) => ({
            key: c.key ?? '',
            label: c.label ?? '',
            amount: round2(Number(c.amount ?? 0)),
            percent: round2(Number(c.percent ?? 0)),
          }),
        ),
      },
      locale,
    );

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating month summary insight:', error);
    return NextResponse.json(
      {
        error: 'Falha ao gerar resumo com IA.',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
