import React from 'react';
import { Sparkles, Users, Volume2, VolumeX, Maximize2, Minimize2, UserCheck } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeaderProps {
  activeTab: 'picker' | 'grouper';
  setActiveTab: (tab: 'picker' | 'grouper') => void;
  studentCount: number;
  onOpenRosterModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  onOpenRosterModal,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              班
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                課堂小幫手
                <span className="hidden md:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  教學專用
                </span>
              </h1>
              <p className="text-xs text-slate-500">隨機抽籤 • 自動分組</p>
            </div>
          </div>

          {/* Roster trigger button on mobile */}
          <button
            id="mobile-roster-btn"
            onClick={onOpenRosterModal}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>名單 ({studentCount})</span>
          </button>
        </div>

        {/* Center: Main Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            id="tab-picker-btn"
            onClick={() => {
              soundEffects.playPop();
              setActiveTab('picker');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'picker'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>隨機抽籤</span>
          </button>
          <button
            id="tab-grouper-btn"
            onClick={() => {
              soundEffects.playPop();
              setActiveTab('grouper');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'grouper'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>自動分組</span>
          </button>
        </div>

        {/* Right: Quick Tools */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            id="desktop-roster-btn"
            onClick={onOpenRosterModal}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="管理學生名單"
          >
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>學生名單</span>
            <span className="px-1.5 py-0.2 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
              {studentCount}人
            </span>
          </button>

          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-lg text-sm border transition-colors ${
              soundEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? '音效已開啟（點擊靜音）' : '音效已靜音（點擊開啟）'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="fullscreen-toggle-btn"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg text-sm bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            title={isFullscreen ? '退出全螢幕' : '投影全螢幕模式'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
