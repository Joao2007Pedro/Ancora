import { auth, googleProvider } from "./firebase-config.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { criarUsuario, buscarUsuarioPorUid, gerarAvatar, registrarCandidaturaMonitor } from "./utils/firebase-db.js";

function mapPerfilToUserType(perfil, aprovado) {
  if (perfil === "monitor" && aprovado !== false) {
    return "monitor";
  }

  return "student";
}

function salvarSessaoLocal(user, dadosPerfil = {}) {
  const perfil = dadosPerfil.perfil || user.perfil || "aluno";
  const aprovado = dadosPerfil.aprovado ?? (perfil !== "monitor");
  const userData = {
    uid: user.uid,
    nome: dadosPerfil.nome || user.displayName || "",
    email: dadosPerfil.email || user.email || "",
    foto_url: dadosPerfil.foto_url || user.photoURL || gerarAvatar(user.displayName || user.email || "Usuario"),
    perfil,
    userType: mapPerfilToUserType(perfil, aprovado),
    equipe: dadosPerfil.equipe || "",
    aprovado,
    perfil_solicitado: dadosPerfil.perfil_solicitado || null,
    candidatura_status: dadosPerfil.candidatura_status || null
  };

  localStorage.setItem("userData", JSON.stringify(userData));
  if (typeof window !== "undefined") {
    window.__ancoraUserData = userData;
    window.dispatchEvent(new CustomEvent("ancora-user-data-updated", { detail: userData }));
  }
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

  const candidatoMonitor = perfil === "monitor";
  const perfilFinal = candidatoMonitor ? "aluno" : perfil;

  await criarUsuario(result.user.uid, {
    nome,
    email,
    foto_url: gerarAvatar(nome),
    perfil: perfilFinal,
    equipe,
    aprovado: !candidatoMonitor,
    perfil_solicitado: candidatoMonitor ? "monitor" : null,
    candidatura_status: candidatoMonitor ? "pendente" : null
  });

  if (candidatoMonitor) {
    await registrarCandidaturaMonitor({
      uid: result.user.uid,
      nome,
      email,
      equipe,
      perfil_solicitado: "monitor"
    });
  }

  salvarSessaoLocal(result.user, {
    nome,
    email,
    perfil: perfilFinal,
    equipe,
    foto_url: gerarAvatar(nome),
    aprovado: !candidatoMonitor,
    perfil_solicitado: candidatoMonitor ? "monitor" : null,
    candidatura_status: candidatoMonitor ? "pendente" : null
  });
  return result.user;
}

export async function logout() {
  await signOut(auth);
  if (typeof window !== "undefined") {
    window.__ancoraUserData = null;
    window.dispatchEvent(new CustomEvent("ancora-user-data-updated", { detail: null }));
  }
  window.location.href = "/frontend/index.html";
}

if (typeof window !== "undefined") {
  window.appLogout = logout;
}

export function observarSessao(callback) {
  onAuthStateChanged(auth, callback);
}