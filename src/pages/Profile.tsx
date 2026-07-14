import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Shield,
  Database,
  Info,
  Settings,
  Calendar,
  Heart,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate as formatDateUtil, formatDuration } from '@/utils/date';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, moodRecords, studyRecords, actionLogs, updateUser, clearAllData, resetToMockData, importData } = useAppStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editNickname, setEditNickname] = useState(user.nickname);
  const [editGrade, setEditGrade] = useState(user.grade);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportToast, setShowImportToast] = useState<{ success: boolean; msg: string } | null>(null);

  const uniqueDays = new Set([
    ...moodRecords.map((r) => formatDateUtil(r.createdAt)),
    ...studyRecords.map((r) => formatDateUtil(r.createdAt)),
    ...actionLogs.map((r) => formatDateUtil(r.createdAt)),
  ]).size;

  const totalStudyMinutes = studyRecords.reduce((sum, r) => sum + r.duration, 0);
  const completedActions = actionLogs.filter((r) => r.completed).length;

  const stats = [
    { icon: <Calendar size={20} />, label: '总记录天数', value: uniqueDays, color: 'text-primary-500', bg: 'bg-primary-100' },
    { icon: <Heart size={20} />, label: '情绪记录', value: moodRecords.length, color: 'text-rose-500', bg: 'bg-rose-100' },
    { icon: <Clock size={20} />, label: '学习时长', value: formatDuration(totalStudyMinutes), color: 'text-sky-500', bg: 'bg-sky-100' },
    { icon: <Sparkles size={20} />, label: '完成微行动', value: completedActions, color: 'text-mint-500', bg: 'bg-mint-100' },
  ];

  const menuItems = [
    {
      icon: <Settings size={20} />,
      label: '个人资料设置',
      onClick: () => setShowEditModal(true),
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
    },
    {
      icon: <Shield size={20} />,
      label: '家长守护',
      onClick: () => navigate('/parent'),
      iconBg: 'bg-mint-100',
      iconColor: 'text-mint-500',
    },
    {
      icon: <Database size={20} />,
      label: '数据管理',
      onClick: () => setShowClearConfirm(true),
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-500',
    },
    {
      icon: <Info size={20} />,
      label: '关于晴语',
      onClick: () => {},
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-500',
    },
  ];

  const handleSaveProfile = () => {
    if (editNickname.trim()) {
      updateUser({ nickname: editNickname.trim(), grade: editGrade });
      setShowEditModal(false);
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const handleResetMock = () => {
    resetToMockData();
    setShowClearConfirm(false);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          const ok = importData(data);
          if (ok) {
            setShowImportToast({ success: true, msg: '数据导入成功' });
          } else {
            setShowImportToast({ success: false, msg: '数据格式不正确' });
          }
        } catch {
          setShowImportToast({ success: false, msg: '文件解析失败' });
        }
        setTimeout(() => setShowImportToast(null), 2500);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportData = () => {
    const data = {
      user,
      moodRecords,
      studyRecords,
      actionLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qingyu-data-${formatDateUtil(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-warm-100 pb-24">
      <div className="relative bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 px-5 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-16 translate-y-16" />

        <div className="relative z-10">
          <h1 className="text-white text-2xl font-bold mb-6">我的</h1>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{user.nickname}</h2>
              <p className="text-white/70 text-sm mt-1">{user.grade}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4">
        <Card className="bg-white">
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={cn('w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center', stat.bg, stat.color)}>
                  {stat.icon}
                </div>
                <p className="text-gray-800 font-bold text-lg">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white p-0 overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 hover:bg-warm-50 active:bg-warm-100 transition-colors',
                index < menuItems.length - 1 && 'border-b border-warm-100'
              )}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.iconBg, item.iconColor)}>
                {item.icon}
              </div>
              <span className="flex-1 text-left text-gray-700 font-medium">{item.label}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </Card>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">编辑资料</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-warm-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">昵称</label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-200 focus:border-primary-400 focus:outline-none transition-colors"
                  placeholder="请输入昵称"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">年级</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-200 focus:border-primary-400 focus:outline-none transition-colors appearance-none"
                >
                  <option value="初一">初一</option>
                  <option value="初二">初二</option>
                  <option value="初三">初三</option>
                  <option value="高一">高一</option>
                  <option value="高二">高二</option>
                  <option value="高三">高三</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              onClick={handleSaveProfile}
              disabled={!editNickname.trim()}
            >
              保存
            </Button>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 animate-bounce-soft">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
              <Database size={28} className="text-sky-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">数据管理</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              导出数据备份到本地，或导入之前备份的数据
            </p>

            <div className="space-y-2.5">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleExportData}
              >
                导出数据
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleImportClick}
              >
                导入数据
              </Button>
              <button
                onClick={handleResetMock}
                className="w-full py-3 text-amber-600 font-medium hover:bg-amber-50 rounded-xl transition-colors text-sm"
              >
                恢复示例数据
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3 text-gray-500 font-medium hover:bg-warm-50 rounded-xl transition-colors"
              >
                关闭
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-warm-100">
              <p className="text-rose-500 text-sm text-center mb-3">危险操作</p>
              <button
                onClick={handleClearData}
                className="w-full py-3 text-rose-500 font-medium hover:bg-rose-50 rounded-xl transition-colors"
              >
                清空所有数据
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
          <div className={cn(
            'px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm text-sm font-medium',
            showImportToast.success ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
          )}>
            {showImportToast.msg}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
