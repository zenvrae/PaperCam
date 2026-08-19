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
        if (!u) {
          setUser(null);
          return;
        }

        // Administrator accounts stay logged in immediately across refreshes
        if (u.role === 'admin' || u.role === 'super_admin') {
          setUser(u);
          return;
        }

        const statusRes = await apiClient.getStudentStatus();
        if (statusRes.error || statusRes.status === 401 || statusRes.status === 403) {
          setUser(null);
          return;
        }

        if (statusRes.account_status === 'removed' || statusRes.account_status === 'student_removed') {
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login?error=account_removed');
          }
          return;
        }

        const mergedUser: User = {
          ...u,
          ...(statusRes.data || {}),
          student_exists: statusRes.student_exists
        };
        setUser(mergedUser);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // Authentication & WordPress Student Status Route Guard
  useEffect(() => {
    if (isLoading || typeof window === 'undefined') return;

    const publicRoutes = ['/', '/login', '/register', '/courses'];
    const isAdminRoute = pathname.startsWith('/admin');

    // 1. Unauthenticated Visitor Guard
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

    if (isAdminRoute) return;

    // 3. Student Verification Guard (Decided strictly by WordPress student_exists response)
    const isExistingStudent = Boolean((user as any).student_exists === true);

    if (isExistingStudent) {
      // student_exists: true -> route to /dashboard if trying to access /onboarding
      if (pathname === '/onboarding') {
        router.push('/dashboard');
      }
    } else {
      // student_exists: false -> route to /onboarding for protected pages
      if (!publicRoutes.includes(pathname) && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, pathname, router]);

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => {
      const base = prev || { id: Date.now(), name: '', email: '', role: 'student' as Role };
      const updated = { ...base, ...updatedData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('psc_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await apiClient.login(email, pass);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await apiClient.register(name, email, pass);
      setUser(u);
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
