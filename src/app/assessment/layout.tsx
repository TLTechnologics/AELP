import Link from 'next/link';

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex flex-col p-4 relative">
      {/* Brand logo header */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="font-heading text-xl text-primary-foreground">A</span>
        </div>
      </div>
      
      {/* Exit Button */}
      <div className="absolute top-8 right-8 z-50">
        <Link href="/" className="text-muted-foreground font-bold hover:text-brand-dark transition-colors">
          Exit Assessment
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
}
