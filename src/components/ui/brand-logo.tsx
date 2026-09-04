import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { text: 'text-xl', dot: 'text-base' },
  md: { text: 'text-2xl sm:text-3xl', dot: 'text-xl sm:text-2xl' },
  lg: { text: 'text-3xl sm:text-4xl', dot: 'text-2xl sm:text-3xl' },
};

export function BrandLogo({ href, size = 'md', className = '' }: BrandLogoProps) {
  const sizes = sizeMap[size];

  const logo = (
    <span className={`flex items-center gap-1 group select-none ${className}`}>
      {/* Icon mark - using official image with mix-blend to preserve white background as transparent */}
      <span className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 shrink-0 -ml-1">
        <img src="/aelp-logo.jpg" alt="AELP Logo" className="w-full h-full object-contain mix-blend-multiply" />
      </span>
      {/* Wordmark */}
      <span className={`font-heading ${sizes.text} tracking-tighter text-brand-dark transition-colors`}>
        AELP<span className={`text-brand-yellow ${sizes.dot}`}>.</span>
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
