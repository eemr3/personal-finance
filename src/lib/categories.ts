/**
 * Mapeamento de categorias: valor armazenado (Firestore) -> label amigável (UI).
 * Mantém o value para consistência no banco; exibe o label na interface.
 */

const CATEGORY_LABELS: Record<string, string> = {
  // Receitas
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimentos',
  business: 'Negócios',
  other: 'Outras receitas',
  // Despesas - transações
  cartão_de_crédito: 'Cartão de Crédito',
  cartao_de_credito: 'Cartão de Crédito',
  supermercado: 'Supermercado',
  informática: 'Informática',
  informatica: 'Informática',
  transporte: 'Transporte',
  saúde: 'Saúde',
  saude: 'Saúde',
  educação: 'Educação',
  educacao: 'Educação',
  entretenimento: 'Entretenimento',
  outros: 'Outros',
  // Despesas - regras fixas
  education: 'Educação',
  religious: 'Religioso',
  taxes: 'Impostos',
  subscriptions: 'Assinaturas',
  utilities: 'Utilidades',
  insurance: 'Seguros',
  debt: 'Dívidas',
  savings: 'Economia',
};

/**
 * Retorna o label amigável para exibição na UI.
 * Se não houver mapeamento, formata o valor (ex: "cartao_de_credito" -> "Cartao de credito").
 */
export function formatCategoryLabel(
  value: string | null | undefined,
): string {
  const raw = value != null ? String(value).trim() : '';
  if (!raw) return '—';
  const normalized = raw.toLowerCase().normalize('NFC');
  // Tenta com acentos e sem (ex.: "educação" e "educacao")
  const withoutAccents = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const fromMap =
    CATEGORY_LABELS[normalized] ?? CATEGORY_LABELS[withoutAccents];
  if (fromMap) return fromMap;
  // Fallback por prefixo (ex.: "educação", "education" -> Educação)
  if (/^educ/.test(withoutAccents) || /^educ/.test(normalized)) return 'Educação';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
