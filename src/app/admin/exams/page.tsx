'use client';

import React, { useEffect, useState } from 'react';
import { Exam, Question } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  FileText, 
  PlusCircle, 
  Trash2, 
  Zap, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  Sparkles,
  Award,
  Globe
} from 'lucide-react';

export default function AdminMockExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);

  // Manual Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(75);
  const [negativeMarks, setNegativeMarks] = useState(0.33);
  const [category, setCategory] = useState('LDC Full Mock');
  const [selectedQIds, setSelectedQIds] = useState<number[]>([]);

  // Auto-Generate Form States
  const [autoTitle, setAutoTitle] = useState('Auto-Generated PSC Practice Test');
  const [autoCategory, setAutoCategory] = useState('All Subjects');
  const [autoQuestionCount, setAutoQuestionCount] = useState(5);
  const [autoDuration, setAutoDuration] = useState(45);

  useEffect(() => {
    async function loadData() {
      try {
        const exData = await apiClient.getExams();
        const qData = await apiClient.getQuestions();
        setExams(exData);
        setQuestions(qData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveManualExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenQuestions = questions.filter(q => selectedQIds.includes(q.id));

    const created = await apiClient.createExam({
      title,
      description: description || 'Custom mock exam created by Admin.',
      duration_minutes: Number(duration),
      negative_marks: Number(negativeMarks),
      subject_category: category,
      questions: chosenQuestions.length > 0 ? chosenQuestions : questions.slice(0, 5)
    });

    setExams(prev => [created, ...prev]);
    setIsManualModalOpen(false);
  };

  const handleAutoGenerateExam = async (e: React.FormEvent) => {
    e.preventDefault();

    const created = await apiClient.autoGenerateExam({
      title: autoTitle,
      subject_category: autoCategory,
      question_count: Number(autoQuestionCount),
      duration_minutes: Number(autoDuration),
      negative_marks: 0.33
    });

    setExams(prev => [created, ...prev]);
    setIsAutoModalOpen(false);
  };

  const toggleQuestionSelection = (qId: number) => {
    setSelectedQIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Exam Setup Module</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Mock Exam &amp; Simulator Setup
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure full-length PSC mock exams, negative marking math (-0.33), or auto-generate from PYQs &amp; Facts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>⚡ Auto-Generate Exam from PYQs &amp; Facts</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 bg-[#131929] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>+ Custom Exam</span>
          </button>
        </div>
      </div>

      {/* Exam Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-5 shadow-xl hover:border-[#334155] transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                  {ex.subject_category}
                </span>

                <div className="flex items-center gap-2">
                  {ex.is_auto_generated && (
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded text-[10px] font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-400" /> Auto-Generated
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Bilingual ML/EN
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-white text-lg font-sans leading-snug">
                {ex.title}
              </h3>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {ex.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-[#1e293b]">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {ex.duration_minutes} Mins</span>
                <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-slate-400" /> {ex.questions?.length || ex.total_questions} Questions</span>
                <span className="text-rose-400">Negative: -{ex.negative_marks}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#1e293b]">
              <span className="text-[11px] text-slate-400">ID: #EX-{ex.id}</span>
              <button
                onClick={() => setExams(prev => prev.filter(e => e.id !== ex.id))}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ⚡ Auto-Generate Exam Modal */}
      {isAutoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h3 className="text-xl font-bold text-white font-sans">⚡ Auto-Generate PSC Exam</h3>
              </div>
              <button onClick={() => setIsAutoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAutoGenerateExam} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Exam Title</label>
                <input
                  type="text"
                  required
                  value={autoTitle}
                  onChange={(e) => setAutoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Source Subject Pool</label>
                <select
                  value={autoCategory}
                  onChange={(e) => setAutoCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                >
                  <option value="All Subjects">All Subjects (PYQ + Related Facts Mix)</option>
                  <option value="Indian History">Indian History</option>
                  <option value="Indian Constitution">Indian Constitution</option>
                  <option value="Kerala History">Kerala History</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Number of Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={autoQuestionCount}
                    onChange={(e) => setAutoQuestionCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={autoDuration}
                    onChange={(e) => setAutoDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0b0f19] border border-amber-400/20 rounded-xl text-[11px] text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Automated Question Selection
                </p>
                <p className="text-slate-300 leading-relaxed font-sans">
                  The algorithm pulls questions from stored PYQs and 📌 Related PSC Facts, injects bilingual Malayalam translations, and publishes the exam to student catalogs.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button type="button" onClick={() => setIsAutoModalOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Generate Exam Now</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Manual Exam Creator Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h3 className="text-xl font-bold text-white font-sans">Create Custom PSC Exam</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualExam} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Degree Level Prelims Model Exam 03"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Duration (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Negative Marking</label>
                  <input
                    type="number"
                    step="0.01"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Select Questions from Question Bank */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <label className="text-amber-400 font-bold">Select Questions from Repository ({selectedQIds.length} Selected)</label>
                
                <div className="max-h-48 overflow-y-auto divide-y divide-[#1e293b]/60 border border-[#1e293b] rounded-xl p-2 bg-[#0b0f19]">
                  {questions.map((q) => {
                    const isSelected = selectedQIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-2.5 flex items-center justify-between text-left cursor-pointer rounded-lg transition-colors ${
                          isSelected ? 'bg-amber-400/10 text-white font-bold' : 'hover:bg-[#131929] text-slate-300'
                        }`}
                      >
                        <span className="truncate pr-2">#Q-{q.id} {q.question_text}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-amber-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-colors">
                  Save Exam
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
