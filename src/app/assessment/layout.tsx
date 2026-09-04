import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted bg-grid-pattern flex flex-col p-4 relative">
      {/* BUG-022: Complete branded header with full wordmark */}
      <div className="w-full flex justify-between items-center z-50 mb-6">
        <BrandLogo href="/" size="sm" />

        <Link
          href="/"
          className="text-sm md:text-base text-muted-foreground font-bold hover:text-brand-dark transition-colors duration-150 uppercase tracking-wider"
        >
          Exit Assessment
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
}
