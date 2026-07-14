import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-300/30 hover:shadow-primary-400/40 active:shadow-primary-500/50',
  secondary: 'bg-warm-50 text-primary-600 hover:bg-warm-100 active:bg-warm-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-warm-50 active:bg-warm-100',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-6 py-3 text-base rounded-full',
  lg: 'px-8 py-4 text-lg rounded-full',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  );
}
