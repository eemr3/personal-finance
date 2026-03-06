import { EditTransactionPage } from './EditTransactionPage';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTransactionPage id={id} />;
}
