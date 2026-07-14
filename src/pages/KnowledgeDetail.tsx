import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Edit3, Trash2, ArrowLeft, Tag, Clock, Lightbulb,
  HelpCircle, CheckCircle, XCircle, Brain, ChevronDown, ChevronUp, Image as ImageIcon,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ImageUploader from '@/components/common/ImageUploader';
import { useAppStore } from '@/store/useAppStore';
import { SUBJECT_CONFIG } from '@/utils/constants';
import { formatDate, formatDuration } from '@/utils/date';
import { DifficultyLevel, NoteType } from '@/types';
import { cn } from '@/lib/utils';

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { knowledgeNotes, studyRecords, updateKnowledgeNote, deleteKnowledgeNote } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editNoteType, setEditNoteType] = useState<NoteType>('normal');
  const [editQuestion, setEditQuestion] = useState('');
  const [editMyAnswer, setEditMyAnswer] = useState('');
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editWrongReason, setEditWrongReason] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>(3);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const note = useMemo(
    () => knowledgeNotes.find((n) => n.id === id),
    [knowledgeNotes, id]
  );

  const linkedStudy = useMemo(() => {
    if (!note?.studyRecordId) return null;
    return studyRecords.find((r) => r.id === note.studyRecordId) || null;
  }, [note, studyRecords]);

  if (!note) {
    return (
      <PageContainer title="笔记详情" showBack>
        <div className="px-4 py-20 text-center text-gray-400">
          笔记不存在或已被删除
        </div>
      </PageContainer>
    );
  }

  const config = SUBJECT_CONFIG[note.subject];
  const isQuestion = (note.noteType || 'normal') === 'question';

  const handleStartEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditNoteType(note.noteType || 'normal');
    setEditQuestion(note.question || '');
    setEditMyAnswer(note.myAnswer || '');
    setEditCorrectAnswer(note.correctAnswer || '');
    setEditWrongReason(note.wrongReason || '');
    setEditDifficulty(note.difficulty || 3);
    setEditImages(note.images || []);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateKnowledgeNote(note.id, {
      title: editTitle.trim(),
      content: editContent,
      noteType: editNoteType,
      question: editNoteType === 'question' ? editQuestion : undefined,
      myAnswer: editNoteType === 'question' ? editMyAnswer : undefined,
      correctAnswer: editNoteType === 'question' ? editCorrectAnswer : undefined,
      wrongReason: editNoteType === 'question' ? editWrongReason : undefined,
      difficulty: editNoteType === 'question' ? editDifficulty : undefined,
      images: editImages,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('确定删除这条笔记吗？')) {
      deleteKnowledgeNote(note.id);
      navigate(-1);
    }
  };

  return (
    <PageContainer
      title={isQuestion ? '题目详情' : '笔记详情'}
      showBack
      headerRight={
        !isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartEdit}
              className="p-2 rounded-full hover:bg-sky-100 transition-colors text-sky-600"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-100 transition-colors text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : null
      }
    >
      <div className="px-4 py-6 space-y-5">
        {isEditing ? (
          <EditMode
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editContent={editContent}
            setEditContent={setEditContent}
            editNoteType={editNoteType}
            setEditNoteType={setEditNoteType}
            editQuestion={editQuestion}
            setEditQuestion={setEditQuestion}
            editMyAnswer={editMyAnswer}
            setEditMyAnswer={setEditMyAnswer}
            editCorrectAnswer={editCorrectAnswer}
            setEditCorrectAnswer={setEditCorrectAnswer}
            editWrongReason={editWrongReason}
            setEditWrongReason={setEditWrongReason}
            editDifficulty={editDifficulty}
            setEditDifficulty={setEditDifficulty}
            editImages={editImages}
            setEditImages={setEditImages}
            onCancel={() => setIsEditing(false)}
            onSave={handleSave}
          />
        ) : (
          <>
            {/* 标题区 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  {config.emoji} {config.label}
                </span>
                {isQuestion && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">
                    ❓ 题目
                  </span>
                )}
                {isQuestion && note.difficulty && (
                  <span className="text-xs text-amber-500 font-medium">
                    {'★'.repeat(note.difficulty)}{'☆'.repeat(5 - note.difficulty)}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-800 leading-relaxed">
                {note.title}
              </h1>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 font-medium"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isQuestion ? (
              <QuestionView
                question={note.question || ''}
                myAnswer={note.myAnswer || ''}
                correctAnswer={note.correctAnswer || ''}
                wrongReason={note.wrongReason || ''}
                showCorrectAnswer={showCorrectAnswer}
                setShowCorrectAnswer={setShowCorrectAnswer}
                images={note.images || []}
                onImageClick={setPreviewImage}
              />
            ) : (
              /* 普通笔记内容 */
              <Card className="bg-white border border-gray-100">
                <div className="text-gray-700 leading-loose whitespace-pre-wrap text-[15px]">
                  {note.content || '暂无内容'}
                </div>
              </Card>
            )}

            {/* 图片展示（普通笔记） */}
            {!isQuestion && (note.images || []).length > 0 && (
              <Card className="bg-white border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-sky-500" />
                  <h3 className="text-sm font-semibold text-gray-700">图片</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(note.images || []).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewImage(src)}
                      className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img src={src} alt={`图片 ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* 关联学习 */}
            {linkedStudy && (
              <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-sky-500" />
                  <h3 className="text-sm font-semibold text-gray-700">这次学习的情况</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1">学习时长</p>
                    <p className="text-lg font-bold text-gray-800">{formatDuration(linkedStudy.duration)}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1">专注度</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={cn(
                            'text-sm',
                            s <= linkedStudy.focusRating ? 'text-amber-400' : 'text-gray-200'
                          )}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1">效率</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={cn(
                            'text-sm',
                            s <= linkedStudy.efficiencyRating ? 'text-amber-400' : 'text-gray-200'
                          )}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1">学习时心情</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={cn(
                            'text-sm',
                            s <= linkedStudy.moodRating ? 'text-rose-400' : 'text-gray-200'
                          )}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* 全屏图片预览 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="预览"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            <XCircle size={24} />
          </button>
        </div>
      )}
    </PageContainer>
  );
}

function QuestionView({
  question,
  myAnswer,
  correctAnswer,
  wrongReason,
  showCorrectAnswer,
  setShowCorrectAnswer,
  images,
  onImageClick,
}: {
  question: string;
  myAnswer: string;
  correctAnswer: string;
  wrongReason: string;
  showCorrectAnswer: boolean;
  setShowCorrectAnswer: (v: boolean) => void;
  images: string[];
  onImageClick: (src: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* 题目 */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-700">题目</h3>
        </div>
        <div className="text-gray-700 leading-loose whitespace-pre-wrap text-[15px]">
          {question || '暂无题目'}
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => onImageClick(src)}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img src={src} alt={`图片 ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* 我的答案 */}
      <Card className="bg-white border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={16} className="text-rose-400" />
          <h3 className="text-sm font-semibold text-gray-700">我的答案</h3>
        </div>
        <div className="text-gray-700 leading-loose whitespace-pre-wrap text-[15px]">
          {myAnswer || '暂无'}
        </div>
      </Card>

      {/* 正确答案 - 可折叠 */}
      <Card className="bg-white border border-emerald-100">
        <button
          onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
          className="w-full flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-700">正确答案</h3>
          </div>
          {showCorrectAnswer ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>
        {showCorrectAnswer && (
          <div className="text-gray-700 leading-loose whitespace-pre-wrap text-[15px] pt-2 border-t border-emerald-50">
            {correctAnswer || '暂无'}
          </div>
        )}
        {!showCorrectAnswer && (
          <p className="text-xs text-gray-400 text-center py-1">点击查看答案</p>
        )}
      </Card>

      {/* 错因分析 */}
      {wrongReason && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-700">错因分析</h3>
          </div>
          <div className="text-gray-700 leading-loose whitespace-pre-wrap text-[15px]">
            {wrongReason}
          </div>
        </Card>
      )}
    </div>
  );
}

function EditMode({
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editNoteType,
  setEditNoteType,
  editQuestion,
  setEditQuestion,
  editMyAnswer,
  setEditMyAnswer,
  editCorrectAnswer,
  setEditCorrectAnswer,
  editWrongReason,
  setEditWrongReason,
  editDifficulty,
  setEditDifficulty,
  editImages,
  setEditImages,
  onCancel,
  onSave,
}: {
  editTitle: string;
  setEditTitle: (v: string) => void;
  editContent: string;
  setEditContent: (v: string) => void;
  editNoteType: NoteType;
  setEditNoteType: (v: NoteType) => void;
  editQuestion: string;
  setEditQuestion: (v: string) => void;
  editMyAnswer: string;
  setEditMyAnswer: (v: string) => void;
  editCorrectAnswer: string;
  setEditCorrectAnswer: (v: string) => void;
  editWrongReason: string;
  setEditWrongReason: (v: string) => void;
  editDifficulty: DifficultyLevel;
  setEditDifficulty: (v: DifficultyLevel) => void;
  editImages: string[];
  setEditImages: (v: string[]) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* 类型切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setEditNoteType('normal')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
            editNoteType === 'normal'
              ? 'bg-sky-100 text-sky-600'
              : 'bg-gray-50 text-gray-500'
          )}
        >
          📝 普通笔记
        </button>
        <button
          onClick={() => setEditNoteType('question')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
            editNoteType === 'question'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gray-50 text-gray-500'
          )}
        >
          ❓ 题目笔记
        </button>
      </div>

      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        placeholder="标题"
        className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white text-lg font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
      />

      {editNoteType === 'question' ? (
        <>
          {/* 难度 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">难度</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setEditDifficulty(d as DifficultyLevel)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm transition-all',
                    editDifficulty === d
                      ? 'bg-amber-100 text-amber-600 font-medium'
                      : 'bg-gray-50 text-gray-400'
                  )}
                >
                  {'★'.repeat(d)}
                </button>
              ))}
            </div>
          </div>

          {/* 题目 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">题目</p>
            <textarea
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              placeholder="把题目写在这里……"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none leading-relaxed"
            />
          </div>

          {/* 我的答案 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">我的答案</p>
            <textarea
              value={editMyAnswer}
              onChange={(e) => setEditMyAnswer(e.target.value)}
              placeholder="你当时怎么写的……"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent resize-none leading-relaxed"
            />
          </div>

          {/* 正确答案 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">正确答案</p>
            <textarea
              value={editCorrectAnswer}
              onChange={(e) => setEditCorrectAnswer(e.target.value)}
              placeholder="标准答案……"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none leading-relaxed"
            />
          </div>

          {/* 错因分析 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">错因分析</p>
            <textarea
              value={editWrongReason}
              onChange={(e) => setEditWrongReason(e.target.value)}
              placeholder="为什么做错了？是哪里没掌握？"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-violet-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none leading-relaxed"
            />
          </div>
        </>
      ) : (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="笔记内容……"
          rows={15}
          className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent resize-none leading-relaxed"
        />
      )}

      {/* 图片上传 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">图片</p>
        <ImageUploader images={editImages} onChange={setEditImages} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          size="lg"
          className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={onCancel}
        >
          取消
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 shadow-md shadow-sky-200 text-white"
          onClick={onSave}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
