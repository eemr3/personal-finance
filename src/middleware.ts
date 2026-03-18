import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isInMaintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  // 1. Condição para evitar loop infinito e permitir arquivos estáticos/imagens
  // ✅ Só deixa passar o que é estritamente necessário
  if (
    pathname.startsWith('/manutencao') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/ai/month-summary') || // ✅ sua rota de IA
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Redireciona para manutenção se a flag estiver ativa
  if (isInMaintenanceMode) {
    return NextResponse.rewrite(new URL('/manutencao', request.url));
  }

  return NextResponse.next();
}
