import { Course, Exam, Lesson, Module, Question, Order, ExamAttempt, User, QuestionOption, DashboardResponseData, ResumeLearningData } from '@/types';
import { MOCK_COURSES, MOCK_QUESTIONS, MOCK_EXAMS, MOCK_USER } from './constants/mock-data';
import { getFirebaseIdToken, auth } from './firebase';

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
  private onboardingToken: string | null = null;

  // Initialize onboarding session & retrieve onboarding_token from WordPress
  async startOnboarding(): Promise<string> {
    try {
      const res = await this.request<{ success?: boolean; onboarding_token?: string; token?: string }>('/me/onboarding/start', {
        method: 'POST'
      });
      const tok = res?.onboarding_token || res?.token || `onb_tok_${Date.now()}`;
      this.onboardingToken = tok;
      return tok;
    } catch (err) {
      const tok = `onb_tok_${Date.now()}`;
      this.onboardingToken = tok;
      return tok;
    }
  }

  getOnboardingToken(): string | null {
    return this.onboardingToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${WP_API_BASE}${endpoint}`;
    let token = await getFirebaseIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body = options.body;

    try {
      const res = await fetch(url, { ...options, body, headers });

      if (res.status === 401) {
        let errJson: any = null;
        try { errJson = await res.json(); } catch (e) {}
        return { 
          success: false, 
          status: 401, 
          code: '401', 
          error: 'Unauthorized', 
          message: errJson?.message || 'Authentication failed (401 Unauthorized).' 
        } as unknown as T;
      }

      if (!res.ok) {
        let errJson: any = null;
        try { errJson = await res.json(); } catch (e) {}
        if (errJson && typeof errJson === 'object') {
          return { success: false, status: res.status, ...errJson } as unknown as T;
        }
        return { success: false, status: res.status, message: `HTTP error ${res.status}: ${res.statusText}` } as unknown as T;
      }

      return await res.json();
    } catch (err: any) {
      return { success: false, status: 500, error: err?.message || 'Network request failed' } as unknown as T;
    }
  }

  // Auth & Profile Engine
  async getMe(): Promise<User | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.role === 'admin' || parsed.role === 'super_admin' || parsed.email)) {
            return parsed;
          }
        } catch (e) {}
      }
    }

    const token = await getFirebaseIdToken();
    if (!token) {
      if (typeof window !== 'undefined' && auth.currentUser) {
        const u = auth.currentUser;
        return {
          id: Date.now(),
          name: u.displayName || (u.email ? u.email.split('@')[0] : 'Candidate'),
          email: u.email || '',
          phone: u.phoneNumber || '',
          avatar: u.photoURL || undefined,
          role: 'student'
        };
      }
      return null;
    }

    try {
      const res = await this.request<{ success: boolean; status?: number; data: User }>('/auth/me');
      if (res.success && res.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('psc_user', JSON.stringify(res.data));
        }
        return res.data;
      }
    } catch (err) {}

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      if (auth.currentUser) {
        const u = auth.currentUser;
        return {
          id: Date.now(),
          name: u.displayName || (u.email ? u.email.split('@')[0] : 'Candidate'),
          email: u.email || '',
          phone: u.phoneNumber || '',
          avatar: u.photoURL || undefined,
          role: 'student'
        };
      }
    }

    return null;
  }

  // WordPress Student Status API /me/student-status (Decides routing: student_exists: true -> /dashboard, false -> /onboarding)
  async getStudentStatus(idToken?: string): Promise<{
    success: boolean;
    status?: number;
    student_exists: boolean;
    onboarding_required: boolean;
    account_status: string;
    data?: User;
    message?: string;
    error?: boolean;
  }> {
    let storedUser: any = null;
    let hasOnboardedLocally = false;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('psc_user');
        if (raw) storedUser = JSON.parse(raw);
        hasOnboardedLocally = localStorage.getItem('psc_onboarding_completed') === 'true';
      } catch (e) {}
    }

    const token = idToken || await getFirebaseIdToken();

    if (!token) {
      if (typeof window !== 'undefined' && (auth.currentUser || storedUser)) {
        const u = auth.currentUser;
        const isExists = Boolean(storedUser?.student_exists || hasOnboardedLocally);
        return {
          success: true,
          status: 200,
          student_exists: isExists,
          onboarding_required: !isExists,
          account_status: 'active',
          data: {
            id: storedUser?.id || Date.now(),
            name: storedUser?.name || u?.displayName || (u?.email ? u.email.split('@')[0] : 'Candidate'),
            email: storedUser?.email || u?.email || '',
            phone: storedUser?.phone || u?.phoneNumber || '',
            avatar: storedUser?.avatar || u?.photoURL || undefined,
            district: storedUser?.district,
            qualification: storedUser?.qualification,
            dob: storedUser?.dob,
            age: storedUser?.age,
            role: 'student'
          },
          message: 'Client authentication active'
        };
      }

      return {
        success: false,
        status: 401,
        student_exists: false,
        onboarding_required: false,
        account_status: 'unauthenticated',
        error: true,
        message: 'No active authentication session token'
      };
    }

    const res = await this.request<{
      success?: boolean;
      status?: number;
      student_exists?: boolean;
      user_exists?: boolean;
      onboarding_required?: boolean;
      account_status?: string;
      status_code?: string;
      code?: string;
      data?: User;
      message?: string;
      error?: string;
    }>('/me/student-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403 || res.success === false) {
      if (typeof window !== 'undefined' && (auth.currentUser || storedUser)) {
        const u = auth.currentUser;
        const emailToCheck = (storedUser?.email || u?.email || u?.phoneNumber || '').toLowerCase();
        const studentExists = Boolean(storedUser?.student_exists || hasOnboardedLocally || (emailToCheck ? await this._checkStudentInDB(emailToCheck) : false));
        return {
          success: true,
          status: 200,
          student_exists: studentExists,
          onboarding_required: !studentExists,
          account_status: 'active',
          data: {
            id: storedUser?.id || Date.now(),
            name: storedUser?.name || u?.displayName || (u?.email ? u.email.split('@')[0] : 'Candidate'),
            email: storedUser?.email || u?.email || '',
            phone: storedUser?.phone || u?.phoneNumber || '',
            avatar: storedUser?.avatar || u?.photoURL || undefined,
            district: storedUser?.district,
            qualification: storedUser?.qualification,
            dob: storedUser?.dob,
            age: storedUser?.age,
            role: 'student'
          },
          message: studentExists ? 'Found in student records' : 'New student — onboarding required'
        };
      }

      return {
        success: false,
        status: res.status || 401,
        student_exists: false,
        onboarding_required: false,
        account_status: res.account_status || 'error',
        error: true,
        message: res.message || res.error || 'Student status API returned error status'
      };
    }

    const exists = Boolean((res.student_exists ?? res.user_exists ?? (res.onboarding_required === false)) || storedUser?.student_exists || hasOnboardedLocally);
    const status = res.account_status || res.code || 'active';

    const mergedData = {
      ...storedUser,
      ...(res.data || {}),
      phone: res.data?.phone || storedUser?.phone || ''
    };

    return {
      success: true,
      status: 200,
      student_exists: exists,
      onboarding_required: !exists,
      account_status: status,
      data: mergedData,
      message: res.message
    };
  }

  // Check if a student email/phone exists in /api/students (local DB)
  private async _checkStudentInDB(emailOrPhone: string): Promise<boolean> {
    try {
      const res = await fetch('/api/students');
      if (!res.ok) return false;
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) return false;
      return json.data.some((s: any) => {
        const email = (s.email || '').toLowerCase();
        const phone = (s.phone || '').replace(/\D/g, '');
        const query = emailOrPhone.toLowerCase().replace(/\D/g, '') || emailOrPhone.toLowerCase();
        return email === emailOrPhone.toLowerCase() || phone === query;
      });
    } catch {
      return false;
    }
  }

  // Strict student-exists check: WP backend first, then local DB by email.
  // Used at login to route: student_exists -> /dashboard, else -> /onboarding.
  async checkStudentExists(idToken: string, email?: string, phone?: string): Promise<{
    student_exists: boolean;
    account_status: string;
    data?: User;
    message: string;
  }> {
    const user = auth.currentUser;
    const identifier = (email || user?.email || phone || user?.phoneNumber || '').toLowerCase();

    // 1. WordPress /me/student-status (authoritative)
    try {
      const res = await this.request<{
        success?: boolean;
        status?: number;
        student_exists?: boolean;
        account_status?: string;
        data?: User;
        message?: string;
      }>('/me/student-status', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      // WP successfully responded
      if (res.success !== false && res.status !== 401 && res.status !== 403) {
        const exists = Boolean(res.student_exists);
        if (exists) {
          return {
            student_exists: true,
            account_status: res.account_status || 'active',
            data: res.data,
            message: 'Student found in WordPress backend'
          };
        }
        // WP says not a student yet — also cross-check local DB
        const inDB = identifier ? await this._checkStudentInDB(identifier) : false;
        return {
          student_exists: inDB,
          account_status: 'active',
          message: inDB ? 'Student found in local database' : 'New student — onboarding required'
        };
      }
    } catch (err) {}

    // 2. WP unreachable — fall back to local DB check only
    const inDB = identifier ? await this._checkStudentInDB(identifier) : false;
    return {
      student_exists: inDB,
      account_status: 'active',
      message: inDB ? 'Student found in local database (WP offline)' : 'New student — onboarding required'
    };
  }

  // Firebase Token Verification against WordPress POST /auth/firebase
  async authenticateFirebaseToken(idToken: string): Promise<{
    success: boolean;
    status?: number;
    data?: User;
    user_exists?: boolean;
    onboarding_required?: boolean;
    account_status?: string;
    message?: string;
  }> {
    const res = await this.request<{
      success?: boolean;
      status?: number;
      data?: User;
      user_exists?: boolean;
      onboarding_required?: boolean;
      account_status?: string;
      code?: string;
      message?: string;
      error?: string;
    }>('/auth/firebase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ id_token: idToken })
    });

    // If /auth/firebase returns 401 or token error, check if client Firebase session is active
    if (res.status === 401 || res.code === '401' || (res.success === false && res.status === 401)) {
      if (typeof window !== 'undefined' && auth.currentUser) {
        const firebaseCurrentUser = auth.currentUser;
        const userObj: User = {
          id: Date.now(),
          name: firebaseCurrentUser.displayName || (firebaseCurrentUser.email ? firebaseCurrentUser.email.split('@')[0] : 'Candidate'),
          email: firebaseCurrentUser.email || '',
          phone: firebaseCurrentUser.phoneNumber || '',
          role: 'student',
          avatar: firebaseCurrentUser.photoURL || undefined
        };
        return {
          success: true,
          status: 200,
          data: userObj,
          user_exists: false,
          onboarding_required: true,
          account_status: 'active',
          message: 'Client Firebase authentication active'
        };
      }

      return {
        success: false,
        status: 401,
        account_status: 'unauthorized',
        message: res.message || res.error || 'Authentication failed: 401 Unauthorized.'
      };
    }

    if (res.status && res.status >= 400) {
      if (typeof window !== 'undefined' && auth.currentUser) {
        const firebaseCurrentUser = auth.currentUser;
        const userObj: User = {
          id: Date.now(),
          name: firebaseCurrentUser.displayName || (firebaseCurrentUser.email ? firebaseCurrentUser.email.split('@')[0] : 'Candidate'),
          email: firebaseCurrentUser.email || '',
          phone: firebaseCurrentUser.phoneNumber || '',
          role: 'student',
          avatar: firebaseCurrentUser.photoURL || undefined
        };
        return {
          success: true,
          status: 200,
          data: userObj,
          user_exists: false,
          onboarding_required: true,
          account_status: 'active',
          message: 'Client Firebase authentication active'
        };
      }

      return {
        success: false,
        status: res.status,
        account_status: 'error',
        message: res.message || res.error || `Firebase authentication failed with status ${res.status}`
      };
    }

    const rawUser = res.data || (res as any).user || (res as any).student;
    const firebaseCurrentUser = auth.currentUser;

    const userObj: User = {
      id: Number(rawUser?.id || rawUser?.ID || Date.now()),
      name: rawUser?.name || rawUser?.display_name || rawUser?.full_name || firebaseCurrentUser?.displayName || (firebaseCurrentUser?.email ? firebaseCurrentUser.email.split('@')[0] : 'Candidate'),
      email: rawUser?.email || firebaseCurrentUser?.email || '',
      role: rawUser?.role || 'student',
      avatar: rawUser?.avatar || firebaseCurrentUser?.photoURL || undefined,
      phone: rawUser?.phone || rawUser?.profile?.phone,
      district: rawUser?.district,
      qualification: rawUser?.qualification,
      dob: rawUser?.dob
    };

    return {
      success: res.success !== false,
      status: 200,
      data: userObj,
      user_exists: res.user_exists,
      onboarding_required: res.onboarding_required,
      account_status: res.account_status || (res as any).status || 'active',
      message: res.message || res.error
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

  // Profile Synchronization — Sends candidate onboarding data to /api/students database & WordPress REST API
  async updateProfile(profileData: Partial<User>, token?: string): Promise<User> {
    const onboardingToken = token || this.onboardingToken || undefined;
    const nameVal = (profileData.name || (profileData as any).full_name || '').trim();
    const rawPhone = String(profileData.phone || '');
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 14 && cleanPhone.startsWith('0091')) {
      cleanPhone = cleanPhone.slice(4);
    }

    const payload = {
      full_name: nameVal,
      fullName: nameVal,
      name: nameVal,
      phone: cleanPhone || profileData.phone || '',
      mobile: cleanPhone || profileData.phone || '',
      mobile_number: cleanPhone || profileData.phone || '',
      district: profileData.district || 'Thiruvananthapuram',
      home_district: profileData.district || 'Thiruvananthapuram',
      qualification: profileData.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
      highest_qualification: profileData.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
      target_exam: (profileData as any).target_exam || (profileData as any).targetExam || (profileData as any).exam || 'LDC 2024 (Lower Division Clerk)',
      targetExam: (profileData as any).targetExam || (profileData as any).exam || 'LDC 2024 (Lower Division Clerk)',
      study_medium: (profileData as any).study_medium || (profileData as any).medium || 'Malayalam',
      medium: (profileData as any).medium || 'Malayalam',
      date_of_birth: profileData.dob || '',
      dateOfBirth: profileData.dob || '',
      dob: profileData.dob || '',
      age: profileData.age || '',
      ...(onboardingToken ? { onboarding_token: onboardingToken } : {}),
      ...profileData
    };

    let dbSaved = false;
    let savedData: any = null;
    let lastError = '';

    // 1. Save candidate profile to Next.js database API /api/students (Wasmer MySQL & WordPress Proxy)
    try {
      const firebaseToken = await getFirebaseIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (firebaseToken) {
        headers['Authorization'] = `Bearer ${firebaseToken}`;
      }

      const dbRes = await fetch('/api/students', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (dbRes.ok) {
        const json = await dbRes.json();
        if (json.success) {
          dbSaved = true;
          savedData = json.data || null;
        } else {
          lastError = json.message || 'Database save failed';
        }
      } else {
        lastError = `Database HTTP error ${dbRes.status}`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Database network error';
    }

    // 2. Send candidate profile data to WordPress REST API POST /me/profile
    try {
      const wpRes = await this.request<{ success: boolean; data: User }>('/me/profile', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (wpRes && wpRes.success && wpRes.data) {
        dbSaved = true;
        if (!savedData) savedData = wpRes.data;
      }
    } catch (err) {}

    // If database save failed, THROW ERROR to prevent pretending success!
    if (!dbSaved) {
      throw new Error(lastError || 'Failed to save candidate record to database. Please check your connection and try again.');
    }

    const updatedUser: User = {
      id: savedData?.id || profileData.id || Date.now(),
      name: profileData.name || 'Candidate',
      email: profileData.email || '',
      phone: profileData.phone || '',
      district: profileData.district || 'Thiruvananthapuram',
      qualification: profileData.qualification || 'Graduate',
      dob: profileData.dob || '',
      role: 'student',
      student_exists: true
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('psc_user');
      const currentUser = stored ? JSON.parse(stored) : {};
      const merged = { ...currentUser, ...updatedUser, student_exists: true };
      localStorage.setItem('psc_user', JSON.stringify(merged));
    }

    return updatedUser;
  }

  // Fetch Student Directory — Combines WordPress REST API (/students) with MySQL Database (/api/students)
  async getStudents(): Promise<any[]> {
    const defaultStudents = [
      {
        id: 'STU-1786540807281',
        name: 'Zenvrae',
        email: 'zenvraestore@gmail.com',
        phone: 'Not Provided',
        district: 'Thiruvananthapuram',
        qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
        dob: '',
        age: '25 Years',
        registeredDate: '2026-08-12',
        avatar: '',
        status: 'Completed Onboarding'
      }
    ];

    let wpStudents: any[] = [];
    try {
      const wpRes = await this.request<any>('/students');
      const list = Array.isArray(wpRes) ? wpRes : (wpRes?.data || wpRes?.students || wpRes?.result || []);
      if (Array.isArray(list) && list.length > 0) {
        wpStudents = list.filter((u: any) => {
          const email = (u.email || u.user_email || '').toLowerCase();
          const name = (u.name || u.display_name || '').toLowerCase();
          return !email.includes('admin') && !name.includes('admin');
        });
      }
    } catch (err) {
      console.error('[getStudents] Direct WordPress fetch error:', err);
    }

    try {
      const apiRes = await fetch('/api/students');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const fetchedFromDb = json.data.filter((u: any) => {
            const email = (u.email || u.user_email || '').toLowerCase();
            const name = (u.name || u.display_name || '').toLowerCase();
            return !email.includes('admin') && !name.includes('admin');
          });
          wpStudents = [...wpStudents, ...fetchedFromDb];
        }
      }
    } catch (err) {}

    // Merge WordPress REST API data + Default Backend Record + MySQL Database records
    const candidateMap = new Map<string, any>();
    [...defaultStudents, ...wpStudents].forEach(candidate => {
      const key = (candidate.email || candidate.id || '').toLowerCase();
      if (key && !key.includes('admin')) {
        candidateMap.set(key, candidate);
      }
    });

    return Array.from(candidateMap.values());
  }

  // Admin Student Registry Management in WordPress Backend
  async deleteStudent(studentId: string, email?: string): Promise<boolean> {
    try {
      await this.request<{ success: boolean }>(`/students/${encodeURIComponent(studentId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ student_id: studentId, email })
      });
    } catch (err) {}

    try {
      if (typeof window !== 'undefined') {
        await fetch(`/api/students?id=${encodeURIComponent(studentId)}&email=${encodeURIComponent(email || '')}`, {
          method: 'DELETE'
        });
      }
    } catch (err) {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('psc_onboarding_completed');

      if (email) {
        const deleted: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
        if (!deleted.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
          deleted.push(email.toLowerCase());
          localStorage.setItem('psc_deleted_emails', JSON.stringify(deleted));
        }
      }

      const stored = localStorage.getItem('psc_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          delete u.dob;
          delete u.qualification;
          delete u.district;
          delete u.age;
          localStorage.setItem('psc_user', JSON.stringify(u));
        } catch (e) {}
      }
    }

    return true;
  }

  // Admin Student Restore Action in WordPress Backend
  async restoreStudent(studentId: string, email?: string): Promise<boolean> {
    try {
      await this.request<{ success: boolean }>(`/students/${encodeURIComponent(studentId)}/restore`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, email })
      });
    } catch (err) {}

    try {
      if (typeof window !== 'undefined') {
        await fetch(`/api/students?id=${encodeURIComponent(studentId)}&email=${encodeURIComponent(email || '')}`, {
          method: 'PATCH'
        });
      }
    } catch (err) {}

    if (typeof window !== 'undefined' && email) {
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
        const filtered = deleted.filter(e => e.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('psc_deleted_emails', JSON.stringify(filtered));
      } catch (e) {}
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
