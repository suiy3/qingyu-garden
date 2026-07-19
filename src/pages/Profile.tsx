import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Database,
  Edit3,
  FileDown,
  FileUp,
  Heart,
  Info,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDuration } from '@/utils/date';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    moodRecords,
    studyRecords,
    knowledgeNotes,
    actionLogs,
    isFirstLaunch,
    updateUser,
    clearAllData,
    resetToMockData,
    importData,
  } = useAppStore();

  const [showEdit, setShowEdit] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editNickname, setEditNickname] = useState(user.nickname);
  const [editGrade, setEditGrade] = useState(user.grade);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  const uniqueDays = new Set([
    ...moodRecords.map((record) => formatDate(record.createdAt)),
    ...studyRecords.map((record) => formatDate(record.createdAt)),
    ...actionLogs.map((record) => formatDate(record.createdAt)),
  ]).size;
  const totalStudyMinutes = studyRecords.reduce((sum, record) => sum + record.duration, 0);
  const questionCount = knowledgeNotes.filter((note) => note.noteType === 'question').length;

  const showToast = (success: boolean, message: string) => {
    setToast({ success, message });
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleSaveProfile = () => {
    if (!editNickname.trim()) return;
    updateUser({ nickname: editNickname.trim(), grade: editGrade });
    setShowEdit(false);
    showToast(true, '资料已更新');
  };

  const handleExport = () => {
    const backup = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      user,
      moodRecords,
      studyRecords,
      knowledgeNotes,
      actionLogs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qingyu-backup-${formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(true, '备份已下载到本机');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const data = JSON.parse(loadEvent.target?.result as string);
          const success = importData(data);
          showToast(success, success ? '备份恢复成功' : '这不是有效的晴语备份');
          if (success) setShowData(false);
        } catch {
          showToast(false, '文件无法读取');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    clearAllData();
    setShowDelete(false);
    setShowData(false);
    showToast(true, '记录已清空，个人资料已保留');
  };

  const sections = [
    {
      title: '我的成长',
      items: [
        { icon: Heart, label: '情绪记录', detail: `${moodRecords.length} 条`, color: 'bg-rose-50 text-rose-500', action: () => navigate('/mood-history') },
        { icon: NotebookPen, label: '知识点与错题', detail: `${knowledgeNotes.length} 篇 · 错题 ${questionCount} 道`, color: 'bg-sky-50 text-sky-600', action: () => navigate('/knowledge') },
        { icon: BarChart3, label: '成长规律', detail: '心情 × 学习', color: 'bg-indigo-50 text-indigo-500', action: () => navigate('/insight') },
        { icon: CalendarDays, label: '本周小结', detail: '看见这一周', color: 'bg-amber-50 text-amber-500', action: () => navigate('/weekly-report') },
      ],
    },
    {
      title: '隐私与设置',
      items: [
        { icon: ShieldCheck, label: '家长守护', detail: '进入前确认查看范围', color: 'bg-emerald-50 text-emerald-600', action: () => navigate('/parent') },
        { icon: Database, label: '本机数据', detail: '备份、恢复与清空', color: 'bg-sky-50 text-sky-600', action: () => setShowData(true) },
        { icon: Edit3, label: '个人资料', detail: `${user.nickname} · ${user.grade}`, color: 'bg-orange-50 text-orange-500', action: () => setShowEdit(true) },
        { icon: Info, label: '关于晴语', detail: '能力边界与隐私说明', color: 'bg-purple-50 text-purple-500', action: () => setShowAbout(true) },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50 pb-28">
      <header className="bg-gradient-to-br from-primary-400 via-primary-500 to-rose-400 px-5 pb-8 pt-11 text-white">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-white/20 p-4 text-4xl backdrop-blur-sm">{user.avatar}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold">{user.nickname}</h1>
              {isFirstLaunch && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">体验模式</span>}
            </div>
            <p className="mt-1 text-sm text-white/75">{user.grade} · 每一次记录都算数</p>
          </div>
          <button aria-label="编辑个人资料" onClick={() => setShowEdit(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Edit3 size={18} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-5 px-4 pt-5">
        {isFirstLaunch && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700">
            当前是体验数据。完成第一条自己的记录后，示例内容会自动清空，昵称和年级会保留。
          </section>
        )}

        <Card className="p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center"><p className="text-lg font-bold text-gray-800">{uniqueDays}</p><p className="mt-1 text-[11px] text-gray-400">记录天数</p></div>
            <div className="text-center"><p className="text-lg font-bold text-gray-800">{formatDuration(totalStudyMinutes)}</p><p className="mt-1 text-[11px] text-gray-400">学习时长</p></div>
            <div className="text-center"><p className="text-lg font-bold text-gray-800">{knowledgeNotes.length}</p><p className="mt-1 text-[11px] text-gray-400">知识与错题</p></div>
          </div>
        </Card>

        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 px-1 text-xs font-semibold text-gray-400">{section.title}</h2>
            <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={item.action} className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-warm-50', index < section.items.length - 1 && 'border-b border-gray-100')}>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', item.color)}><Icon size={19} /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-700">{item.label}</p><p className="mt-0.5 truncate text-xs text-gray-400">{item.detail}</p></div>
                    <ChevronRight size={17} className="text-gray-300" />
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <section className="rounded-2xl bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-2 text-xs leading-5 text-emerald-800"><LockKeyhole size={16} className="mt-0.5 shrink-0" /><p>你的数据保存在当前设备。晴语的智能发现是基于记录的规律分析，不会替代专业判断。</p></div>
        </section>
      </main>

      {showEdit && (
        <Modal title="编辑个人资料" onClose={() => setShowEdit(false)}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-600">昵称<input value={editNickname} onChange={(event) => setEditNickname(event.target.value.slice(0, 10))} className="mt-2 w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 outline-none focus:border-primary-400" /></label>
            <label className="block text-sm font-medium text-gray-600">年级<select value={editGrade} onChange={(event) => setEditGrade(event.target.value)} className="mt-2 w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 outline-none focus:border-primary-400">{['初一','初二','初三','高一','高二','高三'].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
          </div>
          <Button size="lg" className="mt-6 w-full" disabled={!editNickname.trim()} onClick={handleSaveProfile}>保存资料</Button>
        </Modal>
      )}

      {showData && (
        <Modal title="本机数据" onClose={() => setShowData(false)}>
          <div className="rounded-2xl bg-sky-50 p-4 text-xs leading-5 text-sky-800">换设备或清理浏览器数据前，建议先下载备份。备份包含心情、学习、知识笔记和微行动记录。</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="rounded-2xl border border-gray-100 p-4 text-left"><FileDown size={22} className="text-sky-500" /><p className="mt-3 text-sm font-semibold text-gray-700">下载备份</p><p className="mt-1 text-xs text-gray-400">保存到本机</p></button>
            <button onClick={handleImport} className="rounded-2xl border border-gray-100 p-4 text-left"><FileUp size={22} className="text-indigo-500" /><p className="mt-3 text-sm font-semibold text-gray-700">恢复备份</p><p className="mt-1 text-xs text-gray-400">选择晴语文件</p></button>
          </div>
          <button onClick={() => { resetToMockData(); setShowData(false); showToast(true, '已恢复体验数据'); }} className="mt-4 w-full rounded-xl bg-amber-50 py-3 text-sm font-medium text-amber-700">恢复体验数据</button>
          <div className="mt-5 border-t border-gray-100 pt-4"><button onClick={() => setShowDelete(true)} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-rose-500"><Trash2 size={16} /> 清空全部记录</button></div>
        </Modal>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-5" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500"><Trash2 size={24} /></div>
            <h3 className="mt-4 text-lg font-bold text-gray-800">确定清空全部记录？</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">心情、学习、知识笔记和微行动记录都会删除，昵称与年级会保留。此操作无法撤销。</p>
            <Button className="mt-5 w-full" onClick={handleClear}>确认清空</Button>
            <button onClick={() => setShowDelete(false)} className="mt-2 w-full py-3 text-sm font-medium text-gray-400">取消</button>
          </div>
        </div>
      )}

      {showAbout && (
        <Modal title="关于晴语" onClose={() => setShowAbout(false)}>
          <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-rose-100 text-3xl">🌱</div><h3 className="mt-3 text-lg font-bold text-gray-800">心情与学习的双轨成长伙伴</h3><p className="mt-2 text-sm leading-6 text-gray-500">晴语通过每日记录寻找两条轨迹之间的规律，并提供简单、可完成的微行动。</p></div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-800"><ShieldCheck size={16} className="mb-2" />记录只保存在当前设备，家长视图不展示日记原话、聊天内容和知识笔记。</div>
            <div className="rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800"><Sparkles size={16} className="mb-2" />“智能发现”来自本机规则分析，不代表医疗或心理诊断。如果持续难受或身处危险，请尽快联系可信赖的成年人或当地专业帮助。</div>
          </div>
        </Modal>
      )}

      {toast && <div className={cn('fixed left-1/2 top-20 z-[80] -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-lg', toast.success ? 'bg-emerald-500' : 'bg-rose-500')}>{toast.message}</div>}
      <BottomNav />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-5" role="dialog" aria-modal="true">
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-800">{title}</h2><button aria-label="关闭" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}
