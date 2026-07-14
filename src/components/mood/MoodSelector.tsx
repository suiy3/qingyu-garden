import { MoodType } from '@/types';
import { MOOD_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

const moods: MoodType[] = ['happy', 'calm', 'anxious', 'sad', 'angry', 'tired'];

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-3">
        {moods.map((mood) => {
          const config = MOOD_CONFIG[mood];
          const isSelected = selected === mood;
          return (
            <button
              key={mood}
              onClick={() => onSelect(mood)}
              className={cn(
                'flex flex-col items-center justify-center',
                'transition-all duration-300 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-300',
                isSelected ? 'scale-110 z-10' : 'hover:scale-105 active:scale-95'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-full',
                  'flex items-center justify-center',
                  'text-3xl sm:text-4xl',
                  'bg-gradient-to-br',
                  'shadow-soft',
                  'transition-all duration-300 ease-out',
                  isSelected && 'ring-4 ring-white ring-offset-2 ring-offset-warm-50 shadow-soft-lg'
                )}
                style={{
                  background: `linear-gradient(135deg, ${config.color}40, ${config.color}80)`,
                  boxShadow: isSelected
                    ? `0 0 0 4px white, 0 0 0 6px ${config.color}30, 0 10px 25px ${config.color}40`
                    : `0 4px 15px ${config.color}30`,
                }}
              >
                {config.emoji}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  'transition-all duration-300',
                  isSelected ? 'text-primary-600 font-semibold' : 'text-gray-600'
                )}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
