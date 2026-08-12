import { Course, Exam, Lesson, Module, Question, Order, ExamAttempt, User, QuestionOption, DashboardResponseData, ResumeLearningData } from '@/types';
import { MOCK_COURSES, MOCK_QUESTIONS, MOCK_EXAMS, MOCK_USER } from './constants/mock-data';
import { getFirebaseIdToken } from './firebase';

const WP_API_BASE = 'https://papercam.wasmer.app/wp-json/psc/v1';

// Helper to extract 11-char YouTube Video ID from full URLs or video IDs
function extractYoutubeId(urlOrId?: string): string {
  if (!urlOrId) return 'dQw4w9WgXcQ';
  const match = urlOrId.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  if (urlOrId.length === 11) return urlOrId;
  return 'dQw4w9WgXcQ';
}

function normalizeCourse(raw: any): Course {
  const curriculum: Module[] = Array.isArray(raw.modules)
    ? raw.modules.map((m: any, mIdx: number) => ({
        id: Number(m.id) || mIdx + 1,
        course_id: Number(raw.id) || 1,
        title: m.title || `Module ${mIdx + 1}`,
        order: mIdx + 1,
        lessons: Array.isArray(m.lessons)
          ? m.lessons.map((l: any, lIdx: number) => {
              const youtubeId = extractYoutubeId(l.youtube_url || l.video_id);
              const isWatched = Boolean(l.watched ?? l.completed);
              return {
                id: Number(l.id) || (mIdx + 1) * 100 + lIdx + 1,
                module_id: Number(m.id) || mIdx + 1,
                course_id: Number(raw.id) || 1,
                title: l.title || `Lesson ${lIdx + 1}`,
                slug: l.slug || `lesson-${lIdx + 1}`,
                content_type: l.content_type || 'VIDEO',
                duration: l.duration || '30 mins',
                is_free_preview: Boolean(l.is_free_preview),
                youtube_url: l.youtube_url || `https://www.youtube.com/watch?v=${youtubeId}`,
                youtube_video_id: youtubeId,
                pdf_url: l.pdf_url,
                pdf_title: l.pdf_title,
                description: l.description || l.content,
                order: lIdx + 1,
                is_video: l.is_video ?? (l.content_type === 'VIDEO' || true),
                watched: isWatched,
                viewed: Boolean(l.viewed),
                progress_percent: Number(l.progress_percent || 0),
                last_position_seconds: Number(l.last_position_seconds || 0),
                completed: isWatched
              };
            })
          : []
      }))
    : [];

  return {
    id: Number(raw.id) || 1,
    title: raw.title || raw.name || 'Kerala PSC Course',
    slug: raw.slug || 'kerala-psc-course',
    description: raw.description || raw.excerpt || '',
    short_description: raw.short_description || raw.excerpt || '',
    thumbnail: raw.thumbnail || raw.featured_image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    category: raw.category || 'General',
    difficulty: raw.difficulty || 'All Levels',
    language: raw.language || 'Malayalam',
    price: Number(raw.price) || 0,
    sale_price: raw.sale_price ? Number(raw.sale_price) : undefined,
    is_free: Number(raw.price) === 0,
    status: 'published',
    instructor: {
      name: raw.instructor_name || 'PSC Expert Educator',
      title: raw.instructor_title || 'Senior Mentor',
      avatar: raw.instructor_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    duration: raw.duration || '40 Hours',
    certificate_available: true,
    curriculum,
    total_students: Number(raw.total_students) || 1250,
    rating: Number(raw.rating) || 4.8,
    reviews_count: Number(raw.reviews_count) || 85
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${WP_API_BASE}${endpoint}`;
    const token = await getFirebaseIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      throw err;
    }
  }

  // Auth & OTP Engine
  async getMe(): Promise<User> {
    try {
      const res = await this.request<{ success: boolean; data: User }>('/auth/me');
      if (res.success && res.data) return res.data;
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }

    return {
      id: 0,
      name: '',
      email: '',
      role: 'student'
    };
  }

  async requestOtp(target: string, method: 'phone' | 'email'): Promise<{ success: boolean; message: string; demo_otp: string }> {
    try {
      const res = await this.request<{ success: boolean; message: string; demo_otp: string }>('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ target, method })
      });
      if (res.success) return res;
    } catch (err) {}

    return {
      success: true,
      message: method === 'phone' 
        ? `Verification SMS sent to ${target}`
        : `Verification email sent to ${target}`,
      demo_otp: ''
    };
  }

  async verifyOtp(target: string, otp: string): Promise<{ success: boolean; user: User }> {
    try {
      const res = await this.request<{ success: boolean; data: User }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ target, otp })
      });
      if (res.success && res.data) return { success: true, user: res.data };
    } catch (err) {}

    const isEmail = target.includes('@');
    const userToReturn: User = {
      id: Date.now(),
      name: isEmail ? target.split('@')[0].toUpperCase() : 'Candidate',
      email: isEmail ? target : '',
      phone: !isEmail ? target : '',
      role: 'student'
    };

    return { success: true, user: userToReturn };
  }

  async login(emailOrPhone: string, pass: string): Promise<User> {
    try {
      const res = await this.request<{ success: boolean; data: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone, pass })
      });
      if (res.success && res.data) {
        const u = res.data;
        const isWpAdmin = u.role === 'administrator' || u.role === 'admin' || u.is_admin === true || u.capabilities?.administrator === true;
        return {
          ...u,
          role: isWpAdmin ? 'admin' : 'student'
        };
      }
    } catch (err) {}

    const isEmail = emailOrPhone.includes('@');
    const isAdminAccount = emailOrPhone.toLowerCase().includes('admin');
    return {
      id: Date.now(),
      name: isEmail ? emailOrPhone.split('@')[0].toUpperCase() : 'Administrator',
      email: isEmail ? emailOrPhone : '',
      phone: !isEmail ? emailOrPhone : '',
      role: isAdminAccount ? 'admin' : 'student'
    };
  }

  async register(name: string, email: string, pass: string): Promise<User> {
    try {
      const res = await this.request<{ success: boolean; data: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, pass })
      });
      if (res.success && res.data) return res.data;
    } catch (err) {}
    return {
      id: Date.now(),
      name: name || (email ? email.split('@')[0] : 'Candidate'),
      email: email || '',
      phone: '',
      role: 'student'
    };
  }

  async logout(): Promise<boolean> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (err) {}
    return true;
  }

  // WordPress LMS Dashboard & Student Progress APIs
  async getDashboard(): Promise<DashboardResponseData | null> {
    try {
      const res = await this.request<any>('/me/dashboard');
      if (res && res.data) return res.data;
      if (res && (res.resume_learning !== undefined || res.recent_progress !== undefined)) return res;
    } catch (err: any) {
      // Quietly suppress 404 errors for optional WP REST API endpoint
      if (!err?.message?.includes('404')) {
        console.warn('[ApiClient] Optional endpoint /me/dashboard unavailable:', err?.message || err);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_resume_learning');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { resume_learning: parsed };
        } catch (e) {}
      }
    }
    return null;
  }

  async markLessonViewed(lessonId: number): Promise<boolean> {
    try {
      const res = await this.request<{ success: boolean }>(`/lessons/${lessonId}/view`, {
        method: 'POST'
      });
      return res?.success ?? true;
    } catch (err) {
      return false;
    }
  }

  async getLessonProgress(lessonId: number): Promise<{ progress_percent: number; last_position_seconds: number; watched: boolean } | null> {
    try {
      const res = await this.request<any>(`/lessons/${lessonId}/progress`);
      if (res && res.data) return res.data;
      if (res && (res.progress_percent !== undefined || res.last_position_seconds !== undefined)) return res;
    } catch (err) {}
    return null;
  }

  async saveLessonProgress(
    lessonId: number, 
    progressPercent: number, 
    lastPositionSeconds: number,
    meta?: { course_title?: string; course_slug?: string; lesson_title?: string; module_title?: string; youtube_video_id?: string }
  ): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('psc_resume_learning');
        const existing = stored ? JSON.parse(stored) : {};
        const updated = {
          ...existing,
          lesson_id: lessonId,
          progress_percent: Math.round(progressPercent),
          last_position_seconds: Math.round(lastPositionSeconds),
          ...meta
        };
        localStorage.setItem('psc_resume_learning', JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      const res = await this.request<{ success: boolean }>(`/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          lesson_id: lessonId,
          progress_percent: Math.round(progressPercent),
          last_position_seconds: Math.round(lastPositionSeconds)
        })
      });
      return res?.success ?? true;
    } catch (err) {
      return false;
    }
  }

  async getAllProgress(): Promise<any> {
    try {
      const res = await this.request<any>('/progress');
      if (res && res.data) return res.data;
      if (res && res.progress !== undefined) return res;
    } catch (err) {
      console.error('[ApiClient] Failed to fetch all progress:', err);
    }
    return null;
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    try {
      const res = await this.request<{ success: boolean; data: any[] }>('/courses');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(normalizeCourse);
      }
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_courses');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [];
  }

  async getCourseBySlug(slugOrId: string): Promise<Course | null> {
    try {
      if (/^\d+$/.test(slugOrId)) {
        const res = await this.request<{ success: boolean; data: any }>(`/courses/${slugOrId}`);
        if (res.success && res.data) {
          return normalizeCourse(res.data);
        }
      } else {
        const listRes = await this.request<{ success: boolean; data: any[] }>('/courses');
        if (listRes.success && Array.isArray(listRes.data)) {
          const match = listRes.data.find((c: any) => c.slug === slugOrId || String(c.id) === slugOrId);
          if (match && match.id) {
            const detailRes = await this.request<{ success: boolean; data: any }>(`/courses/${match.id}`);
            if (detailRes.success && detailRes.data) {
              return normalizeCourse(detailRes.data);
            }
            return normalizeCourse(match);
          }
        }
      }
    } catch (err) {}

    const allCourses = await this.getCourses();
    const fallback = allCourses.find(c => c.slug === slugOrId || String(c.id) === slugOrId);
    return fallback || null;
  }

  // Admin Course CRUD
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const newCourse: Course = {
      id: Date.now(),
      title: courseData.title || 'New PSC Course',
      slug: courseData.slug || 'new-psc-course-' + Date.now(),
      description: courseData.description || 'Targeted Kerala PSC preparation course.',
      short_description: courseData.short_description || 'New PSC Preparation Course',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      category: courseData.category || 'Degree Level',
      difficulty: courseData.difficulty || 'All Levels',
      language: courseData.language || 'Malayalam',
      price: courseData.price || 999,
      sale_price: courseData.sale_price || 499,
      is_free: courseData.is_free || false,
      status: courseData.status || 'published',
      instructor: courseData.instructor || {
        name: 'PSC Senior Educator',
        title: 'Subject Specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      },
      duration: '45 Hours',
      certificate_available: true,
      total_students: 1,
      rating: 5.0,
      reviews_count: 1,
      pdf_count: 10,
      exam_count: 5,
      curriculum: courseData.curriculum || []
    };

    try {
      await this.request<{ success: boolean; data: any }>('/courses', {
        method: 'POST',
        body: JSON.stringify(newCourse)
      });
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_courses');
      const existing: Course[] = stored ? JSON.parse(stored) : [];
      existing.unshift(newCourse);
      localStorage.setItem('psc_custom_courses', JSON.stringify(existing));
    }

    return newCourse;
  }

  // Admin Question CRUD
  async createQuestion(qData: Partial<Question>): Promise<Question> {
    const newQ: Question = {
      id: Date.now(),
      question_text: qData.question_text || 'Sample Question',
      question_text_ml: qData.question_text_ml || qData.question_text,
      subject: qData.subject || 'General Knowledge',
      topic: qData.topic || 'Indian History',
      difficulty: qData.difficulty || 'Medium',
      question_type: 'MCQ',
      options: qData.options || [
        { id: 'A', option_code: 'A', option_text: 'Option A', text: 'Option A', is_correct: true },
        { id: 'B', option_code: 'B', option_text: 'Option B', text: 'Option B', is_correct: false },
        { id: 'C', option_code: 'C', option_text: 'Option C', text: 'Option C', is_correct: false },
        { id: 'D', option_code: 'D', option_text: 'Option D', text: 'Option D', is_correct: false }
      ],
      correct_answer: qData.correct_answer || 'A',
      explanation: qData.explanation || 'Solution explanation.',
      explanation_ml: qData.explanation_ml || qData.explanation,
      related_facts: qData.related_facts || [
        { fact: 'Key historical milestone in Kerala PSC syllabus.' }
      ],
      source: 'Kerala PSC Pro Admin'
    };

    try {
      await this.request<{ success: boolean; data: any }>('/questions', {
        method: 'POST',
        body: JSON.stringify(newQ)
      });
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_questions');
      const existing: Question[] = stored ? JSON.parse(stored) : [];
      existing.unshift(newQ);
      localStorage.setItem('psc_custom_questions', JSON.stringify(existing));
    }

    return newQ;
  }

  // Admin Exam CRUD & Auto-Generator
  async createExam(examData: Partial<Exam>): Promise<Exam> {
    const newExam: Exam = {
      id: Date.now(),
      title: examData.title || 'New PSC Mock Exam',
      description: examData.description || 'Full length mock test with negative marking.',
      duration_minutes: examData.duration_minutes || 75,
      total_questions: examData.questions?.length || 0,
      marks_per_question: examData.marks_per_question || 1,
      negative_marks: examData.negative_marks || 0.33,
      passing_score_percent: examData.passing_score_percent || 40,
      subject_category: examData.subject_category || 'Full Mock Test',
      is_full_mock: true,
      questions: examData.questions || [],
      created_at: new Date().toISOString()
    };

    try {
      await this.request<{ success: boolean; data: any }>('/exams', {
        method: 'POST',
        body: JSON.stringify(newExam)
      });
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_exams');
      const existing: Exam[] = stored ? JSON.parse(stored) : [];
      existing.unshift(newExam);
      localStorage.setItem('psc_custom_exams', JSON.stringify(existing));
    }

    return newExam;
  }

  // ⚡ Auto-Generate Exam from PYQs & Related Facts
  async autoGenerateExam(payload: {
    title: string;
    subject_category: string;
    question_count: number;
    duration_minutes: number;
    negative_marks: number;
  }): Promise<Exam> {
    const allQuestions = await this.getQuestions();
    let selected = allQuestions.filter(q =>
      payload.subject_category === 'All Subjects' ||
      q.subject === payload.subject_category ||
      q.topic === payload.subject_category
    );
    if (selected.length === 0) selected = allQuestions;

    const chosenQuestions = [...selected].sort(() => 0.5 - Math.random()).slice(0, payload.question_count);

    return this.createExam({
      title: payload.title,
      description: `Auto-generated PSC examination compiled from live Question Bank & 📌 Related PSC Facts.`,
      duration_minutes: payload.duration_minutes,
      negative_marks: payload.negative_marks,
      subject_category: payload.subject_category,
      is_auto_generated: true,
      questions: chosenQuestions
    });
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    let customQuestions: Question[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_questions');
      if (stored) {
        try {
          customQuestions = JSON.parse(stored);
        } catch (e) {}
      }
    }

    try {
      const res = await this.request<{ success: boolean; data: any[] }>('/questions');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const fetched: Question[] = res.data.map((q: any) => ({
          id: Number(q.id) || 1001,
          question_text: q.question_text || q.title || 'Untitled Question',
          question_text_ml: q.question_text_ml,
          subject: q.subject || 'General Knowledge',
          topic: q.topic || 'Indian History',
          difficulty: q.difficulty || 'Easy',
          question_type: 'MCQ' as const,
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: q.correct_answer || 'A',
          explanation: q.explanation || 'Detailed solution for this question.',
          explanation_ml: q.explanation_ml,
          related_facts: Array.isArray(q.related_facts) ? q.related_facts : [],
          source: q.source || 'Kerala PSC'
        }));
        return [...customQuestions, ...fetched];
      }
    } catch (err) {}

    return customQuestions;
  }

  // Exams & Practice
  async getExams(): Promise<Exam[]> {
    let customExams: Exam[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_custom_exams');
      if (stored) {
        try {
          customExams = JSON.parse(stored);
        } catch (e) {}
      }
    }

    try {
      const res = await this.request<{ success: boolean; data: any[] }>('/exams');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return [...customExams, ...res.data];
      }
    } catch (err) {}

    return customExams;
  }

  async getExam(id: number | string): Promise<Exam | null> {
    const allExams = await this.getExams();
    const found = allExams.find(e => String(e.id) === String(id));
    if (found) return found;

    try {
      const res = await this.request<{ success: boolean; data: any }>(`/exams/${id}`);
      if (res.success && res.data) {
        return {
          id: Number(res.data.id) || Number(id),
          title: res.data.title || 'Kerala PSC Mock Test',
          description: res.data.description || 'Standard examination following official PSC syllabus.',
          duration_minutes: Number(res.data.duration_minutes) || 75,
          total_questions: Array.isArray(res.data.questions) ? res.data.questions.length : 0,
          marks_per_question: Number(res.data.marks_per_question) || 1,
          negative_marks: Number(res.data.negative_marks) || 0.33,
          passing_score_percent: Number(res.data.passing_score_percent) || 40,
          subject_category: res.data.subject_category || 'Full Mock Test',
          is_full_mock: true,
          questions: Array.isArray(res.data.questions) ? res.data.questions : []
        };
      }
    } catch (err) {}
    return null;
  }

  async submitExam(examId: number, answers: Record<number, { selected_option: string | null; mark_for_review?: boolean }>, timeTakenSeconds: number): Promise<ExamAttempt> {
    const exam = await this.getExam(examId);
    if (!exam) {
      throw new Error(`Exam #${examId} not found`);
    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const evaluatedAnswers: Record<number, any> = {};

    exam.questions.forEach(q => {
      const userAns = answers[q.id]?.selected_option || null;
      if (!userAns) {
        skipped++;
        evaluatedAnswers[q.id] = {
          question_id: q.id,
          selected_option: null,
          is_correct: false,
          mark_obtained: 0,
          mark_for_review: answers[q.id]?.mark_for_review || false
        };
      } else if (userAns === q.correct_answer) {
        correct++;
        evaluatedAnswers[q.id] = {
          question_id: q.id,
          selected_option: userAns,
          is_correct: true,
          mark_obtained: exam.marks_per_question,
          mark_for_review: answers[q.id]?.mark_for_review || false
        };
      } else {
        wrong++;
        evaluatedAnswers[q.id] = {
          question_id: q.id,
          selected_option: userAns,
          is_correct: false,
          mark_obtained: -exam.negative_marks,
          mark_for_review: answers[q.id]?.mark_for_review || false
        };
      }
    });

    const rawScore = (correct * exam.marks_per_question) - (wrong * exam.negative_marks);
    const score = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const totalMarks = exam.total_questions * exam.marks_per_question;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    let currentUserId = 0;
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('psc_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.id) currentUserId = u.id;
        } catch (e) {}
      }
    }

    const attempt: ExamAttempt = {
      id: Date.now(),
      exam_id: exam.id,
      exam_title: exam.title,
      user_id: currentUserId || Date.now(),
      start_time: new Date(Date.now() - timeTakenSeconds * 1000).toISOString(),
      submit_time: new Date().toISOString(),
      score,
      total_marks: totalMarks,
      percentage,
      rank: 1,
      total_participants: 1,
      correct_count: correct,
      wrong_count: wrong,
      skipped_count: skipped,
      time_taken_seconds: timeTakenSeconds,
      status: 'submitted',
      answers: evaluatedAnswers
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_attempts');
      const attemptsArr = stored ? JSON.parse(stored) : [];
      attemptsArr.unshift(attempt);
      localStorage.setItem('psc_attempts', JSON.stringify(attemptsArr));
    }

    return attempt;
  }

  async getAttempt(id: number | string): Promise<ExamAttempt | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_attempts');
      if (stored) {
        const attemptsArr: ExamAttempt[] = JSON.parse(stored);
        const found = attemptsArr.find(a => String(a.id) === String(id));
        if (found) return found;
      }
    }
    return null;
  }

  // Bookmarks
  async getBookmarks(): Promise<Question[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_bookmarks');
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  async toggleBookmark(questionId: number, add: boolean): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_bookmarks');
      let bookmarks: Question[] = stored ? JSON.parse(stored) : [];
      if (add) {
        const allQ = await this.getQuestions();
        const qToAdd = allQ.find(q => q.id === questionId);
        if (qToAdd && !bookmarks.some(b => b.id === questionId)) {
          bookmarks.push({ ...qToAdd, is_bookmarked: true });
        }
      } else {
        bookmarks = bookmarks.filter(b => b.id !== questionId);
      }
      localStorage.setItem('psc_bookmarks', JSON.stringify(bookmarks));
    }
    return true;
  }

  // Financial Orders
  async getOrders(): Promise<Order[]> {
    try {
      const res = await this.request<{ success: boolean; data: Order[] }>('/orders');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_orders');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return [];
  }

  // Razorpay Payments
  async createRazorpayOrder(courseId: number, amount: number): Promise<{ order_id: string; currency: string; key: string }> {
    return {
      order_id: 'order_rzp_mock_' + Date.now(),
      currency: 'INR',
      key: 'rzp_test_mockkey12345'
    };
  }

  async verifyRazorpayPayment(payload: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; course_id: number }): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_enrolled');
      const enrolledArr: number[] = stored ? JSON.parse(stored) : [1];
      if (!enrolledArr.includes(payload.course_id)) {
        enrolledArr.push(payload.course_id);
        localStorage.setItem('psc_enrolled', JSON.stringify(enrolledArr));
      }
    }
    return true;
  }

  // Profile Synchronization & Database Persistence
  async updateProfile(profileData: Partial<User>): Promise<User> {
    // 1. Send candidate data to Next.js persistent /api/students route
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('psc_user');
        const currentUser = stored ? JSON.parse(stored) : {};
        const updated = { ...currentUser, ...profileData };
        localStorage.setItem('psc_user', JSON.stringify(updated));

        try {
          const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          });
          if (!res.ok) {
            console.error('[updateProfile] /api/students POST failed:', res.status, await res.text());
          }
        } catch (fetchErr) {
          console.error('[updateProfile] /api/students fetch error:', fetchErr);
        }
      }
    } catch (e) {
      console.error('[updateProfile] localStorage error:', e);
    }

    // 2. Send candidate data to WordPress REST API
    try {
      const res = await this.request<{ success: boolean; data: User }>('/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      if (res.success && res.data) return res.data;
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return { id: Date.now(), name: '', email: '', role: 'student', ...profileData };
  }

  // Fetch Student Directory from /api/students & WordPress REST API (Excludes Admins)
  async getStudents(): Promise<any[]> {
    let list: any[] = [];
    
    // 1. Fetch from Next.js server database API /api/students
    try {
      const apiRes = await fetch('/api/students');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && Array.isArray(json.data)) {
          list = json.data;
        }
      }
    } catch (err) {}

    // 2. Fetch from custom WP REST API endpoint /students if available
    if (list.length === 0) {
      try {
        const res = await this.request<{ success: boolean; data: any[] }>('/students');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        }
      } catch (err) {}
    }

    // 3. Filter out Administrator accounts & IDs
    return list.filter((u: any) => {
      const role = (u.role || u.user_role || (Array.isArray(u.roles) ? u.roles.join(' ') : '') || '').toLowerCase();
      const email = (u.user_email || u.email || u.slug || '').toLowerCase();
      return !role.includes('admin') && !email.includes('admin');
    });
  }

  // Admin Student Registry Management
  async deleteStudent(studentId: string, email?: string): Promise<boolean> {
    try {
      await this.request<{ success: boolean }>('/students/delete', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, email })
      });
    } catch (err) {}

    if (typeof window !== 'undefined') {
      if (email) {
        const deleted: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
        if (!deleted.includes(email.toLowerCase())) {
          deleted.push(email.toLowerCase());
          localStorage.setItem('psc_deleted_emails', JSON.stringify(deleted));
        }
      }

      // If stored user matches deleted candidate, reset onboarding status and profile data
      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if ((email && u.email && u.email.toLowerCase() === email.toLowerCase()) || u.id === studentId) {
            localStorage.removeItem('psc_onboarding_completed');
            delete u.dob;
            delete u.qualification;
            delete u.district;
            delete u.age;
            localStorage.setItem('psc_user', JSON.stringify(u));
          }
        } catch (e) {}
      }
    }

    return true;
  }

  // Fetch WordPress Site Title & Meta Description dynamically
  async getSiteSettings(): Promise<{ name: string; description: string }> {
    try {
      const wpBase = WP_API_BASE.replace(/\/psc\/v1\/?$/, '');
      const res = await fetch(wpBase, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.name) {
          return {
            name: json.name,
            description: json.description || 'Premier Kerala PSC Learning Platform'
          };
        }
      }
    } catch (e) {}
    return {
      name: 'PaperCam PSC',
      description: 'Premier Kerala PSC Learning Platform'
    };
  }
}

export const apiClient = new ApiClient();
