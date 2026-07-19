import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Check, CircleHelp, Image as ImageIcon, Sparkles, Tag } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import SubjectSelector from '@/components/study/SubjectSelector';
import ImageUploader from '@/components/common/ImageUploader';
import { useAppStore } from '@/store/useAppStore';
import { DifficultyLevel, NoteType, SubjectType } from '@/types';
import { cn } from '@/lib/utils';

const subjects: SubjectType[] = ['chinese', 'math', 'english', 'physics', 'chemistry', 'other'];

export default function KnowledgeCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') as SubjectType | null;
  const initialType: NoteType = searchParams.get('type') === 'question' ? 'question' : 'normal';
  const addKnowledgeNote = useAppStore((state) => state.addKnowledgeNote);

  const [noteType, setNoteType] = useState<NoteType>(initialType);
  const [subject, setSubject] = useState<SubjectType | null>(
    initialSubject && subjects.includes(initialSubject) ? initialSubject : null
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wrongReason, setWrongReason] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [tagText, setTagText] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const isQuestion = noteType === 'question';
  const canSave = Boolean(subject && title.trim() && (isQuestion ? question.trim() : content.trim()));
  const tags = useMemo(
    () => tagText.split(/[\s,，、]+/).map((item) => item.trim()).filter(Boolean).slice(0, 8),
    [tagText]
  );

  const handleSave = () => {
    if (!subject || !canSave) return;
    const id = addKnowledgeNote(
      subject,
      title.trim(),
      isQuestion ? myAnswer.trim() : content.trim(),
      tags,
      undefined,
      noteType,
      isQuestion
        ? {
            question: question.trim(),
            myAnswer: myAnswer.trim(),
            correctAnswer: correctAnswer.trim(),
            wrongReason: wrongReason.trim(),
            difficulty,
          }
        : undefined,
      images
    );
    navigate(`/knowledge/${id}`, { replace: true });
  };

  return (
    <PageContainer title={isQuestion ? '记录一道错题' : '记录一个知识点'} showBack className="px-4 pt-5">
      <div className="mx-auto max-w-xl space-y-4 pb-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 p-5 text-white shadow-soft-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              {isQuestion ? <CircleHelp size={25} /> : <BookOpen size={25} />}
            </div>
            <div>
              <p className="text-xs text-white/70">学习沉淀</p>
              <h1 className="mt-0.5 text-xl font-bold">{isQuestion ? '把错因留下，比只记答案更有用' : '把今天学会的，变成自己的'}</h1>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-soft">
          <button onClick={() => setNoteType('normal')} className={cn('rounded-xl py-3 text-sm font-semibold transition-colors', !isQuestion ? 'bg-sky-500 text-white' : 'text-gray-500')}>📝 知识点</button>
          <button onClick={() => setNoteType('question')} className={cn('rounded-xl py-3 text-sm font-semibold transition-colors', isQuestion ? 'bg-amber-500 text-white' : 'text-gray-500')}>❓ 错题</button>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">属于哪个科目？</h2>
          <SubjectSelector selected={subject} onSelect={setSubject} />
        </section>

        <section className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
          <label className="block text-sm font-medium text-gray-700">
            {isQuestion ? '错题标题' : '知识点标题'}
            <input value={title} onChange={(event) => setTitle(event.target.value.slice(0, 50))} placeholder={isQuestion ? '例如：二次函数交点判断' : '例如：二次函数顶点式'} className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white" />
          </label>

          {isQuestion ? (
            <>
              <TextArea label="题目内容" value={question} onChange={setQuestion} placeholder="把题目抄下来，或上传题目图片……" required />
              <TextArea label="我的答案 / 解题过程" value={myAnswer} onChange={setMyAnswer} placeholder="当时我是怎么想的？" />
              <TextArea label="正确答案 / 正确思路" value={correctAnswer} onChange={setCorrectAnswer} placeholder="订正后的关键步骤……" />
              <TextArea label="错因分析" value={wrongReason} onChange={setWrongReason} placeholder="是概念不清、计算失误，还是审题遗漏？" />
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">难度</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} onClick={() => setDifficulty(value as DifficultyLevel)} className={cn('rounded-xl py-2.5 text-sm font-bold', difficulty === value ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600')}>{value}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <TextArea label="知识点内容" value={content} onChange={setContent} placeholder="公式、定义、例子，或者你自己的理解……" required />
          )}
        </section>

        <section className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
          <label className="block text-sm font-medium text-gray-700"><span className="flex items-center gap-2"><Tag size={15} className="text-sky-500" /> 标签（可选）</span><input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="用空格分开，例如：函数 易错" className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white" /></label>
          <div><p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"><ImageIcon size={15} className="text-sky-500" /> 图片（可选）</p><ImageUploader images={images} onChange={setImages} /></div>
        </section>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800"><Sparkles size={15} className="mr-1 inline" /> 保存后会进入你的知识点与错题本，只保存在当前设备。</div>
        <Button size="lg" className="flex w-full items-center justify-center gap-2" disabled={!canSave} onClick={handleSave}><Check size={18} /> 保存到知识本</Button>
      </div>
    </PageContainer>
  );
}

function TextArea({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}{required && <span className="ml-1 text-rose-400">*</span>}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 outline-none focus:border-sky-400 focus:bg-white" />
    </label>
  );
}
