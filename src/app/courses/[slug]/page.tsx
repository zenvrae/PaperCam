'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Course, Lesson } from '@/types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { CurriculumAccordion } from '@/components/courses/CurriculumAccordion';
import { FreePreviewModal } from '@/components/courses/FreePreviewModal';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Star, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle, 
  PlayCircle, 
  Lock, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || '';

  const { isCourseEnrolled } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        const c = await apiClient.getCourseBySlug(slug);
        setCourse(c);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-mono-code">
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <Link href="/courses">
          <button className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">Return to Catalog</button>
        </Link>
      </div>
    );
  }

  const isEnrolled = isCourseEnrolled(course.id);
  const hasDiscount = course.sale_price && course.sale_price < course.price;

  const handleSelectPreviewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setPreviewModalOpen(true);
  };

  return (
    <div className="pb-20 space-y-8 max-w-7xl mx-auto">
      
      {/* Course Detail Hero */}
      <section className="bg-[#131929] text-white p-8 sm:p-10 rounded-3xl border border-[#1e293b] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Course Details */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-2 flex-wrap font-mono-code">
                <span className="px-2.5 py-1 bg-[#0b0f19] border border-[#1e293b] rounded-md text-xs text-slate-300">
                  {course.category}
                </span>
                <Badge variant="indigo" size="sm">{course.difficulty}</Badge>
                <Badge variant="amber" size="sm">{course.language}</Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {course.description}
              </p>

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 text-xs font-mono-code text-slate-300 flex-wrap">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {course.rating || 4.9} ({course.reviews_count || 180} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  {(course.total_students || 1240).toLocaleString()} enrolled
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {course.duration}
                </span>
              </div>

              {/* Instructor Badge */}
              <div className="pt-3 flex items-center gap-3 border-t border-[#1e293b]">
                <img src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'} alt={course.instructor?.name || 'Faculty'} className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-400/40" />
                <div>
                  <p className="text-xs font-bold text-white">{course.instructor?.name || 'PSC Faculty'}</p>
                  <p className="text-[11px] font-mono-code text-slate-400">{course.instructor?.title || 'Senior Educator'}</p>
                </div>
              </div>
            </div>

            {/* Right Pricing Card (Desktop Sticky) */}
            <div className="lg:col-span-4">
              <div className="bg-[#0b0f19] text-white rounded-3xl p-6 shadow-2xl border border-[#1e293b] space-y-6">
                
                {/* Thumbnail Preview */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-[#131929] group">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                  <button
                    onClick={() => {
                      const firstLesson = course.curriculum?.[0]?.lessons[0];
                      if (firstLesson) handleSelectPreviewLesson(firstLesson);
                    }}
                    className="absolute inset-0 bg-[#0b0f19]/40 hover:bg-[#0b0f19]/20 flex items-center justify-center transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-7 h-7 fill-slate-950 text-amber-400" />
                    </div>
                  </button>
                </div>

                {/* Price Display */}
                <div className="space-y-1 font-mono-code">
                  {course.is_free ? (
                    <span className="text-3xl font-black text-amber-400">FREE</span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₹{course.sale_price || course.price}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{course.price}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          {Math.round(((course.price - (course.sale_price || 0)) / course.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 font-medium">Includes full lifetime access &amp; certificate</p>
                </div>

                {/* Main Action Button */}
                {isEnrolled ? (
                  <Link href={`/learn/${course.slug}/${course.curriculum?.[0]?.lessons[0]?.id || 201}`}>
                    <button className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-mono-code text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>Go to Learning Portal</span>
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-mono-code text-xs font-black uppercase rounded-2xl shadow-md transition-colors cursor-pointer"
                  >
                    Enroll Now — ₹{course.sale_price || course.price}
                  </button>
                )}

                {/* Included Features */}
                <div className="space-y-2.5 pt-2 border-t border-[#1e293b] text-xs text-slate-300">
                  <p className="font-bold text-white font-mono-code">This Course Includes:</p>
                  {(course.features || [
                    '120 HD Video Lessons',
                    '45 Topic-wise Reference PDFs',
                    '25 Standard PSC Mock Tests',
                    '2,500+ Solved Practice Questions',
                    'Detailed Explanations & PSC Related Facts'
                  ]).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Curriculum */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#131929] p-6 rounded-2xl border border-[#1e293b] shadow-lg space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Course Curriculum &amp; Syllabus Modules
            </h2>

            {course.curriculum && course.curriculum.length > 0 ? (
              <CurriculumAccordion
                curriculum={course.curriculum}
                courseSlug={course.slug}
                isEnrolled={isEnrolled}
                onSelectPreviewLesson={handleSelectPreviewLesson}
              />
            ) : (
              <p className="text-xs text-slate-400 font-mono-code">Curriculum loading...</p>
            )}
          </div>

        </div>

      </section>

      {/* Modals */}
      <FreePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        course={course}
        lesson={selectedLesson}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        course={course}
        onSuccess={() => setPaymentModalOpen(false)}
      />

    </div>
  );
}
