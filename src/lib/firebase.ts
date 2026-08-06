import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  RecaptchaVerifier,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing VITE_FIREBASE_API_KEY');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOutUser() {
  return signOut(auth);
}

export function watchAuthState(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

/** Sends a phone OTP using an invisible reCAPTCHA mounted on `containerId`. */
export function sendPhoneOtp(phoneNumber: string, containerId: string): Promise<ConfirmationResult> {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  }
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export function confirmPhoneOtp(confirmation: ConfirmationResult, code: string) {
  return confirmation.confirm(code);
}
