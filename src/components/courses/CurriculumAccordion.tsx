'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Module, Lesson } from '@/types';
import { Video, FileText, Lock, Play, Music, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CurriculumAccordionProps {
  curriculum: Module[];
  courseSlug: string;
  isEnrolled: boolean;
  onSelectPreviewLesson?: (lesson: Lesson) => void;
}

export const CurriculumAccordion: React.FC<CurriculumAccordionProps> = ({
  curriculum,
  courseSlug,
  isEnrolled,
  onSelectPreviewLesson
}) => {
  const [expandedModules, setExpandedModules] = useState<number[]>([curriculum[0]?.id || 1]);

  const toggleModule = (id: number) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
      case 'VIDEO_PDF':
        return <Video className="w-4 h-4 text-amber-400" />;
      case 'AUDIO':
      case 'AUDIO_PDF':
        return <Music className="w-4 h-4 text-indigo-400" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-rose-400" />;
      default:
        return <Video className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {curriculum.map((module, idx) => {
        const isExpanded = expandedModules.includes(module.id);
        return (
          <div key={module.id} className="border border-[#1e293b] rounded-xl overflow-hidden bg-[#131929]">
            
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-4 bg-[#0b0f19]/60 hover:bg-[#1e293b]/40 transition-colors text-left font-bold text-white text-sm font-mono-code cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#1e293b] text-amber-400 flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </span>
                <span>{module.title}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({module.lessons.length} lessons)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Lesson Items */}
            {isExpanded && (
              <div className="divide-y divide-[#1e293b]/60 bg-[#131929]">
                {module.lessons.map((lesson) => {
                  const canAccess = isEnrolled || lesson.is_free_preview;

                  return (
                    <div
                      key={lesson.id}
                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-[#1e293b]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="shrink-0 p-1.5 rounded-lg bg-[#0b0f19] text-slate-400 border border-[#1e293b]">
                          {getContentTypeIcon(lesson.content_type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                              {lesson.title}
                            </h4>
                            {lesson.is_free_preview && (
                              <Badge variant="amber" size="sm" className="hidden sm:inline-flex gap-1 font-mono-code">
                                <Sparkles className="w-3 h-3" /> Free Preview
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono-code text-slate-400 mt-0.5">
                            <span>{lesson.duration}</span>
                            {lesson.pdf_title && <span>• {lesson.pdf_title}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {canAccess ? (
                          lesson.is_free_preview && !isEnrolled ? (
                            <button
                              onClick={() => onSelectPreviewLesson?.(lesson)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-400 text-slate-950 rounded-lg text-xs font-mono-code font-bold hover:bg-amber-500 transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-slate-950" /> Preview
                            </button>
                          ) : (
                            <Link
                              href={`/learn/${courseSlug}/${lesson.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1e293b] text-white rounded-lg text-xs font-mono-code font-semibold hover:bg-[#334155] border border-[#334155]"
                            >
                              <Play className="w-3 h-3 fill-current" /> Start Lesson
                            </Link>
                          )
                        ) : (
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0b0f19] text-slate-500 rounded-lg text-xs font-mono-code border border-[#1e293b] cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Locked
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};
