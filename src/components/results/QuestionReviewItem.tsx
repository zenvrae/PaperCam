'use client';

import React, { useState } from 'react';
import { Question, AttemptAnswer } from '@/types';
import { CheckCircle2, XCircle, HelpCircle, Bookmark, BookmarkCheck, Lightbulb, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';

interface QuestionReviewItemProps {
  question: Question;
  questionNumber: number;
  userAnswer?: AttemptAnswer;
}

export const QuestionReviewItem: React.FC<QuestionReviewItemProps> = ({
  question,
  questionNumber,
  userAnswer
}) => {
  const [isBookmarked, setIsBookmarked] = useState(question.is_bookmarked || false);

  const selectedOpt = userAnswer?.selected_option || null;
  const isCorrect = selectedOpt === question.correct_answer;
  const isSkipped = !selectedOpt;

  const handleToggleBookmark = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    await apiClient.toggleBookmark(question.id, next);
  };

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 sm:p-6 space-y-4 shadow-2xs transition-all ${
      isSkipped 
        ? 'border-slate-200' 
        : isCorrect 
        ? 'border-emerald-200 bg-emerald-50/10' 
        : 'border-rose-200 bg-rose-50/10'
    }`}>
      
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 text-white">
            Q {questionNumber}
          </span>
          
          {isSkipped ? (
            <Badge variant="slate" size="sm" className="gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Skipped (0 marks)
            </Badge>
          ) : isCorrect ? (
            <Badge variant="emerald" size="sm" className="gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1.0 mark)
            </Badge>
          ) : (
            <Badge variant="rose" size="sm" className="gap-1 font-bold">
              <XCircle className="w-3.5 h-3.5" /> Wrong (-0.33 mark)
            </Badge>
          )}

          <Badge variant="indigo" size="sm">{question.subject}</Badge>
        </div>

        <button
          onClick={handleToggleBookmark}
          className={`p-1.5 rounded-lg border transition-colors ${
            isBookmarked
              ? 'bg-amber-50 border-amber-300 text-amber-600'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
          title="Save Question"
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-base font-bold text-slate-900 leading-snug">
        {question.question_text}
      </h3>

      {/* Options List with Visual State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {question.options.map((opt) => {
          const isUserChoice = selectedOpt === opt.option_code;
          const isRightChoice = question.correct_answer === opt.option_code;

          let cardStyle = 'border-slate-200 bg-white text-slate-700';
          let badgeStyle = 'bg-slate-100 text-slate-600';

          if (isRightChoice) {
            cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500';
            badgeStyle = 'bg-emerald-600 text-white';
          } else if (isUserChoice && !isRightChoice) {
            cardStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
            badgeStyle = 'bg-rose-600 text-white';
          }

          return (
            <div
              key={opt.id}
              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${cardStyle}`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}>
                {opt.option_code}
              </span>
              <span className="pt-0.5 leading-tight flex-1">{opt.option_text}</span>
              {isRightChoice && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {isUserChoice && !isRightChoice && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
            </div>
          );
        })}
      </div>

      {/* WHY? Explanation Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-100" />
          <span>Explanation</span>
        </div>
        <p className="leading-relaxed">{question.explanation}</p>
      </div>

      {/* RELATED PSC FACTS Callout Box */}
      {question.related_facts && question.related_facts.length > 0 && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-sm">
            <Pin className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            <span>RELATED PSC FACTS</span>
          </div>
          <ul className="space-y-1.5 text-indigo-950 font-medium list-disc list-inside">
            {question.related_facts.map((fact, idx) => (
              <li key={idx} className="leading-relaxed">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
