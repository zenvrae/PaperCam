'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Landmark, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* 1. Header Navigation */}
      <header className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1e293b] sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight font-sans">
              PaperCam PSC
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono-code font-bold text-slate-300">
            <Link href="/courses" className="hover:text-amber-400 transition-colors">Courses</Link>
            <a href="#about" className="hover:text-amber-400 transition-colors">About Us</a>
            <Link href="/courses" className="hover:text-amber-400 transition-colors">Mock Tests</Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3 font-mono-code">
            <Link href="/login">
              <button className="px-4 py-2 border border-amber-400/80 text-amber-400 hover:bg-amber-400/10 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                Login
              </button>
            </Link>

            <Link href="/register">
              <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer">
                Register
              </button>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-8">
        
        {/* Background Library Backdrop with Subtle Gradients */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/80 via-[#0b0f19]/95 to-[#0b0f19] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight font-sans">
            Master Your <span className="text-amber-400">Kerala PSC</span> Journey with <br className="hidden sm:inline" />
            <span className="text-slate-100">PaperCam PSC</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            Expert-led coaching designed for high-achievers. Prepare systematically for KAS, LDC, and premier state exams with our data-driven learning platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono-code">
            <Link href="/register">
              <button className="px-7 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/10 transition-all cursor-pointer">
                Get Started
              </button>
            </Link>

            <Link href="/courses">
              <button className="px-7 py-3.5 border border-amber-400/80 hover:bg-amber-400/10 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                View Courses
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* 3. Key Stats Bar */}
      <section className="bg-[#080b13] border-y border-[#1e293b] py-10 px-4 sm:px-8 font-mono-code">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">50k+</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider uppercase">ACTIVE STUDENTS</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">200+</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider uppercase">MOCK TESTS</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">95%</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider uppercase">SUCCESS RATE</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">50+</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider uppercase">EXPERT FACULTY</p>
          </div>

        </div>
      </section>

      {/* 4. Target Exams Section */}
      <section className="bg-slate-50 text-slate-900 py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight">
              Target Exams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* KAS Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#0b0f19] text-amber-400 flex items-center justify-center font-bold">
                <Landmark className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Kerala Administrative Service (KAS)
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Comprehensive modules covering all papers with specialized administrative focus and current affairs analysis.
              </p>

              <Link 
                href="/courses" 
                className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold text-amber-500 hover:text-amber-600 transition-colors pt-2"
              >
                <span>Explore Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* LDC Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#0b0f19] text-amber-400 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Lower Division Clerk (LDC)
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Master the basics with intensive practice sessions and previous year question analysis.
              </p>

              <Link 
                href="/courses" 
                className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold text-amber-500 hover:text-amber-600 transition-colors pt-2"
              >
                <span>Explore Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Degree Level Prelims Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-[#0b0f19] text-amber-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Degree Level Prelims &amp; Mains
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Structured syllabus coverage for Secretariat Assistant, Sub Inspector, and Auditor examinations.
              </p>

              <Link 
                href="/courses" 
                className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold text-amber-500 hover:text-amber-600 transition-colors pt-2"
              >
                <span>Explore Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CTA Banner */}
      <section id="about" className="bg-[#0b101d] py-20 px-4 sm:px-8 border-t border-[#1e293b] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Ready to Achieve Your Dream?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of successful candidates who trusted PaperCam PSC for their PSC preparation.
          </p>

          <div className="pt-2 font-mono-code">
            <Link href="/register">
              <button className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer">
                Register Now
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#070a12] border-t border-[#1e293b] py-12 px-4 sm:px-8 font-mono-code text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white font-sans">PaperCam PSC</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              © 2024 PaperCam PSC Kerala Preparation. All rights reserved.
            </p>
          </div>

          {/* Col 1 */}
          <div className="space-y-2">
            <a href="#" className="block hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="block hover:text-amber-400 transition-colors">Terms of Service</a>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <a href="#" className="block hover:text-amber-400 transition-colors">Contact Us</a>
            <a href="#" className="block hover:text-amber-400 transition-colors">Syllabus</a>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <a href="#" className="block hover:text-amber-400 transition-colors">Expert Faculty</a>
            <a href="#" className="block hover:text-amber-400 transition-colors">Success Stories</a>
          </div>

        </div>
      </footer>

    </div>
  );
}
