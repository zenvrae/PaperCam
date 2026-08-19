'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  CreditCard, 
  ArrowLeft, 
  PlusCircle, 
  Search, 
  Bell, 
  Settings, 
  Users,
  Menu,
  X,
  Zap,
  Sparkles,
  LogOut,
  ShieldAlert,
  Lock
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, login, logout, updateUser } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Admin Auth Form State
  const [adminCredential, setAdminCredential] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  const adminNav = [
    { name: 'Command Center', href: '/admin', icon: LayoutDashboard },
    { name: 'Course Manager', href: '/admin/courses', icon: GraduationCap },
    { name: 'Student Directory', href: '/admin/students', icon: Users },
    { name: 'Question Bank Builder', href: '/admin/questions', icon: HelpCircle },
    { name: 'Mock Exam Setup', href: '/admin/exams', icon: FileText },
    { name: 'Orders & Revenue', href: '/admin/orders', icon: CreditCard },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredential || !adminPassword) return;

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const loggedUser = await apiClient.login(adminCredential, adminPassword);
      if (loggedUser && (loggedUser.role === 'admin' || loggedUser.role === 'super_admin')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('psc_user', JSON.stringify(loggedUser));
        }
        updateUser(loggedUser);
      } else {
        setAuthError(`Access Denied: Account "${loggedUser?.email || adminCredential}" does not have WordPress Administrator privileges.`);
      }
    } catch (err) {
      setAuthError('Invalid administrator credentials. Please check your WordPress username & password.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Guard Screen for Non-Admin Users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080b13] text-slate-100 flex items-center justify-center p-4 font-mono-code relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0d121f] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 font-black">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Admin Access Portal
            </h1>
            <p className="text-xs text-slate-400">
              Restricted Area. Login with your WordPress Administrator credentials.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {user && user.role === 'student' && !authError && (
            <div className="p-3 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs rounded-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Logged in as Student ({user.email}). Admin privileges required.</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold">WordPress Admin Email / Username</label>
              <input
                type="text"
                required
                value={adminCredential}
                onChange={(e) => setAdminCredential(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080b13] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                placeholder="admin@papercam.app"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Admin Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080b13] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{isAuthenticating ? 'Authenticating Admin...' : 'Access Admin Control Panel'}</span>
            </button>
          </form>



        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b13] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d121f] border-b border-[#1e293b] sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="font-bold text-white text-base tracking-tight font-sans">Admin Portal</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Persistent Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 h-screen bg-[#0d121f] border-r border-[#1e293b] flex flex-col justify-between transition-transform duration-300 transform md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full font-mono-code overflow-hidden">
          
          {/* Logo Header */}
          <div className="p-6 border-b border-[#1e293b]/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-sm text-white tracking-tight font-sans">PaperCam Admin</h2>
                <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-400 text-[9px] font-mono-code font-bold rounded">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono-code">CMS &amp; Exam Management</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              Content Management
            </div>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#1e293b] text-amber-400 border border-amber-400/30 shadow-md shadow-amber-400/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Bottom CTA */}
          <div className="p-4 border-t border-[#1e293b]/60">
            <button
              onClick={logout}
              className="w-full py-2.5 bg-[#131929] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-bold rounded-xl border border-[#1e293b] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout Admin Session</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-[#080b13] border-b border-[#1e293b] px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 font-mono-code">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20">
              Admin Portal
            </span>
            <h1 className="text-xs sm:text-sm text-slate-400 hidden sm:block">
              System Control &amp; Content Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/courses?action=new">
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer">
                <PlusCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
                <span>+ Create Course</span>
              </button>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-[#1e293b]">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Admin"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400/40"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-200">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'admin@papercam.app'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>

        <footer className="px-8 py-4 border-t border-[#1e293b] text-xs font-mono-code text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2024 PaperCam PSC Enterprise Admin Engine.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>System Status: <strong className="text-emerald-400">ONLINE</strong></span>
            <span>WP API Sync: <strong className="text-amber-400">CONNECTED</strong></span>
          </div>
        </footer>

      </div>

    </div>
  );
};
