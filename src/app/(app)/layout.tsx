export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}
