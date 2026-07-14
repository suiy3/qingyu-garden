import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/layout/BottomNav';
import ActionCard from '@/components/actions/ActionCard';
import { microActions } from '@/data/microActions';
import { ActionCategory } from '@/types';
import { cn } from '@/lib/utils';

const categories: { key: ActionCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: '全部', emoji: '✨' },
  { key: 'breathing', label: '呼吸练习', emoji: '🌬️' },
  { key: 'first-aid', label: '情绪急救', emoji: '🩹' },
  { key: 'mindfulness', label: '正念引导', emoji: '🧘' },
  { key: 'relaxation', label: '身体放松', emoji: '💆' },
];

export default function ActionCenter() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ActionCategory | 'all'>('all');

  const filteredActions = activeCategory === 'all'
    ? microActions
    : microActions.filter(action => action.category === activeCategory);

  const handleCardClick = (actionId: string) => {
    navigate(`/action/${actionId}`);
  };

  return (
    <div className="relative min-h-screen">
      <PageContainer title="微行动">
        <div className="px-4 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300',
                  activeCategory === category.key
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md shadow-primary-300/30'
                    : 'bg-white text-gray-600 hover:bg-warm-50'
                )}
              >
                <span>{category.emoji}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onClick={() => handleCardClick(action.id)}
              />
            ))}
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </div>
  );
}
