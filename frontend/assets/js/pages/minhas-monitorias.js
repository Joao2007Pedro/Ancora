import { protegerPagina } from "../utils/auth-guard.js";
import { buscarInscricoesDoAluno, buscarMonitoriaPorId, cancelarInscricao } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

function getUserTypeFromStorage() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return userData.userType === "monitor" || userData.perfil === "monitor" ? "monitor" : "student";
}

function atualizarCopyDaPagina() {
  const userType = getUserTypeFromStorage();
  const titulo    = document.querySelector(".header-titles h1");
  const subtitulo = document.querySelector(".header-titles p");

  document.title = userType === "monitor"
    ? "Âncora — Minhas Monitorias"
    : "Âncora — Monitorias Agendadas";

  if (titulo) titulo.textContent = userType === "monitor" ? "Minhas Monitorias" : "Monitorias Agendadas";
  if (subtitulo) subtitulo.textContent = userType === "monitor"
    ? "Acompanhe e gerencie as monitorias que você oferece."
    : "Veja as monitorias em que você vai participar.";
}

atualizarCopyDaPagina();

/* ─────────────────────────────────────────
   ÍCONE DISCORD inline
───────────────────────────────────────── */
const DISCORD_SVG = `<svg width="16" height="12" viewBox="0 0 71 55" fill="none" style="flex-shrink:0">
  <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.7a40 40 0 0 0-1.8 3.6 54.2 54.2 0 0 0-16.3 0A40 40 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19 -1 32.8.3 46.4a58.9 58.9 0 0 0 17.9 9.1 44.6 44.6 0 0 0 3.8-6.3 38.3 38.3 0 0 1-6-2.9l1.5-1.1a42 42 0 0 0 36 0l1.5 1.1a38.4 38.4 0 0 1-6 2.9 44.3 44.3 0 0 0 3.8 6.3 58.7 58.7 0 0 0 17.9-9.1C72 30.6 68.3 16.9 60 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.8 7.2-6.4 7.2Z" fill="currentColor"/>
</svg>`;

/* ─────────────────────────────────────────
   RENDERIZA CARD
───────────────────────────────────────── */
function renderCard(item, tipo) {
  const m = item.monitoria;
  if (!m) return "";

  const temDiscord = tipo === "proxima" && m.link_discord;
  const salaDiscord = m.sala_discord_nome || "Sala do Discord";

  const botaoEntrar = temDiscord
    ? `<a href="${m.link_discord}" target="_blank" rel="noopener"
         class="btn btn-primary flex-1"
         style="display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;color:#fff;background:#5865F2;border:none;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer;">
         ${DISCORD_SVG} Entrar na Sala
       </a>`
    : `<button class="btn btn-primary flex-1">Entrar na Sala</button>`;

  return `
    <div class="card-monitoria ${tipo}">
      <strong>${m.assunto || "Monitoria"}</strong>
      <p>${m.monitor_nome || "Monitor"}</p>
      <p>${m.data || "Data a combinar"} · ${m.horario_inicio || "--:--"}–${m.horario_fim || "--:--"}</p>
      ${m.link_discord ? `<p class="discord-room">${salaDiscord}</p>` : ""}
      <span class="badge-formato">${(m.formato || "online").toUpperCase()}</span>
      ${tipo === "proxima" ? `
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
          ${botaoEntrar}
          <button class="btn btn-error-text btn-cancelar-inscricao"
            data-inscricao="${item.id}"
            data-monitoria="${item.monitoria_id}"
            data-uid="${item.aluno_id}">
            Cancelar
          </button>
        </div>` : ""}
    </div>
  `;
}

function renderEmptyState(message) {
  return `<div class="monitorias-empty"><p>${message}</p></div>`;
}

/* ─────────────────────────────────────────
   CARREGA MONITORIAS DO ALUNO
───────────────────────────────────────── */
observarSessao(async (usuario) => {
  if (!usuario) return;

  const inscricoes = await buscarInscricoesDoAluno(usuario.uid);
  const lista = document.querySelector("#lista-minhas-monitorias");
  if (!lista) return;

  lista.innerHTML = `<div class="monitorias-loading" aria-live="polite"><p>Carregando suas monitorias...</p></div>`;

  if (inscricoes.length === 0) {
    lista.innerHTML = renderEmptyState("Você ainda não tem monitorias agendadas.");
    return;
  }

  const detalhes = await Promise.all(
    inscricoes.map(async (i) => {
      const m = await buscarMonitoriaPorId(i.monitoria_id);
      return { ...i, monitoria: m };
    })
  );

  const hoje = new Date().toISOString().split("T")[0];

  const proximas   = detalhes.filter((i) => i.status === "confirmada" && i.monitoria?.data >= hoje);
  const passadas   = detalhes.filter((i) => i.status === "confirmada" && i.monitoria?.data < hoje);
  const canceladas = detalhes.filter((i) => i.status === "cancelada");

  if (detalhes.length === 0) {
    lista.innerHTML = renderEmptyState("Você ainda não tem monitorias agendadas.");
    return;
  }

  lista.innerHTML = `
    <div class="aba-conteudo" id="tab-proximas">
      ${proximas.length
        ? proximas.map((i) => renderCard(i, "proxima")).join("")
        : "<p>Nenhuma monitoria próxima.</p>"}
    </div>
    <div class="aba-conteudo oculto" id="tab-passadas">
      ${passadas.length
        ? passadas.map((i) => renderCard(i, "passada")).join("")
        : "<p>Nenhuma monitoria passada.</p>"}
    </div>
    <div class="aba-conteudo oculto" id="tab-canceladas">
      ${canceladas.length
        ? canceladas.map((i) => renderCard(i, "cancelada")).join("")
        : "<p>Nenhuma monitoria cancelada.</p>"}
    </div>
  `;

  // Abas
  document.querySelectorAll(".aba-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".aba-btn").forEach((b) => b.classList.remove("ativo", "active"));
      document.querySelectorAll(".aba-conteudo").forEach((c) => c.classList.add("oculto"));
      btn.classList.add("ativo", "active");
      document.querySelector(`#tab-${btn.dataset.aba}`)?.classList.remove("oculto");
    });
  });

  // Cancelar inscrição
  lista.addEventListener("click", async (e) => {
    const target = e.target.closest(".btn-cancelar-inscricao");
    if (!target) return;
    const { inscricao, monitoria, uid } = target.dataset;
    if (!confirm("Cancelar essa monitoria?")) return;
    await cancelarInscricao(inscricao, monitoria, uid);
    location.reload();
  });
});