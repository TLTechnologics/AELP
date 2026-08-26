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
      {/* Icon mark */}
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-dark text-brand-yellow font-heading text-sm font-bold shrink-0 shadow-sm group-hover:bg-brand-yellow group-hover:text-brand-dark transition-colors duration-200">
        A
      </span>
      {/* Wordmark */}
      <span className={`font-heading ${sizes.text} tracking-tighter text-brand-dark transition-colors`}>
        ELP<span className={`text-brand-yellow ${sizes.dot}`}>.</span>
      </span>
    </span>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
