import { Capacitor } from '@capacitor/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(key);
}

type FinancialMonthSummary = {
  monthLabel: string; // ex: "Março de 2026"
  currency: string; // ex: "BRL"
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topCategories: Array<{
    key: string;
    label: string;
    amount: number;
    percent: number;
  }>;
};

export type AiMonthInsight = {
  resumo: string;
  maiorGasto: string;
  dica: string;
};

export async function generateMonthlyInsight(
  summary: FinancialMonthSummary,
  locale: 'pt' | 'en' | 'es' = 'pt',
) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const systemPromptPt = `
  Você é um assistente financeiro pessoal. 
  Receberá um resumo numérico do mês em JSON e deve gerar insights curtos.
  Regras IMPORTANTES:
  - Use EXATAMENTE os valores numéricos do JSON (não invente números novos).
  - Responda SEMPRE em português do Brasil.
  - Resposta em formato JSON com as chaves: "resumo", "maiorGasto", "dica".
  - "resumo": 2 a 4 frases curtas explicando o mês.
  - "maiorGasto": 1 frase destacando a principal categoria de gasto (use o label da categoria).
  - "dica": 1 ou 2 frases com sugestão prática e gentil (sem julgamento).
  - Ao citar valores em dinheiro ou percentual, use SEMPRE exatamente 2 casas decimais (ex: 384,10 ou 55,5%).
  `;

  const systemPromptEn = `
  You are a personal finance assistant. 
  You receive a numeric summary of the month in JSON and must generate short insights.
  IMPORTANT rules:
  - Use EXACTLY the numeric values from the JSON (do not make up numbers).
  - Always answer in natural English.
  - Response format: JSON object with "resumo", "maiorGasto", "dica".
  - When writing currency or percentage values, use exactly 2 decimal places (e.g. 384.10 or 55.5%).
  `;

  const systemPromptEs = `
Eres un asistente de finanzas personales.
Recibirás un resumen numérico del mes en JSON y debes generar ideas cortas.
Reglas IMPORTANTES:
- Usa EXACTAMENTE los valores numéricos del JSON (no inventes números).
- Responde siempre en español.
- Respuesta en formato JSON con "resumo", "maiorGasto", "dica".
- Al citar valores en dinero o porcentaje, usa siempre exactamente 2 decimales (ej: 384,10 o 55,5%).
`;

  const systemPrompt =
    locale === 'en'
      ? systemPromptEn
      : locale === 'es'
      ? systemPromptEs
      : systemPromptPt;

  const input = `
CONTEXT JSON (do not repeat literally, just use it as data):
${JSON.stringify(summary, null, 2)}
Remember: respond ONLY with a JSON object like:
{
  "resumo": "...",
  "maiorGasto": "...",
  "dica": "..."
}
`;

  const result = await model.generateContent([systemPrompt, input]);
  let text = result.response.text().trim();

  // Remove markdown code block se o modelo devolver ```json ... ```
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    text = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return {
      resumo: String(parsed.resumo ?? parsed.summary ?? ''),
      maiorGasto: String(parsed.maiorGasto ?? parsed.topSpending ?? ''),
      dica: String(parsed.dica ?? parsed.tip ?? ''),
    };
  } catch {
    return {
      resumo: text,
      maiorGasto: '',
      dica: '',
    };
  }
}

export function getApiUrl() {
  if (Capacitor.isNativePlatform()) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return window.location.origin;
}
