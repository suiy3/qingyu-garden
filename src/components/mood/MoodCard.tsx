import { MoodRecord } from '@/types';
import { MOOD_CONFIG, TRIGGER_CONFIG } from '@/utils/constants';
import { formatTime, formatDate, getDayOfWeek } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MoodCardProps {
  record: MoodRecord;
}

export default function MoodCard({ record }: MoodCardProps) {
  const moodConfig = MOOD_CONFIG[record.moodType];

  return (
    <div
      className={cn(
        'relative bg-white rounded-[20px] p-5 shadow-soft',
        'hover:shadow-soft-lg transition-all duration-300',
        'overflow-hidden'
      )}
    >
      <div
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{
          background: `linear-gradient(180deg, ${moodConfig.color}, ${moodConfig.color}80)`,
        }}
      />

      <div className="flex items-start gap-4 pl-2">
        <div
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-full',
            'flex items-center justify-center text-2xl',
            'shadow-soft'
          )}
          style={{
            background: `linear-gradient(135deg, ${moodConfig.color}30, ${moodConfig.color}15)`,
          }}
        >
          {moodConfig.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 text-lg">{moodConfig.label}</h3>
            <div className="flex items-center gap-1">
              <span
                className="text-xl font-bold"
                style={{ color: moodConfig.color }}
              >
                {record.intensity}
              </span>
              <span className="text-xs text-gray-400">/10</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span>{formatDate(record.createdAt)}</span>
            <span className="text-gray-300">·</span>
            <span>{getDayOfWeek(record.createdAt)}</span>
            <span className="text-gray-300">·</span>
            <span>{formatTime(record.createdAt)}</span>
          </div>

          {record.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {record.triggers.map((trigger) => {
                const triggerConfig = TRIGGER_CONFIG[trigger];
                return (
                  <span
                    key={trigger}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
                      'text-xs font-medium',
                      'bg-warm-50 text-primary-700'
                    )}
                  >
                    <span>{triggerConfig.emoji}</span>
                    <span>{triggerConfig.label}</span>
                  </span>
                );
              })}
            </div>
          )}

          {record.note && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{record.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}
