import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const FALLBACK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC7zN3Z0UsJDFDVy7eQ7la2RfNf0CvrSXw",
  authDomain: "ancora-proa.firebaseapp.com",
  projectId: "ancora-proa",
  storageBucket: "ancora-proa.firebasestorage.app",
  messagingSenderId: "633489684642",
  appId: "1:633489684642:web:6c41be5cdb1d504c18bffb",
};

async function carregarFirebaseConfig() {
  try {
    const response = await fetch("/api/firebase-web-config");

    if (!response.ok) {
      throw new Error(`Falha ao carregar configuracao do Firebase: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("[Ancora] Usando configuração Firebase local para ambiente estático:", error);
    return FALLBACK_FIREBASE_CONFIG;
  }
}

const firebaseConfig = await carregarFirebaseConfig();

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();