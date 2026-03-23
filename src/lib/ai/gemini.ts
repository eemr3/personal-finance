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
    creditCardInfo?: {
      totalLimit: number;
      usedLimit: number;
      nextInvoiceTotal: number;
      mainCardName: string;
    };
  }>;
  creditCardInfo?: {
    totalLimit: number;
    usedLimit: number;
    nextInvoiceTotal: number;
    mainCardName: string;
  };
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
  Você é o motor de inteligência do MeuBolso, um assistente financeiro de elite. 
  Receberá um JSON com o resumo financeiro do mês (entradas, saídas, categorias e dados de cartões).

  Sua missão é gerar 3 insights estratégicos em JSON:

  1. "resumo": Analise o fluxo de caixa. Se o saldo for positivo, parabenize de forma profissional. Se for negativo, identifique se o problema são os gastos fixos ou variáveis. Considere que o usuário pode estar olhando um mês FUTURO (planejamento).
  2. "maiorGasto": Identifique a categoria dominante. Se for "Cartão de Crédito", tente inferir pelo resumo das categorias se o gasto é concentrado ou pulverizado. Use o label exato da categoria.
  3. "dica": Esta é a parte mais importante. 
    - Se houver faturas de cartão altas, sugira verificar a data de fechamento para "empurrar" novos gastos para o próximo mês.
    - Se o saldo estiver muito alto, sugira uma reserva de emergência.
    - Use um tom de "parceiro de negócios", direto e técnico, condizente com um usuário que valoriza arquitetura e precisão.

  Regras de Formatação:
  - Responda APENAS o objeto JSON com as chaves: "resumo", "maiorGasto", "dica".
  - Valores monetários: Sempre R$ com 2 casas decimais.
  - Percentuais: Sempre % com 1 ou 2 casas decimais.
  - NÃO invente dados. Se algo não estiver no JSON, não mencione.

  IMPORTANTE: O JSON de retorno deve seguir EXATAMENTE esta estrutura de lista para facilitar o mapeamento no App:
    {
      "insights": [
        { "icon": "trending-down", "color": "income", "text": "[Resumo do mês]" },
        { "icon": "alert-circle", "color": "warning", "text": "[Insight sobre maior gasto]" },
        { "icon": "bulb", "color": "primary", "text": "[Dica prática]" }
      ]
    }
  `;

  const systemPromptEn = `
You are the intelligence engine of MeuBolso, an elite financial assistant.
You will receive a JSON containing the monthly financial summary (income, expenses, categories, and credit card data).

Your mission is to generate 3 strategic insights in JSON:

1. "summary": Analyze the cash flow. If the balance is positive, provide a professional congratulation. If negative, identify whether the issue comes from fixed or variable expenses. Consider that the user may be viewing a FUTURE month (planning scenario).
2. "largestExpense": Identify the dominant category. If it is "Credit Card", try to infer from the category breakdown whether spending is concentrated or distributed. Use the exact category label.
3. "tip": This is the most important part.
  - If there are high credit card bills, suggest checking the closing date to "push" new expenses into the next cycle.
  - If the balance is very high, suggest building an emergency fund.
  - Use a "business partner" tone, direct and technical, suitable for a user who values architecture and precision.

Formatting Rules:
- Respond ONLY with the JSON object containing the keys: "summary", "largestExpense", "tip".
- Monetary values: Always use R$ with 2 decimal places.
- Percentages: Always use % with 1 or 2 decimal places.
- DO NOT invent data. If something is not in the JSON, do not mention it.

IMPORTANT: The returned JSON must EXACTLY follow this list structure to facilitate mapping in the App:
  {
    "insights": [
      { "icon": "trending-down", "color": "income", "text": "[Monthly summary]" },
      { "icon": "alert-circle", "color": "warning", "text": "[Insight about largest expense]" },
      { "icon": "bulb", "color": "primary", "text": "[Practical tip]" }
    ]
  }
`;

  const systemPromptEs = `
Eres el motor de inteligencia de MeuBolso, un asistente financiero de alto nivel.
Recibirás un JSON con el resumen financiero mensual (ingresos, gastos, categorías y datos de tarjetas de crédito).

Tu misión es generar 3 insights estratégicos en JSON:

1. "resumen": Analiza el flujo de caja. Si el saldo es positivo, felicita de manera profesional. Si es negativo, identifica si el problema proviene de gastos fijos o variables. Considera que el usuario puede estar viendo un mes FUTURO (escenario de planificación).
2. "mayorGasto": Identifica la categoría dominante. Si es "Tarjeta de Crédito", intenta inferir a partir del desglose de categorías si el gasto está concentrado o distribuido. Usa la etiqueta exacta de la categoría.
3. "consejo": Esta es la parte más importante.
  - Si hay facturas de tarjeta de crédito altas, sugiere verificar la fecha de cierre para "empujar" nuevos gastos al siguiente ciclo.
  - Si el saldo es muy alto, sugiere crear un fondo de emergencia.
  - Usa un tono de "socio de negocios", directo y técnico, adecuado para un usuario que valora la arquitectura y la precisión.

Reglas de Formato:
- Responde SOLO con el objeto JSON con las claves: "resumen", "mayorGasto", "consejo".
- Valores monetarios: Siempre R$ con 2 decimales.
- Porcentajes: Siempre % con 1 o 2 decimales.
- NO inventes datos. Si algo no está en el JSON, no lo menciones.

IMPORTANTE: El JSON de retorno debe seguir EXACTAMENTE esta estructura de lista para facilitar el mapeo en la App:
  {
    "insights": [
      { "icon": "trending-down", "color": "income", "text": "[Resumen del mes]" },
      { "icon": "alert-circle", "color": "warning", "text": "[Insight sobre el mayor gasto]" },
      { "icon": "bulb", "color": "primary", "text": "[Consejo práctico]" }
    ]
  }
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
