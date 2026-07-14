import { Clock } from 'lucide-react';
import { MicroAction } from '@/types';
import { ACTION_CATEGORY_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: MicroAction;
  onClick: () => void;
}

export default function ActionCard({ action, onClick }: ActionCardProps) {
  const categoryConfig = ACTION_CATEGORY_CONFIG[action.category];
  const minutes = Math.floor(action.duration / 60);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-5 rounded-3xl text-left overflow-hidden',
        'bg-gradient-to-br',
        action.gradient,
        'shadow-soft-lg hover:shadow-soft-lg',
        'transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300',
        'group'
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transform translate-x-8 -translate-y-8">
        <div className="absolute inset-0 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 transform -translate-x-6 translate-y-6">
        <div className="absolute inset-0 bg-white rounded-full blur-xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
            {action.icon}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-medium">
            <span>{categoryConfig.emoji}</span>
            <span>{categoryConfig.label}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
          {action.name}
        </h3>

        <p className="text-white/85 text-sm line-clamp-2 mb-4 leading-relaxed">
          {action.description}
        </p>

        <div className="flex items-center gap-1.5 text-white/90">
          <Clock size={16} />
          <span className="text-sm font-medium">{minutes} 分钟</span>
        </div>
      </div>
    </button>
  );
}
