'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Course, Exam, ResumeLearningData } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Play, Calendar, Clock, Share2, Zap, GraduationCap, CheckCircle2, ArrowRight, Star, FileX } from 'lucide-react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [resumeLearning, setResumeLearning] = useState<ResumeLearningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifiedTests, setNotifiedTests] = useState<number[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [dashRes, liveCourses, liveExams] = await Promise.all([
          apiClient.getDashboard().catch(() => null),
          apiClient.getCourses().catch(() => []),
          apiClient.getExams().catch(() => [])
        ]);

        setCourses(liveCourses);
        setExams(liveExams);

        if (dashRes?.resume_learning) {
          setResumeLearning(dashRes.resume_learning);
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

  const defaultCourse = courses[0];
  const defaultModule = defaultCourse?.curriculum?.[0];
  const defaultLesson = defaultModule?.lessons?.[0];

  const displayCourseTitle = resumeLearning?.course_title || defaultCourse?.title || 'Kerala PSC Learning Portal';
  const displayModuleTitle = resumeLearning?.module_title || defaultModule?.title || 'Active Curriculum';
  const displayLessonTitle = resumeLearning?.lesson_title || defaultLesson?.title || 'Select a lesson to begin learning';
  const displayResumeUrl = resumeLearning
    ? `/learn/${resumeLearning.course_slug}/${resumeLearning.lesson_id}`
    : defaultCourse && defaultLesson
    ? `/learn/${defaultCourse.slug}/${defaultLesson.id}`
    : '/courses';

  const thumbnailUrl = resumeLearning?.youtube_video_id
    ? `https://img.youtube.com/vi/${resumeLearning.youtube_video_id}/mqdefault.jpg`
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Candidate'}
        </h1>
        <p className="text-sm text-slate-400">
          Continue your preparation with expert PSC modules and live mock exams.
        </p>
      </div>

      {/* Top Grid: In Progress Card + Daily Affairs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* In Progress Main Card (8 Cols) */}
        <div className="lg:col-span-8 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-md bg-[#0b0f19] text-amber-400 border border-[#1e293b] text-xs font-bold uppercase tracking-wider">
                {resumeLearning ? 'Resume Learning' : 'Featured Learning Batch'}
              </span>
              {resumeLearning?.progress_percent !== undefined && resumeLearning.progress_percent > 0 && (
                <span className="text-xs text-slate-400 font-mono-code font-bold">
                  {resumeLearning.progress_percent}% Complete
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {thumbnailUrl && (
                <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#0b0f19] border border-[#1e293b] shrink-0">
                  <img src={thumbnailUrl} alt={displayLessonTitle} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 min-w-0 flex-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
                  {displayCourseTitle}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  <strong className="text-amber-400">{displayModuleTitle}</strong> — {displayLessonTitle}
                </p>
                {resumeLearning && resumeLearning.last_position_seconds !== undefined && resumeLearning.last_position_seconds > 0 && (
                  <p className="text-[11px] text-slate-400 font-mono-code pt-1">
                    Continue from {formatTime(resumeLearning.last_position_seconds)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 relative z-10">
            {resumeLearning?.progress_percent !== undefined && resumeLearning.progress_percent > 0 && (
              <div className="w-full bg-[#0b0f19] h-2 rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, resumeLearning.progress_percent))}%` }}
                />
              </div>
            )}
            <div>
              <Link href={displayResumeUrl}>
                <button className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer">
                  <Play className="w-4 h-4 fill-slate-950 text-amber-400" />
                  <span>{resumeLearning ? 'Continue Learning' : 'Resume Learning Stream'}</span>
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
              <h3 className="font-bold text-sm text-white font-sans">Current Affairs &amp; News</h3>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <p className="leading-relaxed">
                Stay updated with daily PSC current affairs digests and topic summaries.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/current-affairs">
              <button className="w-full py-2 bg-transparent hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] font-mono-code text-xs rounded-xl transition-colors">
                View All News &amp; Practice Feed
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* Live Enrolled Courses Section */}
      <div className="space-y-4 border-t border-[#1e293b] pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-white font-sans">My Live Courses ({courses.length})</h3>
          <Link href="/courses" className="text-xs text-amber-400 hover:underline font-bold">Browse Catalog →</Link>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 bg-[#131929] border border-[#1e293b] rounded-2xl text-center text-xs text-slate-400">
            No courses available yet. Browse the catalog or create a course in Admin.
          </div>
        ) : (
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
                      {course.curriculum ? course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0) : 0} Lessons
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
        )}
      </div>

      {/* Live Exams Catalog */}
      <div className="space-y-4 border-t border-[#1e293b] pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-white font-sans">Available PSC Mock Exams ({exams.length})</h3>
          <Link href="/dashboard/mock-tests" className="text-xs text-amber-400 hover:underline font-bold">View All Exams →</Link>
        </div>

        {exams.length === 0 ? (
          <div className="p-8 bg-[#131929] border border-[#1e293b] rounded-2xl text-center text-xs text-slate-400">
            No mock tests currently published. Build mock tests in the Admin Panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(ex => (
              <div key={ex.id} className="p-5 bg-[#131929] border border-[#1e293b] rounded-2xl flex items-center justify-between gap-4 shadow-md">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">{ex.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono-code">
                    {ex.duration_minutes} Mins • {ex.questions?.length || ex.total_questions} Questions • Negative: -{ex.negative_marks}
                  </p>
                </div>
                <Link href={`/exams/${ex.id}`}>
                  <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shrink-0">
                    Start Exam
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
