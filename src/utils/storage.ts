import { AppState } from '@/types';
import { STORAGE_KEYS } from './constants';

export function loadAppState(): AppState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
  } catch {
    console.error('Failed to save app state');
  }
}

export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  } catch {
    console.error('Failed to clear app state');
  }
}
