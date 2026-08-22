import { LucideIcon } from 'lucide-react';
import { HTMLAttributes } from 'react';

type ColorScheme = 'blue' | 'orange' | 'purple' | 'pink' | 'yellow' | 'green' | 'muted';

interface IconContainerProps extends HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  color?: ColorScheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', shadow: 'shadow-blue-100/50' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', shadow: 'shadow-orange-100/50' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', shadow: 'shadow-purple-100/50' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', shadow: 'shadow-pink-100/50' },
  yellow: { bg: 'bg-brand-yellow/20', text: 'text-brand-dark', shadow: 'shadow-brand-yellow/30' },
  green: { bg: 'bg-green-50', text: 'text-green-600', shadow: 'shadow-green-100/50' },
  muted: { bg: 'bg-muted', text: 'text-muted-foreground', shadow: 'shadow-muted/50' },
};

const sizeMap = {
  sm: { container: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  md: { container: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
  xl: { container: 'w-20 h-20 rounded-[20px]', icon: 'w-10 h-10' },
};

export function IconContainer({ 
  icon: Icon, 
  color = 'blue', 
  size = 'lg',
  className = '',
  ...props 
}: IconContainerProps) {
  const selectedColor = colorMap[color];
  const selectedSize = sizeMap[size];

  return (
    <div 
      className={`flex items-center justify-center shrink-0 shadow-inner ${selectedColor.bg} ${selectedColor.text} ${selectedSize.container} ${className}`}
      {...props}
    >
      <Icon className={selectedSize.icon} />
    </div>
  );
}
