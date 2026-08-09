'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User as UserIcon, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Settings, 
  Edit3, 
  Sparkles,
  BookOpen,
  ChevronRight,
  UserCheck,
  Timer,
  Zap,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const [totalStudySeconds, setTotalStudySeconds] = useState(174300); // Default 48h 25m

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_total_study_seconds');
      if (stored) {
        setTotalStudySeconds(parseInt(stored, 10));
      } else {
        localStorage.setItem('psc_total_study_seconds', '174300');
      }

      // Increment live study time while on portal
      const interval = setInterval(() => {
        setTotalStudySeconds(prev => {
          const nextVal = prev + 1;
          localStorage.setItem('psc_total_study_seconds', String(nextVal));
          return nextVal;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const formatHoursMinutes = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const name = user?.name || 'VISHNU S';
  const email = user?.email || 'vishnu@papercam.app';

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Aspirant Hero Banner */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-amber-400/40 shadow-lg"
              />
              <Link
                href="/dashboard/settings/personal-info"
                className="absolute -bottom-2 -right-2 p-2 bg-amber-400 text-slate-950 rounded-xl shadow-md hover:bg-amber-500 transition-colors cursor-pointer"
                title="Edit Avatar"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            </div>

            {/* Aspirant Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Active Aspirant
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Registration ID: <strong className="text-slate-200">KPE-2024-8921</strong>
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
                <div className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase">CURRENT BATCH</span>
                  <span className="font-bold text-white">LDC 2024</span>
                </div>

                <div className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase">STATEWIDE RANK</span>
                  <span className="font-extrabold text-amber-400 font-sans flex items-center gap-1">
                    #42 <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard/settings/personal-info">
              <button className="px-4 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-[#334155] font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Edit Profile</span>
              </button>
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* Performance & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Performance Statistics & Completed Courses (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Performance Statistics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white font-sans">
                My Performance Statistics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Stat 1: Overall Accuracy Card */}
              <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Overall Accuracy</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl font-black text-white font-sans">87%</span>
                  <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b] mt-1.5">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '87%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 text-right">Top 15% of cohort</p>
                </div>
              </div>

              {/* Stat 2: Avg Time / Question Card */}
              <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Avg Time / Q</span>
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl font-black text-white font-sans">42s</span>
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] text-emerald-400 font-bold">
                    <span>↓ Improved 4s/wk</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Total Time Spent Card */}
              <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Total Time Spent</span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl font-black text-white font-sans">
                    {formatHoursMinutes(totalStudySeconds)}
                  </span>
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] text-emerald-400 font-bold">
                    <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    <span>+3.5h this week</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Completed Courses Section */}
          <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h3 className="font-extrabold text-base text-white font-sans">Completed Courses</h3>
              <Link href="/courses" className="text-xs text-amber-400 hover:underline font-bold">View All</Link>
            </div>

            <div className="space-y-3">
              
              <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs font-sans">Kerala History Fundamentals</h4>
                    <p className="text-[11px] text-slate-400">Completed: Oct 12, 2023</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                </span>
              </div>

              <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs font-sans">Quantitative Aptitude Level 1</h4>
                    <p className="text-[11px] text-slate-400">Completed: Sep 28, 2023</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Account Settings Hub (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-4">
              <Settings className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white font-sans">Account Settings</h3>
            </div>

            <div className="space-y-4 divide-y divide-[#1e293b]/60 text-xs font-sans">
              
              <Link
                href="/dashboard/settings/personal-info"
                className="pt-3 first:pt-0 flex items-center justify-between hover:text-amber-400 transition-colors group block"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-amber-400">Personal Information</p>
                  <p className="text-[11px] text-slate-400">Update email, phone, district</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                href="/dashboard/settings/exam-preferences"
                className="pt-3 flex items-center justify-between hover:text-amber-400 transition-colors group block"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-amber-400">Exam Preferences</p>
                  <p className="text-[11px] text-slate-400">Target exams, language medium</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                href="/dashboard/settings/notifications"
                className="pt-3 flex items-center justify-between hover:text-amber-400 transition-colors group block"
              >
                <div>
                  <p className="font-bold text-white group-hover:text-amber-400">Notification Settings</p>
                  <p className="text-[11px] text-slate-400">Exam alerts, email digests, SMS</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

            </div>

            <div className="pt-2 space-y-2">
              <Link href="/dashboard/settings/personal-info" className="block">
                <button className="w-full py-2.5 bg-transparent hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-bold text-xs rounded-xl font-mono-code transition-colors cursor-pointer">
                  Edit Profile
                </button>
              </Link>

              <button
                onClick={logout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl font-mono-code transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
