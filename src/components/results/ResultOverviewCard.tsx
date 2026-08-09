import React from 'react';
import { ExamAttempt } from '@/types';
import { Award, CheckCircle2, XCircle, HelpCircle, Clock, Percent, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ResultOverviewCardProps {
  attempt: ExamAttempt;
  onRetakeExam?: () => void;
}

export const ResultOverviewCard: React.FC<ResultOverviewCardProps> = ({ attempt, onRetakeExam }) => {
  const isPassed = attempt.percentage >= 40;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
            Exam Evaluation Report
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {attempt.exam_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submitted on {new Date(attempt.submit_time || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
            isPassed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
          }`}>
            <Award className="w-5 h-5" />
            <span className="font-extrabold text-sm">{isPassed ? 'QUALIFIED' : 'NEEDS REVISION'}</span>
          </div>
        </div>
      </div>

      {/* Main Score Hero Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className="md:col-span-2 p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Your Final Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-emerald-400">
                {attempt.score}
              </span>
              <span className="text-lg font-bold text-slate-400">
                / {attempt.total_marks}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Net marks after negative deduction</p>
          </div>

          <div className="text-right">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/40 flex items-center justify-center bg-slate-900/80">
              <span className="text-lg font-black text-white">{attempt.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Rank & Participant */}
        <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Platform Rank</p>
            <p className="text-2xl font-black text-amber-400">#{attempt.rank || 1}</p>
            <p className="text-[11px] text-slate-400">out of {attempt.total_participants || 1420} students</p>
          </div>
        </div>

        {/* Time Taken */}
        <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Time Taken</p>
            <p className="text-2xl font-black text-indigo-300">{formatDuration(attempt.time_taken_seconds)}</p>
            <p className="text-[11px] text-slate-400">Speed: ~{(attempt.time_taken_seconds / (attempt.correct_count + attempt.wrong_count + attempt.skipped_count || 1)).toFixed(1)}s / qn</p>
          </div>
        </div>

      </div>

      {/* Answer Metrics Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-emerald-300 font-medium">Correct</p>
            <p className="text-xl font-black text-white">{attempt.correct_count}</p>
          </div>
        </div>

        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-2xl flex items-center gap-3">
          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="text-xs text-rose-300 font-medium">Wrong</p>
            <p className="text-xl font-black text-white">{attempt.wrong_count}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-300 font-medium">Skipped</p>
            <p className="text-xl font-black text-white">{attempt.skipped_count}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          Tip: Review the explanations and 📌 <strong>Related PSC Facts</strong> below to maximize your learning score.
        </p>

        <div className="flex items-center gap-3">
          {onRetakeExam && (
            <Button variant="outline" size="sm" onClick={onRetakeExam} className="text-white border-slate-700 hover:bg-slate-800">
              Re-take Exam
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
};
