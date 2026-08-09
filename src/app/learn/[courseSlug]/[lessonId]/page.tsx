'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Course, Lesson, Module } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Play, Download, Clock, Eye, CheckCircle2, Lock, ArrowRight, HelpCircle, ChevronRight, BookOpen } from 'lucide-react';

export default function LearningPortalPage() {
  const params = useParams();
  const router = useRouter();

  const courseSlug = (params.courseSlug as string) || '';
  const lessonIdParam = (params.lessonId as string) || '';

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const c = await apiClient.getCourseBySlug(courseSlug);
        if (c) {
          setCourse(c);
          
          // Flatten all lessons from modules
          const allLessons: Lesson[] = [];
          c.curriculum?.forEach(m => {
            if (Array.isArray(m.lessons)) {
              allLessons.push(...m.lessons);
            }
          });

          // Find current active lesson
          const targetLesson = allLessons.find(l => String(l.id) === lessonIdParam) || allLessons[0];
          setActiveLesson(targetLesson || null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [courseSlug, lessonIdParam]);

  // Save Last Watched Video to LocalStorage for Dashboard Integration
  useEffect(() => {
    if (course && activeLesson && typeof window !== 'undefined') {
      const moduleName = course.curriculum?.find(m => m.lessons.some(l => l.id === activeLesson.id))?.title || 'Module Syllabus';
      localStorage.setItem('psc_last_watched', JSON.stringify({
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
        moduleTitle: moduleName,
        watchedAt: new Date().toISOString()
      }));
    }
  }, [course, activeLesson]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Loading lesson video player...</p>
      </div>
    );
  }

  if (!course || !activeLesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <h2 className="text-xl font-bold text-white">Lesson Not Found</h2>
        <Link href="/courses">
          <button className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">Return to Catalog</button>
        </Link>
      </div>
    );
  }

  // Extract all lessons across modules for the playlist
  const allLessons: Lesson[] = [];
  course.curriculum?.forEach(m => {
    if (Array.isArray(m.lessons)) {
      allLessons.push(...m.lessons);
    }
  });

  const activeVideoId = activeLesson.youtube_video_id || 'dQw4w9WgXcQ';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono-code">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/courses" className="hover:text-amber-400">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href={`/courses/${course.slug}`} className="hover:text-amber-400 truncate max-w-[200px]">
            {course.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-bold truncate max-w-[250px]">{activeLesson.title}</span>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Video Embed & Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Video Player Frame */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#1e293b] shadow-2xl group">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
              title={activeLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Lesson Metadata Card */}
          <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6">
            
            <div className="space-y-2 border-b border-[#1e293b] pb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
                {activeLesson.title}
              </h1>
              <p className="text-xs font-mono-code text-amber-400">
                Course: {course.title}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {activeLesson.pdf_url ? (
                  <a
                    href={activeLesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#0b0f19] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-mono-code text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Study Material (PDF)</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-[#0b0f19]/50 text-slate-500 border border-[#1e293b] font-mono-code text-xs rounded-xl flex items-center gap-2 opacity-60 cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Reference PDF Included</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
                  <span className="px-2.5 py-1 bg-[#0b0f19] border border-[#1e293b] rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {activeLesson.duration}
                  </span>
                  <span className="px-2.5 py-1 bg-[#0b0f19] border border-[#1e293b] rounded-lg flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> Kerala PSC HD Stream
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Key Objectives */}
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p className="font-sans">
                {activeLesson.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <h3 className="font-extrabold text-sm text-white font-sans">
                  Lesson Overview &amp; Key Study Objectives:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-300 pl-1 font-sans">
                  <li>Comprehensive coverage of Kerala PSC syllabus concepts according to latest exam trends.</li>
                  <li>Includes previous years' PSC question analysis and 📌 <strong>Related PSC Facts</strong>.</li>
                  <li>In-depth explanations with memory tricks and topic-wise revision guidance.</li>
                </ul>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Course Content Playlist (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-lg">
            
            <div className="space-y-4">
              <div className="space-y-2 border-b border-[#1e293b] pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white font-sans">Course Content</h3>
                  <span className="text-xs font-mono-code text-slate-400">{allLessons.length} Lessons</span>
                </div>
                <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              {/* Playlist Items */}
              <div className="divide-y divide-[#1e293b]/60 text-xs font-mono-code max-h-[500px] overflow-y-auto pr-1">
                {allLessons.map((item, idx) => {
                  const isPlaying = activeLesson.id === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/learn/${course.slug}/${item.id}`)}
                      className={`w-full py-3 px-2 flex items-start justify-between text-left transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-[#1e293b] border-l-2 border-amber-400 pl-3 font-bold text-white'
                          : 'hover:bg-[#1e293b]/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isPlaying ? (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </div>
                        ) : (
                          <span className="w-4 text-center text-[10px] text-slate-500 font-mono-code shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 shrink-0">
                        {item.duration}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Yellow Start Practice Sidebar Button */}
          <Link href="/exams/1" className="block">
            <button className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer font-mono-code">
              <Play className="w-4 h-4 fill-slate-950 text-amber-400" />
              <span>Start Practice Exam</span>
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}
