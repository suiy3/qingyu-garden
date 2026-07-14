import { cn } from '@/lib/utils';

interface EmptyProps {
  title?: string;
  description?: string;
  emoji?: string;
  className?: string;
}

export default function Empty({ title = '暂无数据', description, emoji = '📭', className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="text-5xl mb-4 opacity-60">{emoji}</div>
      <p className="text-gray-600 font-medium text-base">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-2">{description}</p>
      )}
    </div>
  );
}
