import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import MoodSelector from '@/components/mood/MoodSelector';
import IntensitySlider from '@/components/mood/IntensitySlider';
import TriggerTags from '@/components/mood/TriggerTags';
import MoodCard from '@/components/mood/MoodCard';
import { useAppStore } from '@/store/useAppStore';
import { MoodType, TriggerType } from '@/types';

export default function MoodRecord() {
  const navigate = useNavigate();
  const { moodRecords, addMoodRecord } = useAppStore();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [triggers, setTriggers] = useState<TriggerType[]>([]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleTrigger = (trigger: TriggerType) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleSave = () => {
    if (!selectedMood) return;

    addMoodRecord(selectedMood, intensity, triggers, note);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleViewInsight = () => {
    navigate('/mood-insight');
  };

  const recentRecords = moodRecords.slice(0, 5);

  return (
    <PageContainer title="记录心情" showBack>
      <div className="px-4 py-6 space-y-6">
        {showSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-soft">
            <div className="flex items-center gap-2 px-6 py-3 bg-mint-400 text-white rounded-full shadow-soft-lg">
              <Check size={20} />
              <span className="font-medium">记录成功啦！</span>
            </div>
          </div>
        )}

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今天心情怎么样？</h3>
          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <IntensitySlider value={intensity} onChange={setIntensity} />
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <TriggerTags selected={triggers} onToggle={handleToggleTrigger} />
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <p className="text-sm font-medium text-gray-600 mb-3">想说点什么吗？</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="记录此刻的心情..."
            className="w-full h-28 px-4 py-3 rounded-xl bg-white/80 border border-orange-200
                       text-gray-700 placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent
                       transition-all"
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-400">{note.length}/200</span>
          </div>
        </Card>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-orange-200 text-white font-medium"
            onClick={handleSave}
            disabled={!selectedMood}
          >
            保存记录
          </Button>

          {showSuccess && (
            <Button
              size="lg"
              className="w-full bg-orange-100 text-orange-600 hover:bg-orange-200 font-medium"
              onClick={handleViewInsight}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={18} />
                查看情绪洞察
              </span>
            </Button>
          )}
        </div>

        {recentRecords.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">最近记录</h3>
              <button
                onClick={handleViewInsight}
                className="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors"
              >
                查看更多 →
              </button>
            </div>
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <MoodCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
