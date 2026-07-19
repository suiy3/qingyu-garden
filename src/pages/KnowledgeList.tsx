import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Tag, HelpCircle, Image as ImageIcon } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import Empty from '@/components/Empty';
import { useAppStore } from '@/store/useAppStore';
import { SUBJECT_CONFIG } from '@/utils/constants';
import { SubjectType, KnowledgeNote, NoteType } from '@/types';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

const SUBJECT_TABS: Array<{ key: 'all' | SubjectType; label: string; emoji: string }> = [
  { key: 'all', label: '全部', emoji: '📚' },
  { key: 'chinese', label: '语文', emoji: '📖' },
  { key: 'math', label: '数学', emoji: '🔢' },
  { key: 'english', label: '英语', emoji: '🔤' },
  { key: 'physics', label: '物理', emoji: '⚛️' },
  { key: 'chemistry', label: '化学', emoji: '🧪' },
  { key: 'other', label: '其他', emoji: '📝' },
];

const TYPE_TABS: Array<{ key: 'all' | NoteType; label: string; emoji: string }> = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'normal', label: '笔记', emoji: '📝' },
  { key: 'question', label: '错题', emoji: '❓' },
];

export default function KnowledgeList() {
  const navigate = useNavigate();
  const { knowledgeNotes } = useAppStore();
  const [activeSubject, setActiveSubject] = useState<'all' | SubjectType>('all');
  const [activeType, setActiveType] = useState<'all' | NoteType>('all');
  const [searchText, setSearchText] = useState('');

  const filteredNotes = useMemo(() => {
    let result = [...knowledgeNotes];

    if (activeSubject !== 'all') {
      result = result.filter((n) => n.subject === activeSubject);
    }

    if (activeType !== 'all') {
      result = result.filter((n) => (n.noteType || 'normal') === activeType);
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(keyword) ||
          n.content.toLowerCase().includes(keyword) ||
          n.question?.toLowerCase().includes(keyword) ||
          n.tags.some((t) => t.toLowerCase().includes(keyword))
      );
    }

    return result;
  }, [knowledgeNotes, activeSubject, activeType, searchText]);

  const stats = useMemo(() => {
    const countBySubject: Record<string, number> = {};
    let questionCount = 0;
    let normalCount = 0;
    knowledgeNotes.forEach((n) => {
      countBySubject[n.subject] = (countBySubject[n.subject] || 0) + 1;
      if ((n.noteType || 'normal') === 'question') questionCount++;
      else normalCount++;
    });
    return {
      total: knowledgeNotes.length,
      questionCount,
      normalCount,
      countBySubject,
    };
  }, [knowledgeNotes]);

  return (
    <PageContainer title="知识点与错题" showBack>
      <div className="px-4 py-6 space-y-5">
        {/* 顶部统计 */}
        <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-sky-600 font-medium">已积累</p>
              <div className="flex items-baseline gap-3 mt-1">
                <p className="text-3xl font-bold text-gray-800">{stats.total} 篇</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-sky-600">📝 笔记 {stats.normalCount}</span>
                  <span className="text-amber-600">❓ 错题 {stats.questionCount}</span>
                </div>
              </div>
            </div>
            <div className="text-5xl">📒</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/knowledge/new')} className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-left text-white shadow-md shadow-sky-200 active:scale-[0.98]">
            <span className="text-2xl">📝</span>
            <p className="mt-2 text-sm font-bold">记一个知识点</p>
            <p className="mt-1 text-xs text-white/70">公式、概念或心得</p>
          </button>
          <button onClick={() => navigate('/knowledge/new?type=question')} className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-left text-white shadow-md shadow-amber-200 active:scale-[0.98]">
            <span className="text-2xl">❓</span>
            <p className="mt-2 text-sm font-bold">记一道错题</p>
            <p className="mt-1 text-xs text-white/75">答案、订正与错因</p>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索标题、内容、题目……"
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent shadow-sm"
          />
        </div>

        {/* 类型筛选 */}
        <div className="flex gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeType === tab.key
                  ? 'bg-white text-sky-600 shadow-sm border border-sky-200'
                  : 'bg-transparent text-gray-500'
              )}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 学科筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {SUBJECT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubject(tab.key)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium transition-all',
                activeSubject === tab.key
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-500 text-white shadow-md shadow-sky-200'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              )}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {tab.key !== 'all' && stats.countBySubject[tab.key] !== undefined && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  activeSubject === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {stats.countBySubject[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 笔记列表 */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <Empty
              emoji="📒"
              title={searchText ? '没有找到相关笔记' : '还没有知识笔记'}
              description={searchText ? '换个关键词试试' : '记录学习时，随手记一下今天学了什么'}
            />
          ) : (
            filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onClick={() => navigate(`/knowledge/${note.id}`)} />
            ))
          )}
        </div>
      </div>

      {/* 悬浮新建按钮 */}
      <button
        aria-label="新建知识点或错题"
        onClick={() => navigate('/knowledge/new')}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-300 flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus size={24} />
      </button>
    </PageContainer>
  );
}

function NoteCard({ note, onClick }: { note: KnowledgeNote; onClick: () => void }) {
  const config = SUBJECT_CONFIG[note.subject];
  const isQuestion = (note.noteType || 'normal') === 'question';
  const hasImages = (note.images || []).length > 0;
  const preview = isQuestion
    ? (note.question || '').length > 60
      ? (note.question || '').slice(0, 60) + '…'
      : note.question
    : note.content.length > 60
      ? note.content.slice(0, 60) + '…'
      : note.content;

  const difficultyStars = note.difficulty
    ? '★'.repeat(note.difficulty) + '☆'.repeat(5 - note.difficulty)
    : null;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        isQuestion && 'border-l-4 border-l-amber-400'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${config.color}15` }}
        >
          {isQuestion ? <HelpCircle size={24} className="text-amber-500" /> : config.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">{note.title}</h4>
              {isQuestion && (
                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                  题目
                </span>
              )}
            </div>
            <span
              className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 whitespace-pre-wrap">
            {preview}
          </p>
          {/* 图片缩略图 */}
          {hasImages && (
            <div className="flex gap-1.5 mb-2">
              {(note.images || []).slice(0, 3).map((src, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {(note.images || []).length > 3 && (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-gray-400">+{(note.images || []).length - 3}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {isQuestion && difficultyStars && (
                <span className="inline-flex items-center text-[10px] text-amber-500 font-medium">
                  {difficultyStars}
                </span>
              )}
              {hasImages && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-500">
                  <ImageIcon size={10} />
                  {(note.images || []).length}
                </span>
              )}
              {note.tags.slice(0, isQuestion ? 2 : 3).map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {formatDate(note.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
