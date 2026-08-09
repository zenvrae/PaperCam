export type Role = 'student' | 'instructor' | 'content_manager' | 'question_manager' | 'admin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  district?: string;
  qualification?: string;
  dob?: string;
  age?: number;
  created_at?: string;
}

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseLanguage = 'Malayalam' | 'English' | 'Bilingual';
export type ContentType = 'VIDEO' | 'AUDIO' | 'PDF' | 'TEXT' | 'VIDEO_PDF' | 'AUDIO_PDF' | 'MIXED';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  thumbnail: string;
  category: string;
  difficulty: CourseDifficulty;
  language: CourseLanguage;
  price: number;
  sale_price?: number;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  duration: string;
  certificate_available: boolean;
  curriculum?: Module[];
  total_students: number;
  rating: number;
  reviews_count: number;
  features?: string[];
  pdf_count?: number;
  exam_count?: number;
}

export interface Lesson {
  id: number;
  module_id: number;
  course_id: number;
  title: string;
  slug?: string;
  content_type: ContentType;
  duration: string;
  is_free_preview: boolean;
  youtube_url?: string;
  youtube_video_id?: string;
  pdf_url?: string;
  pdf_title?: string;
  audio_url?: string;
  description?: string;
  notes?: string;
  order: number;
  completed?: boolean;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface QuestionOption {
  id: string | number;
  question_id?: number;
  option_code?: 'A' | 'B' | 'C' | 'D' | 'E';
  option_text?: string;
  option_text_ml?: string;
  text?: string;
  is_correct?: boolean;
}

export interface QuestionFact {
  id?: string | number;
  question_id?: number;
  fact_text?: string;
  fact?: string;
  order?: number;
}

export interface Question {
  id: number;
  question_text: string;
  question_text_ml?: string;
  question_image?: string;
  question_pdf?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_type: 'MCQ' | 'TrueFalse';
  year?: string;
  exam_name?: string;
  options: QuestionOption[];
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  explanation_ml?: string;
  related_facts: any[];
  source?: string;
  is_bookmarked?: boolean;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  marks_per_question: number;
  negative_marks: number;
  passing_score_percent: number;
  subject_category: string;
  is_full_mock: boolean;
  is_auto_generated?: boolean;
  questions: Question[];
  created_at?: string;
}

export interface AttemptAnswer {
  question_id: number;
  selected_option: string | null;
  is_correct?: boolean;
  mark_obtained?: number;
  mark_for_review?: boolean;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  exam_title: string;
  user_id: number;
  start_time: string;
  submit_time?: string;
  score: number;
  total_marks: number;
  percentage: number;
  rank?: number;
  total_participants?: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  time_taken_seconds: number;
  status: 'in_progress' | 'submitted' | 'expired';
  answers: Record<number, AttemptAnswer>;
}

export interface Order {
  id: string | number;
  order_number?: string;
  user_id: number;
  course_id: number;
  course_title: string;
  amount: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'SUCCESS';
  payment_gateway: 'razorpay' | 'stripe' | 'test' | 'Razorpay';
  transaction_id?: string;
  razorpay_payment_id?: string;
  coupon_code?: string;
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_percent?: number;
  flat_discount?: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  applicable_course_id?: number;
}

export interface CourseReview {
  id: number;
  course_id: number;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface StudentProgress {
  course_id: number;
  completed_lesson_ids: number[];
  video_watch_percent: Record<number, number>;
  last_watched_lesson_id?: number;
  overall_percentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    pages?: number;
  };
  message?: string;
  error?: string;
}
