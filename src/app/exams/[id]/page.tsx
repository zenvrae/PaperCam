'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Exam, ExamAttempt, AttemptAnswer } from '@/types';
import { apiClient } from '@/lib/api-client';
import { QuestionCard } from '@/components/exams/QuestionCard';
import { QuestionPalette } from '@/components/exams/QuestionPalette';
import { ExamHeader } from '@/components/exams/ExamHeader';
import { SubmitModal } from '@/components/exams/SubmitModal';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = (params.id as string) || '1';

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AttemptAnswer>>({});
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<number[]>([]);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    async function loadExamData() {
      try {
        const examData = await apiClient.getExam(examId);
        if (examData) {
          setExam(examData);
          if (examData.title && typeof document !== 'undefined') {
            document.title = `${examData.title} | PaperCam PSC`;
          }
        }

        const bookmarks = await apiClient.getBookmarks();
        setBookmarkedQuestionIds(bookmarks.map(b => b.id));
      } finally {
        setIsLoading(false);
      }
    }
    loadExamData();
  }, [examId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 text-center space-y-4 font-mono-code">
        <div>
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-bold">Initializing Live Exam Simulator...</p>
        </div>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 text-center space-y-4 font-mono-code">
        <div>
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Examination Not Found</h2>
          <button onClick={() => router.push('/courses')} className="mt-2 px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];

  const handleSelectOption = (optionCode: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        selected_option: optionCode,
        mark_for_review: prev[currentQuestion.id]?.mark_for_review || false
      }
    }));
  };

  const handleToggleMarkForReview = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        selected_option: prev[currentQuestion.id]?.selected_option || null,
        mark_for_review: !(prev[currentQuestion.id]?.mark_for_review || false)
      }
    }));
  };

  const handleToggleBookmark = async (qId: number) => {
    const isCurrentlyBookmarked = bookmarkedQuestionIds.includes(qId);
    setBookmarkedQuestionIds(prev =>
      isCurrentlyBookmarked ? prev.filter(id => id !== qId) : [...prev, qId]
    );
    await apiClient.toggleBookmark(qId, !isCurrentlyBookmarked);
  };

  const handleFinalSubmit = async () => {
    setIsEvaluating(true);
    try {
      const attempt = await apiClient.submitExam(exam.id, answers, timeTakenSeconds);
      router.push(`/attempts/${attempt.id}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const answeredCount = Object.values(answers).filter(a => a.selected_option !== null).length;
  const reviewCount = Object.values(answers).filter(a => a.mark_for_review).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between select-none">
      
      {/* Top Fixed Header with Timer */}
      <ExamHeader
        title={exam.title}
        durationMinutes={exam.duration_minutes}
        onTimeExpired={handleFinalSubmit}
        onSubmitRequested={() => setSubmitModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Question Viewer (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={exam.total_questions}
            selectedOption={answers[currentQuestion.id]?.selected_option || null}
            isMarkedForReview={answers[currentQuestion.id]?.mark_for_review || false}
            onSelectOption={handleSelectOption}
            onToggleReview={handleToggleMarkForReview}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
            isBookmarked={bookmarkedQuestionIds.includes(currentQuestion.id)}
          />

          <div className="flex items-center justify-between font-mono-code pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 bg-[#131929] hover:bg-[#1e293b] disabled:opacity-40 border border-[#1e293b] rounded-xl text-xs font-bold text-slate-200 transition-colors"
            >
              ← Previous Question
            </button>

            <button
              onClick={() => {
                if (currentIndex < exam.total_questions - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  setSubmitModalOpen(true);
                }
              }}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {currentIndex < exam.total_questions - 1 ? 'Save & Next →' : 'Submit Examination'}
            </button>
          </div>
        </div>

        {/* Right Palette Drawer (4 Cols) */}
        <div className="lg:col-span-4">
          <QuestionPalette
            questions={exam.questions}
            currentIndex={currentIndex}
            answers={answers}
            onJumpToQuestion={(idx) => setCurrentIndex(idx)}
          />
        </div>

      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirmSubmit={handleFinalSubmit}
        totalQuestions={exam.total_questions}
        answeredCount={answeredCount}
        reviewCount={reviewCount}
        negativeMarks={exam.negative_marks}
        isLoading={isEvaluating}
      />

    </div>
  );
}
