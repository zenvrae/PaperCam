import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSy_demo_key_for_testing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'papercam-psc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'papercam-psc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'papercam-psc.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1029384756:web:abcd1234efgh5678'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };

// Initialize Firebase Phone Auth Recaptcha Verifier
export function initRecaptchaVerifier(elementId: string): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const windowWithRecaptcha = window as any;
    
    // Properly clear any existing verifier instance to prevent duplication errors
    if (windowWithRecaptcha.recaptchaVerifier) {
      try {
        windowWithRecaptcha.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('[Firebase] Error clearing existing RecaptchaVerifier:', e);
      }
      windowWithRecaptcha.recaptchaVerifier = null;
    }

    const container = document.getElementById(elementId);
    if (!container) {
      console.error(`[Firebase] Element #${elementId} not found in DOM for reCAPTCHA.`);
      return null;
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Expired
      }
    });

    windowWithRecaptcha.recaptchaVerifier = recaptchaVerifier;
    return recaptchaVerifier;
  } catch (err) {
    console.error('[Firebase] Recaptcha initialization failure:', err);
    throw err;
  }
}

// Cleanly format Indian phone numbers to E.164 (+91XXXXXXXXXX)
export function formatIndianPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length === 13 && digits.startsWith('0091')) {
    digits = digits.slice(4);
  }
  
  return `+91${digits}`;
}

// Send SMS via Firebase Phone Auth
export async function sendFirebasePhoneOtp(
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const formatted = formatIndianPhoneNumber(phoneNumber);
  
  // Directly trigger Firebase Phone Authentication
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
    return confirmationResult;
  } catch (err) {
    console.error('[Firebase] signInWithPhoneNumber failed:', err);
    throw err;
  }
}

// Map Firebase authentication error codes to user-friendly messages
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || error.message || '';
  
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The phone number entered is invalid. Please make sure to enter a valid 10-digit number.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please try reloading the page and try again.';
    case 'auth/too-many-requests':
      return 'Too many SMS requests have been sent to this number. Please wait a few minutes before trying again.';
    case 'auth/quota-exceeded':
      return 'SMS quota for this project has been exceeded. Please try logging in with Email instead.';
    case 'auth/invalid-verification-code':
      return 'The 6-digit OTP code you entered is incorrect. Please check and try again.';
    case 'auth/code-expired':
      return 'This verification code has expired. Please click "Resend" to get a new one.';
    case 'auth/operation-not-allowed':
      return 'Phone authentication is disabled in the project console. Please contact the administrator.';
    case 'auth/billing-not-enabled':
      return 'SMS dispatch failed because Firebase Billing (Blaze Plan) is not enabled on this project. Please upgrade your Firebase project to the Blaze Plan or use the Email OTP method instead.';
    default:
      // Include the exact code and message to not hide any developer configuration issues
      return `Auth Error [${code}]: ${error.message || 'Verification failed.'}`;
  }
}

// Retrieve current Firebase ID Token for authenticated REST API requests
export async function getFirebaseIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (!auth.currentUser) {
    // Wait briefly for auth state initialization if needed
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
      setTimeout(resolve, 500);
    });
  }

  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (err) {
      console.error('[Firebase] Failed to retrieve ID token:', err);
    }
  }
  return null;
}

