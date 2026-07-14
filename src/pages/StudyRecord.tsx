import { useState, useEffect } from 'react';
import { Clock, Edit3, X, Star, BookOpen, ChevronDown, HelpCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SubjectSelector from '@/components/study/SubjectSelector';
import StudyTimer from '@/components/study/StudyTimer';
import RatingStars from '@/components/study/RatingStars';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Empty from '@/components/Empty';
import ImageUploader from '@/components/common/ImageUploader';
import { useAppStore } from '@/store/useAppStore';
import { SubjectType, NoteType } from '@/types';
import { SUBJECT_CONFIG } from '@/utils/constants';
import { formatDuration, formatDateTime } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Mode = 'timer' | 'manual';

export default function StudyRecord() {
  const navigate = useNavigate();
  const { studyRecords, addStudyRecord, addKnowledgeNote } = useAppStore();
  const [mode, setMode] = useState<Mode>('timer');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  const [focusRating, setFocusRating] = useState(0);
  const [efficiencyRating, setEfficiencyRating] = useState(0);
  const [moodRating, setMoodRating] = useState(0);
  const [manualDuration, setManualDuration] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('normal');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteQuestion, setNoteQuestion] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };
  const handleStop = () => {
    setIsRunning(false);
    if (time > 0) {
      setShowRatingPanel(true);
    }
  };

  const handleSave = () => {
    if (!selectedSubject) return;

    const duration = mode === 'timer' ? Math.floor(time / 60) : parseInt(manualDuration);

    if (duration <= 0) return;
    if (focusRating === 0 || efficiencyRating === 0 || moodRating === 0) return;

    const studyRecordId = addStudyRecord(
      selectedSubject,
      duration,
      focusRating,
      efficiencyRating,
      moodRating
    );

    if (noteTitle.trim() || noteContent.trim() || noteQuestion.trim() || noteImages.length > 0) {
      addKnowledgeNote(
        selectedSubject,
        noteTitle.trim() || (noteType === 'question' ? '错题记录' : '学习笔记'),
        noteContent.trim(),
        [],
        studyRecordId,
        noteType,
        noteType === 'question' ? { question: noteQuestion.trim(), myAnswer: noteContent.trim() } : undefined,
        noteImages
      );
    }

    resetForm();
  };

  const resetForm = () => {
    setShowRatingPanel(false);
    setSelectedSubject(null);
    setTime(0);
    setIsRunning(false);
    setFocusRating(0);
    setEfficiencyRating(0);
    setMoodRating(0);
    setManualDuration('');
    setShowNoteInput(false);
    setNoteType('normal');
    setNoteTitle('');
    setNoteContent('');
    setNoteQuestion('');
    setNoteImages([]);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const canSave =
    selectedSubject &&
    (mode === 'timer' ? time >= 60 : parseInt(manualDuration) > 0) &&
    focusRating > 0 &&
    efficiencyRating > 0 &&
    moodRating > 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStars = (rating: number, size = 16) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
          strokeWidth={star <= rating ? 0 : 2}
        />
      ))}
    </div>
  );

  return (
    <PageContainer title="学习记录" showBack>
      <div className="px-4 py-6 space-y-6">
        <div className="flex bg-sky-50 rounded-full p-1">
          <button
            onClick={() => handleModeChange('timer')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-medium transition-all duration-300',
              mode === 'timer'
                ? 'bg-white text-sky-600 shadow-soft'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Clock size={18} />
            <span>计时器</span>
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-medium transition-all duration-300',
              mode === 'manual'
                ? 'bg-white text-sky-600 shadow-soft'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Edit3 size={18} />
            <span>手动记录</span>
          </button>
        </div>

        {mode === 'timer' ? (
          <Card className="space-y-6 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">选择科目</h3>
              <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />
            </div>

            {selectedSubject && (
              <div className="pt-4 border-t border-sky-100">
                <StudyTimer
                  isRunning={isRunning}
                  time={time}
                  onStart={handleStart}
                  onPause={handlePause}
                  onReset={handleReset}
                  onStop={handleStop}
                />
              </div>
            )}
          </Card>
        ) : (
          <Card className="space-y-6 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">选择科目</h3>
              <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />
            </div>

            {selectedSubject && (
              <div className="space-y-6 pt-4 border-t border-sky-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学习时长（分钟）
                  </label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="请输入学习时长"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-medium text-gray-700">学习评分</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <RatingStars label="专注度" value={focusRating} onChange={setFocusRating} />
                    <RatingStars label="效率" value={efficiencyRating} onChange={setEfficiencyRating} />
                    <RatingStars label="心情" value={moodRating} onChange={setMoodRating} />
                  </div>
                </div>

                {/* 记知识点 */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="w-full flex items-center justify-between py-2 text-sm text-sky-600 font-medium"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={16} />
                      记一下今天学了什么
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn('transition-transform', showNoteInput && 'rotate-180')}
                    />
                  </button>

                  {showNoteInput && (
                    <div className="space-y-3 animate-fade-in">
                      {/* 类型切换 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNoteType('normal')}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                            noteType === 'normal'
                              ? 'bg-sky-100 text-sky-600'
                              : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          📝 普通笔记
                        </button>
                        <button
                          onClick={() => setNoteType('question')}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                            noteType === 'question'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          ❓ 题目/错题
                        </button>
                      </div>

                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder={noteType === 'question' ? '题目名称（如：二次函数图像题）' : '知识点标题（如：二次函数顶点式）'}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                      />

                      {noteType === 'question' && (
                        <textarea
                          value={noteQuestion}
                          onChange={(e) => setNoteQuestion(e.target.value)}
                          placeholder="题目内容……"
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
                        />
                      )}

                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder={noteType === 'question' ? '我的答案 / 解题过程……' : '详细内容、公式、心得……'}
                        rows={noteType === 'question' ? 3 : 4}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent resize-none"
                      />

                      <ImageUploader images={noteImages} onChange={setNoteImages} />

                      <p className="text-[10px] text-gray-400">
                        {noteType === 'question' ? '保存后可以去知识笔记里补充正确答案和错因分析' : ''}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 shadow-md shadow-sky-200 text-white font-medium"
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  保存记录
                </Button>
              </div>
            )}
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">学习历史</h3>
          {studyRecords.length === 0 ? (
            <Empty title="暂无学习记录" description="开始记录你的第一次学习吧" />
          ) : (
            <div className="space-y-3">
              {studyRecords.map((record) => {
                const config = SUBJECT_CONFIG[record.subject];
                return (
                  <Card key={record.id} className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800 truncate">{config.label}</h4>
                        <span className="text-sm font-semibold text-sky-600 flex-shrink-0">
                          {formatDuration(record.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {formatDateTime(record.createdAt)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">专注</span>
                          {renderStars(record.focusRating, 14)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">效率</span>
                          {renderStars(record.efficiencyRating, 14)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">心情</span>
                          {renderStars(record.moodRating, 14)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRatingPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRatingPanel(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">完成学习！</h3>
              <button
                onClick={() => setShowRatingPanel(false)}
                className="p-2 rounded-full hover:bg-sky-100 transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🎉</div>
              <p className="text-gray-600">
                本次学习时长：
                <span className="font-bold text-sky-600">{formatTime(time)}</span>
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <h4 className="text-sm font-medium text-gray-700 text-center">给这次学习打分吧</h4>
              <div className="grid grid-cols-3 gap-2">
                <RatingStars label="专注度" value={focusRating} onChange={setFocusRating} />
                <RatingStars label="效率" value={efficiencyRating} onChange={setEfficiencyRating} />
                <RatingStars label="心情" value={moodRating} onChange={setMoodRating} />
              </div>

              {/* 记知识点 */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="w-full flex items-center justify-between py-2 text-sm text-sky-600 font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={16} />
                    记一下今天学了什么
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn('transition-transform', showNoteInput && 'rotate-180')}
                  />
                </button>

                {showNoteInput && (
                  <div className="space-y-3 animate-fade-in">
                    {/* 类型切换 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNoteType('normal')}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                          noteType === 'normal'
                            ? 'bg-sky-100 text-sky-600'
                            : 'bg-gray-50 text-gray-500'
                        )}
                      >
                        📝 普通笔记
                      </button>
                      <button
                        onClick={() => setNoteType('question')}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                          noteType === 'question'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-50 text-gray-500'
                        )}
                      >
                        ❓ 题目/错题
                      </button>
                    </div>

                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={noteType === 'question' ? '题目名称（如：二次函数图像题）' : '知识点标题（如：二次函数顶点式）'}
                      className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                    />

                    {noteType === 'question' && (
                      <textarea
                        value={noteQuestion}
                        onChange={(e) => setNoteQuestion(e.target.value)}
                        placeholder="题目内容……"
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
                      />
                    )}

                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder={noteType === 'question' ? '我的答案 / 解题过程……' : '详细内容、公式、心得……'}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent resize-none"
                    />

                    <ImageUploader images={noteImages} onChange={setNoteImages} />

                    <p className="text-[10px] text-gray-400">
                      {noteType === 'question' ? '保存后可以去知识笔记里补充正确答案和错因分析' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-sky-100 text-sky-600 hover:bg-sky-200 font-medium"
                onClick={() => setShowRatingPanel(false)}
              >
                取消
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 shadow-md shadow-sky-200 text-white font-medium"
                onClick={handleSave}
                disabled={focusRating === 0 || efficiencyRating === 0 || moodRating === 0}
              >
                保存记录
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
