'use client';

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, TrendingUp, Calendar, Download, UserPlus, FileX } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ExamAttempt } from '@/types';

export default function AnalyticsOverviewPage() {
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const students = await apiClient.getStudents();
        setStudentCount(students.length);

        const courses = await apiClient.getCourses();
        setCourseCount(courses.length);

        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('psc_attempts');
          if (stored) {
            try {
              const atts: ExamAttempt[] = JSON.parse(stored);
              setAttempts(atts);
              if (atts.length > 0) {
                const totalPct = atts.reduce((acc, a) => acc + (a.percentage || 0), 0);
                setAvgScore(Math.round(totalPct / atts.length));
              }
            } catch (e) {}
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Analytics &amp; Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono-code">
            Monitor real-time institutional performance, candidate enrollments, and test metrics.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono-code text-slate-400">Loading performance metrics...</div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1 */}
            <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
                  Registered Students
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-amber-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white font-mono-code">{studentCount}</p>
                <p className="text-[11px] font-mono-code text-slate-400 mt-2">Active Candidates</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
                  Active Courses
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white font-mono-code">{courseCount}</p>
                <p className="text-[11px] font-mono-code text-slate-400 mt-2">Live Curriculum Batches</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
                  Avg. Candidate Score
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white font-mono-code">
                  {avgScore !== null ? `${avgScore}%` : 'N/A'}
                </p>
                <p className="text-[11px] font-mono-code text-slate-400 mt-2">
                  {attempts.length > 0 ? `Computed from ${attempts.length} attempt(s)` : 'No exam attempts yet'}
                </p>
              </div>
            </div>

          </div>

          {/* Activity Section */}
          <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-extrabold text-base text-white border-b border-[#1e293b] pb-4 font-sans">
              Recent Exam Attempts ({attempts.length})
            </h3>

            {attempts.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono-code text-slate-400 space-y-2">
                <FileX className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No student exam attempts recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]/60 text-xs font-mono-code">
                {attempts.slice(0, 5).map(att => (
                  <div key={att.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{att.exam_title}</p>
                      <p className="text-[10px] text-slate-400">{att.submit_time ? new Date(att.submit_time).toLocaleString() : 'Recently'}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                        Score: {att.score} / {att.total_marks} ({att.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
