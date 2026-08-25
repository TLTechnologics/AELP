import { LucideIcon } from 'lucide-react';
import { IconContainer } from './icon-container';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: 'blue' | 'orange' | 'purple' | 'pink' | 'yellow' | 'green' | 'muted';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  iconColor = 'muted'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-border/40 rounded-[24px] shadow-sm max-w-2xl mx-auto w-full">
      <IconContainer icon={icon} color={iconColor} size="xl" className="mb-6 opacity-80" />
      <h3 className="font-heading text-2xl sm:text-3xl text-brand-dark mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
