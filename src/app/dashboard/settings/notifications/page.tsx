'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Mail, Phone, ArrowLeft, CheckCircle2, Save, Volume2 } from 'lucide-react';

export default function NotificationSettingsPage() {
  const [examAlerts, setExamAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [mockAlerts, setMockAlerts] = useState(true);
  const [liveClassReminders, setLiveClassReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [examSoundEffects, setExamSoundEffects] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-6">
        <div>
          <Link href="/dashboard/profile" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-bold mb-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Notification Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control your exam date alerts, daily current affairs digests, and simulator audio preferences.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved
          </span>
        )}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-xs">
        
        <div className="space-y-4 divide-y divide-[#1e293b]/60">
          
          {/* Toggle 1 */}
          <div className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <p className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" /> Exam Date &amp; Hall Ticket Alerts
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Receive immediate SMS and email alerts when Kerala PSC publishes hall tickets.</p>
            </div>
            <input
              type="checkbox"
              checked={examAlerts}
              onChange={(e) => setExamAlerts(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400" /> Daily Current Affairs Email Digest
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Get a morning email summary of key Kerala &amp; National PSC news points.</p>
            </div>
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" /> New Mock Test Notifications
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Alert me when new weekly full-length mock exams are released.</p>
            </div>
            <input
              type="checkbox"
              checked={mockAlerts}
              onChange={(e) => setMockAlerts(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 4 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" /> Live Class Reminders
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Receive a push reminder 15 minutes before scheduled instructor live streams.</p>
            </div>
            <input
              type="checkbox"
              checked={liveClassReminders}
              onChange={(e) => setLiveClassReminders(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 5 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="font-bold text-white text-sm font-sans flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" /> Simulator Sound Effects &amp; Timer Chime
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Enable countdown timer audio warning during the final 5 minutes of mock tests.</p>
            </div>
            <input
              type="checkbox"
              checked={examSoundEffects}
              onChange={(e) => setExamSoundEffects(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-[#1e293b] flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Notification Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
}
