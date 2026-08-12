'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Course, Order } from '@/types';
import { 
  GraduationCap, 
  Users, 
  DollarSign, 
  FileText, 
  PlusCircle, 
  ArrowUpRight, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  Activity,
  CheckCircle2,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [c, o, st, q] = await Promise.all([
          apiClient.getCourses().catch(() => []),
          apiClient.getOrders().catch(() => []),
          apiClient.getStudents().catch(() => []),
          apiClient.getQuestions().catch(() => [])
        ]);
        setCourses(c);
        setOrders(o);
        setStudents(st);
        setQuestions(q);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStudents = students.filter((s: any) => s.registeredDate === todayStr || s.user_registered?.startsWith(todayStr)).length;
  const questionsWithFacts = questions.filter((q: any) => Array.isArray(q.related_facts) && q.related_facts.length > 0).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Control Center</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage course catalog, question banks, mock exams, and financial transactions.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/courses">
            <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer">
              <PlusCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
              <span>+ Create Course</span>
            </button>
          </Link>
          <Link href="/admin/questions">
            <button className="px-4 py-2 bg-[#131929] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>+ Add Question</span>
            </button>
          </Link>
          <Link href="/admin/exams">
            <button className="px-4 py-2 bg-[#131929] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>+ Build Exam</span>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">TOTAL REVENUE</span>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Razorpay Live Payments</p>
        </div>

        {/* Active Students */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">ACTIVE STUDENTS</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">{students.length}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +{todayStudents} today
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Enrolled Candidates</p>
        </div>

        {/* Published Courses */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">PUBLISHED COURSES</span>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">{courses.length}</span>
            <span className="text-xs text-amber-400 font-bold">Live on WP</span>
          </div>
          <p className="text-[10px] text-slate-400">WordPress REST API Sync</p>
        </div>

        {/* Total Questions */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">QUESTION BANK</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">{questions.length}</span>
            <span className="text-xs text-emerald-400 font-bold">{questionsWithFacts} With Facts</span>
          </div>
          <p className="text-[10px] text-slate-400">MCQ Database</p>
        </div>

      </div>

      {/* Main Grid: Live Course Roster + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Courses Table (7 Cols) */}
        <div className="lg:col-span-7 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <div>
              <h3 className="font-extrabold text-base text-white font-sans">Live WordPress Courses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Connected to https://papercam.wasmer.app/wp-json/psc/v1/</p>
            </div>
            <Link href="/admin/courses" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold">
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1e293b]/60">
            {courses.map(c => (
              <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={c.thumbnail} alt={c.title} className="w-10 h-10 rounded-xl object-cover border border-[#1e293b] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{c.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.curriculum ? c.curriculum.reduce((acc, m) => acc + m.lessons.length, 0) : 0} Lessons • ₹{c.sale_price || c.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    PUBLISHED
                  </span>
                  <Link href={`/admin/courses?edit=${c.id}`}>
                    <button className="px-3 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-lg text-xs font-bold transition-colors">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Razorpay Orders (5 Cols) */}
        <div className="lg:col-span-5 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <h3 className="font-extrabold text-base text-white font-sans">Recent Razorpay Orders</h3>
            <Link href="/admin/orders" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold">
              <span>View Roster</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1e293b]/60">
            {orders.map(ord => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{ord.id}</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{ord.course_title}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-amber-400 font-sans">₹{ord.amount}</p>
                  <span className="text-[10px] text-emerald-400 font-bold">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
