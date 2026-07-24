export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted bg-grid-pattern flex flex-col justify-center items-center p-4">
      {/* Brand logo header */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="font-heading text-2xl text-primary-foreground">A</span>
        </div>
        <h1 className="text-3xl tracking-tight m-0">AELP</h1>
      </div>
      
      {children}
    </div>
  );
}
