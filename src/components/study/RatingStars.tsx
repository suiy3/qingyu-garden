import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (val: number) => void;
  label: string;
}

export default function RatingStars({ value, onChange, label }: RatingStarsProps) {
  const isInteractive = !!onChange;

  const handleClick = (rating: number) => {
    if (!isInteractive) return;
    if (value === rating) {
      onChange(0);
    } else {
      onChange(rating);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((star) => {
          const isFilled = star <= value;
          return (
            <button
              key={star}
              onClick={() => handleClick(star)}
              disabled={!isInteractive}
              className={cn(
                'p-1 rounded-full transition-all duration-300 transform',
                isInteractive && 'hover:scale-110 active:scale-95 cursor-pointer',
                !isInteractive && 'cursor-default'
              )}
            >
              <Star
                size={32}
                className={cn(
                  'transition-all duration-300',
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]'
                    : 'text-gray-300'
                )}
                strokeWidth={isFilled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs text-gray-400">
        {value === 0 ? '点击评分' : value === 1 ? '一般' : value === 2 ? '不错' : '很棒'}
      </span>
    </div>
  );
}
