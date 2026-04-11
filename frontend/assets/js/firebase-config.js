import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7zN3Z0UsJDFDVy7eQ7la2RfNf0CvrSXw",
  authDomain: "ancora-proa.firebaseapp.com",
  projectId: "ancora-proa",
  storageBucket: "ancora-proa.firebasestorage.app",
  messagingSenderId: "633489684642",
  appId: "1:633489684642:web:c99df95720148b9418bffb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();