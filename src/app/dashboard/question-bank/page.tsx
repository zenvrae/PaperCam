'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Plus, SlidersHorizontal, CheckSquare } from 'lucide-react';

interface QuestionRow {
  id: string;
  snippet: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastEdited: string;
}

export default function QuestionBankManagerPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const questions: QuestionRow[] = [
    { id: '#Q-1042', snippet: 'What year did the French Revolution begin?', topic: 'History', difficulty: 'Easy', lastEdited: '2 hours ago' },
    { id: '#Q-1043', snippet: 'Calculate the derivative of f(x) = x^2 * sin(x).', topic: 'Math', difficulty: 'Hard', lastEdited: 'Yesterday' },
    { id: '#Q-1044', snippet: 'Which river is the longest in the world?', topic: 'Geography', difficulty: 'Medium', lastEdited: 'Oct 24, 2023' },
    { id: '#Q-1045', snippet: 'Who wrote \'The Odyssey\'?', topic: 'History', difficulty: 'Easy', lastEdited: 'Oct 20, 2023' },
  ];

  const toggleSelect = (id: string) => {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Question Bank Manager
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

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono-code">
        
        {/* Left Dropdown Filters */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          <button className="px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-slate-200 flex items-center gap-1.5">
            <span>All Topics</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button className="px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-slate-200 flex items-center gap-1.5">
            <span>All Difficulties</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-[#131929] border border-[#1e293b] rounded-xl text-slate-200 hover:bg-[#1e293b] transition-colors flex items-center gap-1.5">
            <span>Bulk Actions</span>
          </button>

          <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Question</span>
          </button>
        </div>

      </div>

      {/* Questions Data Table Card */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
        
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
                <th className="p-4 uppercase">Topic</th>
                <th className="p-4 uppercase">Difficulty</th>
                <th className="p-4 uppercase">Last Edited</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-[#1e293b]/60 text-slate-300">
              {questions.map((row) => {
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
                    <td className="p-4 font-bold text-amber-400">{row.id}</td>
                    <td className="p-4 text-white font-sans text-sm">{row.snippet}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-[#1e293b] text-slate-300 rounded-full text-[10px]">
                        {row.topic}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getDifficultyBadge(row.difficulty)}`}>
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{row.lastEdited}</td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-[#0b0f19]/40 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-400">
          <div>Showing 1 to 4 of 124 results</div>
          
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1 bg-[#131929] border border-[#1e293b] rounded-lg text-slate-400 hover:text-white">Prev</button>
            <button className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg">1</button>
            <button className="px-3 py-1 bg-[#131929] border border-[#1e293b] text-slate-300 rounded-lg">2</button>
            <button className="px-3 py-1 bg-[#131929] border border-[#1e293b] text-slate-300 rounded-lg">3</button>
          </div>
        </div>

      </div>

    </div>
  );
}
