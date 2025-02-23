// Import Firebase dependencies
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkgpWhpFLxiNGKIOF6b0JwwuopTptCNrM",
    authDomain: "edubot-6aa9b.firebaseapp.com",
    projectId: "edubot-6aa9b",
    storageBucket: "edubot-6aa9b.appspot.com", // Fixed storage bucket URL
    messagingSenderId: "285639460732",
    appId: "1:285639460732:web:556ae3325cdc3be8acc6f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db, app };
