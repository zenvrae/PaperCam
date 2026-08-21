import { Question, QuestionOption } from '@/types';

export interface ParsedQuestionCandidate {
  question_text: string;
  question_text_ml?: string;
  options: QuestionOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  related_facts?: string[];
  raw?: string;
}

/**
 * Parses raw text extracted from a PDF or text document into structured Kerala PSC MCQ questions.
 * Handles both English & Malayalam question paper formats.
 */
export function parseQuestionsFromText(
  rawText: string,
  defaultSubject: string = 'General Knowledge',
  defaultTopic: string = 'Kerala PSC PYQ',
  defaultDifficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
): ParsedQuestionCandidate[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize line breaks & page dividers
  const text = rawText
    .replace(/--- Page \d+ ---/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split into chunks by question numbers (e.g., "1.", "Q1.", "1)", "Question 1:")
  const questionNumberRegex = /(?:^|\n)\s*(?:Q\.?\s*|Question\s*)?(\d+)[.:\)]\s+/gi;

  const matches: { index: number; num: number; matchStr: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionNumberRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      num: parseInt(match[1], 10),
      matchStr: match[0]
    });
  }

  const blocks: string[] = [];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const block = text.slice(start, end).trim();
      if (block) blocks.push(block);
    }
  } else {
    // Fallback: split by double newlines if no numbered list found
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    blocks.push(...paragraphs);
  }

  const results: ParsedQuestionCandidate[] = [];

  for (const block of blocks) {
    const parsed = parseSingleBlock(block, defaultSubject, defaultTopic, defaultDifficulty);
    if (parsed && parsed.question_text && parsed.options.length >= 2) {
      results.push(parsed);
    }
  }

  return results;
}

function parseSingleBlock(
  block: string,
  subject: string,
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard'
): ParsedQuestionCandidate | null {
  // Strip leading question number (e.g. "1. ", "Q1) ")
  let cleanBlock = block.replace(/^(?:\n|\s)*(?:Q\.?\s*|Question\s*)?\d+[.:\)]\s*/i, '').trim();

  if (!cleanBlock) return null;

  let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
  let explanation = '';
  let relatedFacts: string[] = [];

  // 1. Extract Answer Key if present (e.g., "Ans: A", "Answer: Option B", "Correct: C", "[B]", "ഉത്തരം: A")
  const ansRegex = /(?:Ans(?:wer)?|Correct(?:\s*Answer)?|Key|ഉത്തരം)\s*[:=\-]?\s*(?:Option\s*)?\(?([A-Da-d])\)?/i;
  const ansMatch = cleanBlock.match(ansRegex);
  if (ansMatch) {
    correctAnswer = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
    cleanBlock = cleanBlock.replace(ansRegex, '').trim();
  }

  // 2. Extract Explanation / Facts if present
  const expRegex = /(?:Explanation|Solution|വിശദീകരണം|Rationale)\s*[:=\-]\s*([\s\S]*)$/i;
  const expMatch = cleanBlock.match(expRegex);
  if (expMatch) {
    explanation = expMatch[1].trim();
    cleanBlock = cleanBlock.replace(expRegex, '').trim();
  }

  const factRegex = /(?:Facts?|📌 Related Facts?|കുറിപ്പുകൾ)\s*[:=\-]\s*([\s\S]*)$/i;
  const factMatch = cleanBlock.match(factRegex);
  if (factMatch) {
    relatedFacts = factMatch[1].split(/\n|;|\u2022/).map(f => f.trim()).filter(Boolean);
    cleanBlock = cleanBlock.replace(factRegex, '').trim();
  }

  // 3. Extract Options:
  // Supports: "( ) a", "( ) b", "(a)", "(b)", "a)", "b)", "A.", "B.", "Option A"
  const optionRegex = /(?:^|\s|\n)(?:\(\s*\)\s*([a-dA-D])|\(?([a-dA-D])[\).:\-]|Option\s+([a-dA-D])[:\.\)]?)\s+/g;

  const optionIndices: { letter: 'A' | 'B' | 'C' | 'D'; start: number; textIndex: number }[] = [];
  let optMatch: RegExpExecArray | null;

  while ((optMatch = optionRegex.exec(cleanBlock)) !== null) {
    const rawLetter = optMatch[1] || optMatch[2] || optMatch[3];
    if (rawLetter) {
      const letter = rawLetter.toUpperCase() as 'A' | 'B' | 'C' | 'D';
      optionIndices.push({
        letter,
        start: optMatch.index,
        textIndex: optMatch.index + optMatch[0].length
      });
    }
  }

  let prompt = cleanBlock;
  const optionsMap: Record<'A' | 'B' | 'C' | 'D', string> = { A: '', B: '', C: '', D: '' };

  if (optionIndices.length >= 2) {
    prompt = cleanBlock.slice(0, optionIndices[0].start).trim();

    for (let i = 0; i < optionIndices.length; i++) {
      const current = optionIndices[i];
      const nextStart = i < optionIndices.length - 1 ? optionIndices[i + 1].start : cleanBlock.length;
      const optText = cleanBlock.slice(current.textIndex, nextStart).trim();
      optionsMap[current.letter] = optText;
    }
  } else {
    // Fallback line-by-line option extraction
    const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 3) {
      prompt = lines[0];
      const optLines = lines.slice(1);
      const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      optLines.forEach((line, idx) => {
        if (idx < 4) {
          const cleanOpt = line.replace(/^(?:\(\s*\)\s*[a-d]|\([a-d]\)|[a-d][\.\)]|Option\s+[a-d])\s*/i, '').trim();
          optionsMap[letters[idx]] = cleanOpt || line;
        }
      });
    }
  }

  // Build final structured options array
  const formattedOptions: QuestionOption[] = (['A', 'B', 'C', 'D'] as const).map((code) => ({
    id: code,
    option_code: code,
    option_text: optionsMap[code] || `Option ${code}`,
    text: optionsMap[code] || `Option ${code}`,
    is_correct: code === correctAnswer
  }));

  prompt = prompt.replace(/\s+/g, ' ').trim();

  if (!prompt) return null;

  return {
    question_text: prompt,
    options: formattedOptions,
    correct_answer: correctAnswer,
    explanation: explanation || 'Refer official Kerala PSC key and syllabus reference.',
    subject,
    topic,
    difficulty,
    related_facts: relatedFacts.length > 0 ? relatedFacts : [],
    raw: block
  };
}

/**
 * Extracts text directly from PDF files in browser using Mozilla PDF.js engine.
 * Decompresses stream filters and handles font CMap table text extractions natively.
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  // If plain text file
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Load PDF.js from CDN dynamically if not already loaded in window
  if (typeof window !== 'undefined') {
    if (!(window as any).pdfjsLib) {
      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            if ((window as any).pdfjsLib) {
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve();
            } else {
              reject(new Error('PDF.js library failed to initialize'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load PDF engine script from CDN'));
          document.head.appendChild(script);
        });
      } catch (err) {
        console.warn('Could not load PDF.js script from CDN, falling back to FileReader text decoder:', err);
      }
    }

    if ((window as any).pdfjsLib) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageItems = textContent.items.map((item: any) => item.str);
          const pageText = pageItems.join(' ');
          fullText += `\n--- Page ${i} ---\n` + pageText;
        }

        if (fullText.trim().length > 20) {
          return fullText;
        }
      } catch (err) {
        console.warn('PDF.js text extraction failed:', err);
      }
    }
  }

  // Fallback text decoder
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
      const decoder = new TextDecoder('utf-8');
      resolve(decoder.decode(bytes));
    };
    reader.readAsArrayBuffer(file);
  });
}
