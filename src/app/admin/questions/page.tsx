'use client';

import React, { useEffect, useState } from 'react';
import { Question, QuestionOption } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  parseQuestionsFromText, 
  extractTextFromPdfFile, 
  ParsedQuestionCandidate 
} from '@/lib/pdf-parser';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  HelpCircle, 
  CheckCircle, 
  X, 
  BookOpen, 
  Sparkles,
  FileText,
  UploadCloud,
  Search,
  Filter,
  Check,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Code,
  Plus,
  CheckSquare,
  Square
} from 'lucide-react';

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('All');

  // Bulk Selection State
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // One-by-One Question Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // Question Form Fields
  const [questionText, setQuestionText] = useState('');
  const [questionTextMl, setQuestionTextMl] = useState('');
  const [subject, setSubject] = useState('Indian Constitution');
  const [topic, setTopic] = useState('Fundamental Rights');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [explanationMl, setExplanationMl] = useState('');
  const [relatedFacts, setRelatedFacts] = useState<string[]>([]);
  const [newFact, setNewFact] = useState('');

  // Bulk Import Wizard State (PDF, Text, JSON)
  const [isPdfWizardOpen, setIsPdfWizardOpen] = useState(false);
  const [importMode, setImportMode] = useState<'pdf' | 'text' | 'json'>('pdf');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');
  const [rawJsonText, setRawJsonText] = useState('');
  const [pdfBatchSubject, setPdfBatchSubject] = useState('General Knowledge');
  const [pdfBatchTopic, setPdfBatchTopic] = useState('Kerala PSC PYQ');
  const [pdfBatchDifficulty, setPdfBatchDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [parsedCandidates, setParsedCandidates] = useState<ParsedQuestionCandidate[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Load Questions from WordPress REST API / Local Storage
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getQuestions();
      setQuestions(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Question Modal for Creating
  const handleOpenCreateModal = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setQuestionTextMl('');
    setSubject('Indian Constitution');
    setTopic('Fundamental Rights');
    setDifficulty('Medium');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer('A');
    setExplanation('');
    setExplanationMl('');
    setRelatedFacts(['First Constitutional Amendment in 1951 introduced Schedule 9.']);
    setNewFact('');
    setIsModalOpen(true);
  };

  // Open Question Modal for Editing
  const handleOpenEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question_text || '');
    setQuestionTextMl(q.question_text_ml || '');
    setSubject(q.subject || 'General Knowledge');
    setTopic(q.topic || 'General');
    setDifficulty(q.difficulty || 'Medium');

    const findOptText = (code: 'A' | 'B' | 'C' | 'D') => {
      const found = q.options?.find(o => String(o.id).toUpperCase() === code || o.option_code === code);
      return found?.option_text || found?.text || '';
    };

    setOptA(findOptText('A'));
    setOptB(findOptText('B'));
    setOptC(findOptText('C'));
    setOptD(findOptText('D'));
    setCorrectAnswer(q.correct_answer === 'E' ? 'A' : (q.correct_answer || 'A'));
    setExplanation(q.explanation || '');
    setExplanationMl(q.explanation_ml || '');

    const facts = (q.related_facts || []).map(f => typeof f === 'string' ? f : (f.fact || f.fact_text || '')).filter(Boolean);
    setRelatedFacts(facts);
    setNewFact('');
    setIsModalOpen(true);
  };

  // Add Fact to Form
  const handleAddFact = () => {
    if (newFact.trim()) {
      setRelatedFacts(prev => [...prev, newFact.trim()]);
      setNewFact('');
    }
  };

  // Remove Fact from Form
  const handleRemoveFact = (index: number) => {
    setRelatedFacts(prev => prev.filter((_, i) => i !== index));
  };

  // Save Question (Create or Edit One-by-One)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const payload: Partial<Question> = {
      question_text: questionText.trim(),
      question_text_ml: questionTextMl.trim() || undefined,
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
      explanation: explanation.trim() || 'Detailed solution reference.',
      explanation_ml: explanationMl.trim() || undefined,
      related_facts: relatedFacts.map(f => ({ fact: f }))
    };

    if (editingQuestionId) {
      const updated = await apiClient.updateQuestion(editingQuestionId, payload);
      setQuestions(prev => prev.map(q => q.id === editingQuestionId ? updated : q));
    } else {
      const created = await apiClient.createQuestion(payload);
      setQuestions(prev => [created, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete Question Single
  const handleDeleteQuestion = async (id: number) => {
    if (confirm(`Are you sure you want to delete Question #${id}? This action cannot be undone.`)) {
      await apiClient.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelectedQuestionIds(prev => prev.filter(i => i !== id));
    }
  };

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk Delete Selected Questions
  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    const count = selectedQuestionIds.length;

    if (confirm(`Are you sure you want to delete ${count} selected question(s)? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        for (const id of selectedQuestionIds) {
          await apiClient.deleteQuestion(id);
        }
        setQuestions(prev => prev.filter(q => !selectedQuestionIds.includes(q.id)));
        setSelectedQuestionIds([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // PDF File Upload Handler
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPdf(true);
    setImportSuccessMsg('');
    try {
      if (file.name.endsWith('.json')) {
        const jsonStr = await file.text();
        parseJsonContent(jsonStr);
      } else {
        const extractedText = await extractTextFromPdfFile(file);
        const candidates = parseQuestionsFromText(extractedText, pdfBatchSubject, pdfBatchTopic, pdfBatchDifficulty);
        setParsedCandidates(candidates);
        if (candidates.length === 0) {
          alert('No structured questions could be automatically extracted from this file. Try pasting raw text directly.');
        }
      }
    } catch (err) {
      alert('Failed to read file. Please ensure it is a valid PDF or JSON document.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Raw Text Parse Trigger
  const handleParseRawText = () => {
    if (!rawPastedText.trim()) return;
    setIsProcessingPdf(true);
    setImportSuccessMsg('');
    try {
      const candidates = parseQuestionsFromText(rawPastedText, pdfBatchSubject, pdfBatchTopic, pdfBatchDifficulty);
      setParsedCandidates(candidates);
      if (candidates.length === 0) {
        alert('Could not detect question pattern. Ensure questions are numbered (e.g. 1. Question text...) with options A, B, C, D.');
      }
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // JSON Parse Trigger (Handles object options { "a": "...", "b": "..." } and array options)
  const parseJsonContent = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        alert('JSON content must be an array of question objects.');
        return;
      }
      const candidates: ParsedQuestionCandidate[] = parsed.map((item: any) => {
        const qText = item.question_text || item.question || item.title || item.prompt || 'Untitled Question';
        
        let opts: QuestionOption[] = [];

        if (Array.isArray(item.options)) {
          opts = item.options.map((o: any, idx: number) => {
            const code = (['A', 'B', 'C', 'D'][idx] || 'A') as any;
            if (typeof o === 'string') {
              return { 
                id: code, 
                option_code: code, 
                option_text: o, 
                text: o, 
                is_correct: (item.correct_answer || item.answer) === code 
              };
            }
            return {
              id: o.id || o.option_code || code,
              option_code: o.option_code || code,
              option_text: o.option_text || o.text || `Option ${code}`,
              text: o.option_text || o.text || `Option ${code}`,
              is_correct: Boolean(o.is_correct || (item.correct_answer || item.answer) === (o.option_code || code))
            };
          });
        } else if (item.options && typeof item.options === 'object') {
          // Handles object shape: { "a": "Option A text", "b": "Option B text", ... }
          const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
          opts = letters.map(code => {
            const lower = code.toLowerCase();
            const val = item.options[lower] || item.options[code] || item.options[`option_${lower}`] || item.options[`option_${code}`] || `Option ${code}`;
            const isCorrect = (item.correct_answer || item.answer) ? String(item.correct_answer || item.answer).toUpperCase() === code : code === 'A';
            return {
              id: code,
              option_code: code,
              option_text: val,
              text: val,
              is_correct: isCorrect
            };
          });
        } else {
          // Handles flat keys shape: item.optA, item.optB, item.option_a...
          const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
          opts = letters.map(code => {
            const lower = code.toLowerCase();
            const val = item[`opt${code}`] || item[`option_${lower}`] || item[`option${code}`] || item[lower] || `Option ${code}`;
            const isCorrect = (item.correct_answer || item.answer) ? String(item.correct_answer || item.answer).toUpperCase() === code : code === 'A';
            return {
              id: code,
              option_code: code,
              option_text: val,
              text: val,
              is_correct: isCorrect
            };
          });
        }

        const rawAns = (item.correct_answer || item.answer || 'A').toString().toUpperCase();
        const finalAns: 'A' | 'B' | 'C' | 'D' = (['A', 'B', 'C', 'D'].includes(rawAns) ? rawAns : 'A') as any;

        return {
          question_text: qText,
          question_text_ml: item.question_text_ml,
          subject: item.subject || pdfBatchSubject,
          topic: item.topic || pdfBatchTopic,
          difficulty: item.difficulty || pdfBatchDifficulty,
          options: opts,
          correct_answer: finalAns,
          explanation: item.explanation || 'Detailed solution reference.',
          related_facts: Array.isArray(item.related_facts) ? item.related_facts.map((f: any) => typeof f === 'string' ? f : (f.fact || f.fact_text || '')).filter(Boolean) : []
        };
      });

      setParsedCandidates(candidates);
    } catch (e) {
      alert('Invalid JSON format. Please ensure valid JSON array syntax.');
    }
  };

  const handleParseJsonInput = () => {
    if (!rawJsonText.trim()) return;
    setIsProcessingPdf(true);
    setImportSuccessMsg('');
    try {
      parseJsonContent(rawJsonText);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Import All Parsed Candidates to Bank
  const handleCommitImportCandidates = async () => {
    if (parsedCandidates.length === 0) return;

    setIsProcessingPdf(true);
    try {
      const questionsToSave: Partial<Question>[] = parsedCandidates.map(c => ({
        question_text: c.question_text,
        question_text_ml: c.question_text_ml,
        subject: c.subject || pdfBatchSubject,
        topic: c.topic || pdfBatchTopic,
        difficulty: c.difficulty || pdfBatchDifficulty,
        options: c.options,
        correct_answer: c.correct_answer,
        explanation: c.explanation || 'Extracted solution key.',
        related_facts: (c.related_facts || []).map(f => ({ fact: f }))
      }));

      const created = await apiClient.bulkCreateQuestions(questionsToSave);
      setQuestions(prev => [...created, ...prev]);
      setImportSuccessMsg(`Successfully imported ${created.length} questions into Question Bank!`);
      setParsedCandidates([]);
      setRawPastedText('');
      setRawJsonText('');
      setTimeout(() => {
        setIsPdfWizardOpen(false);
        setImportSuccessMsg('');
      }, 1500);
    } catch (err) {
      alert('Failed to import questions. Please try again.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Filter questions based on search & drop downs
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = searchQuery === '' || 
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectFilter === 'All' || q.subject === selectedSubjectFilter;
    const matchesDifficulty = selectedDifficultyFilter === 'All' || q.difficulty === selectedDifficultyFilter;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const availableSubjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean)));
  const allFilteredSelected = filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">CMS Module</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Question Bank Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create MCQs one-by-one or import from PDF, raw text, or JSON files.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setParsedCandidates([]);
              setImportSuccessMsg('');
              setIsPdfWizardOpen(true);
            }}
            className="px-4 py-2.5 bg-[#131929] hover:bg-[#1e293b] text-amber-400 border border-amber-400/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>+ Import PDF / Text / JSON</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
            <span>+ Add Question (1-by-1)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by text, subject, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">Subject:</span>
          </div>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
          >
            <option value="All">All Subjects ({questions.length})</option>
            {availableSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <select
            value={selectedDifficultyFilter}
            onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

      </div>

      {/* Active Question Repository List */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Header & Bulk Selection Bar */}
        <div className="p-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19]/40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer font-sans"
            >
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleToggleSelectAll}
                className="rounded border-[#1e293b] bg-[#0b0f19] text-amber-400 focus:ring-amber-400 cursor-pointer"
              />
              <span>Select All</span>
            </button>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white font-sans">
                Active Questions ({filteredQuestions.length} of {questions.length})
              </h3>
            </div>
          </div>

          {/* Bulk Selection Actions */}
          <div className="flex items-center gap-3">
            {selectedQuestionIds.length > 0 && (
              <div className="flex items-center gap-2 animate-fade-in font-sans">
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  {selectedQuestionIds.length} Selected
                </span>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete ({selectedQuestionIds.length})</span>
                </button>
              </div>
            )}

            <button 
              onClick={loadQuestions} 
              className="p-1.5 hover:bg-[#1e293b] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Refresh question bank"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading questions from server...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-sans">No questions found matching your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]/60">
            {filteredQuestions.map((q, idx) => {
              const isSelected = selectedQuestionIds.includes(q.id);

              return (
                <div key={q.id || idx} className={`p-4 sm:p-5 transition-colors space-y-3 ${isSelected ? 'bg-amber-400/5' : 'hover:bg-[#1e293b]/30'}`}>
                  <div className="flex items-start justify-between gap-4">
                    
                    {/* Checkbox for selection */}
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectQuestion(q.id)}
                        className="w-4 h-4 rounded border-[#1e293b] bg-[#0b0f19] text-amber-400 focus:ring-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Question Metadata & Text */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap font-mono-code text-[10px]">
                        <span className="font-bold text-amber-400">#Q-{q.id}</span>
                        <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-slate-300 font-bold">{q.subject}</span>
                        <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-slate-400">{q.topic}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm font-sans leading-snug">{q.question_text}</h4>
                      {q.question_text_ml && (
                        <p className="text-xs text-amber-300/90 font-sans">{q.question_text_ml}</p>
                      )}

                      {/* MCQ Options Display */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans text-xs">
                        {q.options && q.options.map((opt, oIdx) => {
                          const optCode = opt.option_code || (oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D');
                          const isCorrect = q.correct_answer === optCode || opt.is_correct;
                          const optText = opt.option_text || opt.text || '';

                          return (
                            <div 
                              key={oIdx} 
                              className={`p-2 rounded-xl border flex items-center gap-2 ${
                                isCorrect 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' 
                                  : 'bg-[#0b0f19] border-[#1e293b] text-slate-300'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-[#131929] text-slate-400 border border-[#1e293b]'
                              }`}>
                                {optCode}
                              </span>
                              <span className="truncate">{optText}</span>
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Explanation */}
                      {q.explanation && (
                        <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
                          <strong className="text-slate-200">Solution:</strong> {q.explanation}
                        </p>
                      )}

                      {/* Related PSC Facts */}
                      {q.related_facts && q.related_facts.length > 0 && (
                        <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px] text-amber-300 font-sans">
                          <span className="font-bold flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> 📌 Facts:</span>
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

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-[#1e293b] rounded-xl transition-colors cursor-pointer"
                        title="Edit question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* One-by-One Question Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {editingQuestionId ? 'Edit Question' : 'Single Question Entry'}
                </span>
                <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                  {editingQuestionId ? `Edit Question #${editingQuestionId}` : 'Add MCQ Question & Related Facts'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Question Text (English)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter Kerala PSC question prompt..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Question Text (Malayalam - Optional)</label>
                <textarea
                  rows={2}
                  placeholder="ചോദ്യം മലയാളത്തിൽ നൽകുക..."
                  value={questionTextMl}
                  onChange={(e) => setQuestionTextMl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Topic</label>
                  <input
                    type="text"
                    required
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
                    className="w-full px-3 py-1.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <label className="text-amber-400 font-bold">Multiple Choice Options (Select Radio for Correct Answer)</label>
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
                        required
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
                    className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {relatedFacts.map((fact, fIdx) => (
                    <div key={fIdx} className="flex items-center justify-between p-2 bg-[#131929] border border-[#1e293b] rounded-lg text-[11px] text-slate-300">
                      <span>📌 {fact}</span>
                      <button type="button" onClick={() => handleRemoveFact(fIdx)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 font-bold rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-colors cursor-pointer">
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Wizard Modal (PDF / Text / JSON) */}
      {isPdfWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative font-sans">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Automated Importer</span>
                <h3 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Import Questions (PDF, Text, JSON)</span>
                </h3>
              </div>
              <button onClick={() => setIsPdfWizardOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Alert Banner */}
            {importSuccessMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Batch Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Batch Subject</label>
                <input
                  type="text"
                  value={pdfBatchSubject}
                  onChange={(e) => setPdfBatchSubject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Batch Topic</label>
                <input
                  type="text"
                  value={pdfBatchTopic}
                  onChange={(e) => setPdfBatchTopic(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Difficulty</label>
                <select
                  value={pdfBatchDifficulty}
                  onChange={(e) => setPdfBatchDifficulty(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-white cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[#1e293b] gap-2 flex-wrap">
              <button
                onClick={() => setImportMode('pdf')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  importMode === 'pdf'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📁 Upload PDF File
              </button>
              <button
                onClick={() => setImportMode('text')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  importMode === 'text'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 Paste Raw Text
              </button>
              <button
                onClick={() => setImportMode('json')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  importMode === 'json'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {'{ }'} Bulk Import JSON
              </button>
            </div>

            {/* PDF File Upload Mode */}
            {importMode === 'pdf' && (
              <div className="border-2 border-dashed border-[#1e293b] hover:border-amber-400/50 rounded-3xl p-8 text-center bg-[#0b0f19]/50 transition-colors">
                <UploadCloud className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">Select Kerala PSC Question Paper PDF</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Automatically extracts text, questions, options A-D, and answer key from PDF files.
                </p>
                <label className="mt-4 inline-block px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors">
                  <span>Browse PDF File</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.json"
                    onChange={handlePdfFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Text Input Mode */}
            {importMode === 'text' && (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  placeholder={`Paste Kerala PSC question paper content here...\n\nExample:\n1. Who was the first Governor of Kerala?\nA) Burgula Ramakrishna Rao\nB) V. V. Giri\nC) N. N. Wanchoo\nD) P. S. Rao\nAns: A`}
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  className="w-full p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-xs text-white placeholder-slate-500 font-mono-code focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleParseRawText}
                  disabled={!rawPastedText.trim() || isProcessingPdf}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  ⚡ Parse Questions from Text
                </button>
              </div>
            )}

            {/* JSON Input Mode */}
            {importMode === 'json' && (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  placeholder={`Paste JSON array of questions here...\n\nExample:\n[\n  {\n    "question_number": 1,\n    "question": "താഴെ പറയുന്നവയില് ഹിമാലയ പര്വ്വതനിരയുടെ സവിശേഷത ഏത് ?",\n    "options": {\n      "a": "കിഴക്കോട്ടുപോകുന്തോറും ഉയരം കൂടുന്നു.",\n      "b": "പടിഞ്ഞാറ് ഭാഗത്ത് ഉയരം ഏറ്റവും കുറവ്.",\n      "c": "കിഴക്കോട്ടുപോകുംന്തോറും ഉയരം കുറയുന്നു.",\n      "d": "എല്ലാഭാഗത്തും ഒരേ ഉയരം."\n    }\n  }\n]`}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  className="w-full p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl text-xs text-white placeholder-slate-500 font-mono-code focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleParseJsonInput}
                  disabled={!rawJsonText.trim() || isProcessingPdf}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  ⚡ Parse JSON Questions
                </button>
              </div>
            )}

            {/* Parsed Candidates Preview List */}
            {parsedCandidates.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Parsed Questions Preview ({parsedCandidates.length})</span>
                  </h4>
                  <button
                    onClick={handleCommitImportCandidates}
                    disabled={isProcessingPdf}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Import {parsedCandidates.length} Questions to Bank</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-[#1e293b]">
                  {parsedCandidates.map((cand, cIdx) => (
                    <div key={cIdx} className="pt-3 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 font-mono-code">Q{cIdx + 1}.</span>
                          <p className="font-bold text-white text-xs">{cand.question_text}</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                            {cand.options.map(o => (
                              <div key={o.option_code} className={`p-1.5 rounded-lg border ${o.option_code === cand.correct_answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-[#0b0f19] border-[#1e293b]'}`}>
                                <span className="font-bold mr-1">{o.option_code}:</span> {o.option_text}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => setParsedCandidates(prev => prev.filter((_, i) => i !== cIdx))}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
              <button onClick={() => setIsPdfWizardOpen(false)} className="px-4 py-2 bg-[#1e293b] text-slate-300 text-xs font-bold rounded-xl cursor-pointer">
                Close
              </button>
              {parsedCandidates.length > 0 && (
                <button
                  onClick={handleCommitImportCandidates}
                  disabled={isProcessingPdf}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  Import All to Bank
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
