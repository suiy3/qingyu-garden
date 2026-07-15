import { MoodType, TriggerType, SubjectType, ActionCategory } from '@/types';

export const MOOD_THEME = {
  primary: '#FF8A65',
  secondary: '#FFB74D',
  accent: '#F48FB1',
  gradient: 'from-primary-400 to-primary-600',
  bgLight: '#FFF3E0',
};

export const STUDY_THEME = {
  primary: '#4FC3F7',
  secondary: '#81D4FA',
  accent: '#4DD0E1',
  gradient: 'from-sky-400 to-cyan-500',
  bgLight: '#E3F2FD',
};

export const MOOD_CONFIG: Record<MoodType, { label: string; emoji: string; color: string; gradient: string }> = {
  happy: {
    label: '开心',
    emoji: '😊',
    color: '#FFB74D',
    gradient: 'from-amber-300 to-orange-400',
  },
  calm: {
    label: '平静',
    emoji: '😌',
    color: '#81C784',
    gradient: 'from-green-300 to-emerald-400',
  },
  anxious: {
    label: '焦虑',
    emoji: '😰',
    color: '#64B5F6',
    gradient: 'from-blue-300 to-sky-400',
  },
  sad: {
    label: '难过',
    emoji: '😢',
    color: '#90A4AE',
    gradient: 'from-slate-300 to-gray-400',
  },
  angry: {
    label: '生气',
    emoji: '😤',
    color: '#EF5350',
    gradient: 'from-red-300 to-rose-400',
  },
  tired: {
    label: '疲惫',
    emoji: '😴',
    color: '#BA68C8',
    gradient: 'from-purple-300 to-violet-400',
  },
};

export const TRIGGER_CONFIG: Record<TriggerType, { label: string; emoji: string }> = {
  study: { label: '学习压力', emoji: '📚' },
  relationship: { label: '人际关系', emoji: '👥' },
  family: { label: '家庭关系', emoji: '🏠' },
  health: { label: '身体不适', emoji: '🤒' },
  other: { label: '其他', emoji: '💭' },
};

export const SUBJECT_CONFIG: Record<SubjectType, { label: string; emoji: string; color: string }> = {
  chinese: { label: '语文', emoji: '📖', color: '#EF5350' },
  math: { label: '数学', emoji: '🔢', color: '#42A5F5' },
  english: { label: '英语', emoji: '🔤', color: '#66BB6A' },
  physics: { label: '物理', emoji: '⚛️', color: '#FFA726' },
  chemistry: { label: '化学', emoji: '🧪', color: '#AB47BC' },
  other: { label: '其他', emoji: '📝', color: '#78909C' },
};

export const ACTION_CATEGORY_CONFIG: Record<ActionCategory, { label: string; emoji: string }> = {
  breathing: { label: '呼吸练习', emoji: '🌬️' },
  'first-aid': { label: '情绪急救', emoji: '🩹' },
  mindfulness: { label: '正念引导', emoji: '🧘' },
  relaxation: { label: '身体放松', emoji: '💆' },
  cognitive: { label: '认知调整', emoji: '💡' },
  sensory: { label: '感官调节', emoji: '🎵' },
  creative: { label: '创意表达', emoji: '🎨' },
  physical: { label: '运动活力', emoji: '🏃' },
  social: { label: '社交连接', emoji: '💝' },
  nature: { label: '自然疗愈', emoji: '🌿' },
  fun: { label: '趣味解压', emoji: '🎉' },
};

export const STORAGE_KEYS = {
  APP_STATE: 'qingyu_app_state',
};
