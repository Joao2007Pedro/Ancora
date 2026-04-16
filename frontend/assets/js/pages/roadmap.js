import { protegerPagina } from "../utils/auth-guard.js";
import { buscarRoadmap, buscarProgressoAluno, salvarProgressoModulo } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";
import { buscarUsuarioPorUid } from "../utils/firebase-db.js";

protegerPagina();

const STATUS = {
  concluido:     { label: "Concluído",    cor: "var(--color-lime)",   icone: "✓" },
  em_andamento:  { label: "Em andamento", cor: "var(--color-blue)",   icone: "▶" },
  a_aprender:    { label: "A aprender",   cor: "var(--color-outline)", icone: "○" }
};

function normalizarTurmaId(turma) {
  return (turma || "java")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace("#", "sharp");
}

function canonicalizarTurmaRoadmap(turmaId) {
  if (turmaId === "java-manha" || turmaId === "java-tarde") {
    return "java";
  }

  return turmaId;
}

observarSessao(async (usuario) => {
  if (!usuario) return;

  const dadosUsuario = await buscarUsuarioPorUid(usuario.uid);
  const turma        = dadosUsuario?.equipe || "java";
  const turmaOriginalId = normalizarTurmaId(turma);
  const turmaId      = canonicalizarTurmaRoadmap(turmaOriginalId);
  const roadmap      = await buscarRoadmap(turmaId);
  const progresso    = await buscarProgressoAluno(usuario.uid);
  const container = document.querySelector("#roadmap-container");

  const getStatusModulo = (ordem) => {
    const chaveCanonica = `${turmaId}_modulo_${ordem}`;
    const chaveLegada = `${turmaOriginalId}_modulo_${ordem}`;
    return progresso[chaveCanonica] || progresso[chaveLegada] || "a_aprender";
  };

  if (!container) return;

  if (!roadmap) {
    container.innerHTML =
      "<p>Roadmap não encontrado para sua turma. Em breve!</p>";
    return;
  }

  // Calcula progresso geral
  const total     = roadmap.modulos.length;
  const concluidos = roadmap.modulos.filter(m => {
    return getStatusModulo(m.ordem) === "concluido";
  }).length;

  // Atualiza barra de progresso
  const pct = Math.round((concluidos / total) * 100);
  document.querySelector("#progresso-texto") &&
    (document.querySelector("#progresso-texto").textContent = `${concluidos}/${total} concluídos`);
  document.querySelector("#barra-progresso") &&
    (document.querySelector("#barra-progresso").style.width = `${pct}%`);
  document.querySelector("#turma-nome") &&
    (document.querySelector("#turma-nome").textContent = roadmap.turma);

  // Renderiza módulos
  container.innerHTML = roadmap.modulos.map(modulo => {
    const status = getStatusModulo(modulo.ordem);
    const s      = STATUS[status];

    return `
      <div class="modulo-card status-${status}" data-ordem="${modulo.ordem}">
        <div class="modulo-header">
          <div class="modulo-numero" style="background: ${s.cor}">${s.icone}</div>
          <div class="modulo-info">
            <h3>${modulo.titulo}</h3>
            <p>${modulo.descricao}</p>
          </div>
          <span class="modulo-badge status-${status}">${s.label}</span>
        </div>

        <ul class="topicos-lista">
          ${modulo.topicos.map(t => `<li>${t}</li>`).join("")}
        </ul>

        <div class="modulo-acoes">
          <button class="btn-status ${status === 'concluido' ? 'ativo' : ''}"
            data-ordem="${modulo.ordem}"
            data-status="concluido">
            ✓ Marcar como concluído
          </button>
          <button class="btn-status ${status === 'em_andamento' ? 'ativo' : ''}"
            data-ordem="${modulo.ordem}"
            data-status="em_andamento">
            ▶ Em andamento
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Interação dos botões de status
  if (container.dataset.bound === "true") return;
  container.dataset.bound = "true";

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-status");
    if (!btn) return;

    const ordem  = parseInt(btn.dataset.ordem);
    const status = btn.dataset.status;

    await salvarProgressoModulo(usuario.uid, turmaId, ordem, status);

    // Atualiza visual sem recarregar a página
    const card = container.querySelector(`.modulo-card[data-ordem="${ordem}"]`);
    card.className = `modulo-card status-${status}`;
    card.querySelector(".modulo-badge").textContent = STATUS[status].label;
    card.querySelector(".modulo-badge").className = `modulo-badge status-${status}`;
    card.querySelectorAll(".btn-status").forEach(b => {
      b.classList.toggle("ativo", b.dataset.status === status);
    });

    // Recalcula barra
    const novoProgresso = await buscarProgressoAluno(usuario.uid);
    const novoConcluidos = roadmap.modulos.filter(m => {
      const chaveCanonica = `${turmaId}_modulo_${m.ordem}`;
      const chaveLegada = `${turmaOriginalId}_modulo_${m.ordem}`;
      return (novoProgresso[chaveCanonica] || novoProgresso[chaveLegada]) === "concluido";
    }).length;
    const novoPct = Math.round((novoConcluidos / total) * 100);
    document.querySelector("#progresso-texto") &&
      (document.querySelector("#progresso-texto").textContent = `${novoConcluidos}/${total} concluídos`);
    document.querySelector("#barra-progresso") &&
      (document.querySelector("#barra-progresso").style.width = `${novoPct}%`);
  });
});