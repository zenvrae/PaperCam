'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { User as UserIcon, Mail, Phone, MapPin, ArrowLeft, CheckCircle2, Save, Camera, GraduationCap, Calendar, AlertCircle } from 'lucide-react';

export default function PersonalInfoPage() {
  const { user, updateUser } = useAuth();
  const dobInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState('Male');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUser({ avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  // Bulletproof Indian Mobile Validation (Supports +91, 91, 0, spaces & dashes; required)
  const isPhoneValid = useMemo(() => {
    if (!phone || !phone.trim()) return false;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone || !phone.trim() || !isPhoneValid) return;

    setIsSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        district,
        qualification,
        dob,
        age: ageDetail.years
      };

      // 1. Save profile changes through /me/profile
      await apiClient.updateProfile(payload);

      // 2. Refresh profile directly from WordPress after saving
      const freshUser = await apiClient.getMe();
      const statusRes = await apiClient.getStudentStatus();

      updateUser({
        ...(freshUser || payload),
        ...(statusRes.data || {}),
        student_exists: statusRes.student_exists ?? true
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('[PersonalInfo] Profile update error:', err);
      setErrorMsg(err?.message || 'Failed to save profile changes to WordPress.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono-code">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-6">
        <div>
          <Link href="/dashboard/profile" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-bold mb-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Personal Information
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your candidate name, email address, phone number, qualification, and district.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Saved Successfully
          </span>
        )}
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Avatar Header */}
        <div className="flex items-center gap-5 border-b border-[#1e293b] pb-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-400/40"
            />
            <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-file-input" className="absolute -bottom-1 -right-1 p-1.5 bg-amber-400 text-slate-950 rounded-lg shadow-md hover:bg-amber-500 transition-colors cursor-pointer flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </label>
          </div>

          <div>
            <h3 className="font-bold text-white text-base font-sans">{name}</h3>
            <p className="text-xs text-slate-400">Registration ID: KPE-2024-8921</p>
            <p className="text-[11px] text-amber-400 font-bold mt-1">Verified Candidate Profile</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number (+91)
              </label>
              <span className={`text-[10px] font-bold ${isPhoneValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPhoneValid ? '✓ Valid (+91)' : '✕ Enter 10 digits'}
              </span>
            </div>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-[#0b0f19] border rounded-xl text-white focus:outline-none ${
                isPhoneValid ? 'border-[#1e293b] focus:border-emerald-400' : 'border-rose-500/50'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
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

          {/* Qualification */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Educational Qualification
            </label>
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
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
            </label>
            <div className="relative">
              <input
                ref={dobInputRef}
                type="date"
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

        {/* Real-Time Calculated Age Display (Years, Months, Days) */}
        <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">REAL-TIME AGE (YEARS, MONTHS, DAYS)</span>
            <p className="text-lg font-black text-amber-400 font-sans mt-0.5">
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

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-4 border-t border-[#1e293b] flex justify-end">
          <button
            type="submit"
            disabled={!isPhoneValid || isSaving}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving to WordPress...' : 'Save Personal Info'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
