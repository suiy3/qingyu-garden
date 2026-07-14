import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Check } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import BreathingCircle from '@/components/actions/BreathingCircle';
import Button from '@/components/common/Button';
import { microActions } from '@/data/microActions';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type ActionState = 'idle' | 'playing' | 'paused' | 'completed';

export default function ActionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addActionLog = useAppStore((state) => state.addActionLog);

  const action = microActions.find((a) => a.id === id);

  const [timeLeft, setTimeLeft] = useState(action?.duration || 0);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [guideIndex, setGuideIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const guideIntervalRef = useRef<number | null>(null);

  const isBreathingCategory = action?.category === 'breathing';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (guideIntervalRef.current) {
      clearInterval(guideIntervalRef.current);
      guideIntervalRef.current = null;
    }
  };

  const startAction = () => {
    if (actionState === 'idle') {
      setTimeLeft(action?.duration || 0);
      setGuideIndex(0);
    }
    setActionState('playing');
  };

  const pauseAction = () => {
    setActionState('paused');
  };

  const endAction = (completed: boolean) => {
    clearTimers();
    setActionState('completed');
    if (action) {
      const actualDuration = action.duration - timeLeft;
      addActionLog(action.id, action.name, actualDuration > 0 ? actualDuration : 0, completed);
    }
  };

  const handleBack = () => {
    clearTimers();
    navigate(-1);
  };

  useEffect(() => {
    if (actionState === 'playing' && action) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimers();
            setActionState('completed');
            addActionLog(action.id, action.name, action.duration, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const guideDuration = action.duration / action.guideText.length;
      guideIntervalRef.current = window.setInterval(() => {
        setGuideIndex((prev) => {
          if (prev < action.guideText.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, guideDuration * 1000);
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [actionState, action, addActionLog]);

  if (!action) {
    return (
      <PageContainer title="微行动" showBack>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">未找到该行动</p>
          <Button onClick={() => navigate('/action')} className="mt-4">
            返回列表
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (actionState === 'completed') {
    return (
      <PageContainer>
        <div className={cn(
          'flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6',
          'bg-gradient-to-b',
          action.gradient,
          'from-opacity-20 to-opacity-10'
        )}>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-soft-lg flex items-center justify-center">
              <Check size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">做得很棒！</h2>
            <p className="text-gray-600 mb-2">你完成了 {action.name}</p>
            <p className="text-gray-500 text-sm mb-8">
              用时 {Math.floor((action.duration - timeLeft) / 60)} 分 {(action.duration - timeLeft) % 60} 秒
            </p>
            <div className="text-6xl mb-8">{action.icon}</div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              每一次小小的尝试，都是对自己的温柔呵护。
              <br />
              继续保持，你会越来越好的 ✨
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={handleBack}>
                返回列表
              </Button>
              <Button
                onClick={() => {
                  setActionState('idle');
                  setTimeLeft(action.duration);
                  setGuideIndex(0);
                }}
              >
                再来一次
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBack>
      <div className={cn(
        'flex flex-col min-h-[calc(100vh-3.5rem)]',
        'bg-gradient-to-b',
        action.gradient,
        'from-opacity-20 to-opacity-5'
      )}>
        <div className="px-6 pt-6 pb-4">
          <div className="text-center">
            <div className="text-5xl mb-3">{action.icon}</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{action.name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-7xl font-bold text-gray-800 mb-8 font-mono tracking-wider">
            {formatTime(timeLeft)}
          </div>

          {isBreathingCategory ? (
            <BreathingCircle isBreathing={actionState === 'playing'} />
          ) : (
            <div className={cn(
              'relative flex items-center justify-center w-64 h-64',
              actionState === 'playing' && 'animate-pulse-slow'
            )}>
              <div className={cn(
                'absolute w-56 h-56 rounded-full opacity-30',
                'bg-gradient-to-br',
                action.gradient,
                'blur-xl'
              )} />
              <div className={cn(
                'relative w-36 h-36 rounded-full',
                'bg-white shadow-soft-lg',
                'flex items-center justify-center'
              )}>
                <span className="text-6xl">{action.icon}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-5 mb-6 min-h-[100px] flex items-center justify-center">
            <p className="text-center text-gray-700 text-base leading-relaxed transition-all duration-500">
              {action.guideText[guideIndex]}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            {actionState === 'idle' || actionState === 'paused' ? (
              <Button onClick={startAction} size="lg" className="flex-1 max-w-[200px]">
                <span className="flex items-center justify-center gap-2">
                  <Play size={20} fill="currentColor" />
                  <span>{actionState === 'paused' ? '继续' : '开始'}</span>
                </span>
              </Button>
            ) : (
              <Button onClick={pauseAction} variant="secondary" size="lg" className="flex-1 max-w-[200px]">
                <span className="flex items-center justify-center gap-2">
                  <Pause size={20} fill="currentColor" />
                  <span>暂停</span>
                </span>
              </Button>
            )}
            {actionState !== 'idle' && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => endAction(false)}
                className="flex items-center justify-center"
              >
                <Square size={20} fill="currentColor" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
