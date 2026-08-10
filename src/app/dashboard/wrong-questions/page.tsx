'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Zap, ArrowRight, CheckCircle2, FileX } from 'lucide-react';
import { ExamAttempt } from '@/types';

export default function WrongQuestionsPage() {
  const [totalWrong, setTotalWrong] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [latestExamId, setLatestExamId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_attempts');
      if (stored) {
        try {
          const attempts: ExamAttempt[] = JSON.parse(stored);
          setAttemptsCount(attempts.length);
          let wrongCount = 0;
          attempts.forEach(a => {
            wrongCount += a.wrong_count || 0;
          });
          setTotalWrong(wrongCount);
          if (attempts.length > 0 && attempts[0].exam_id) {
            setLatestExamId(attempts[0].exam_id);
          }
        } catch (e) {}
      }
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-4">
        <Badge variant="rose" size="sm" className="gap-1">
          <Zap className="w-3.5 h-3.5 fill-current" /> Spaced Repetition Engine
        </Badge>
        
        <h1 className="text-3xl font-black text-white">
          Wrong Questions Practice Bank ({totalWrong})
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Questions you missed in previous mock exams are automatically gathered here. Practicing your weak areas is proven to boost your overall PSC score.
        </p>

        <div className="pt-2">
          <Link href={latestExamId ? `/exams/${latestExamId}` : '/dashboard/mock-tests'}>
            <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Revision Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {totalWrong === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Missed Questions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {attemptsCount > 0
              ? 'Great job! You answered all questions correctly in your submitted exams.'
              : 'Take mock tests to track incorrectly answered questions here for spaced repetition revision.'}
          </p>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Attempt Summary</h3>
          <p className="text-xs text-slate-600">
            You have attempted <strong className="text-slate-900">{attemptsCount}</strong> practice test(s) with <strong className="text-rose-600">{totalWrong}</strong> total incorrect answers recorded.
          </p>
        </div>
      )}

    </div>
  );
}
