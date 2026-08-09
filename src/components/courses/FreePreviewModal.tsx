'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Lesson, Course } from '@/types';
import { Play, FileText, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface FreePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  course: Course | null;
}

export const FreePreviewModal: React.FC<FreePreviewModalProps> = ({
  isOpen,
  onClose,
  lesson,
  course
}) => {
  if (!lesson || !course) return null;

  const videoId = lesson.youtube_video_id || 'dQw4w9WgXcQ';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Free Lesson Preview" maxWidth="xl">
      <div className="space-y-4">
        
        {/* Video Player Embed */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={lesson.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Lesson Metadata */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Free Preview
            </span>
            <span className="text-xs text-slate-500">{lesson.duration}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{lesson.title}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {lesson.description || 'Study this free preview lesson to sample our expert teaching methodology for Kerala PSC.'}
          </p>
        </div>

        {/* PDF Notes Download if attached */}
        {lesson.pdf_url && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">{lesson.pdf_title || 'Lesson Reference PDF'}</p>
                <p className="text-[11px] text-slate-500">Free downloadable PSC study notes</p>
              </div>
            </div>
            <a
              href={lesson.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Download PDF
            </a>
          </div>
        )}

        {/* Unlock Full Course Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Unlock 150+ More Lessons
            </p>
            <p className="text-sm font-extrabold text-white mt-0.5">{course.title}</p>
          </div>
          <Link href={`/courses/${course.slug}`} onClick={onClose}>
            <Button variant="accent" size="sm" className="whitespace-nowrap">
              Enroll Now (₹{course.sale_price || course.price})
            </Button>
          </Link>
        </div>

      </div>
    </Modal>
  );
};
