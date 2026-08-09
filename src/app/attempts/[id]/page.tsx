'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExamAttempt, Question } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Download, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Award,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AttemptEvaluationPage() {
  const params = useParams();
  const attemptId = (params.id as string) || '9001';

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'>('ALL');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [lang, setLang] = useState<'EN' | 'ML'>('EN');

  useEffect(() => {
    async function loadAttemptData() {
      try {
        const attData = await apiClient.getAttempt(attemptId);
        const qData = await apiClient.getQuestions();
        if (attData) setAttempt(attData);
        setQuestions(qData);
        
        // Trigger celebratory confetti if score > 70%
        if (attData && attData.percentage >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadAttemptData();
  }, [attemptId]);

  const toggleExplanation = (qId: number) => {
    setExpandedQuestions(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Generating detailed auto-evaluation...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <h2 className="text-xl font-bold text-white">Attempt Record Not Found</h2>
        <Link href="/courses">
          <button className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">Return to Catalog</button>
        </Link>
      </div>
    );
  }

  const filteredQuestions = questions.filter(q => {
    const userAns = attempt.answers[q.id];
    if (activeFilter === 'CORRECT') return userAns?.is_correct === true;
    if (activeFilter === 'INCORRECT') return userAns?.is_correct === false && userAns.selected_option !== null;
    if (activeFilter === 'SKIPPED') return !userAns || userAns.selected_option === null;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code pb-16">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <Link href="/dashboard/mock-tests" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-bold mb-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mock Tests</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            {attempt.exam_title || 'KAS Prelims Mock'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Completed on Oct 24, 2023 • 2h 00m
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="p-1 bg-[#131929] border border-[#1e293b] rounded-xl flex items-center gap-1 font-mono-code text-[11px]">
            <button
              onClick={() => setLang('EN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                lang === 'EN'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ML')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                lang === 'ML'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              മലയാളം
            </button>
          </div>

          <button className="px-4 py-2 bg-[#131929] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PDF</span>
          </button>

          <Link href="/exams/1">
            <button className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer">
              <RotateCcw className="w-4 h-4 text-slate-950" />
              <span>Retake Test</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Performance Summary Card (7 Cols) */}
        <div className="lg:col-span-7 bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <h3 className="font-extrabold text-base text-white font-sans">Performance Summary</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold">Total Score</p>
                <p className="text-3xl font-black text-white font-sans mt-0.5">
                  {attempt.score}<span className="text-sm text-slate-500 font-normal">/{attempt.total_marks}</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold">Rank</p>
                <p className="text-3xl font-black text-amber-400 font-sans mt-0.5">
                  #{attempt.rank || 142}<span className="text-sm text-slate-500 font-normal">/5k+</span>
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold">Percentile</p>
                <p className="text-3xl font-black text-white font-sans mt-0.5">
                  {attempt.percentage || 97.2}%
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold">Avg Time/Q</p>
                <p className="text-3xl font-black text-white font-sans mt-0.5">
                  1m 12s
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl relative">
              <div className="w-32 h-32 rounded-full border-8 border-amber-400 border-t-emerald-400 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <span className="text-2xl font-black text-white font-sans">{attempt.percentage}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 font-bold">Overall Accuracy</p>
            </div>
          </div>
        </div>

        {/* Subject Mastery (5 Cols) */}
        <div className="lg:col-span-5 bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-base text-white font-sans border-b border-[#1e293b] pb-3">Subject Mastery</h3>

          <div className="space-y-3.5 text-xs font-mono-code">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>History &amp; Culture</span>
                <span className="font-bold text-white">22/25</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Constitution &amp; Polity</span>
                <span className="font-bold text-white">18/20</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '90%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>General Science</span>
                <span className="font-bold text-white">15/20</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Current Affairs</span>
                <span className="font-bold text-white">12/20</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Mental Ability</span>
                <span className="font-bold text-white">15/15</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Question Analysis Section */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <h3 className="font-extrabold text-xl text-white font-sans">Question Analysis</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-[#1e293b] text-white border-[#334155]'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-slate-200'
              }`}
            >
              All ({questions.length})
            </button>

            <button
              onClick={() => setActiveFilter('CORRECT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'CORRECT'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-slate-200'
              }`}
            >
              ● Correct ({attempt.correct_count || 4})
            </button>

            <button
              onClick={() => setActiveFilter('INCORRECT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'INCORRECT'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-slate-200'
              }`}
            >
              ● Incorrect ({attempt.wrong_count || 1})
            </button>

            <button
              onClick={() => setActiveFilter('SKIPPED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'SKIPPED'
                  ? 'bg-slate-700 text-slate-200 border-slate-600'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-slate-200'
              }`}
            >
              ● Skipped ({attempt.skipped_count || 0})
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns?.is_correct === true;
            const isWrong = userAns?.is_correct === false && userAns.selected_option !== null;
            const isExpanded = expandedQuestions.includes(q.id);

            const qText = lang === 'ML' && q.question_text_ml ? q.question_text_ml : q.question_text;
            const explanationText = lang === 'ML' && q.explanation_ml ? q.explanation_ml : q.explanation;

            return (
              <div key={q.id || idx} className="p-5 bg-[#0b0f19] border border-[#1e293b] rounded-2xl space-y-4 shadow-md">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isWrong
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCorrect ? '✓' : isWrong ? '✕' : '?'}
                    </div>

                    <div>
                      <span className="px-2 py-0.5 rounded bg-[#131929] border border-[#1e293b] text-[10px] text-amber-400 font-bold">
                        Q{idx + 1} • {q.subject}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white font-sans mt-1">
                        {qText}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">Time: 45s</span>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt) => {
                    const optCode = String(opt.option_code || opt.id);
                    const isUserChoice = userAns?.selected_option === optCode;
                    const isRightOption = q.correct_answer === optCode;

                    const optDisplay = lang === 'ML' && opt.option_text_ml ? opt.option_text_ml : (opt.option_text || opt.text);

                    return (
                      <div
                        key={String(opt.id)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between font-sans ${
                          isRightOption
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                            : isUserChoice && !isRightOption
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                            : 'bg-[#131929] border-[#1e293b] text-slate-300'
                        }`}
                      >
                        <span>{optCode}. {optDisplay}</span>
                        {isRightOption && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isUserChoice && !isRightOption && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Collapsible */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleExplanation(q.id)}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? 'Hide Explanation' : 'View Explanation'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 bg-[#131929] border border-[#1e293b] rounded-xl space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                      <p><strong className="text-white">Explanation:</strong> {explanationText}</p>

                      {q.related_facts && q.related_facts.length > 0 && (
                        <div className="p-3 bg-[#0b0f19] border border-amber-400/20 rounded-lg space-y-1 text-amber-300 font-mono-code">
                          <p className="font-bold flex items-center gap-1.5 text-amber-400">
                            <Sparkles className="w-3.5 h-3.5" /> 📌 Related PSC Facts:
                          </p>
                          <ul className="list-disc list-inside space-y-1 pl-1">
                            {q.related_facts.map((f: any, fIdx: number) => {
                              const text = typeof f === 'string' ? f : (f.fact || f.fact_text || '');
                              return <li key={fIdx}>{text}</li>;
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
