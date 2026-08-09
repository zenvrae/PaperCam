'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, Users, Clock, FileText, CheckCircle2, PlayCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CourseCardProps {
  course: Course;
  onOpenPreview?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onOpenPreview }) => {
  const { isCourseEnrolled } = useAuth();
  const enrolled = isCourseEnrolled(course.id);

  const hasDiscount = course.sale_price && course.sale_price < course.price;
  const enrolledCount = (course.total_students || 0).toLocaleString();

  return (
    <div className="bg-[#131929] rounded-2xl border border-[#1e293b] hover:border-[#334155] shadow-md transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0b0f19]">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131929] via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#0b0f19]/80 backdrop-blur-xs text-slate-200 rounded-md text-[10px] font-mono-code border border-[#1e293b]">
            {course.category}
          </span>
          {course.is_free ? (
            <Badge variant="amber" size="sm">100% Free</Badge>
          ) : hasDiscount ? (
            <Badge variant="rose" size="sm">SAVE ₹{course.price - (course.sale_price || 0)}</Badge>
          ) : null}
        </div>

        {/* Free Preview Quick Trigger */}
        <button
          onClick={() => onOpenPreview?.(course)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0f19]/90 hover:bg-[#0b0f19] text-amber-400 rounded-xl text-xs font-bold border border-[#1e293b] backdrop-blur-xs transition-colors cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 fill-amber-400 text-slate-950" />
          <span>Free Preview</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono-code">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {course.rating || 4.9} ({course.reviews_count || 380})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {enrolledCount} enrolled
            </span>
          </div>

          <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-amber-400 transition-colors">
            <Link href={`/courses/${course.slug}`}>
              {course.title}
            </Link>
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {course.short_description}
          </p>
        </div>

        {/* Instructor & Metadata */}
        <div className="space-y-3 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono-code">
            <div className="flex items-center gap-2">
              <img
                src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                alt={course.instructor?.name || 'Faculty'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-medium text-slate-300 truncate max-w-[120px]">{course.instructor?.name || 'PSC Faculty'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{course.duration}</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{course.pdf_count || 30} PDFs</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {course.is_free ? (
                <span className="text-lg font-black text-amber-400 font-mono-code">FREE</span>
              ) : (
                <div className="flex items-baseline gap-1.5 font-mono-code">
                  <span className="text-xl font-extrabold text-white">
                    ₹{course.sale_price || course.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-500 line-through">
                      ₹{course.price}
                    </span>
                  )}
                </div>
              )}
            </div>

            <Link href={`/courses/${course.slug}`}>
              {enrolled ? (
                <button className="px-3.5 py-1.5 bg-[#1e293b] text-white font-mono-code text-xs font-bold rounded-xl border border-[#334155] flex items-center gap-1 hover:bg-[#334155] transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Continue</span>
                </button>
              ) : (
                <button className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-mono-code text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  View Course
                </button>
              )}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
