'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Video, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  Bell, 
  Search, 
  LogOut, 
  Zap,
  Calendar,
  Menu,
  X
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/courses', icon: GraduationCap },
    { name: 'Mock Tests', href: '/dashboard/mock-tests', icon: FileText },
    { name: 'Current Affairs', href: '/dashboard/current-affairs', icon: Calendar },
    { name: 'Study Materials', href: '/dashboard/study-materials', icon: BookOpen },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    const cleanPath = path.split('?')[0];
    if (cleanPath === '/dashboard' && pathname === '/dashboard') return true;
    if (cleanPath !== '/dashboard' && pathname.startsWith(cleanPath)) return true;
    return false;
  };

  const noSidebarRoutes = ['/', '/login', '/register', '/onboarding'];
  const hideSidebar = noSidebarRoutes.includes(pathname) || pathname.startsWith('/admin') || !user;

  if (hideSidebar) {
    return <main className="min-h-screen w-full bg-[#0b0f19]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0e1424] border-b border-[#1e293b] sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-base tracking-tight font-sans">PaperCam PSC</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Persistent Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 h-screen bg-[#0e1424] border-r border-[#1e293b] flex flex-col justify-between transition-transform duration-300 transform md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full font-mono-code overflow-hidden">
          
          {/* Sidebar Logo */}
          <div className="p-6 border-b border-[#1e293b]/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight font-sans">PaperCam PSC</h2>
              <p className="text-[10px] text-slate-400 font-mono-code">Learning Portal</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#1e293b] text-white font-bold border border-[#334155]/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Bottom Actions */}
          <div className="p-4 space-y-3 border-t border-[#1e293b]/60">
            <Link href="/exams/1" className="block">
              <button className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Start Practice</span>
              </button>
            </Link>

            {/* Sub-links */}
            <div className="space-y-1 pt-1 text-xs">
              <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Settings</span>
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-rose-400 rounded-lg text-left cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area + Top App Header */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top App Bar Header */}
        <header className="h-16 bg-[#0b0f19] border-b border-[#1e293b] px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 font-mono-code">
          <h1 className="text-sm sm:text-base font-extrabold text-amber-400 hidden sm:block tracking-tight font-sans">
            Kerala PSC Excellence
          </h1>

          {/* Global Search Input */}
          <div className="flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search courses, tests..."
              className="w-full pl-10 pr-4 py-2 bg-[#131929] border border-[#1e293b] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Right User Controls */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#131929] relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-2 ring-[#0b0f19]" />
            </button>

            <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#131929]">
              <HelpCircle className="w-5 h-5" />
            </button>

            <Link href="/dashboard/profile" className="flex items-center gap-2 pl-2 border-l border-[#1e293b]">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name || 'Profile'}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400/40"
              />
              <span className="text-xs font-bold text-slate-200 hidden lg:inline-block truncate max-w-[100px]">
                {user?.name || 'Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Render */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>

        {/* Footer info bar */}
        <footer className="px-8 py-4 border-t border-[#1e293b] text-xs font-mono-code text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2024 PSC Elite Education Portal. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Contact Support</Link>
          </div>
        </footer>

      </div>

    </div>
  );
};
