import { AuthGuard } from '@/features/auth/components/AuthGuard';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto min-h-screen w-full">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
