import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shuffle,
  Copy,
  Download,
  Check,
  Users,
  Settings2,
  ArrowUpDown,
  MoveRight,
  Info,
} from 'lucide-react';
import { Student, GroupResult, GroupingStrategy, RemainderStrategy } from '../types';
import { soundEffects } from '../utils/audio';

interface GrouperViewProps {
  students: Student[];
  onOpenRosterModal: () => void;
}

// Visual color themes for distinct group cards
const GROUP_COLORS = [
  { border: 'border-indigo-200', bg: 'bg-indigo-50/50', badge: 'bg-indigo-600 text-white', ring: 'ring-indigo-300' },
  { border: 'border-emerald-200', bg: 'bg-emerald-50/50', badge: 'bg-emerald-600 text-white', ring: 'ring-emerald-300' },
  { border: 'border-amber-200', bg: 'bg-amber-50/50', badge: 'bg-amber-600 text-white', ring: 'ring-amber-300' },
  { border: 'border-rose-200', bg: 'bg-rose-50/50', badge: 'bg-rose-600 text-white', ring: 'ring-rose-300' },
  { border: 'border-cyan-200', bg: 'bg-cyan-50/50', badge: 'bg-cyan-600 text-white', ring: 'ring-cyan-300' },
  { border: 'border-purple-200', bg: 'bg-purple-50/50', badge: 'bg-purple-600 text-white', ring: 'ring-purple-300' },
  { border: 'border-orange-200', bg: 'bg-orange-50/50', badge: 'bg-orange-600 text-white', ring: 'ring-orange-300' },
  { border: 'border-teal-200', bg: 'bg-teal-50/50', badge: 'bg-teal-600 text-white', ring: 'ring-teal-300' },
  { border: 'border-pink-200', bg: 'bg-pink-50/50', badge: 'bg-pink-600 text-white', ring: 'ring-pink-300' },
  { border: 'border-blue-200', bg: 'bg-blue-50/50', badge: 'bg-blue-600 text-white', ring: 'ring-blue-300' },
];

export const GrouperView: React.FC<GrouperViewProps> = ({
  students,
  onOpenRosterModal,
}) => {
  // Strategy: Default to "設定要幾個人一組" as explicitly requested by user
  const [strategy, setStrategy] = useState<GroupingStrategy>('by-member-count');
  const [sizePerGroup, setSizePerGroup] = useState<number>(4);
  const [targetGroupCount, setTargetGroupCount] = useState<number>(4);
  const [remainderStrategy, setRemainderStrategy] = useState<RemainderStrategy>('distribute');
  
  // Group results
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  // Interactive student swap/move selection
  const [selectedStudent, setSelectedStudent] = useState<{
    groupId: number;
    student: Student;
  } | null>(null);

  // Fisher-Yates shuffle helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Perform automatic grouping algorithm
  const generateGroups = () => {
    if (students.length === 0) {
      setGroups([]);
      return;
    }

    soundEffects.playShuffle();
    const shuffled: Student[] = shuffleArray<Student>(students);

    let calculatedGroups: GroupResult[] = [];

    if (strategy === 'by-member-count') {
      const perGroup = Math.max(1, Math.min(sizePerGroup, students.length));
      
      if (remainderStrategy === 'distribute') {
        // If distributing remainder:
        // Calculate number of full groups
        const numGroups = Math.max(1, Math.round(students.length / perGroup));
        const groupBuckets: Student[][] = [];
        for (let i = 0; i < numGroups; i++) {
          groupBuckets.push([]);
        }
        
        shuffled.forEach((student: Student, index: number) => {
          groupBuckets[index % numGroups].push(student);
        });

        calculatedGroups = groupBuckets
          .filter((bucket) => bucket.length > 0)
          .map((members: Student[], idx: number): GroupResult => ({
            groupId: idx + 1,
            groupName: `第 ${idx + 1} 組`,
            color: GROUP_COLORS[idx % GROUP_COLORS.length].badge,
            members,
          }));
      } else {
        // Option: New group for remaining
        const numGroups = Math.ceil(students.length / perGroup);
        calculatedGroups = [];
        for (let idx = 0; idx < numGroups; idx++) {
          const start = idx * perGroup;
          const end = start + perGroup;
          calculatedGroups.push({
            groupId: idx + 1,
            groupName: `第 ${idx + 1} 組`,
            color: GROUP_COLORS[idx % GROUP_COLORS.length].badge,
            members: shuffled.slice(start, end),
          });
        }
      }
    } else {
      // By group count
      const numGroups = Math.max(1, Math.min(targetGroupCount, students.length));
      const groupBuckets: Student[][] = [];
      for (let i = 0; i < numGroups; i++) {
        groupBuckets.push([]);
      }

      shuffled.forEach((student: Student, index: number) => {
        groupBuckets[index % numGroups].push(student);
      });

      calculatedGroups = groupBuckets.map((members: Student[], idx: number): GroupResult => ({
        groupId: idx + 1,
        groupName: `第 ${idx + 1} 組`,
        color: GROUP_COLORS[idx % GROUP_COLORS.length].badge,
        members,
      }));
    }

    setGroups(calculatedGroups);
    setSelectedStudent(null);
  };

  // Run initial grouping when students change or settings change
  useEffect(() => {
    if (students.length > 0 && groups.length === 0) {
      generateGroups();
    }
  }, [students.length]);

  // Click student handler for fine-tuning swap/move
  const handleStudentClick = (groupId: number, student: Student) => {
    soundEffects.playPop();

    if (!selectedStudent) {
      // Select first student
      setSelectedStudent({ groupId, student });
      return;
    }

    if (selectedStudent.student.id === student.id) {
      // Deselect
      setSelectedStudent(null);
      return;
    }

    // SWAP two students between groups or in the same group!
    const updatedGroups = groups.map((grp) => {
      let newMembers = [...grp.members];

      if (grp.groupId === selectedStudent.groupId && grp.groupId === groupId) {
        // Swap within same group
        const idx1 = newMembers.findIndex((m) => m.id === selectedStudent.student.id);
        const idx2 = newMembers.findIndex((m) => m.id === student.id);
        if (idx1 !== -1 && idx2 !== -1) {
          const temp = newMembers[idx1];
          newMembers[idx1] = newMembers[idx2];
          newMembers[idx2] = temp;
        }
      } else if (grp.groupId === selectedStudent.groupId) {
        // Replace selected with clicked
        newMembers = newMembers.map((m) =>
          m.id === selectedStudent.student.id ? student : m
        );
      } else if (grp.groupId === groupId) {
        // Replace clicked with selected
        newMembers = newMembers.map((m) =>
          m.id === student.id ? selectedStudent.student : m
        );
      }

      return { ...grp, members: newMembers };
    });

    setGroups(updatedGroups);
    setSelectedStudent(null);
  };

  // Move selected student directly into an empty or target group
  const handleMoveToGroup = (targetGroupId: number) => {
    if (!selectedStudent || selectedStudent.groupId === targetGroupId) return;

    soundEffects.playPop();
    const updatedGroups = groups.map((grp) => {
      if (grp.groupId === selectedStudent.groupId) {
        return {
          ...grp,
          members: grp.members.filter((m) => m.id !== selectedStudent.student.id),
        };
      }
      if (grp.groupId === targetGroupId) {
        return {
          ...grp,
          members: [...grp.members, selectedStudent.student],
        };
      }
      return grp;
    });

    setGroups(updatedGroups);
    setSelectedStudent(null);
  };

  // Copy formatted grouping text for LINE or Google Classroom
  const handleCopyFormattedText = () => {
    if (groups.length === 0) return;

    let text = `【課堂分組結果】共 ${students.length} 人，分成 ${groups.length} 組\n`;
    text += `=========================\n`;

    groups.forEach((grp) => {
      const memberList = grp.members
        .map((m) => (m.number ? `[${m.number}]${m.name}` : m.name))
        .join('、');
      text += `${grp.groupName} (${grp.members.length}人)：${memberList}\n`;
    });

    text += `=========================\n`;
    text += `時間：${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(text);
    soundEffects.playPop();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Export CSV file
  const handleExportCSV = () => {
    if (groups.length === 0) return;

    let csvContent = '\uFEFF組別,學號/座號,姓名\n';
    groups.forEach((grp) => {
      grp.members.forEach((m) => {
        csvContent += `"${grp.groupName}","${m.number || ''}","${m.name}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `課堂分組結果_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundEffects.playPop();
  };

  // Stat summary
  const summaryText = useMemo(() => {
    if (students.length === 0) return '尚未有名單';
    if (groups.length === 0) return '尚未分組';
    const minSize = Math.min(...groups.map((g) => g.members.length));
    const maxSize = Math.max(...groups.map((g) => g.members.length));
    if (minSize === maxSize) {
      return `全班 ${students.length} 人，共分成 ${groups.length} 組，每組 ${minSize} 人`;
    }
    return `全班 ${students.length} 人，共分成 ${groups.length} 組，每組約 ${minSize} ~ ${maxSize} 人`;
  }, [students.length, groups]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Settings Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">自動分組規則設定</h3>
              <p className="text-xs text-slate-500">{summaryText}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              id="reshuffle-btn"
              onClick={generateGroups}
              disabled={students.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-102"
            >
              <Shuffle className="w-4 h-4" />
              <span>重新隨機分組</span>
            </button>

            {groups.length > 0 && (
              <>
                <button
                  id="copy-results-btn"
                  onClick={handleCopyFormattedText}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  title="複製格式化名單文字（適合貼在 LINE / 班級公告）"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">已複製！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-600" />
                      <span>複製結果</span>
                    </>
                  )}
                </button>

                <button
                  id="export-csv-btn"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  title="匯出 CSV 試算表"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">匯出 CSV</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Strategy Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              分組方式
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setStrategy('by-member-count');
                }}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                  strategy === 'by-member-count'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                每組幾人
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  setStrategy('by-group-count');
                }}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                  strategy === 'by-group-count'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                指定組數
              </button>
            </div>
          </div>

          {/* Number of People per Group OR Group Count */}
          {strategy === 'by-member-count' ? (
            <div>
              <label htmlFor="size-per-group-input" className="block text-xs font-bold text-slate-600 mb-2">
                設定每組人數
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setSizePerGroup((prev) => Math.max(2, prev - 1));
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  id="size-per-group-input"
                  type="number"
                  min="1"
                  max={Math.max(1, students.length)}
                  value={sizePerGroup}
                  onChange={(e) => setSizePerGroup(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setSizePerGroup((prev) => Math.min(students.length || 30, prev + 1));
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-xs text-slate-500">人 / 組</span>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="target-group-count-input" className="block text-xs font-bold text-slate-600 mb-2">
                設定分成幾組
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setTargetGroupCount((prev) => Math.max(2, prev - 1));
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  id="target-group-count-input"
                  type="number"
                  min="2"
                  max={Math.max(2, students.length)}
                  value={targetGroupCount}
                  onChange={(e) =>
                    setTargetGroupCount(Math.max(2, parseInt(e.target.value) || 2))
                  }
                  className="w-20 text-center py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setTargetGroupCount((prev) => Math.min(students.length || 30, prev + 1));
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-xs text-slate-500">組</span>
              </div>
            </div>
          )}

          {/* Remainder Treatment */}
          {strategy === 'by-member-count' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                若人數無法整除時
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setRemainderStrategy('distribute');
                  }}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                    remainderStrategy === 'distribute'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  平均分配至各組
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setRemainderStrategy('new-group');
                  }}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                    remainderStrategy === 'new-group'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  剩餘人數自成一組
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tip for manual adjustment */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            💡 <strong>微調技巧：</strong>點擊任何學生姓名可選中，接著點擊另一位學生可直接<strong>互換組別</strong>，或點擊其他組別的「移入此組」進行調動。
          </span>
        </div>
      </div>

      {/* Selected Student Active Bar */}
      {selectedStudent && (
        <div className="bg-indigo-600 text-white rounded-xl p-3 px-5 shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs">已選取：</span>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-md">
              {selectedStudent.student.name} (第 {selectedStudent.groupId} 組)
            </span>
            <span className="text-xs text-indigo-100 hidden sm:inline">
              👉 請點擊另一位學生互換，或點擊任一小組下方的「移入此組」
            </span>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            取消選取
          </button>
        </div>
      )}

      {/* Grouping Visual Result Cards */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">尚未建立學生名單</h3>
          <p className="text-xs text-slate-500 mb-4">請先匯入學生名單以執行自動分組</p>
          <button
            id="empty-roster-grouper-cta"
            onClick={onOpenRosterModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            建立名單
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <p className="text-sm text-slate-500 mb-3">請點擊上方按鈕執行分組</p>
          <button
            onClick={generateGroups}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            開始隨機分組
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {groups.map((group, gIdx) => {
              const theme = GROUP_COLORS[gIdx % GROUP_COLORS.length];
              const isSelectedGroup = selectedStudent?.groupId === group.groupId;

              return (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: gIdx * 0.04 }}
                  className={`bg-white rounded-2xl border ${theme.border} shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden`}
                >
                  {/* Group Header */}
                  <div
                    className={`px-4 py-3 border-b ${theme.border} ${theme.bg} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${theme.badge}`}
                      >
                        {group.groupId}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {group.groupName}
                      </h4>
                    </div>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 border border-slate-200/80 shadow-2xs">
                      {group.members.length} 人
                    </span>
                  </div>

                  {/* Student Members List */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {group.members.map((member) => {
                        const isThisStudentSelected =
                          selectedStudent?.student.id === member.id;

                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleStudentClick(group.groupId, member)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition-all relative ${
                              isThisStudentSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-xs'
                                : selectedStudent
                                ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 hover:bg-indigo-50'
                                : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/90 text-slate-800'
                            }`}
                            title="點擊可選取調動組別"
                          >
                            {member.number && (
                              <span
                                className={`text-[10px] font-mono px-1 py-0.2 rounded-sm shrink-0 ${
                                  isThisStudentSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {member.number}
                              </span>
                            )}
                            <span className="text-xs font-medium truncate flex-1">
                              {member.name}
                            </span>
                            {selectedStudent && !isThisStudentSelected && (
                              <ArrowUpDown className="w-3 h-3 text-indigo-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Move button if a student from another group is selected */}
                    {selectedStudent && !isSelectedGroup && (
                      <button
                        type="button"
                        onClick={() => handleMoveToGroup(group.groupId)}
                        className="w-full py-1.5 px-3 rounded-lg border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                        <span>將「{selectedStudent.student.name}」移入本組</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
