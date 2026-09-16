import { Student, DrawRecord } from '../types';
import { SAMPLE_STUDENTS } from './parser';

const ROSTER_KEY = 'classroom_roster_data_v2';
const HISTORY_KEY = 'classroom_draw_history_v2';
const SOUND_KEY = 'classroom_sound_enabled_v1';

export function loadStoredStudents(): Student[] {
  try {
    const saved = localStorage.getItem(ROSTER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return SAMPLE_STUDENTS;
}

export function saveStoredStudents(students: Student[]) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function loadStoredHistory(): DrawRecord[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredHistory(history: DrawRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function loadSoundPreference(): boolean {
  try {
    const saved = localStorage.getItem(SOUND_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // ignore
  }
  return true;
}

export function saveSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // ignore
  }
}
