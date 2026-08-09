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
    if (windowWithRecaptcha.recaptchaVerifier) {
      windowWithRecaptcha.recaptchaVerifier.clear();
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
    console.warn('[Firebase] Recaptcha initialization fallback:', err);
    return null;
  }
}

// Send SMS via Firebase Phone Auth (10,000 Free SMS/mo)
export async function sendFirebasePhoneOtp(
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult | null> {
  try {
    const cleaned = phoneNumber.replace(/[\s\-]/g, '');
    const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0/, '')}`;
    
    const confirmationResult = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
    return confirmationResult;
  } catch (err) {
    console.warn('[Firebase] Phone OTP dispatch notice:', err);
    return null;
  }
}
