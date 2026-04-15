import { protegerPaginaAdmin } from "../utils/auth-guard.js";
import {
  buscarCandidaturas,
  atualizarCandidatura,
  buscarMonitoriasPendentes,
  aprovarMonitoria,
  rejeitarMonitoria
} from "../utils/firebase-db.js";

protegerPaginaAdmin();

async function carregarCandidaturas() {
  const lista = document.querySelector("#lista-candidaturas");
  if (!lista) return;

  const candidaturas = await buscarCandidaturas("pendente");

  if (candidaturas.length === 0) {
    lista.innerHTML = "<p class='vazio'>Nenhuma candidatura pendente.</p>";
    return;
  }

  lista.innerHTML = candidaturas.map((c) => `
    <div class="admin-card" id="cand-${c.id}">
      <div class="admin-card-info">
        <strong>${c.nome || "Sem nome"}</strong>
        <span>${c.email || "Sem e-mail"}</span>
        <div class="tags">
          ${(c.assuntos || []).map((a) => `<span class="tag">${a}</span>`).join("")}
        </div>
        <p class="motivo">"${c.motivo || "Sem motivo informado."}"</p>
      </div>
      <div class="admin-card-acoes">
        <button class="btn-aprovar" data-id="${c.id}" data-uid="${c.uid}">✓ Aprovar</button>
        <button class="btn-rejeitar" data-id="${c.id}" data-uid="${c.uid}">✗ Rejeitar</button>
      </div>
    </div>
  `).join("");

  lista.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;

    const { id, uid } = btn.dataset;
    const acao = btn.classList.contains("btn-aprovar") ? "aprovada" : "rejeitada";

    btn.disabled = true;
    btn.textContent = "Processando...";

    await atualizarCandidatura(id, uid, acao);
    document.querySelector(`#cand-${id}`)?.remove();

    if (lista.querySelectorAll(".admin-card").length === 0) {
      lista.innerHTML = "<p class='vazio'>Nenhuma candidatura pendente.</p>";
    }
  });
}

async function carregarMonitoriasPendentes() {
  const lista = document.querySelector("#lista-monitorias-pendentes");
  if (!lista) return;

  const monitorias = await buscarMonitoriasPendentes();

  if (monitorias.length === 0) {
    lista.innerHTML = "<p class='vazio'>Nenhuma monitoria aguardando aprovação.</p>";
    return;
  }

  lista.innerHTML = monitorias.map((m) => `
    <div class="admin-card" id="mon-${m.id}">
      <div class="admin-card-info">
        <strong>${m.titulo || "Monitoria sem título"}</strong>
        <span>${m.monitor_nome || "Monitor"} · ${m.assunto || "Assunto"}</span>
        <span>${m.data || "Data"} · ${m.horario_inicio || "--:--"}–${m.horario_fim || "--:--"}</span>
      </div>
      <div class="admin-card-acoes">
        <button class="btn-aprovar" data-id="${m.id}">✓ Aprovar</button>
        <button class="btn-rejeitar" data-id="${m.id}">✗ Rejeitar</button>
      </div>
    </div>
  `).join("");

  lista.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;

    const { id } = btn.dataset;
    const aprovar = btn.classList.contains("btn-aprovar");

    btn.disabled = true;
    btn.textContent = "Processando...";

    if (aprovar) {
      await aprovarMonitoria(id);
    } else {
      await rejeitarMonitoria(id);
    }

    document.querySelector(`#mon-${id}`)?.remove();

    if (lista.querySelectorAll(".admin-card").length === 0) {
      lista.innerHTML = "<p class='vazio'>Nenhuma monitoria aguardando aprovação.</p>";
    }
  });
}

(async () => {
  try {
    await Promise.all([carregarCandidaturas(), carregarMonitoriasPendentes()]);
  } catch (error) {
    console.error("Erro ao carregar painel admin:", error);
  }
})();
