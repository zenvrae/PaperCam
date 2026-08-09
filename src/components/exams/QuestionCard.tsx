'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { Bookmark, Globe, Languages } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: string | null;
  isBookmarked?: boolean;
  isMarkedForReview?: boolean;
  onSelectOption: (optionCode: string) => void;
  onToggleBookmark?: () => void;
  onToggleReview?: () => void;
  showAnswer?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isBookmarked = false,
  isMarkedForReview = false,
  onSelectOption,
  onToggleBookmark,
  onToggleReview,
  showAnswer = false,
}) => {
  const [lang, setLang] = useState<'EN' | 'ML'>('EN');

  const questionPrompt = lang === 'ML' && question.question_text_ml ? question.question_text_ml : question.question_text;

  return (
    <div className="bg-[#131929] rounded-2xl border border-[#1e293b] p-6 sm:p-8 space-y-6 shadow-xl">
      
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono-code">
            <span className="px-2.5 py-0.5 rounded-md bg-[#0b0f19] text-amber-400 font-bold border border-[#1e293b]">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-semibold">{question.subject}</span>
            <span className="text-slate-400">•</span>
            <Badge variant={question.difficulty === 'Easy' ? 'emerald' : question.difficulty === 'Medium' ? 'amber' : 'rose'} size="sm">
              {question.difficulty}
            </Badge>
          </div>
        </div>

        {/* Language Switcher & Controls */}
        <div className="flex items-center gap-2">
          
          {/* Bilingual Language Switcher Pill */}
          <div className="p-1 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center gap-1 font-mono-code text-[11px]">
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

          {onToggleReview && (
            <button
              onClick={onToggleReview}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code font-bold border transition-colors ${
                isMarkedForReview
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              {isMarkedForReview ? '★ Reviewing' : 'Mark Review'}
            </button>
          )}

          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-[#0b0f19] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
              title="Save to Bookmarks"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Question Body */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {questionPrompt}
        </h3>

        {question.question_image && (
          <img
            src={question.question_image}
            alt="Question Illustration"
            className="mt-3 rounded-xl max-h-60 object-contain border border-[#1e293b]"
          />
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3 pt-2">
        {question.options.map((opt) => {
          const optCode = String(opt.option_code || opt.id);
          const isSelected = selectedOption === optCode;

          const optionDisplay = lang === 'ML' && opt.option_text_ml ? opt.option_text_ml : (opt.option_text || opt.text);

          return (
            <button
              key={String(opt.id)}
              onClick={() => onSelectOption(optCode)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-amber-400/10 text-white font-bold shadow-md'
                  : 'border-[#1e293b] bg-[#0b0f19]/60 hover:bg-[#1e293b]/40 text-slate-200'
              }`}
            >
              <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black transition-colors font-mono-code ${
                isSelected
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-[#1e293b] text-slate-400'
              }`}>
                {optCode}
              </span>
              <span className="text-sm sm:text-base pt-0.5 leading-snug">
                {optionDisplay}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
