import { useNavigate } from 'react-router-dom';
import { BarChart3, Check, Clock3, LockKeyhole, MessageCircle, ShieldCheck } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import { grantParentAccess } from '@/utils/parentAccess';

export default function ParentEntry() {
  const navigate = useNavigate();

  const handleEnter = () => {
    grantParentAccess();
    navigate('/parent/dashboard');
  };

  return (
    <PageContainer title="家长守护" showBack className="px-4 pt-5">
      <div className="mx-auto max-w-lg space-y-4 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-soft-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20"><ShieldCheck size={25} /></div>
          <h1 className="mt-4 text-2xl font-bold">先确认，再把屏幕交给家长</h1>
          <p className="mt-2 text-sm leading-6 text-white/80">守护不是翻看秘密，而是一起理解最近的状态。</p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold text-emerald-600">本次家长视图会展示</p>
          <div className="mt-4 space-y-4">
            <div className="flex gap-3"><BarChart3 size={19} className="mt-0.5 shrink-0 text-indigo-500" /><div><p className="text-sm font-semibold text-gray-700">情绪趋势</p><p className="mt-0.5 text-xs leading-5 text-gray-400">只看一段时间内的变化与风险提示</p></div></div>
            <div className="flex gap-3"><Clock3 size={19} className="mt-0.5 shrink-0 text-sky-500" /><div><p className="text-sm font-semibold text-gray-700">学习概览</p><p className="mt-0.5 text-xs leading-5 text-gray-400">科目投入、学习时长与整体节奏</p></div></div>
            <div className="flex gap-3"><MessageCircle size={19} className="mt-0.5 shrink-0 text-amber-500" /><div><p className="text-sm font-semibold text-gray-700">沟通建议</p><p className="mt-0.5 text-xs leading-5 text-gray-400">帮助家长先倾听，再开启对话</p></div></div>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-100 bg-rose-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700"><LockKeyhole size={17} /> 不会展示</div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-rose-700/75">
            {['记录时写下的原话', '与晴语的聊天内容', '知识笔记和错题内容'].map((item) => (
              <div key={item} className="flex items-center gap-2"><Check size={14} /> {item}</div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">家长视图会在 30 分钟后自动退出，也可以随时手动退出。趋势提示仅用于沟通参考，不是心理诊断。</div>

        <Button size="lg" className="w-full" onClick={handleEnter}>已确认查看范围，进入家长视图</Button>
        <button onClick={() => navigate('/profile')} className="w-full py-2 text-sm font-medium text-gray-400">暂不进入</button>
      </div>
    </PageContainer>
  );
}
