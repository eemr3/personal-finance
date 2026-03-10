import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

type AiMonthInsight = {
  resumo: string;
  maiorGasto: string;
  dica: string;
};

export async function generateMonthlyInsight(
  summary: FinancialMonthSummary,
  locale: 'pt' | 'en' | 'es' = 'pt',
) {
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
  `;

  const systemPromptEn = `
  You are a personal finance assistant. 
  You receive a numeric summary of the month in JSON and must generate short insights.
  IMPORTANT rules:
  - Use EXACTLY the numeric values from the JSON (do not make up numbers).
  - Always answer in natural English.
  - Response format: JSON object with "resumo", "maiorGasto", "dica".
  `;

  const systemPromptEs = `
Eres un asistente de finanzas personales.
Recibirás un resumen numérico del mes en JSON y debes generar ideas cortas.
Reglas IMPORTANTES:
- Usa EXACTAMENTE los valores numéricos del JSON (no inventes números).
- Responde siempre en español.
- Respuesta en formato JSON con "resumo", "maiorGasto", "dica".
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
  const text = result.response.text().trim();

  try {
    const parsed = JSON.parse(text) as AiMonthInsight;
    return {
      resumo: parsed.resumo ?? '',
      maiorGasto: parsed.maiorGasto ?? '',
      dica: parsed.dica ?? '',
    };
  } catch {
    // Fallback: se por algum motivo não vier JSON, devolve tudo em "resumo"
    return {
      resumo: text,
      maiorGasto: '',
      dica: '',
    };
  }
}
