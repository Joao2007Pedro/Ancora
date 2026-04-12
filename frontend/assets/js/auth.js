import { auth, googleProvider } from "./firebase-config.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { criarUsuario, buscarUsuarioPorUid, gerarAvatar } from "./utils/firebase-db.js";

function mapPerfilToUserType(perfil) {
  return perfil === "monitor" ? "monitor" : "student";
}

function salvarSessaoLocal(user, dadosPerfil = {}) {
  const perfil = dadosPerfil.perfil || user.perfil || "aluno";
  const userData = {
    uid: user.uid,
    nome: dadosPerfil.nome || user.displayName || "",
    email: dadosPerfil.email || user.email || "",
    foto_url: dadosPerfil.foto_url || user.photoURL || gerarAvatar(user.displayName || user.email || "Usuario"),
    perfil,
    userType: mapPerfilToUserType(perfil),
    equipe: dadosPerfil.equipe || "",
    aprovado: dadosPerfil.aprovado ?? (perfil !== "monitor")
  };

  localStorage.setItem("userData", JSON.stringify(userData));
  return userData;
}

async function sincronizarSessaoLocal(user, fallbackPerfil = "aluno") {
  const dadosPerfil = await buscarUsuarioPorUid(user.uid);

  if (dadosPerfil) {
    return salvarSessaoLocal(user, dadosPerfil);
  }

  return salvarSessaoLocal(user, { perfil: fallbackPerfil });
}

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
  await sincronizarSessaoLocal(user, "aluno");
  return user;
}

export async function loginEmail(email, senha) {
  const result = await signInWithEmailAndPassword(auth, email, senha);
  await sincronizarSessaoLocal(result.user);
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
  salvarSessaoLocal(result.user, { nome, email, perfil, equipe, foto_url: gerarAvatar(nome), aprovado: perfil === "monitor" ? false : true });
  return result.user;
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/frontend/index.html";
}

if (typeof window !== "undefined") {
  window.appLogout = logout;
}

export function observarSessao(callback) {
  onAuthStateChanged(auth, callback);
}