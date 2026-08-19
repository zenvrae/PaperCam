'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { initRecaptchaVerifier, sendFirebasePhoneOtp, auth, googleProvider, signInWithPopup, getFirebaseErrorMessage, formatIndianPhoneNumber } from '@/lib/firebase';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft,
  Info
} from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.055 0-5.542-2.487-5.542-5.542 0-3.055 2.487-5.542 5.542-5.542 1.373 0 2.628.502 3.596 1.328l3.107-3.107C18.667 3.39 15.65 2.143 12.24 2.143 6.643 2.143 2.143 6.643 2.143 12.24s4.5 10.097 10.097 10.097c5.8 0 9.686-4.08 9.686-9.857 0-.669-.06-1.311-.172-1.937l-9.514-.258z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, updateUser } = useAuth();

  // Auth Mode
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  
  // Step 1: Credentials
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Step 2: OTP State
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('error') === 'account_removed') {
        setError('Your student account has been removed. Access denied.');
      }
    }
  }, []);

  // Phone Validation
  const isPhoneValid = useMemo(() => {
    if (!phone) return false;
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

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const currentCredential = authMethod === 'phone' ? phone : email;
  const isCredentialValid = authMethod === 'phone' ? isPhoneValid : isEmailValid;

  // Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Request OTP (Firebase Phone SDK for SMS or WP REST API for Email)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCredentialValid) return;

    setIsLoading(true);
    setError('');
    setConfirmationResult(null);
    setDemoCode('');

    try {
      if (authMethod === 'phone') {
        const verifier = initRecaptchaVerifier('recaptcha-container');
        if (verifier) {
          const result = await sendFirebasePhoneOtp(phone, verifier);
          if (result) {
            setConfirmationResult(result);
            setSuccessMsg('SMS OTP code sent to your phone!');
            setStep('OTP');
            setTimerSeconds(60);
            setIsLoading(false);
            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 100);
            return;
          }
        }
      } else {
        // Email path
        const res = await apiClient.requestOtp(currentCredential, authMethod);
        setDemoCode(res.demo_otp);
        setSuccessMsg(res.message);
        setStep('OTP');
        setTimerSeconds(60);
        
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err: any) {
      console.error('[Login] OTP Request Error:', err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let isPhone = !currentCredential.includes('@');
      const formattedCred = isPhone ? formatIndianPhoneNumber(currentCredential) : currentCredential;

      if (confirmationResult) {
        await confirmationResult.confirm(fullOtp);
      } else {
        await apiClient.verifyOtp(formattedCred, fullOtp);
      }

      const token = await auth.currentUser?.getIdToken(true);
      if (token) {
        const authRes = await apiClient.authenticateFirebaseToken(token);
        if (!authRes.success && !auth.currentUser) {
          setError(authRes.message || 'Authentication failed: 401 Unauthorized.');
          setIsLoading(false);
          return;
        }

        const studentStatus = await apiClient.getStudentStatus(token);
        if ((!studentStatus.success || studentStatus.error) && !auth.currentUser) {
          setError(studentStatus.message || 'Student status check failed. Access denied.');
          setIsLoading(false);
          return;
        }

        if (studentStatus.account_status === 'student_removed' || studentStatus.account_status === 'removed') {
          setError('Your student account has been removed. Access denied.');
          setIsLoading(false);
          return;
        }

        updateUser({
          id: studentStatus.data?.id || authRes.data?.id || Date.now(),
          name: studentStatus.data?.name || authRes.data?.name || 'Candidate',
          email: isPhone ? (studentStatus.data?.email || '') : formattedCred,
          phone: isPhone ? formattedCred : (studentStatus.data?.phone || ''),
          role: 'student',
          student_exists: studentStatus.student_exists
        });

        if (studentStatus.student_exists) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        await login(formattedCred, 'password123');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[Login] OTP Verification Error:', err);
      setError(getFirebaseErrorMessage(err));
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Google Popup Sign-In
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Get a fresh Firebase ID Token after Google login
      const token = await result.user.getIdToken(true);

      // 3. Send that token to /wp-json/psc/v1/auth/firebase
      const authRes = await apiClient.authenticateFirebaseToken(token);

      if (!authRes.success && !auth.currentUser) {
        setError(authRes.message || 'Authentication failed: 401 Unauthorized.');
        setIsLoading(false);
        return;
      }

      // 4. Student verification: call /wp-json/psc/v1/me/student-status
      const studentStatus = await apiClient.getStudentStatus(token);

      if ((!studentStatus.success || studentStatus.error) && !auth.currentUser) {
        setError(studentStatus.message || `Student status verification failed (${studentStatus.status || 'error'}). Access denied.`);
        setIsLoading(false);
        return;
      }

      // removed -> access denied
      if (studentStatus.account_status === 'student_removed' || studentStatus.account_status === 'removed') {
        setError(studentStatus.message || 'Your student account has been removed. Access denied.');
        setIsLoading(false);
        return;
      }

      const activeUser = {
        id: studentStatus.data?.id || authRes.data?.id || Date.now(),
        name: studentStatus.data?.name || authRes.data?.name || result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Candidate'),
        email: studentStatus.data?.email || authRes.data?.email || result.user.email || '',
        avatar: studentStatus.data?.avatar || authRes.data?.avatar || result.user.photoURL || undefined,
        role: 'student' as const,
        student_exists: studentStatus.student_exists
      };

      updateUser(activeUser);

      // Use ONLY student_exists response to decide routing:
      // student_exists: true + active -> /dashboard
      // student_exists: false -> /onboarding
      if (studentStatus.student_exists) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In was cancelled.');
      } else {
        setError(err?.message || 'Google Sign-In failed or was cancelled.');
      }
      console.error('Google sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 font-mono-code relative overflow-hidden">
      
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container" />

      {/* Glow Effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10 my-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 font-black">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Candidate Access Portal
          </h1>
          <p className="text-xs text-slate-400">
            Verify via Firebase SMS (+91) or Free Email OTP to access dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold">
            {error}
          </div>
        )}

        {/* Step 1: Credential Selection */}
        {step === 'INPUT' ? (
          <div className="space-y-5">
            <form onSubmit={handleRequestOtp} className="space-y-5 text-xs">
              
              {/* Method Tabs */}
              <div className="p-1 bg-[#0b0f19] border border-[#1e293b] rounded-xl grid grid-cols-2 gap-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setError(''); }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'phone'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone SMS (+91)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setError(''); }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Input Field */}
              {authMethod === 'phone' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Mobile Number (+91)</label>
                    <span className={`text-[10px] font-bold ${isPhoneValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPhoneValid ? '✓ Valid (+91)' : '✕ Enter 10-digit number'}
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono-code"
                      placeholder="e.g. +91 9847012345"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Email Address</label>
                    <span className={`text-[10px] font-bold ${isEmailValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isEmailValid ? '✓ Valid Email' : '✕ Enter valid email'}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono-code"
                      placeholder="vishnu@papercam.app"
                    />
                  </div>
                </div>
              )}

              {/* Provider Notice */}
              <div className="p-3 bg-[#0b0f19] border border-[#1e293b] rounded-xl flex items-start gap-2 text-[10px] text-slate-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {authMethod === 'phone' 
                    ? 'Powered by Firebase Phone Authentication (10,000 Free SMS logins/month).' 
                    : 'Powered by WordPress REST API wp_mail() (100% Free Email OTP).'
                  }
                </span>
              </div>

              <button
                type="submit"
                disabled={!isCredentialValid || isLoading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Generating OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>

            <div className="relative flex py-2 items-center text-xs">
              <div className="flex-grow border-t border-[#1e293b]"></div>
              <span className="flex-shrink mx-4 text-slate-500 font-bold">OR</span>
              <div className="flex-grow border-t border-[#1e293b]"></div>
            </div>

            {/* Google Sign-in Trigger */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 bg-[#1e293b] hover:bg-[#2e3d56] border border-[#334155]/60 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          /* Step 2: 6-Digit OTP Verification Box */
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            
            <div className="p-3 bg-[#0b0f19] border border-amber-400/20 rounded-xl space-y-1 text-center">
              <p className="text-slate-300 font-bold">OTP Dispatched To:</p>
              <p className="text-amber-400 font-bold font-mono-code text-sm">{currentCredential}</p>
              
              {/* Only display Demo Code if we are not utilizing real Firebase Confirmation Result */}
              {!confirmationResult && demoCode && (
                <div className="pt-2">
                  <span className="px-2.5 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold">
                    Demo Code: {demoCode}
                  </span>
                </div>
              )}
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block text-center">Enter 6-Digit Verification Code</label>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-12 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-center text-lg font-black text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Time Remaining: <strong className="text-white font-mono-code">00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</strong></span>
              <button
                type="button"
                disabled={timerSeconds > 0}
                onClick={handleRequestOtp}
                className="text-amber-400 hover:underline disabled:opacity-40 font-bold cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Resend OTP
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify OTP & Access Site'}</span>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
              </button>

              <button
                type="button"
                onClick={() => setStep('INPUT')}
                className="w-full py-2 bg-transparent text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Credential Step
              </button>
            </div>

          </form>
        )}

        <div className="pt-4 border-t border-[#1e293b] text-center text-xs text-slate-400">
          First time PSC candidate?{' '}
          <Link href="/register" className="font-bold text-amber-400 hover:underline">
            Register New Candidate Profile
          </Link>
        </div>

      </div>
    </div>
  );
}
