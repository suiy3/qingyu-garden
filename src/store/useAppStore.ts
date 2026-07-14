import { create } from 'zustand';
import { AppState, MoodRecord, StudyRecord, ActionLog, UserProfile, MoodType, TriggerType, SubjectType, KnowledgeNote } from '@/types';
import { loadAppState, saveAppState } from '@/utils/storage';
import { generateId } from '@/utils/date';
import { mockMoodRecords, mockStudyRecords, mockActionLogs, mockKnowledgeNotes } from '@/data/mockData';

const defaultUser: UserProfile = {
  nickname: '小晴',
  grade: '初二',
  avatar: '🌟',
};

const getInitialState = (): AppState => {
  const saved = loadAppState();
  if (saved) {
    return {
      user: defaultUser,
      moodRecords: saved.moodRecords || [],
      studyRecords: saved.studyRecords || [],
      knowledgeNotes: saved.knowledgeNotes || [],
      actionLogs: saved.actionLogs || [],
      isFirstLaunch: false,
    };
  }
  return {
    user: defaultUser,
    moodRecords: mockMoodRecords,
    studyRecords: mockStudyRecords,
    knowledgeNotes: mockKnowledgeNotes,
    actionLogs: mockActionLogs,
    isFirstLaunch: true,
  };
};

interface AppStore extends AppState {
  addMoodRecord: (moodType: MoodType, intensity: number, triggers: TriggerType[], note: string) => void;
  addStudyRecord: (subject: SubjectType, duration: number, focusRating: number, efficiencyRating: number, moodRating: number, note?: string) => string;
  addKnowledgeNote: (
    subject: SubjectType,
    title: string,
    content: string,
    tags: string[],
    studyRecordId?: string,
    noteType?: 'normal' | 'question',
    questionData?: {
      question?: string;
      myAnswer?: string;
      correctAnswer?: string;
      wrongReason?: string;
      difficulty?: 1 | 2 | 3 | 4 | 5;
    },
    images?: string[]
  ) => void;
  updateKnowledgeNote: (id: string, updates: Partial<KnowledgeNote>) => void;
  deleteKnowledgeNote: (id: string) => void;
  addActionLog: (actionId: string, actionName: string, duration: number, completed: boolean) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setParentPassword: (password: string) => void;
  validateParentPassword: (password: string) => boolean;
  clearAllData: () => void;
  resetToMockData: () => void;
  importData: (data: Partial<AppState>) => boolean;
  setFirstLaunchFalse: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...getInitialState(),

  addMoodRecord: (moodType, intensity, triggers, note) => {
    const newRecord: MoodRecord = {
      id: generateId(),
      moodType,
      intensity,
      triggers,
      note,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = {
        ...state,
        moodRecords: [newRecord, ...state.moodRecords],
      };
      saveAppState(newState);
      return newState;
    });
  },

  addStudyRecord: (subject, duration, focusRating, efficiencyRating, moodRating, note) => {
    const id = generateId();
    const newRecord: StudyRecord = {
      id,
      subject,
      duration,
      focusRating,
      efficiencyRating,
      moodRating,
      note,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = {
        ...state,
        studyRecords: [newRecord, ...state.studyRecords],
      };
      saveAppState(newState);
      return newState;
    });
    return id;
  },

  addKnowledgeNote: (subject, title, content, tags, studyRecordId, noteType = 'normal', questionData, images) => {
    const now = new Date().toISOString();
    const newNote: KnowledgeNote = {
      id: generateId(),
      subject,
      title,
      content,
      tags,
      noteType,
      ...(noteType === 'question' && questionData ? {
        question: questionData.question || '',
        myAnswer: questionData.myAnswer || '',
        correctAnswer: questionData.correctAnswer || '',
        wrongReason: questionData.wrongReason || '',
        difficulty: questionData.difficulty || 3,
      } : {}),
      studyRecordId,
      images: images || [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newState = {
        ...state,
        knowledgeNotes: [newNote, ...state.knowledgeNotes],
      };
      saveAppState(newState);
      return newState;
    });
  },

  updateKnowledgeNote: (id, updates) => {
    set((state) => {
      const newNotes = state.knowledgeNotes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      const newState = { ...state, knowledgeNotes: newNotes };
      saveAppState(newState);
      return newState;
    });
  },

  deleteKnowledgeNote: (id) => {
    set((state) => {
      const newState = {
        ...state,
        knowledgeNotes: state.knowledgeNotes.filter((n) => n.id !== id),
      };
      saveAppState(newState);
      return newState;
    });
  },

  addActionLog: (actionId, actionName, duration, completed) => {
    const newLog: ActionLog = {
      id: generateId(),
      actionId,
      actionName,
      duration,
      completed,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = {
        ...state,
        actionLogs: [newLog, ...state.actionLogs],
      };
      saveAppState(newState);
      return newState;
    });
  },

  updateUser: (user) => {
    set((state) => {
      const newState = {
        ...state,
        user: { ...state.user, ...user },
      };
      saveAppState(newState);
      return newState;
    });
  },

  setParentPassword: (password) => {
    set((state) => {
      const newState = {
        ...state,
        user: { ...state.user, parentPassword: password },
      };
      saveAppState(newState);
      return newState;
    });
  },

  validateParentPassword: (password) => {
    const state = get();
    return state.user.parentPassword === password;
  },

  clearAllData: () => {
    const newState = {
      user: defaultUser,
      moodRecords: [],
      studyRecords: [],
      knowledgeNotes: [],
      actionLogs: [],
      isFirstLaunch: false,
    };
    saveAppState(newState);
    set(newState);
  },

  resetToMockData: () => {
    const newState = {
      user: defaultUser,
      moodRecords: mockMoodRecords,
      studyRecords: mockStudyRecords,
      knowledgeNotes: mockKnowledgeNotes,
      actionLogs: mockActionLogs,
      isFirstLaunch: false,
    };
    saveAppState(newState);
    set(newState);
  },

  importData: (data) => {
    try {
      if (!data || typeof data !== 'object') return false;
      const current = get();
      const newState: AppState = {
        user: data.user || current.user,
        moodRecords: data.moodRecords || current.moodRecords,
        studyRecords: data.studyRecords || current.studyRecords,
        knowledgeNotes: data.knowledgeNotes || current.knowledgeNotes,
        actionLogs: data.actionLogs || current.actionLogs,
        isFirstLaunch: false,
      };
      if (!Array.isArray(newState.moodRecords)) return false;
      if (!Array.isArray(newState.studyRecords)) return false;
      if (!Array.isArray(newState.knowledgeNotes)) return false;
      if (!Array.isArray(newState.actionLogs)) return false;
      saveAppState(newState);
      set(newState);
      return true;
    } catch {
      return false;
    }
  },

  setFirstLaunchFalse: () => {
    set((state) => {
      const newState = { ...state, isFirstLaunch: false };
      saveAppState(newState);
      return newState;
    });
  },
}));
