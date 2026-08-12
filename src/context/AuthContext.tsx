'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  enrolledCourseIds: number[];
  isCourseEnrolled: (courseId: number) => boolean;
  enrollInCourse: (courseId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([1]);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await apiClient.getMe();
        
        // Merge with local stored user details if available
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('psc_user');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUser({ ...u, ...parsed });
              return;
            } catch (e) {}
          }
        }
        setUser(u);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();

    if (typeof window !== 'undefined') {
      const storedEnrolled = localStorage.getItem('psc_enrolled');
      if (storedEnrolled) {
        try {
          setEnrolledCourseIds(JSON.parse(storedEnrolled));
        } catch (e) {}
      } else {
        localStorage.setItem('psc_enrolled', JSON.stringify([1]));
      }
    }
  }, []);

  // Airtight Authentication & First-Time Onboarding Guard
  useEffect(() => {
    if (isLoading || typeof window === 'undefined') return;

    const publicRoutes = ['/', '/login', '/register', '/courses'];
    const isAdminRoute = pathname.startsWith('/admin');

    // 1. Unauthenticated Visitor Guard: Always require login for protected routes
    if (!user) {
      if (!publicRoutes.includes(pathname) && !isAdminRoute) {
        router.push('/login');
      }
      return;
    }

    // 2. Administrator Role Guard
    const isAdminUser = user.role === 'admin' || user.role === 'super_admin';
    if (isAdminUser) {
      if (!isAdminRoute && !publicRoutes.includes(pathname)) {
        router.push('/admin');
      }
      return;
    }

    // Allow Admin routes bypass for non-admin view
    if (isAdminRoute) return;

    // 3. Student Deletion & Onboarding Guard
    const deletedEmails: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
    const isUserDeleted = Boolean(user.email && deletedEmails.map(e => e.toLowerCase()).includes(user.email.toLowerCase()));

    if (isUserDeleted) {
      localStorage.removeItem('psc_onboarding_completed');
      if (user.dob || user.qualification || user.district) {
        const resetUser = { ...user, dob: undefined, qualification: undefined, district: undefined, age: undefined };
        setUser(resetUser);
        localStorage.setItem('psc_user', JSON.stringify(resetUser));
      }
      if (pathname !== '/onboarding' && !publicRoutes.includes(pathname)) {
        router.push('/onboarding');
      }
      return;
    }

    // 4. Onboarding Guard (If student record/data exists, onboarding form is not needed)
    const hasOnboardedData = Boolean(
      (user.dob && user.qualification && user.district && user.district !== 'Not Provided') ||
      (user as any).onboarding_completed === true ||
      (user as any).student_exists === true ||
      (typeof window !== 'undefined' && localStorage.getItem('psc_onboarding_completed') === 'true')
    );
    const isCompleted = !isUserDeleted && hasOnboardedData;

    if (isCompleted) {
      if (pathname === '/onboarding') {
        router.push('/dashboard');
      }
    } else {
      if (!publicRoutes.includes(pathname) && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }

    // 5. Periodic/Navigation Account Status Verification (Checks for student removal)
    if (!publicRoutes.includes(pathname) && pathname !== '/onboarding') {
      apiClient.getStudentStatus()
        .then(status => {
          if (status.account_status === 'student_removed' || status.account_status === 'removed') {
            setUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('psc_user');
              localStorage.removeItem('psc_onboarding_completed');
            }
            router.push('/login?error=account_removed');
          }
        })
        .catch(() => {});
    }
  }, [user, isLoading, pathname, router]);

  const updateUser = (updatedData: Partial<User>) => {
    if (typeof window !== 'undefined') {
      const emailToClear = (updatedData.email || user?.email || '').toLowerCase();
      if (emailToClear) {
        try {
          const deletedEmails: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
          const filtered = deletedEmails.filter(e => e.toLowerCase() !== emailToClear);
          localStorage.setItem('psc_deleted_emails', JSON.stringify(filtered));
        } catch (e) {}
      }
    }

    setUser(prev => {
      const base = prev || { id: Date.now(), name: '', email: '', role: 'student' as Role };
      const nextUser = { ...base, ...updatedData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('psc_user', JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await apiClient.login(email, pass);
      setUser(u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('psc_user', JSON.stringify(u));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await apiClient.register(name, email, pass);
      setUser(u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('psc_user', JSON.stringify(u));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('psc_user');
      localStorage.removeItem('psc_onboarding_completed');
    }
    setUser(null);
    router.push('/login');
  };

  const isCourseEnrolled = (courseId: number) => {
    return enrolledCourseIds.includes(courseId);
  };

  const enrollInCourse = (courseId: number) => {
    setEnrolledCourseIds(prev => {
      if (prev.includes(courseId)) return prev;
      const updated = [...prev, courseId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('psc_enrolled', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      enrolledCourseIds,
      isCourseEnrolled,
      enrollInCourse
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
