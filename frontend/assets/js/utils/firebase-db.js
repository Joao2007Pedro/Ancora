import { db } from "../firebase-config.js";
import {
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, query,
  where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── AVATAR ───────────────────────────────────────────

export function gerarAvatar(nome) {
  const baseNome = (nome || "Usuario").trim();
  const iniciais = baseNome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${iniciais}&background=3333FF&color=fff&size=128`;
}

export function resolverFotoUsuario(userData = {}) {
  return userData.foto_url || userData.photoURL || gerarAvatar(userData.nome || userData.email || "Usuario");
}

// ── USUÁRIOS ─────────────────────────────────────────

export async function criarUsuario(uid, dados) {
  const fotoUrl = dados.foto_url || gerarAvatar(dados.nome);
  await addDoc(collection(db, "usuarios"), {
    uid,
    ...dados,
    foto_url: fotoUrl,
    aprovado: dados.aprovado ?? false,   // usa o valor passado, padrão false
    criado_em: serverTimestamp()
  });
}

export async function buscarUsuarioPorUid(uid) {
  const q = query(collection(db, "usuarios"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function atualizarPerfil(uid, dados) {
  const q = query(collection(db, "usuarios"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (!snap.empty) await updateDoc(snap.docs[0].ref, dados);
}

// ── CANDIDATURAS DE MONITOR ─────────────────────────

export async function registrarCandidaturaMonitor(dados) {
  return await addDoc(collection(db, "candidaturas"), {
    ...dados,
    tipo: "monitor",
    status: "pendente",
    criado_em: serverTimestamp()
  });
}

export async function buscarCandidaturasPendentes() {
  const q = query(collection(db, "candidaturas"), where("status", "==", "pendente"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function buscarTodasCandidaturas() {
  const snapshot = await getDocs(collection(db, "candidaturas"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function aprovarCandidatura(candidaturaId) {
  const candidaturasRef = doc(db, "candidaturas", candidaturaId);
  const candidaturasSnap = await getDoc(candidaturasRef);
  if (!candidaturasSnap.exists()) return false;

  const candidatura = candidaturasSnap.data();
  await updateDoc(candidaturasRef, {
    status: "aprovada",
    aprovado_em: serverTimestamp()
  });

  const usuariosQuery = query(collection(db, "usuarios"), where("uid", "==", candidatura.uid));
  const usuariosSnap = await getDocs(usuariosQuery);
  if (!usuariosSnap.empty) {
    await updateDoc(usuariosSnap.docs[0].ref, {
      perfil: "monitor",
      userType: "monitor",
      aprovado: true,
      perfil_solicitado: "monitor",
      candidatura_status: "aprovada"
    });
  }

  return true;
}

export async function rejeitarCandidatura(candidaturaId) {
  await updateDoc(doc(db, "candidaturas", candidaturaId), {
    status: "rejeitada",
    atualizado_em: serverTimestamp()
  });
}

export async function solicitarCandidaturaMonitor(uid) {
  const usuario = await buscarUsuarioPorUid(uid);
  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  if (usuario.perfil === "monitor" && usuario.aprovado !== false) {
    return { status: "ja-monitor", usuario };
  }

  const q = query(collection(db, "candidaturas"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  const candidaturas = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const pendente = candidaturas.find((c) => c.status === "pendente");
  if (pendente) {
    return { status: "ja-pendente", candidatura: pendente, usuario };
  }

  await registrarCandidaturaMonitor({
    uid,
    nome: usuario.nome || "",
    email: usuario.email || "",
    equipe: usuario.equipe || "",
    perfil_solicitado: "monitor"
  });

  const userRef = doc(db, "usuarios", usuario.id);
  await updateDoc(userRef, {
    perfil: "aluno",
    userType: "student",
    aprovado: false,
    perfil_solicitado: "monitor",
    candidatura_status: "pendente",
    atualizado_em: serverTimestamp()
  });

  return { status: "solicitado" };
}

// ── MONITORIAS ───────────────────────────────────────

export async function criarMonitoria(dados) {
  return await addDoc(collection(db, "monitorias"), {
    ...dados,
    inscritos: [],
    status: dados.status || "pendente_aprovacao",
    criado_em: serverTimestamp()
  });
}

export async function buscarMonitorias(filtros = {}) {
  let q = collection(db, "monitorias");
  if (filtros.assunto) q = query(q, where("assunto", "==", filtros.assunto));
  if (filtros.status)  q = query(q, where("status",  "==", filtros.status));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function buscarMonitoriaPorId(id) {
  const snap = await getDoc(doc(db, "monitorias", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function cancelarMonitoria(id) {
  await updateDoc(doc(db, "monitorias", id), { status: "cancelada" });
}

// ── INSCRIÇÕES ───────────────────────────────────────

export async function inscreverAluno(monitoriaId, alunoId, alunoNome) {
  await addDoc(collection(db, "inscricoes"), {
    aluno_id: alunoId,
    aluno_nome: alunoNome,
    monitoria_id: monitoriaId,
    status: "confirmada",
    criado_em: serverTimestamp()
  });
  const ref = doc(db, "monitorias", monitoriaId);
  const snap = await getDoc(ref);
  const inscritos = snap.data().inscritos || [];
  await updateDoc(ref, { inscritos: [...inscritos, alunoId] });
}

export async function buscarInscricoesDoAluno(alunoId) {
  const q = query(collection(db, "inscricoes"), where("aluno_id", "==", alunoId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function cancelarInscricao(inscricaoId, monitoriaId, alunoId) {
  await updateDoc(doc(db, "inscricoes", inscricaoId), { status: "cancelada" });
  const ref = doc(db, "monitorias", monitoriaId);
  const snap = await getDoc(ref);
  const inscritos = (snap.data().inscritos || []).filter(uid => uid !== alunoId);
  await updateDoc(ref, { inscritos });
}

// ── MENSAGENS ────────────────────────────────────────

export async function enviarMensagem(de, para, texto, monitoriaId = null) {
  await addDoc(collection(db, "mensagens"), {
    de,
    para,
    texto,
    monitoria_id: monitoriaId,
    lida: false,
    criado_em: serverTimestamp()
  });
}

export async function buscarMensagens(uid1, uid2) {
  const q = query(
    collection(db, "mensagens"),
    where("de", "in", [uid1, uid2]),
    where("para", "in", [uid1, uid2])
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.criado_em?.seconds - b.criado_em?.seconds);
}

// ── ROADMAP ──────────────────────────────────────────

export async function buscarRoadmap(turma) {
  const id = turma.toLowerCase().replace(/\s+/g, '').replace('#', 'sharp');
  const snap = await getDoc(doc(db, "roadmaps", id));
  return snap.exists() ? snap.data() : null;
}

export async function salvarProgressoModulo(uid, turma, ordemModulo, status) {
  const q = query(collection(db, "usuarios"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const dados = snap.docs[0].data();
  const progresso = dados.progresso || {};
  const chave = `${turma}_modulo_${ordemModulo}`;
  progresso[chave] = status; // "concluido" | "em_andamento" | "a_aprender"

  await updateDoc(snap.docs[0].ref, { progresso });
}

export async function buscarProgressoAluno(uid) {
  const q = query(collection(db, "usuarios"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return {};
  return snap.docs[0].data().progresso || {};
}

// ── CANDIDATURAS ─────────────────────────────────────

export async function criarCandidatura(uid, nome, email, assuntos, motivo) {
  const q = query(collection(db, "candidaturas"), where("uid", "==", uid));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const pendente = docs.find((c) => c.status === "pendente");
    if (pendente) {
      throw new Error("Você já tem uma candidatura em andamento.");
    }
  }

  return await addDoc(collection(db, "candidaturas"), {
    uid,
    nome,
    email,
    assuntos,
    motivo,
    status: "pendente",
    criado_em: serverTimestamp()
  });
}

export async function buscarCandidaturas(status = "pendente") {
  const q = query(collection(db, "candidaturas"), where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function atualizarCandidatura(candidaturaId, uid, novoStatus) {
  await updateDoc(doc(db, "candidaturas", candidaturaId), {
    status: novoStatus,
    atualizado_em: serverTimestamp()
  });

  if (novoStatus === "aprovada") {
    await atualizarPerfil(uid, {
      perfil: "monitor",
      userType: "monitor",
      aprovado: true,
      perfil_solicitado: "monitor",
      candidatura_status: "aprovada"
    });
    return;
  }

  if (novoStatus === "rejeitada") {
    await atualizarPerfil(uid, {
      aprovado: false,
      perfil_solicitado: "monitor",
      candidatura_status: "rejeitada"
    });
  }
}

export async function buscarCandidaturaDoUsuario(uid) {
  const q = query(collection(db, "candidaturas"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ── ADMIN ────────────────────────────────────────────

export async function verificarSeAdmin(uid) {
  const usuario = await buscarUsuarioPorUid(uid);
  return usuario?.role === "admin";
}

export async function buscarMonitoriasPendentes() {
  const q = query(collection(db, "monitorias"), where("status", "==", "pendente_aprovacao"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function aprovarMonitoria(id) {
  await updateDoc(doc(db, "monitorias", id), { status: "ativa", atualizado_em: serverTimestamp() });
}

export async function rejeitarMonitoria(id) {
  await updateDoc(doc(db, "monitorias", id), { status: "rejeitada", atualizado_em: serverTimestamp() });
}