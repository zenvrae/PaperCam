'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const dobInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Thiruvananthapuram');
  const [qualification, setQualification] = useState(user?.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)');
  const [dob, setDob] = useState(user?.dob || '');
  const [targetExam, setTargetExam] = useState('LDC 2024 (Lower Division Clerk)');
  const [medium, setMedium] = useState('Malayalam');
  const [formError, setFormError] = useState('');

  // Populate fields once user profile is resolved from AuthContext
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.district) setDistrict(user.district);
      if (user.qualification) setQualification(user.qualification);
      if (user.dob) setDob(user.dob);
    }
  }, [user]);

  // Real-Time Age Calculator (Years, Months, Days)
  const ageDetail = useMemo(() => {
    if (!dob) return { years: 0, months: 0, days: 0, text: '0 Years, 0 Months, 0 Days' };
    
    const today = new Date();
    const birthDate = new Date(dob);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
      days: Math.max(0, days),
      text: `${Math.max(0, years)} Years, ${Math.max(0, months)} Months, ${Math.max(0, days)} Days`
    };
  }, [dob]);

  // Bulletproof Indian Mobile Validation (Supports +91, 91, 0, spaces & dashes; optional if empty)
  const isPhoneValid = useMemo(() => {
    if (!phone || !phone.trim()) return true;
    let digits = phone.replace(/\D/g, '');

    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    } else if (digits.length === 13 && digits.startsWith('0091')) {
      digits = digits.slice(4);
    } else if (phone.trim().startsWith('+91') || phone.trim().startsWith('91 ')) {
      if (digits.startsWith('91')) digits = digits.slice(2);
    }

    return /^[6-9]\d{9}$/.test(digits);
  }, [phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || name.trim().length < 2) {
      setFormError('Please enter your Full Name (at least 2 characters).');
      return;
    }

    if (!dob) {
      setFormError('Please select your Date of Birth using the calendar picker.');
      return;
    }

    if (ageDetail.years < 18) {
      setFormError('Candidate must be at least 18 years old to apply for Kerala PSC.');
      return;
    }

    if (!isPhoneValid) {
      setFormError('Please enter a valid 10-digit mobile number (+91) or leave it empty.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('psc_onboarding_completed', 'true');
      const targetEmail = (email || user?.email || '').toLowerCase();
      if (targetEmail) {
        try {
          const deletedEmails: string[] = JSON.parse(localStorage.getItem('psc_deleted_emails') || '[]');
          const filtered = deletedEmails.filter(e => e.toLowerCase() !== targetEmail);
          localStorage.setItem('psc_deleted_emails', JSON.stringify(filtered));
        } catch (err) {}
      }
    }

    updateUser({
      name: name.trim(),
      email: email || user?.email || '',
      phone,
      district: district || 'Thiruvananthapuram',
      qualification: qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
      dob,
      age: ageDetail.years
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 font-mono-code relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative z-10 my-8">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#1e293b] pb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 font-black">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Candidate Verification &amp; Profile Setup
          </h1>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Please fill out your official candidate details and target Kerala PSC exam preferences to unlock your portal access.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {formError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-amber-400 font-sans flex items-center gap-1.5 border-b border-[#1e293b] pb-2">
              <UserIcon className="w-4 h-4" /> 1. Personal Candidate Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Full Name (as in PSC OTR)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VISHNU S"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Real-time Phone Validation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number (+91)
                  </label>
                  <span className={`text-[10px] font-bold ${!phone ? 'text-slate-400' : isPhoneValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {phone ? (isPhoneValid ? '✓ Valid Mobile (+91)' : '✕ Enter 10-digit mobile') : '(Optional)'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Optional (e.g. +91 9847012345)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-[#0b0f19] border rounded-xl text-white focus:outline-none ${
                    isPhoneValid ? 'border-[#1e293b] focus:border-emerald-400' : 'border-rose-500/50 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Home District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  {[
                    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
                    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
                    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
                  ].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Qualification & Real-Time Age Calculator */}
          <div className="space-y-4 pt-2">
            <h3 className="font-extrabold text-sm text-amber-400 font-sans flex items-center gap-1.5 border-b border-[#1e293b] pb-2">
              <GraduationCap className="w-4 h-4" /> 2. Qualification &amp; Real-Time Age
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Highest Educational Qualification */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Highest Educational Qualification</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                  <option value="Post Graduate (M.A / M.Sc / M.Tech / MCA)">Post Graduate (M.A / M.Sc / M.Tech / MCA)</option>
                  <option value="12th / Plus Two Pass">12th / Plus Two Pass</option>
                  <option value="10th / SSLC Pass">10th / SSLC Pass</option>
                  <option value="Diploma / ITI">Diploma / ITI</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
                </label>
                <div className="relative">
                  <input
                    ref={dobInputRef}
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onClick={(e) => (e.target as any).showPicker?.()}
                    style={{ colorScheme: 'dark' }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono-code cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => dobInputRef.current?.showPicker?.()}
                    className="absolute right-3 top-2.5 text-amber-400 hover:text-amber-300 p-0.5 cursor-pointer"
                    title="Open Calendar Picker"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Real-Time Age Output Card */}
            <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">CALCULATED AGE (YEARS, MONTHS, DAYS)</span>
                <p className="text-lg sm:text-xl font-black text-amber-400 font-sans mt-0.5">
                  {ageDetail.text}
                </p>
              </div>

              <div>
                {ageDetail.years >= 18 && ageDetail.years <= 36 ? (
                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ✓ PSC General Eligible (18 - 36 Yrs)
                  </span>
                ) : ageDetail.years > 36 ? (
                  <span className="px-3 py-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> ⚠️ Age Relaxation Required (36+ Yrs)
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> ✕ Underage for PSC (&lt; 18 Yrs)
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Exam Preferences */}
          <div className="space-y-4 pt-2">
            <h3 className="font-extrabold text-sm text-amber-400 font-sans flex items-center gap-1.5 border-b border-[#1e293b] pb-2">
              <Target className="w-4 h-4" /> 3. Target Exam Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Primary Target Examination</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="LDC 2024 (Lower Division Clerk)">LDC 2024 (Lower Division Clerk)</option>
                  <option value="KAS Prelims (Kerala Administrative Service)">KAS Prelims (Kerala Administrative Service)</option>
                  <option value="Degree Level Prelims & Mains">Degree Level Prelims &amp; Mains</option>
                  <option value="LP/UP School Teacher Assistant">LP/UP School Teacher Assistant</option>
                  <option value="Civil Police Officer (CPO) / Fireman">Civil Police Officer (CPO) / Fireman</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Preferred Study Medium</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="English">English</option>
                  <option value="Bilingual">Bilingual (English + Malayalam)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e293b]">
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Complete Verification &amp; Access Site</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
