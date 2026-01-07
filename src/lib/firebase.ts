import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDC8oknj7GfALG2aAJ5cG7FTxOlmOWXLtk",
  authDomain: "linka-f3e2a.firebaseapp.com",
  projectId: "linka-f3e2a",
  storageBucket: "linka-f3e2a.firebasestorage.app",
  messagingSenderId: "515083856310",
  appId: "1:515083856310:web:108b0ea23ea0dc700ab917"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
