import { SubjectType } from '@/types';
import { SUBJECT_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface SubjectSelectorProps {
  selected: SubjectType | null;
  onSelect: (subject: SubjectType) => void;
}

export default function SubjectSelector({ selected, onSelect }: SubjectSelectorProps) {
  const subjects = Object.entries(SUBJECT_CONFIG) as [SubjectType, typeof SUBJECT_CONFIG[SubjectType]][];

  return (
    <div className="grid grid-cols-3 gap-3">
      {subjects.map(([key, config]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              'relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 transform',
              'hover:scale-105 active:scale-95',
              'shadow-soft hover:shadow-soft-lg',
              isSelected
                ? 'bg-white ring-2 ring-offset-2'
                : 'bg-white/70 hover:bg-white'
            )}
            style={{
              boxShadow: isSelected ? `0 4px 20px -2px ${config.color}40, 0 0 0 2px ${config.color}, 0 0 0 4px white` : undefined,
            }}
          >
            <div
              className={cn(
                'text-3xl mb-2 transition-transform duration-300',
                isSelected && 'animate-bounce-soft'
              )}
            >
              {config.emoji}
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors duration-300',
                isSelected ? 'text-gray-800' : 'text-gray-600'
              )}
            >
              {config.label}
            </span>
            {isSelected && (
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: config.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
