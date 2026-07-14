export type MoodType = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'tired';

export type TriggerType = 'study' | 'relationship' | 'family' | 'health' | 'other';

export type SubjectType = 'chinese' | 'math' | 'english' | 'physics' | 'chemistry' | 'other';

export type ActionCategory = 'breathing' | 'first-aid' | 'mindfulness' | 'relaxation';

export interface MoodRecord {
  id: string;
  moodType: MoodType;
  intensity: number;
  triggers: TriggerType[];
  note: string;
  createdAt: string;
}

export interface StudyRecord {
  id: string;
  subject: SubjectType;
  duration: number;
  focusRating: number;
  efficiencyRating: number;
  moodRating: number;
  note?: string;
  createdAt: string;
}

export type NoteType = 'normal' | 'question';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface KnowledgeNote {
  id: string;
  subject: SubjectType;
  title: string;
  content: string;
  tags: string[];
  noteType: NoteType;
  question?: string;
  myAnswer?: string;
  correctAnswer?: string;
  wrongReason?: string;
  difficulty?: DifficultyLevel;
  studyRecordId?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MicroAction {
  id: string;
  name: string;
  category: ActionCategory;
  duration: number;
  description: string;
  guideText: string[];
  icon: string;
  gradient: string;
}

export interface ActionLog {
  id: string;
  actionId: string;
  actionName: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

export interface UserProfile {
  nickname: string;
  grade: string;
  avatar: string;
  parentPassword?: string;
}

export interface AppState {
  user: UserProfile;
  moodRecords: MoodRecord[];
  studyRecords: StudyRecord[];
  knowledgeNotes: KnowledgeNote[];
  actionLogs: ActionLog[];
  isFirstLaunch: boolean;
}
