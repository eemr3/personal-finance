import { EditTransactionPage } from './EditTransactionPage';

// 1. Remova o dynamicParams: true (ele causa o erro no export)
// export const dynamicParams = true; <-- REMOVA ESTA LINHA

// 2. O Next.js PRECISA que o generateStaticParams retorne ao menos um exemplo
// ou ele tentará renderizar a página sem ID no build e falhará.
export async function generateStaticParams() {
  // Retornamos um ID genérico apenas para o build criar o arquivo físico.
  // No Capacitor, a navegação interna lidará com a troca de dados.
  return [{ id: '0' }];
}

// 3. O componente deve aceitar o ID normalmente
export default function Page({ params }: { params: { id: string } }) {
  return <EditTransactionPage id={params.id} />;
}
