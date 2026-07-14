import { TriggerType } from '@/types';
import { TRIGGER_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface TriggerTagsProps {
  selected: TriggerType[];
  onToggle: (trigger: TriggerType) => void;
}

const triggers: TriggerType[] = ['study', 'relationship', 'family', 'health', 'other'];

export default function TriggerTags({ selected, onToggle }: TriggerTagsProps) {
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-600 mb-3">触发因素（可多选）</p>
      <div className="flex flex-wrap gap-2">
        {triggers.map((trigger) => {
          const config = TRIGGER_CONFIG[trigger];
          const isSelected = selected.includes(trigger);
          return (
            <button
              key={trigger}
              onClick={() => onToggle(trigger)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full',
                'text-sm font-medium',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-300',
                'active:scale-95',
                isSelected
                  ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-soft scale-105'
                  : 'bg-warm-50 text-primary-700 hover:bg-warm-100 hover:scale-105'
              )}
            >
              <span className="text-base">{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
