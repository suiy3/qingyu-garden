import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
  isRunning: boolean;
  time: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStop: () => void;
}

export default function StudyTimer({
  isRunning,
  time,
  onStart,
  onPause,
  onReset,
  onStop,
}: StudyTimerProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="relative">
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-1000',
            isRunning ? 'bg-gradient-to-br from-amber-300 to-orange-400' : 'bg-gradient-to-br from-gray-200 to-gray-300'
          )}
          style={{ transform: 'scale(1.2)' }}
        />
        <div
          className={cn(
            'relative w-64 h-64 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-white to-warm-50',
            'shadow-soft-lg',
            isRunning && 'animate-pulse-slow'
          )}
        >
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={cn(
                  'text-7xl font-bold tracking-tight transition-colors duration-500',
                  isRunning ? 'text-amber-600' : 'text-gray-700'
                )}
              >
                {formatTime(minutes)}
              </span>
              <span
                className={cn(
                  'text-6xl font-bold transition-colors duration-500',
                  isRunning ? 'text-amber-500' : 'text-gray-400'
                )}
              >
                :
              </span>
              <span
                className={cn(
                  'text-7xl font-bold tracking-tight transition-colors duration-500',
                  isRunning ? 'text-amber-600' : 'text-gray-700'
                )}
              >
                {formatTime(seconds)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {isRunning ? '专注中...' : time > 0 ? '已暂停' : '准备开始'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className={cn(
              'flex items-center gap-2 px-8 py-4 rounded-full font-medium',
              'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
              'shadow-soft hover:shadow-soft-lg',
              'transform hover:scale-105 active:scale-95 transition-all duration-300'
            )}
          >
            <Play size={20} fill="white" />
            <span>{time > 0 ? '继续' : '开始专注'}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className={cn(
              'flex items-center gap-2 px-8 py-4 rounded-full font-medium',
              'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
              'shadow-soft hover:shadow-soft-lg',
              'transform hover:scale-105 active:scale-95 transition-all duration-300'
            )}
          >
            <Pause size={20} fill="white" />
            <span>暂停</span>
          </button>
        )}

        <button
          onClick={onReset}
          className={cn(
            'p-4 rounded-full',
            'bg-white text-gray-500 hover:text-amber-500',
            'shadow-soft hover:shadow-soft-lg',
            'transform hover:scale-105 active:scale-95 transition-all duration-300'
          )}
          title="重置"
        >
          <RotateCcw size={20} />
        </button>

        {time > 0 && (
          <button
            onClick={onStop}
            className={cn(
              'p-4 rounded-full',
              'bg-white text-gray-500 hover:text-rose-500',
              'shadow-soft hover:shadow-soft-lg',
              'transform hover:scale-105 active:scale-95 transition-all duration-300'
            )}
            title="结束"
          >
            <Square size={20} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
