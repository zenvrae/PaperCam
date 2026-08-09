'use client';

import React from 'react';
import { Question } from '@/types';

interface QuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, { selected_option: string | null; mark_for_review?: boolean }>;
  onJumpToQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  answers,
  onJumpToQuestion
}) => {
  const getQuestionStatus = (qId: number, idx: number) => {
    const ans = answers[qId];
    if (ans?.mark_for_review) return 'review';
    if (ans?.selected_option) return 'answered';
    if (idx === currentIndex) return 'current';
    return 'unvisited';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
        Question Palette
      </h3>

      {/* Grid of Buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(q.id, idx);
          const isCurrent = idx === currentIndex;

          const statusStyles = {
            answered: 'bg-emerald-600 text-white font-bold border-emerald-700',
            review: 'bg-amber-400 text-slate-950 font-bold border-amber-500',
            current: 'bg-slate-900 text-white font-bold ring-2 ring-emerald-500 ring-offset-1',
            unvisited: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
          };

          return (
            <button
              key={q.id}
              onClick={() => onJumpToQuestion(idx)}
              className={`h-10 rounded-xl text-xs flex items-center justify-center border transition-all cursor-pointer ${
                statusStyles[status]
              } ${isCurrent ? 'scale-105 shadow-md' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span>Marked Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-900 inline-block" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 inline-block" />
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
};
