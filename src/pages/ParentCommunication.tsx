import { useMemo, useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Share2,
  ChevronDown,
  Quote,
  BarChart3,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import { useAppStore } from '@/store/useAppStore';
import { generateDialogCard, DialogCard } from '@/utils/dialogCardEngine';
import { cn } from '@/lib/utils';

export default function ParentCommunication() {
  const { moodRecords, studyRecords } = useAppStore();
  const [showReason, setShowReason] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const card = useMemo<DialogCard>(() => {
    return generateDialogCard(moodRecords, studyRecords);
  }, [moodRecords, studyRecords, cardKey]);

  const handleRefresh = () => {
    setCardKey((k) => k + 1);
  };

  return (
    <PageContainer title="今日对话卡" showBack>
      <div className="px-4 py-4 space-y-4">
        {/* 对话卡主体 */}
        <div className="relative">
          {/* 主卡片 */}
          <div className={cn('rounded-2xl overflow-hidden bg-gradient-to-br shadow-lg', card.background)}>
            {/* 卡片头部 */}
            <div className="px-5 pt-5 pb-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-white/80" />
                  <span className="text-sm text-white/80">今日对话卡</span>
                </div>
                <span className="text-xs text-white/70">{card.date}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{card.title}</h2>
              <p className="text-sm text-white/80">{card.subtitle}</p>
            </div>

            {/* 开场问什么 */}
            <div className="mx-3 mb-2 bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-yellow-300" />
                <span className="text-sm font-medium">今晚可以这样问</span>
              </div>
              <div className="space-y-2.5">
                {card.openingLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 bg-white/10 rounded-xl px-3 py-2.5"
                  >
                    <Quote size={12} className="text-white/50 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed font-medium">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 不要说什么 */}
            <div className="mx-3 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-red-300" />
                <span className="text-sm font-medium">尽量别说这些</span>
              </div>
              <div className="space-y-2">
                {card.dontSay.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 bg-white/10 rounded-xl px-3 py-2"
                  >
                    <span className="text-red-300 text-xs font-bold flex-shrink-0 mt-0.5">✕</span>
                    <p className="text-sm leading-relaxed text-white/70 line-through decoration-red-300/60 decoration-2">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="px-4 pb-4 flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} />
                换一张
              </button>
              <button
                onClick={() => setShowReason(!showReason)}
                className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <BarChart3 size={14} />
                为什么是这张
              </button>
            </div>
          </div>
        </div>

        {/* 为什么是这张 - 可展开 */}
        {showReason && (
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800">为什么是这张卡？</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {card.reason}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 bg-gray-100 rounded-full">{card.dataSource}</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                卡片类型：
                {card.cardType === 'mood' && '情绪优先'}
                {card.cardType === 'study' && '学习切入'}
                {card.cardType === 'mixed' && '情绪×学习'}
                {card.cardType === 'positive' && '积极强化'}
              </span>
            </div>
          </Card>
        )}

        {/* 小贴士 */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm mb-1">今日沟通小提示</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {card.tip}
              </p>
            </div>
          </div>
        </Card>

        {/* 使用说明 */}
        <Card>
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            怎么用这张卡
          </h4>
          <div className="space-y-2.5">
            {[
              '选一个你觉得合适的开场问题，记在心里',
              '找个放松的时机（吃饭时、路上、睡前），自然地聊起来',
              '孩子说的时候，认真听，别急着给建议',
              '聊不下去也没关系，至少开了个头',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary-600">{i + 1}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            每天一张对话卡，让沟通变得简单一点
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
