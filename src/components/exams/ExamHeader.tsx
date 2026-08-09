'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Send } from 'lucide-react';

interface ExamHeaderProps {
  title: string;
  durationMinutes: number;
  onTimeExpired: () => void;
  onSubmitRequested: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  title,
  durationMinutes,
  onTimeExpired,
  onSubmitRequested
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired, durationMinutes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = secondsRemaining < 300; // Less than 5 minutes

  return (
    <header className="sticky top-0 z-30 bg-[#0e1424] text-white px-4 sm:px-6 py-3 border-b border-[#1e293b] shadow-md font-mono-code">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Title */}
        <div className="min-w-0 flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            PSC
          </span>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {title}
            </h1>
            <p className="text-[10px] text-slate-400">Kerala PSC Official Simulator</p>
          </div>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono-code text-xs sm:text-sm font-extrabold border transition-all ${
            isWarning 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
              : 'bg-[#131929] text-amber-400 border-[#1e293b]'
          }`}>
            {isWarning ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={onSubmitRequested}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>

      </div>
    </header>
  );
};
