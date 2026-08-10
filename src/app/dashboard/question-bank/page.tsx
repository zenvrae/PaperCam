'use client';

import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Plus, SlidersHorizontal, HelpCircle, FileX } from 'lucide-react';
import { Question } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function QuestionBankManagerPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  useEffect(() => {
    async function loadQuestions() {
      try {
        const liveQ = await apiClient.getQuestions();
        setQuestions(liveQ);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Medium':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Hard':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All Topics' || q.topic === selectedTopic || q.subject === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          Question Bank Manager ({questions.length})
        </h1>

        {/* Global Table Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#131929] border border-[#1e293b] rounded-xl text-xs font-mono-code text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Questions Data Table Card */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono-code text-slate-400">Loading questions from backend...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono-code">
            <FileX className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white font-sans">No Questions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              {searchQuery ? 'No questions match your search query.' : 'No questions currently exist in your backend database. Use Admin to add new questions.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code">
              
              {/* Table Header */}
              <thead className="bg-[#0b0f19]/60 border-b border-[#1e293b] text-slate-400 font-bold">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-[#334155] bg-[#0b0f19] text-amber-400" />
                  </th>
                  <th className="p-4 uppercase">ID</th>
                  <th className="p-4 uppercase">Question Snippet</th>
                  <th className="p-4 uppercase">Subject / Topic</th>
                  <th className="p-4 uppercase">Difficulty</th>
                  <th className="p-4 uppercase">Source</th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-[#1e293b]/60 text-slate-300">
                {filteredQuestions.map((row) => {
                  const isSelected = selectedQuestions.includes(row.id);

                  return (
                    <tr key={row.id} className={`hover:bg-[#1e293b]/30 transition-colors ${isSelected ? 'bg-[#1e293b]/40' : ''}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(row.id)}
                          className="rounded border-[#334155] bg-[#0b0f19] text-amber-400"
                        />
                      </td>
                      <td className="p-4 font-bold text-amber-400">#Q-{row.id}</td>
                      <td className="p-4 text-white font-sans text-sm">{row.question_text}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-[#1e293b] text-slate-300 rounded-full text-[10px]">
                          {row.subject} • {row.topic}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getDifficultyBadge(row.difficulty)}`}>
                          {row.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{row.source || 'Kerala PSC'}</td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </div>
  );
}
