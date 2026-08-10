'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Exam } from '@/types';
import { apiClient } from '@/lib/api-client';
import { FileText, Clock, HelpCircle, ArrowRight, Zap, CheckCircle2, Globe } from 'lucide-react';

export default function MockTestsHubPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const exData = await apiClient.getExams();
        setExams(exData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExams();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">PSC Exam Engine</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Full Mock Tests &amp; Practice Exams
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real Kerala PSC exam environment with live countdown, negative marking (-0.33), and bilingual Malayalam/English prompts.
          </p>
        </div>

        {exams.length > 0 && (
          <Link href={`/exams/${exams[0].id}`}>
            <button className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer">
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Launch Latest Mock Test</span>
            </button>
          </Link>
        )}
      </div>

      {/* Exams Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading live exams catalog...</div>
      ) : exams.length === 0 ? (
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-12 text-center space-y-3 shadow-lg">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white font-sans">No Mock Exams Published</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            Mock tests created in the Admin Panel or auto-generated from your question bank will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((ex) => (
            <div key={ex.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-5 shadow-lg hover:border-[#334155] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                    {ex.subject_category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {ex.is_auto_generated && (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-400" /> Auto-Generated
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Bilingual ML/EN
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-xl font-sans leading-snug">
                  {ex.title}
                </h3>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {ex.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-[#1e293b]">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {ex.duration_minutes} Mins</span>
                  <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-slate-400" /> {ex.questions?.length || ex.total_questions} Questions</span>
                  <span className="text-rose-400">Negative: -{ex.negative_marks}</span>
                </div>
              </div>

              <Link href={`/exams/${ex.id}`}>
                <button className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <span>Start Practice Examination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
