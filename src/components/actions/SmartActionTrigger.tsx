import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { microActions } from '@/data/microActions';
import { MoodRecord, MoodType, MicroAction } from '@/types';
import { formatDate, getPastDays } from '@/utils/date';
import { cn } from '@/lib/utils';

const NEGATIVE_MOODS: MoodType[] = ['anxious', 'sad', 'angry', 'tired'];

interface Trigger {
  reason: string;
  emoji: string;
  recommendedAction: MicroAction;
}

export default function SmartActionTrigger() {
  const navigate = useNavigate();
  const { moodRecords } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string>('');

  useEffect(() => {
    const result = detectTrigger(moodRecords);
    if (result) {
      // 用sessionStorage记录已关闭的触发，避免重复弹窗
      const key = `${result.reason}-${formatDate(new Date())}`;
      const dismissed = sessionStorage.getItem('dismissed_trigger');
      if (dismissed !== key) {
        setTrigger(result);
        setDismissedKey(key);
        // 延迟2秒弹窗，体验更自然
        const timer = setTimeout(() => setShowModal(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [moodRecords]);

  const handleDismiss = () => {
    setShowModal(false);
    sessionStorage.setItem('dismissed_trigger', dismissedKey);
  };

  const handleStartAction = () => {
    if (trigger) {
      setShowModal(false);
      navigate(`/action/${trigger.recommendedAction.id}`);
    }
  };

  if (!showModal || !trigger) return null;

  const action = trigger.recommendedAction;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden animate-slide-up shadow-soft-lg">
        {/* 顶部渐变区 */}
        <div className={cn('bg-gradient-to-br p-6 text-center relative', action.gradient)}>
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="text-5xl mb-3 animate-float">
            {trigger.emoji}
          </div>
          <p className="text-white/90 text-sm mb-1">晴语注意到你</p>
          <h3 className="text-white text-lg font-bold">{trigger.reason}</h3>
        </div>

        {/* 推荐行动 */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700">给你准备了一个3分钟微行动</span>
          </div>

          <div
            className={cn(
              'rounded-2xl p-4 bg-gradient-to-br text-white mb-4',
              action.gradient
            )}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{action.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold">{action.name}</h4>
                <p className="text-xs text-white/80 mt-0.5">{action.description}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              以后再说
            </button>
            <button
              onClick={handleStartAction}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white text-sm font-bold hover:from-orange-500 hover:to-amber-600 transition-all flex items-center justify-center gap-1 shadow-md shadow-orange-200"
            >
              现在试试
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 检测是否需要触发微行动推荐
 */
function detectTrigger(moodRecords: MoodRecord[]): Trigger | null {
  if (moodRecords.length === 0) return null;

  const now = new Date();
  const todayStr = formatDate(now);

  // 规则1：今天记录了高焦虑情绪
  const todayMoods = moodRecords.filter((m) => formatDate(m.createdAt) === todayStr);
  const highAnxiety = todayMoods.find(
    (m) => m.moodType === 'anxious' && m.intensity >= 7
  );
  if (highAnxiety) {
    return {
      reason: '今天焦虑感比较强',
      emoji: '😰',
      recommendedAction: microActions.find((a) => a.id === 'breathing-478') || microActions[0],
    };
  }

  // 规则2：今天记录了高愤怒情绪
  const highAnger = todayMoods.find(
    (m) => m.moodType === 'angry' && m.intensity >= 7
  );
  if (highAnger) {
    return {
      reason: '心情不太好，有点生气',
      emoji: '😤',
      recommendedAction: microActions.find((a) => a.id === 'firstaid-54321') || microActions[3],
    };
  }

  // 规则3：近3天有2天以上负面情绪
  const past3Days = getPastDays(3);
  let negativeDays = 0;
  past3Days.forEach((date) => {
    const dayMoods = moodRecords.filter((m) => formatDate(m.createdAt) === date);
    if (dayMoods.some((m) => NEGATIVE_MOODS.includes(m.moodType) && m.intensity >= 5)) {
      negativeDays++;
    }
  });
  if (negativeDays >= 2) {
    return {
      reason: '连续几天情绪都不太好',
      emoji: '🌧️',
      recommendedAction: microActions.find((a) => a.id === 'mindfulness-body') || microActions[4],
    };
  }

  // 规则4：今天记录了疲惫
  const tired = todayMoods.find(
    (m) => m.moodType === 'tired' && m.intensity >= 6
  );
  if (tired) {
    return {
      reason: '看起来你有点累了',
      emoji: '😴',
      recommendedAction: microActions.find((a) => a.id === 'relax-stretch') || microActions[7],
    };
  }

  return null;
}
