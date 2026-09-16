import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PickerView } from './components/PickerView';
import { GrouperView } from './components/GrouperView';
import { RosterModal } from './components/RosterModal';
import { Student } from './types';
import {
  loadStoredStudents,
  saveStoredStudents,
  loadSoundPreference,
  saveSoundPreference,
} from './utils/storage';
import { soundEffects } from './utils/audio';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => loadStoredStudents());
  const [activeTab, setActiveTab] = useState<'picker' | 'grouper'>('picker');
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => loadSoundPreference());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync sound setting to audio engine
  useEffect(() => {
    soundEffects.enabled = soundEnabled;
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  // Persist students
  const handleUpdateStudents = (updated: Student[]) => {
    setStudents(updated);
    saveStoredStudents(updated);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      soundEffects.enabled = true;
      soundEffects.playPop();
    }
  };

  // Fullscreen toggle (classroom smartboard/projector friendly)
  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          // ignore iframe restriction
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            setIsFullscreen(false);
          }).catch(() => {
            // ignore
          });
        }
      }
    } catch {
      // ignore
    }
  };

  // Listen to fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentCount={students.length}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {activeTab === 'picker' ? (
          <PickerView
            students={students}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
          />
        ) : (
          <GrouperView
            students={students}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Subtle Status Bar */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            🎓 專為教學設計 • 支援班級名單匯入 (CSV / 貼上) • 快速隨機抽籤 • 智慧視覺化分組
          </span>
          <span className="text-slate-400">
            目前名單：{students.length} 人
          </span>
        </div>
      </footer>

      {/* Student Roster Modal */}
      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        students={students}
        onUpdateStudents={handleUpdateStudents}
      />
    </div>
  );
}
