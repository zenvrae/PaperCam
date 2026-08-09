'use client';

import React from 'react';
import { Users, BookOpen, TrendingUp, Calendar, Download, MoreHorizontal, UserPlus, CreditCard } from 'lucide-react';

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono-code">
            Monitor institutional performance and daily engagement metrics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 font-mono-code text-xs">
          <button className="px-3.5 py-2 bg-[#131929] border border-[#1e293b] rounded-xl text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>This Week</span>
            <span className="text-slate-400">▼</span>
          </button>

          <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer">
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono-code">12,450</p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-400 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 font-bold">↗ +14.2%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
              Active Batches
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono-code">42</p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-400 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 font-bold">↗ +3</span>
              <span className="text-slate-400">new this week</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase font-bold text-slate-400 tracking-wider">
              Avg. Mock Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-rose-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono-code">68.5%</p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-rose-400 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 font-bold">↘ -2.1%</span>
              <span className="text-slate-400">Needs attention</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Trend Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Trend Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
            <h3 className="font-extrabold text-base text-white">Batch Performance Trend</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Chart Graphic Mock */}
          <div className="h-64 flex flex-col justify-between py-2 text-slate-500 font-mono-code text-xs relative">
            
            {/* Grid Horizontal Lines */}
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1">
              <span>100%</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1">
              <span>75%</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1">
              <span>50%</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1">
              <span>25%</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-1">
              <span>0%</span>
            </div>

            {/* Glowing Accent Bar */}
            <div className="absolute bottom-6 right-8 w-16 h-3 bg-amber-400 rounded-sm shadow-md shadow-amber-400/30 animate-pulse" />

          </div>

          {/* X Axis Months */}
          <div className="flex justify-between px-6 text-xs font-mono-code text-slate-400 border-t border-[#1e293b] pt-3">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span className="text-amber-400 font-bold">Jun</span>
          </div>
        </div>

        {/* Recent Activity Feed (4 Cols) */}
        <div className="lg:col-span-4 bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-[#1e293b] pb-4">
              Recent Enrollments
            </h3>

            <div className="space-y-4 text-xs font-mono-code">
              
              {/* Event 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e293b] text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-200">
                    <strong className="text-white">Rahul K.</strong> enrolled in <span className="text-amber-400">LDC Mains Crash Course</span>
                  </p>
                  <p className="text-[10px] text-slate-400">2 mins ago</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3 border-t border-[#1e293b]/60 pt-3">
                <div className="w-8 h-8 rounded-lg bg-[#1e293b] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-200">
                    <strong className="text-white">Sneha M.</strong> completed payment for <span className="text-amber-400">Secretariat Assistant Pro</span>
                  </p>
                  <p className="text-[10px] text-slate-400">15 mins ago</p>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4">
            <button className="w-full py-2 bg-transparent hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] font-mono-code text-xs rounded-xl transition-colors cursor-pointer">
              View All Activity
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
