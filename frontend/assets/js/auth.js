import { auth, googleProvider } from "./firebase-config.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { criarUsuario, buscarUsuarioPorUid, gerarAvatar } from "./utils/firebase-db.js";

export async function loginGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const existe = await buscarUsuarioPorUid(user.uid);
  if (!existe) {
    await criarUsuario(user.uid, {
      nome: user.displayName,
      email: user.email,
      foto_url: user.photoURL || gerarAvatar(user.displayName),
      perfil: "aluno",
      equipe: ""
    });
  }
  return user;
}

export async function loginEmail(email, senha) {
  const result = await signInWithEmailAndPassword(auth, email, senha);
  return result.user;
}

export async function cadastrarEmail(nome, email, senha, perfil, equipe) {
  const result = await createUserWithEmailAndPassword(auth, email, senha);
  await criarUsuario(result.user.uid, {
    nome,
    email,
    foto_url: gerarAvatar(nome),
    perfil,
    equipe,
    aprovado: perfil === "monitor" ? false : true
  });
  return result.user;
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/frontend/index.html";
}

export function observarSessao(callback) {
  onAuthStateChanged(auth, callback);
}