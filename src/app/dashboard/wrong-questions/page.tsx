'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Zap, Play, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WrongQuestionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-4">
        <Badge variant="rose" size="sm" className="gap-1">
          <Zap className="w-3.5 h-3.5 fill-current" /> Spaced Repetition Engine
        </Badge>
        
        <h1 className="text-3xl font-black text-white">
          Wrong Questions Practice Bank (127)
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Questions you missed in previous mock exams are automatically gathered here. Practicing your weak areas is proven to boost your overall PSC score by up to 25%.
        </p>

        <div className="pt-2">
          <Link href="/exams/1">
            <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Revision Exam (25 Questions)
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Indian History &amp; Constitution</span>
          <p className="text-2xl font-black text-rose-600">42 Missed</p>
          <p className="text-[11px] text-slate-400">Fundamental Rights &amp; Articles</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Mathematics &amp; Mental Ability</span>
          <p className="text-2xl font-black text-rose-600">55 Missed</p>
          <p className="text-[11px] text-slate-400">Percentage &amp; Time &amp; Work</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Kerala History &amp; Geography</span>
          <p className="text-2xl font-black text-rose-600">30 Missed</p>
          <p className="text-[11px] text-slate-400">Renaissance Movement dates</p>
        </div>
      </div>

    </div>
  );
}
