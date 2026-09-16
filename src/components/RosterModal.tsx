import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Student } from '../types';
import { parseCSVContent, parsePastedNames, SAMPLE_STUDENTS } from '../utils/parser';
import { soundEffects } from '../utils/audio';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
}

type TabType = 'paste' | 'upload' | 'view';

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('paste');
  const [pastedText, setPastedText] = useState('');
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const handleApplyPasted = () => {
    if (!pastedText.trim()) {
      showNotification('請先輸入或貼上學生名單', 'error');
      return;
    }
    const parsed = parsePastedNames(pastedText);
    if (parsed.length === 0) {
      showNotification('無法辨識有效的學生姓名，請檢查格式', 'error');
      return;
    }

    onUpdateStudents(parsed);
    soundEffects.playPop();
    showNotification(`已成功匯入 ${parsed.length} 位學生！`, 'success');
    setPastedText('');
    setActiveTab('view');
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        showNotification('讀取檔案失敗或檔案為空', 'error');
        return;
      }
      const parsed = parseCSVContent(content);
      if (parsed.length === 0) {
        showNotification('未能從檔案中解析出學生名單，請確認檔案格式', 'error');
        return;
      }

      onUpdateStudents(parsed);
      soundEffects.playPop();
      showNotification(`成功由「${file.name}」匯入 ${parsed.length} 位學生！`, 'success');
      setActiveTab('view');
    };
    reader.onerror = () => {
      showNotification('讀取檔案時發生錯誤', 'error');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: Student = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      number: newNumber.trim() || String(students.length + 1).padStart(2, '0'),
    };

    onUpdateStudents([...students, newStudent]);
    soundEffects.playPop();
    setNewName('');
    setNewNumber('');
    showNotification(`已新增學生：${newStudent.name}`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    onUpdateStudents(students.filter((s) => s.id !== id));
    soundEffects.playPop();
    if (target) {
      showNotification(`已移除 ${target.name}`);
    }
  };

  const handleResetSample = () => {
    onUpdateStudents(SAMPLE_STUDENTS);
    soundEffects.playPop();
    showNotification(`已重置為 64 位學生名單`);
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空所有學生名單嗎？')) {
      onUpdateStudents([]);
      soundEffects.playPop();
      showNotification('已清空所有學生名單');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="roster-modal-container"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">學生名單來源管理</h2>
              <p className="text-xs text-slate-500">目前共有 {students.length} 位學生</p>
            </div>
          </div>
          <button
            id="roster-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-2">
          <button
            id="tab-paste"
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>文字貼上</span>
          </button>
          <button
            id="tab-upload"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>上傳 CSV / 檔案</span>
          </button>
          <button
            id="tab-view"
            onClick={() => setActiveTab('view')}
            className={`pb-2.5 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'view'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>目前名單 ({students.length})</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="paste-textarea" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  直接貼上姓名（每行一個，亦可包含座號）
                </label>
                <textarea
                  id="paste-textarea"
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`例如：\n01 王小明\n02 李小華\n03 張小美\n\n或直接貼上純姓名清單，系統會自動編配座號。`}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">💡 支援的文字格式：</p>
                <p>• 換行分隔、逗號分隔、空格分隔皆可辨識</p>
                <p>• 自動去除「1.」「(2)」「No.3」等流水號符號並擷取座號與姓名</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  id="paste-sample-btn"
                  type="button"
                  onClick={() => {
                    const sampleText = SAMPLE_STUDENTS.map((s) => `${s.number} ${s.name}`).join('\n');
                    setPastedText(sampleText);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                >
                  填入示範班級名單文字
                </button>
                <button
                  id="apply-pasted-btn"
                  type="button"
                  onClick={handleApplyPasted}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  確認匯入名單
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div
                id="drop-zone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  拖曳 CSV 檔案至此，或點擊選取檔案
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  支援從 Excel 匯出的 .csv、.txt 文字檔
                </p>

                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>選擇本機檔案</span>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV 格式建議
                </p>
                <p>• 建議具有標題行，例如「座號, 姓名」或直接單欄「姓名」</p>
                <p>• Excel 另存新檔時請選擇「CSV (逗號分隔) (*.csv)」</p>
              </div>
            </div>
          )}

          {/* TAB 3: VIEW & EDIT */}
          {activeTab === 'view' && (
            <div className="space-y-4">
              {/* Quick Add Form */}
              <form onSubmit={handleAddSingleStudent} className="flex gap-2 items-center">
                <input
                  id="new-student-number"
                  type="text"
                  placeholder="座號 (選填)"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <input
                  id="new-student-name"
                  type="text"
                  placeholder="學生姓名 (必填)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <button
                  id="add-student-btn"
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>新增</span>
                </button>
              </form>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>名單清單 ({students.length} 位)</span>
                <div className="flex items-center gap-3">
                  <button
                    id="sample-reload-btn"
                    onClick={handleResetSample}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>載入班級預設名單 (64人)</span>
                  </button>
                  {students.length > 0 && (
                    <button
                      id="clear-all-btn"
                      onClick={handleClearAll}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>清空名單</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Student Table / Chips */}
              {students.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">尚未有學生名單，請先貼上或上傳檔案</p>
                  <button
                    id="empty-load-sample"
                    onClick={handleResetSample}
                    className="mt-3 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                  >
                    載入 64 人班級名單
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                          {student.number || '#'}
                        </span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {student.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-sm transition-colors"
                        title="刪除此學生"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            id="modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
