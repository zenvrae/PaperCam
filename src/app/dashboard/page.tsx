'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Course } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Play, Calendar, Clock, Share2, Zap, GraduationCap, CheckCircle2, ArrowRight, Star } from 'lucide-react';

interface LastWatched {
  courseSlug: string;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  moduleTitle: string;
  watchedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lastWatched, setLastWatched] = useState<LastWatched | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifiedTests, setNotifiedTests] = useState<number[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const liveCourses = await apiClient.getCourses();
        setCourses(liveCourses);

        // Check if student watched a video previously
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('psc_last_watched');
          if (stored) {
            try {
              setLastWatched(JSON.parse(stored));
            } catch (e) {}
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const toggleNotify = (id: number) => {
    setNotifiedTests(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  // Fallback to live course 0 if no video has been watched yet
  const defaultCourse = courses[0];
  const defaultModule = defaultCourse?.curriculum?.[0];
  const defaultLesson = defaultModule?.lessons?.[0];

  const displayCourseTitle = lastWatched?.courseTitle || defaultCourse?.title || 'PSC Combine Study Episodes Season 1';
  const displayModuleTitle = lastWatched?.moduleTitle || defaultModule?.title || 'Season 1 Modules';
  const displayLessonTitle = lastWatched?.lessonTitle || defaultLesson?.title || 'പഠിക്കണം എന്ന മനസ്സുണ്ടെങ്കിൽ ഇത് കണ്ടുതുടങ്ങാം';
  const displayResumeUrl = lastWatched
    ? `/learn/${lastWatched.courseSlug}/${lastWatched.lessonId}`
    : defaultCourse && defaultLesson
    ? `/learn/${defaultCourse.slug}/${defaultLesson.id}`
    : '/courses';

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'VISHNU'}
        </h1>
        <p className="text-sm text-slate-400">
          Let's continue your preparation for LDC 2024 &amp; Degree Level Prelims.
        </p>
      </div>

      {/* Top Grid: In Progress Card + Daily Affairs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* In Progress Main Card (8 Cols) */}
        <div className="lg:col-span-8 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-[#0b0f19] text-amber-400 border border-[#1e293b] text-xs font-bold uppercase tracking-wider">
                {lastWatched ? 'Recently Watched Video' : 'In Progress Course'}
              </span>
              <button className="text-slate-400 hover:text-amber-400 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
                {displayCourseTitle}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                <strong className="text-amber-400">{displayModuleTitle}</strong> — {displayLessonTitle}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2 relative z-10">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Lesson Stream Progress</span>
                <span className="text-amber-400 font-bold">65%</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2.5 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <Link href={displayResumeUrl}>
                <button className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer">
                  <Play className="w-4 h-4 fill-slate-950 text-amber-400" />
                  <span>Resume Last Watched Lesson</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Daily Affairs Widget (4 Cols) */}
        <div className="lg:col-span-4 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#1e293b] pb-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white font-sans">Daily Current Affairs</h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono-code text-amber-400 uppercase font-bold">Today • Kerala</span>
                <p className="text-slate-300 leading-relaxed line-clamp-2">
                  Kerala Govt announces new IT &amp; Knowledge Economy Policy 2026...
                </p>
              </div>

              <div className="space-y-1 border-t border-[#1e293b]/60 pt-3">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase font-bold">Yesterday • National</span>
                <p className="text-slate-400 leading-relaxed line-clamp-2">
                  ISRO successful launch of Earth Observation Satellite EOS-08...
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/current-affairs">
              <button className="w-full py-2 bg-transparent hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] font-mono-code text-xs rounded-xl transition-colors">
                View All News &amp; PDF Digests
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Live Enrolled Courses Section */}
      <div className="space-y-4 border-t border-[#1e293b] pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-white font-sans">My Live Enrolled Courses</h3>
          <Link href="/courses" className="text-xs text-amber-400 hover:underline font-bold">Browse Catalog →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#334155] transition-all shadow-md">
              <div className="flex items-center gap-4 min-w-0">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-xl object-cover border border-[#1e293b] shrink-0" />
                <div className="min-w-0 space-y-1">
                  <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-[10px] text-amber-400 font-bold">
                    {course.category}
                  </span>
                  <h4 className="font-bold text-white text-sm font-sans truncate">{course.title}</h4>
                  <p className="text-xs text-slate-400 font-sans truncate">
                    {course.curriculum ? course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0) : 0} Lessons • Malayalam Stream
                  </p>
                </div>
              </div>

              <Link href={`/courses/${course.slug}`}>
                <button className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shrink-0 transition-colors">
                  Open
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: LDC Targets + Upcoming Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LDC 2024 Targets (6 Cols) */}
        <div className="lg:col-span-6 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white font-sans">LDC 2024 Targets</h3>
            </div>
            <span className="text-xs font-mono-code text-slate-400">42 Days Left</span>
          </div>

          <div className="space-y-4 text-xs font-mono-code">
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span>General Knowledge &amp; Renaissance</span>
                <span className="font-bold text-white">80%</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span>Mental Ability &amp; Reasoning</span>
                <span className="font-bold text-white">45%</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span>General English &amp; Malayalam</span>
                <span className="font-bold text-white">92%</span>
              </div>
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tests (6 Cols) */}
        <div className="lg:col-span-6 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#1e293b] pb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white font-sans">Upcoming Tests</h3>
          </div>

          <div className="space-y-3">
            
            {/* Test Item 1 */}
            <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-mono-code font-bold text-white">LDC Full Length Mock - 05</h4>
                <p className="text-[11px] text-slate-400 font-mono-code mt-0.5">Tomorrow, 10:00 AM</p>
              </div>
              <button
                onClick={() => toggleNotify(1)}
                className={`px-3 py-1.5 text-xs font-mono-code rounded-lg transition-colors border ${
                  notifiedTests.includes(1)
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                    : 'bg-[#1e293b] text-slate-300 border-[#334155] hover:bg-[#334155]'
                }`}
              >
                {notifiedTests.includes(1) ? 'Notified ✓' : 'Notify Me'}
              </button>
            </div>

            {/* Test Item 2 */}
            <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-mono-code font-bold text-white">Subject Test: Malayalam Grammar</h4>
                <p className="text-[11px] text-slate-400 font-mono-code mt-0.5">Friday, 02:00 PM</p>
              </div>
              <button
                onClick={() => toggleNotify(2)}
                className={`px-3 py-1.5 text-xs font-mono-code rounded-lg transition-colors border ${
                  notifiedTests.includes(2)
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                    : 'bg-[#1e293b] text-slate-300 border-[#334155] hover:bg-[#334155]'
                }`}
              >
                {notifiedTests.includes(2) ? 'Notified ✓' : 'Notify Me'}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
