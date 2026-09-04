import { BrandLogo } from '@/components/ui/brand-logo';

export default function AuthShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-muted bg-grid-pattern bg-radial-glow flex flex-col justify-center items-center p-4">
      {/* Unified brand header — fixes BUG-010, IMPROVE-011, POLISH-007 */}
      <div className="absolute top-8 left-8">
        <BrandLogo href="/" size="md" />
      </div>

      {children}
    </div>
  );
}
