import React from 'react';
import { BookOpen, FileText, Award, Bookmark, Zap } from 'lucide-react';
import Link from 'next/link';

interface DashboardStatsProps {
  enrolledCount: number;
  examsCount: number;
  avgScore: number;
  bookmarksCount: number;
  wrongCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  enrolledCount,
  examsCount,
  avgScore,
  bookmarksCount,
  wrongCount
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Enrolled Courses */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-emerald-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Courses</span>
        </div>
        <p className="text-2xl font-black text-slate-900">{enrolledCount}</p>
        <p className="text-xs text-slate-500 font-medium">Active Enrolled</p>
      </div>

      {/* Exams Taken */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-indigo-600">
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exams</span>
        </div>
        <p className="text-2xl font-black text-slate-900">{examsCount}</p>
        <p className="text-xs text-slate-500 font-medium">Mock Tests Completed</p>
      </div>

      {/* Avg Score */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-amber-500">
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average</span>
        </div>
        <p className="text-2xl font-black text-slate-900">{avgScore}%</p>
        <p className="text-xs text-slate-500 font-medium">Accuracy Score</p>
      </div>

      {/* Bookmarks */}
      <Link href="/dashboard/bookmarks" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-amber-400 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between text-amber-600">
          <Bookmark className="w-5 h-5 fill-amber-100" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved</span>
        </div>
        <p className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{bookmarksCount}</p>
        <p className="text-xs text-slate-500 font-medium">Bookmarked Questions</p>
      </Link>

      {/* Wrong Questions Practice */}
      <Link href="/dashboard/wrong-questions" className="p-5 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-md space-y-2 hover:opacity-95 transition-opacity col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-rose-100">
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">Spaced Revision</span>
        </div>
        <p className="text-2xl font-black text-white">{wrongCount}</p>
        <p className="text-xs text-rose-100 font-bold flex items-center justify-between">
          <span>Wrong Questions</span>
          <span>Practice →</span>
        </p>
      </Link>

    </div>
  );
};
