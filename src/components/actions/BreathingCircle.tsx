import { cn } from '@/lib/utils';

interface BreathingCircleProps {
  isBreathing?: boolean;
}

export default function BreathingCircle({ isBreathing = true }: BreathingCircleProps) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <div
        className={cn(
          'absolute w-48 h-48 rounded-full',
          'bg-gradient-to-br from-sky-300/40 to-blue-400/40',
          'blur-xl',
          isBreathing && 'animate-breathe'
        )}
        style={{ animationDuration: '4s' }}
      />

      <div
        className={cn(
          'absolute w-40 h-40 rounded-full',
          'bg-gradient-to-br from-sky-300/50 to-cyan-400/50',
          'blur-lg',
          isBreathing && 'animate-breathe'
        )}
        style={{ animationDuration: '4s', animationDelay: '0.3s' }}
      />

      <div
        className={cn(
          'absolute w-32 h-32 rounded-full',
          'bg-gradient-to-br from-sky-200/60 to-cyan-300/60',
          'blur-md',
          isBreathing && 'animate-breathe'
        )}
        style={{ animationDuration: '4s', animationDelay: '0.6s' }}
      />

      <div
        className={cn(
          'relative w-24 h-24 rounded-full',
          'bg-gradient-to-br from-white to-sky-100',
          'shadow-soft-lg',
          'flex items-center justify-center',
          isBreathing && 'animate-breathe'
        )}
        style={{ animationDuration: '4s', animationDelay: '0.9s' }}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">🌬️</div>
          <span className="text-xs text-sky-500 font-medium">
            {isBreathing ? '呼吸' : '准备'}
          </span>
        </div>
      </div>
    </div>
  );
}
