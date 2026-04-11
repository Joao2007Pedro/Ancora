import { protegerPagina } from "../utils/auth-guard.js";
import { inscreverAluno, buscarMonitoriaPorId } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

let usuarioAtual = null;
observarSessao((u) => {
  usuarioAtual = u;
});

const params = new URLSearchParams(window.location.search);
const monitoriaId = params.get("id");

async function carregarResumo() {
  if (!monitoriaId) return;
  const monitoria = await buscarMonitoriaPorId(monitoriaId);
  if (!monitoria) return;

const nomeEl = document.querySelector("#monitor-nome");
const dataEl = document.querySelector("#sessao-data");
const formatoEl = document.querySelector("#sessao-formato");
const assuntoEl = document.querySelector("#sessao-assunto");

  if (nomeEl) nomeEl.textContent = monitoria.monitor_nome || "Monitor";
  if (dataEl) dataEl.textContent = `${monitoria.data || "Data a combinar"} · ${monitoria.horario_inicio || "--:--"}–${monitoria.horario_fim || "--:--"}`;
  if (formatoEl) {
    formatoEl.textContent = monitoria.formato === "online" ? "Online via Discord" : "Presencial";
  }
  if (assuntoEl) assuntoEl.textContent = monitoria.assunto || "Monitoria";
}

carregarResumo();

document.querySelector("#btn-confirmar")?.addEventListener("click", async () => {
  if (!usuarioAtual || !monitoriaId) return;
  try {
    await inscreverAluno(monitoriaId, usuarioAtual.uid, usuarioAtual.displayName || "Aluno");
    alert("Presença confirmada!");
    window.location.href = "./minhas-monitorias.html";
  } catch (err) {
    console.error(err);
    alert("Erro ao confirmar: " + err.message);
  }
});

document.querySelector("#btn-cancelar")?.addEventListener("click", () => {
  history.back();
});
