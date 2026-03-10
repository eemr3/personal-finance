import { NextResponse } from 'next/server';
import { generateMonthlyInsight } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
        { status: 400 },
      );
    }

    const round2 = (n: number) => Math.round(n * 100) / 100;
    const insight = await generateMonthlyInsight(
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

    return new Response(JSON.stringify({ insight }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating month summary insight:', error);
    return NextResponse.json(
      {
        error: 'Falha ao gerar resumo com IA.',
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
