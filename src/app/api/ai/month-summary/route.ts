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

    const insight = await generateMonthlyInsight(
      {
        monthLabel,
        currency,
        totalIncome,
        totalExpenses,
        balance,
        topCategories,
      },
      locale,
    );

    return NextResponse.json({ insight });
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
