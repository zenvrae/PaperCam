'use client';

import React, { useState } from 'react';
import { Calendar, Download, Search, Globe, Award, Sparkles, FileText, ChevronRight } from 'lucide-react';

export default function CurrentAffairsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const newsItems = [
    {
      id: 1,
      date: 'August 09, 2026',
      category: 'Kerala State',
      title: 'Kerala Government Announces New IT & Knowledge Economy Policy 2026',
      description: 'Key highlights for Kerala PSC exams: Targets 500,000 new digital jobs, state innovation grants, and Technopark Phase 4 expansion.',
      pdf_url: '#'
    },
    {
      id: 2,
      date: 'August 08, 2026',
      category: 'National',
      title: 'ISRO Successfully Launches Earth Observation Satellite EOS-08',
      description: 'Launched aboard SSLV-D3 from Satish Dhawan Space Centre, Sriharikota. Crucial payload data for PSC Science & Technology questions.',
      pdf_url: '#'
    },
    {
      id: 3,
      date: 'August 07, 2026',
      category: 'Sports',
      title: 'National Games 2026: Kerala Athletes Win 14 Gold Medals',
      description: 'Coverage of award winners, venues, and landmark achievements in athletics and aquatic events.',
      pdf_url: '#'
    },
    {
      id: 4,
      date: 'August 05, 2026',
      category: 'International',
      title: 'UNESCO World Heritage Committee Inscribes New Cultural Sites',
      description: 'Updated list of UNESCO sites in India and Asia-Pacific region for Degree Level Prelims General Knowledge.',
      pdf_url: '#'
    }
  ];

  const filteredNews = newsItems.filter(n => selectedCategory === 'All' || n.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Kerala PSC Current Affairs</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Daily Affairs &amp; Monthly Digest
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated daily PSC news updates, monthly revision PDFs, and topic-wise practice questions.
          </p>
        </div>

        <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer">
          <Download className="w-4 h-4 text-slate-950" />
          <span>Download August 2026 PDF</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {['All', 'Kerala State', 'National', 'International', 'Sports'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-[#131929] text-slate-300 border-[#1e293b] hover:border-[#334155]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNews.map((item) => (
          <div key={item.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#334155] transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                  {item.category}
                </span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {item.date}</span>
              </div>

              <h3 className="font-extrabold text-white text-base font-sans leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> High Weightage PSC Topic
              </span>
              <button className="px-3 py-1.5 bg-[#0b0f19] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] rounded-lg text-xs font-bold transition-colors">
                Read Analysis →
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
