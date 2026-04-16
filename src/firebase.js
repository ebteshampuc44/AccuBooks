import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAUnOUqBPxrTzfthN55zc-roIQGyMjmAKM",
  authDomain: "accubooks-bd.firebaseapp.com",
  projectId: "accubooks-bd",
  storageBucket: "accubooks-bd.firebasestorage.app",
  messagingSenderId: "481795943139",
  appId: "1:481795943139:web:318e83e4dd8ef8c92573d6",
  measurementId: "G-PJN715MD2K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// গ্লোবাল ভেরিয়েবল চেক করুন
let recaptchaVerifier = null;

export const setupRecaptcha = (elementId) => {
  // আগের recaptcha ক্লিয়ার করুন
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  
  // চেক করুন element টি আছে কিনা
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return null;
  }
  
  // নতুন recaptcha তৈরি করুন
  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
      recaptchaVerifier = null;
    }
  });
  
  return recaptchaVerifier;
};

export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  try {
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      let cleanNumber = phoneNumber.replace(/^0+/, '');
      cleanNumber = cleanNumber.replace(/\D/g, '');
      if (!cleanNumber.startsWith('880')) {
        formattedNumber = `+880${cleanNumber}`;
      } else {
        formattedNumber = `+${cleanNumber}`;
      }
    }
    
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedNumber,
      recaptchaVerifier
    );
    return { success: true, confirmationResult };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};