import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGpBHOTzPy9XKDOZcan4uBUX1lAdlCsP8",
  authDomain: "accubooks-cef88.firebaseapp.com",
  projectId: "accubooks-cef88",
  storageBucket: "accubooks-cef88.firebasestorage.app",
  messagingSenderId: "561524520940",
  appId: "1:561524520940:web:1870fd678af7f3f89c32c9",
  measurementId: "G-ZWTJ00PB6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return { 
      success: true, 
      user: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || '',
        photoURL: user.photoURL,
      }
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    let errorMessage = 'Google login failed. ';
    
    if (error.code === 'auth/popup-blocked') {
      errorMessage += 'Popup was blocked. Please allow popups for this site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage += 'Domain not authorized. Add localhost to Firebase console.';
    } else {
      errorMessage += error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Upload Profile Picture - Simplified version
export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('Starting upload for user:', userId);
    console.log('File:', file.name, file.type, file.size);
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `profile_${userId}_${timestamp}.jpg`;
    const storageRef = ref(storage, `profile_pictures/${fileName}`);
    
    console.log('Storage path:', `profile_pictures/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload successful:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Upload error details:', error);
    return { success: false, error: error.message };
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};