import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { MobileLayout } from '@/components/layout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MobileLayout>{children}</MobileLayout>
    </AuthGuard>
  );
}
