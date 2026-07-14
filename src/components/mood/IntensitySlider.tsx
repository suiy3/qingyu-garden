import { cn } from '@/lib/utils';

interface IntensitySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export default function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const percentage = ((value - 1) / 9) * 100;

  const getIntensityLabel = (val: number): string => {
    if (val <= 3) return '轻微';
    if (val <= 6) return '中等';
    if (val <= 8) return '较强';
    return '强烈';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-600">情绪强度</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            {value}
          </span>
          <span className="text-sm text-gray-500">/ 10</span>
        </div>
      </div>

      <div className="relative">
        <div className="relative h-3 rounded-full bg-warm-100 overflow-hidden">
          <div
            className={cn(
              'absolute left-0 top-0 h-full rounded-full',
              'bg-gradient-to-r from-primary-300 via-primary-500 to-rose-500',
              'transition-all duration-200 ease-out'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            'w-7 h-7 rounded-full bg-white shadow-soft border-2 border-primary-400',
            'pointer-events-none transition-all duration-200 ease-out',
            'flex items-center justify-center'
          )}
          style={{ left: `calc(${percentage}% - 14px)` }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-xs text-gray-400">1 轻微</span>
        <span className="text-sm font-medium text-primary-500">{getIntensityLabel(value)}</span>
        <span className="text-xs text-gray-400">10 强烈</span>
      </div>
    </div>
  );
}
