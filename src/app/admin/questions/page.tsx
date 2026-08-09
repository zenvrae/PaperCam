'use client';

import React, { useEffect, useState } from 'react';
import { Question, QuestionOption, QuestionFact } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  HelpCircle, 
  CheckCircle, 
  X, 
  BookOpen, 
  Sparkles,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('Indian Constitution');
  const [topic, setTopic] = useState('Fundamental Rights');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [relatedFacts, setRelatedFacts] = useState<string[]>(['First Constitutional Amendment in 1951 introduced Schedule 9.']);
  const [newFact, setNewFact] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const data = await apiClient.getQuestions();
        setQuestions(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleAddFact = () => {
    if (newFact.trim()) {
      setRelatedFacts(prev => [...prev, newFact.trim()]);
      setNewFact('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setRelatedFacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ = await apiClient.createQuestion({
      question_text: questionText,
      subject,
      topic,
      difficulty,
      options: [
        { id: 'A', option_code: 'A', text: optA || 'Option A', option_text: optA || 'Option A', is_correct: correctAnswer === 'A' },
        { id: 'B', option_code: 'B', text: optB || 'Option B', option_text: optB || 'Option B', is_correct: correctAnswer === 'B' },
        { id: 'C', option_code: 'C', text: optC || 'Option C', option_text: optC || 'Option C', is_correct: correctAnswer === 'C' },
        { id: 'D', option_code: 'D', text: optD || 'Option D', option_text: optD || 'Option D', is_correct: correctAnswer === 'D' }
      ],
      correct_answer: correctAnswer,
      explanation,
      related_facts: relatedFacts.map(f => ({ fact: f }))
    });

    setQuestions(prev => [newQ, ...prev]);
    setIsModalOpen(false);
  };

  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkText);
      if (Array.isArray(parsed)) {
        setQuestions(prev => [...parsed, ...prev]);
      }
    } catch (e) {
      alert('Invalid JSON format. Please ensure valid JSON array.');
    }
    setIsBulkOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">CMS Module</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Question Bank Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create MCQs with negative marking options, solutions, and 📌 Related PSC Facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2.5 bg-[#131929] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Bulk Import JSON</span>
          </button>
          
          <button
            onClick={() => {
              setQuestionText('');
              setOptA('');
              setOptB('');
              setOptC('');
              setOptD('');
              setExplanation('');
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-sans">Active Question Repository ({questions.length})</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading questions...</div>
        ) : (
          <div className="divide-y divide-[#1e293b]/60">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 sm:p-5 hover:bg-[#1e293b]/30 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 font-mono-code text-[10px]">
                      <span className="font-bold text-amber-400">#Q-{q.id}</span>
                      <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-slate-300">{q.subject}</span>
                      <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-slate-400">{q.topic}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">{q.difficulty}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm font-sans">{q.question_text}</h4>
                    
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Ans: <strong className="text-amber-400">Option {q.correct_answer}</strong> — {q.explanation}
                    </p>

                    {q.related_facts && q.related_facts.length > 0 && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px] text-amber-300">
                        <span className="font-bold">📌 Facts:</span>
                        {q.related_facts.map((f: any, fIdx: number) => {
                          const factText = typeof f === 'string' ? f : (f.fact || f.fact_text || '');
                          return (
                            <span key={fIdx} className="px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded-md">
                              {factText}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h3 className="text-xl font-bold text-white font-sans">Add MCQ Question &amp; Related Facts</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Question Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter Kerala PSC question prompt..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <label className="text-amber-400 font-bold">Multiple Choice Options (Select Correct Answer)</label>
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const stateVal = opt === 'A' ? optA : opt === 'B' ? optB : opt === 'C' ? optC : optD;
                  const setVal = opt === 'A' ? setOptA : opt === 'B' ? setOptB : opt === 'C' ? setOptC : setOptD;

                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={correctAnswer === opt}
                        onChange={() => setCorrectAnswer(opt)}
                        className="text-amber-400 focus:ring-amber-400 cursor-pointer"
                      />
                      <span className="font-bold text-white w-4">{opt}:</span>
                      <input
                        type="text"
                        placeholder={`Option ${opt} text...`}
                        value={stateVal}
                        onChange={(e) => setVal(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Solution Explanation */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Detailed Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Solution steps & rationale..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                />
              </div>

              {/* 📌 Related PSC Facts Manager */}
              <div className="space-y-2 p-3 bg-[#0b0f19] border border-[#1e293b] rounded-2xl">
                <label className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 📌 Related PSC Facts
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add landmark PSC fact point..."
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFact}
                    className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {relatedFacts.map((fact, fIdx) => (
                    <div key={fIdx} className="flex items-center justify-between p-2 bg-[#131929] border border-[#1e293b] rounded-lg text-[11px] text-slate-300">
                      <span>📌 {fact}</span>
                      <button type="button" onClick={() => handleRemoveFact(fIdx)} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-colors">
                  Save Question
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk JSON Import Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="font-bold text-white text-base">Bulk JSON Import Questions</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={8}
              placeholder="Paste JSON array of questions..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white font-mono-code text-xs"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsBulkOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleBulkImport} className="px-5 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl">
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
