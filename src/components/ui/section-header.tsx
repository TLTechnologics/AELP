import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: ReactNode;
  description?: string;
  badge?: string;
  children?: ReactNode;
}

export function SectionHeader({ title, description, badge, children }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 w-full mb-8">
      <div>
        {badge && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full mb-3">
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading uppercase leading-tight tracking-tight text-brand-dark">
          {title}
        </h1>
        {description && (
          <p className="text-base sm:text-xl text-muted-foreground font-medium mt-2 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="shrink-0 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
