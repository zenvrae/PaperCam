import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                PaperCam <span className="text-emerald-400">PSC</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Kerala's #1 Dedicated Public Service Commission Exam Preparation & Learning Platform. Powered by Next.js student UI and WordPress custom LMS engine.
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-xs pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified PSC Question Bank</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">PSC Courses</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Kerala LDC Masterclass</Link></li>
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Degree Level Prelims</Link></li>
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">LP/UP School Assistant</Link></li>
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Secretariat Assistant</Link></li>
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Sub Inspector (SI)</Link></li>
            </ul>
          </div>

          {/* Practice & Mock Tests */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Exam Engine</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard/mock-tests" className="hover:text-emerald-400 transition-colors">PSC Mock Tests Hub</Link></li>
              <li><Link href="/dashboard/wrong-questions" className="hover:text-emerald-400 transition-colors">Wrong Questions Revision</Link></li>
              <li><Link href="/dashboard/bookmarks" className="hover:text-emerald-400 transition-colors">Saved PSC Facts</Link></li>
              <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Free Video Previews</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Statue, Thiruvananthapuram, Kerala</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@papercam.wasmer.app</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} PSC Learning Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed for Kerala Aspirants with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
