import { Course, Exam, Question, User } from '@/types';

export const MOCK_USER: User = {
  id: 0,
  name: '',
  email: '',
  role: 'student',
  phone: '',
  district: '',
  avatar: '',
  created_at: new Date().toISOString()
};

export const MOCK_COURSES: Course[] = [];

export const MOCK_QUESTIONS: Question[] = [];

export const MOCK_EXAMS: Exam[] = [];
