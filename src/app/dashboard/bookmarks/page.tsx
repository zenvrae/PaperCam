'use client';

import React, { useEffect, useState } from 'react';
import { Question } from '@/types';
import { apiClient } from '@/lib/api-client';
import { MOCK_QUESTIONS } from '@/lib/constants/mock-data';
import { Bookmark, Lightbulb, Pin, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const data = await apiClient.getBookmarks();
        setBookmarks(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (qId: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== qId));
    await apiClient.toggleBookmark(qId, false);
  };

  const toggleReveal = (qId: number) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Badge variant="amber" size="sm">Saved Questions</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            My Bookmarked Questions ({bookmarks.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your saved high-priority PSC questions and facts for fast exam revision.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {bookmarks.map((qn, idx) => {
          const isRevealed = revealedAnswers[qn.id];

          return (
            <div key={qn.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
              
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-slate-900 text-white">
                    #{idx + 1}
                  </span>
                  <Badge variant="indigo" size="sm">{qn.subject}</Badge>
                  <Badge variant="slate" size="sm">{qn.topic}</Badge>
                </div>

                <button
                  onClick={() => handleRemoveBookmark(qn.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {qn.question_text}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {qn.options.map(opt => {
                  const isCorrect = isRevealed && opt.option_code === qn.correct_answer;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{opt.option_code}.</span>
                        <span>{opt.option_text}</span>
                      </div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Toggle Answer Button */}
              <div className="pt-2">
                <button
                  onClick={() => toggleReveal(qn.id)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {isRevealed ? 'Hide Explanation' : 'Reveal Answer & Explanation'}
                </button>
              </div>

              {/* Explanation & Facts Box */}
              {isRevealed && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Explanation
                    </p>
                    <p>{qn.explanation}</p>
                  </div>

                  {qn.related_facts && qn.related_facts.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5 text-xs text-indigo-950">
                      <p className="font-bold flex items-center gap-1 text-indigo-900">
                        <Pin className="w-3.5 h-3.5 text-indigo-600" /> RELATED PSC FACTS
                      </p>
                      <ul className="list-disc list-inside space-y-1 font-medium">
                        {qn.related_facts.map((fact, fIdx) => (
                          <li key={fIdx}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
