import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  History,
  CheckCircle2,
  Users,
  Repeat,
  Repeat1,
  Undo2,
  Trophy,
} from 'lucide-react';
import { Student, DrawRecord, DrawMode } from '../types';
import { soundEffects } from '../utils/audio';

interface PickerViewProps {
  students: Student[];
  onOpenRosterModal: () => void;
}

export const PickerView: React.FC<PickerViewProps> = ({
  students,
  onOpenRosterModal,
}) => {
  const [drawMode, setDrawMode] = useState<DrawMode>('without-replacement');
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [history, setHistory] = useState<DrawRecord[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [displayStudent, setDisplayStudent] = useState<Student | null>(null);
  const [lastWinner, setLastWinner] = useState<Student | null>(null);

  // Available students based on mode
  const availableStudents = React.useMemo(() => {
    if (drawMode === 'with-replacement') {
      return students;
    }
    return students.filter((s) => !drawnIds.includes(s.id));
  }, [students, drawMode, drawnIds]);

  // Rolling timer refs
  const rollingIntervalRef = useRef<number | null>(null);
  const rollingTimeoutRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
      if (rollingTimeoutRef.current) clearTimeout(rollingTimeoutRef.current);
    };
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.7 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  // Perform random draw with decelerating animation and sound
  const startDraw = useCallback(() => {
    if (isRolling) return;
    if (availableStudents.length === 0) {
      soundEffects.playPop();
      return;
    }

    setIsRolling(true);
    setLastWinner(null);

    // Pick final target randomly from available pool
    const winnerIndex = Math.floor(Math.random() * availableStudents.length);
    const chosenWinner = availableStudents[winnerIndex];

    // Build tension audio
    soundEffects.playRiser(2.4);

    let currentInterval = 40; // fast start
    const totalRollingDuration = 2400; // 2.4 seconds
    const startTime = Date.now();

    const cycle = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / totalRollingDuration;

      // Randomly display a name from all students to show rapid shuffle
      const randomDisplay = students[Math.floor(Math.random() * students.length)];
      setDisplayStudent(randomDisplay);

      // Pitch modulates slightly
      const pitchMultiplier = 0.8 + progress * 0.5;
      soundEffects.playTick(pitchMultiplier);

      if (progress < 1) {
        // Deceleration curve: interval grows wider as progress nears 1
        currentInterval = 40 + Math.pow(progress, 2.5) * 220;
        rollingTimeoutRef.current = window.setTimeout(cycle, currentInterval);
      } else {
        // Conclude on chosen winner
        setDisplayStudent(chosenWinner);
        setLastWinner(chosenWinner);
        setIsRolling(false);

        // Sound & Confetti
        soundEffects.playVictory();
        triggerConfetti();

        // Update record
        const newRecord: DrawRecord = {
          id: `draw-${Date.now()}`,
          student: chosenWinner,
          timestamp: Date.now(),
          round: history.length + 1,
        };

        setHistory((prev) => [newRecord, ...prev]);

        // If without-replacement, mark as drawn
        if (drawMode === 'without-replacement') {
          setDrawnIds((prev) => [...prev, chosenWinner.id]);
        }
      }
    };

    cycle();
  }, [availableStudents, isRolling, students, drawMode, history.length]);

  // Spacebar keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRolling) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input/textarea
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        startDraw();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startDraw, isRolling]);

  // Reset pool for without-replacement mode
  const handleResetPool = () => {
    soundEffects.playShuffle();
    setDrawnIds([]);
    setLastWinner(null);
  };

  // Put specific student back into pool
  const handleReturnToPool = (studentId: string) => {
    soundEffects.playPop();
    setDrawnIds((prev) => prev.filter((id) => id !== studentId));
  };

  // Clear draw history
  const handleClearHistory = () => {
    if (window.confirm('確定要清空本次抽籤紀錄嗎？')) {
      soundEffects.playPop();
      setHistory([]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Mode and Pool Status Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Mode Toggle Controls */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 tracking-wider">
            抽籤模式設定
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              id="mode-without-replacement-btn"
              onClick={() => {
                soundEffects.playPop();
                setDrawMode('without-replacement');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                drawMode === 'without-replacement'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat1 className="w-3.5 h-3.5 text-indigo-600" />
              <span>不重複抽取 (抽出後移出池)</span>
            </button>

            <button
              id="mode-with-replacement-btn"
              onClick={() => {
                soundEffects.playPop();
                setDrawMode('with-replacement');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                drawMode === 'with-replacement'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-600" />
              <span>允許重複抽取 (所有人皆有機會)</span>
            </button>
          </div>
        </div>

        {/* Pool Stat & Quick Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">
              {drawMode === 'without-replacement' ? '抽籤池剩餘人數' : '名單總人數'}
            </div>
            <div className="text-base font-extrabold text-slate-800">
              <span className="text-indigo-600 text-lg">{availableStudents.length}</span>
              <span className="text-slate-400 font-normal"> / {students.length} 人</span>
            </div>
          </div>

          {drawMode === 'without-replacement' && drawnIds.length > 0 && (
            <button
              id="reset-pool-btn"
              onClick={handleResetPool}
              disabled={isRolling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              title="重置抽籤池，將所有人放回抽籤池"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>重置抽籤池</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Drawing Stage Area */}
      <div className="relative bg-gradient-to-b from-white to-indigo-50/30 rounded-3xl border border-indigo-100/80 p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Empty list warning */}
        {students.length === 0 ? (
          <div className="text-center max-w-md py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">尚未載入學生名單</h3>
            <p className="text-sm text-slate-600 mb-5">
              請先上傳 CSV 檔案或貼上學生姓名名單，即可開始進行課堂抽籤！
            </p>
            <button
              id="empty-roster-cta"
              onClick={onOpenRosterModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
            >
              開啟名單管理
            </button>
          </div>
        ) : availableStudents.length === 0 && drawMode === 'without-replacement' ? (
          /* Pool Depleted State */
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              🎉 全班同學皆已抽過一輪！
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              名單中的 {students.length} 位學生都已輪流抽過，點擊下方重置即可重新開始新一輪。
            </p>
            <button
              id="pool-depleted-reset-btn"
              onClick={handleResetPool}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新開始新一輪抽籤</span>
            </button>
          </div>
        ) : (
          /* Active Picker Card */
          <div className="w-full max-w-lg flex flex-col items-center text-center">
            {/* Display Card Container */}
            <div className="relative w-full mb-8">
              <div
                className={`relative w-full py-10 px-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                  isRolling
                    ? 'border-indigo-400 bg-white/90 shadow-xl shadow-indigo-100 ring-4 ring-indigo-200/50 scale-[1.02]'
                    : lastWinner
                    ? 'border-indigo-500 bg-white shadow-xl shadow-indigo-100/70'
                    : 'border-slate-200/90 bg-white/80 shadow-sm'
                }`}
              >
                {/* Status / Crown Pill */}
                <div className="mb-3">
                  {lastWinner && !isRolling ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-bounce">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      恭喜抽中！
                    </span>
                  ) : isRolling ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                      命運轉盤旋轉中...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.8 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                      準備就緒（可按空白鍵抽籤）
                    </span>
                  )}
                </div>

                {/* Candidate / Winner Name with motion animation */}
                <div className="h-28 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {displayStudent ? (
                      <motion.div
                        key={isRolling ? displayStudent.id + Math.random() : displayStudent.id}
                        initial={{ opacity: 0, y: isRolling ? -10 : 20, scale: isRolling ? 0.95 : 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: isRolling ? 1 : 1.1 }}
                        exit={{ opacity: 0, y: isRolling ? 10 : -10 }}
                        transition={{ duration: isRolling ? 0.08 : 0.4, type: isRolling ? 'tween' : 'spring' }}
                        className="flex flex-col items-center"
                      >
                        {displayStudent.number && (
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/60 mb-2">
                            {displayStudent.number.length > 3 ? '學號' : '座號'} {displayStudent.number}
                          </span>
                        )}
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-wide">
                          {displayStudent.name}
                        </h2>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-slate-400 flex flex-col items-center gap-2"
                      >
                        <Sparkles className="w-8 h-8 text-slate-300" />
                        <span className="text-base font-medium">點擊下方按鈕開始抽籤</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                id="start-draw-btn"
                onClick={startDraw}
                disabled={isRolling || availableStudents.length === 0}
                className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? '抽籤中...' : lastWinner ? '再抽一位' : '開始隨機抽籤'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              提示：老師可隨時按鍵盤「空白鍵 (Space)」快速抽取
            </p>
          </div>
        )}
      </div>

      {/* History & Pool Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Draw History */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">抽籤歷史紀錄</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {history.length} 次
              </span>
            </div>
            {history.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={handleClearHistory}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
              >
                清空紀錄
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              目前尚無抽籤紀錄，抽出後會依序列於此處
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item, idx) => {
                const isDrawnInPool = drawnIds.includes(item.student.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                        #{history.length - idx}
                      </span>
                      {item.student.number && (
                        <span className="text-xs font-mono text-slate-500">
                          [{item.student.number}]
                        </span>
                      )}
                      <span className="text-sm font-bold text-slate-800">
                        {item.student.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>

                      {drawMode === 'without-replacement' && isDrawnInPool && (
                        <button
                          onClick={() => handleReturnToPool(item.student.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 px-2 py-0.8 bg-white border border-indigo-100 rounded-md transition-colors"
                          title="若該學生請假或不在場，可放回抽籤池重新抽取"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>放回抽籤池</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Remaining / Already Picked Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">名單狀態一覽</h3>
            <span className="text-xs text-slate-500 font-medium">
              共 {students.length} 人
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
            {students.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">名單為空</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {students.map((stu) => {
                  const isAlreadyDrawn =
                    drawMode === 'without-replacement' && drawnIds.includes(stu.id);
                  return (
                    <span
                      key={stu.id}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                        isAlreadyDrawn
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                      }`}
                    >
                      {stu.number ? `${stu.number}. ` : ''}
                      {stu.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
