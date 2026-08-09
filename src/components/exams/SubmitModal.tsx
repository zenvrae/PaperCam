'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle, HelpCircle, Flag, Send } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  totalQuestions: number;
  answeredCount: number;
  reviewCount: number;
  negativeMarks: number;
  isLoading?: boolean;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  totalQuestions,
  answeredCount,
  reviewCount,
  negativeMarks,
  isLoading = false
}) => {
  const skippedCount = totalQuestions - answeredCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Exam Submission" maxWidth="md">
      <div className="space-y-5">
        
        <p className="text-xs sm:text-sm text-slate-600">
          Are you sure you want to finish and submit your exam? Once submitted, your score and detailed answer analysis will be calculated immediately.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-emerald-950">{answeredCount}</p>
            <p className="text-[11px] text-emerald-700 font-semibold">Answered</p>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <HelpCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-rose-950">{skippedCount}</p>
            <p className="text-[11px] text-rose-700 font-semibold">Skipped</p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <Flag className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-extrabold text-amber-950">{reviewCount}</p>
            <p className="text-[11px] text-amber-700 font-semibold">Review</p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>PSC Marking Rule:</strong> Each wrong answer deducts <strong>-{negativeMarks} marks</strong>. Unanswered questions do not incur negative marks.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Continue Test
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmSubmit}
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Confirm & Finish Test
          </Button>
        </div>

      </div>
    </Modal>
  );
};
