'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, BookOpen, Clock, ArrowLeft, CheckCircle2, Save, Award } from 'lucide-react';

export default function ExamPreferencesPage() {
  const [targetExam, setTargetExam] = useState('LDC 2024 (Lower Division Clerk)');
  const [languageMedium, setLanguageMedium] = useState('Malayalam');
  const [dailyGoalHours, setDailyGoalHours] = useState('3 Hours');
  const [difficultyPreference, setDifficultyPreference] = useState('All Levels (Standard PSC)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-6">
        <div>
          <Link href="/dashboard/profile" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-bold mb-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Exam Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailor your target PSC exams, study medium language, and daily preparation targets.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Preferences Updated
          </span>
        )}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-xs">
        
        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" /> Primary Target Examination
          </label>
          <select
            value={targetExam}
            onChange={(e) => setTargetExam(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
          >
            <option value="LDC 2024 (Lower Division Clerk)">LDC 2024 (Lower Division Clerk)</option>
            <option value="KAS Prelims (Kerala Administrative Service)">KAS Prelims (Kerala Administrative Service)</option>
            <option value="Degree Level Prelims & Mains">Degree Level Prelims &amp; Mains</option>
            <option value="LP/UP School Teacher Assistant">LP/UP School Teacher Assistant</option>
            <option value="Civil Police Officer (CPO) / Fireman">Civil Police Officer (CPO) / Fireman</option>
            <option value="Secretarial Assistant & Company Board">Secretarial Assistant &amp; Company Board</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" /> Preferred Study Medium
            </label>
            <select
              value={languageMedium}
              onChange={(e) => setLanguageMedium(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="English">English</option>
              <option value="Bilingual">Bilingual (English + Malayalam)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Daily Study Time Goal
            </label>
            <select
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
            >
              <option value="1 Hour">1 Hour / day (Light)</option>
              <option value="2 Hours">2 Hours / day (Standard)</option>
              <option value="3 Hours">3 Hours / day (Intensive)</option>
              <option value="4+ Hours">4+ Hours / day (Full Time Aspirant)</option>
            </select>
          </div>

        </div>

        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Mock Test Difficulty Level
          </label>
          <select
            value={difficultyPreference}
            onChange={(e) => setDifficultyPreference(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All Levels (Standard PSC)">All Levels (Standard PSC standard)</option>
            <option value="Advanced (Statement Questions & PYQs)">Advanced (Statement Questions &amp; PYQs)</option>
            <option value="Beginner Friendly">Beginner Friendly</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[#1e293b] flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
}
