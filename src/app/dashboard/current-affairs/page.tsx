'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Search, Sparkles, FileX } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Question } from '@/types';

export default function CurrentAffairsPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadCurrentAffairs() {
      try {
        const questions = await apiClient.getQuestions();
        const filtered = questions.filter(q =>
          q.subject.toLowerCase().includes('current') ||
          q.topic.toLowerCase().includes('current') ||
          q.topic.toLowerCase().includes('affairs')
        );
        setItems(filtered.length > 0 ? filtered : questions);
      } finally {
        setIsLoading(false);
      }
    }
    loadCurrentAffairs();
  }, []);

  const filteredNews = items.filter(n =>
    selectedCategory === 'All' || n.topic === selectedCategory || n.subject === selectedCategory
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Kerala PSC Current Affairs</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Daily Affairs &amp; Practice Feed ({items.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated daily PSC news updates and topic-wise practice questions loaded live from backend.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading current affairs feed...</div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-12 text-center space-y-3 shadow-lg">
          <FileX className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white font-sans">No Current Affairs Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            Current affairs questions and news digests published in your backend will appear here.
          </p>
        </div>
      ) : (
        /* News Feed Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#334155] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                    {item.subject}
                  </span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {item.topic}</span>
                </div>

                <h3 className="font-extrabold text-white text-base font-sans leading-snug">
                  {item.question_text}
                </h3>

                {item.explanation && (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {item.explanation}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> High Weightage PSC Topic
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">{item.source || 'Kerala PSC'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
