import { protegerPagina } from "../utils/auth-guard.js";
import { inscreverAluno, buscarMonitoriaPorId } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

let usuarioAtual = null;
observarSessao((u) => { usuarioAtual = u; });

const params      = new URLSearchParams(window.location.search);
const monitoriaId = params.get("id");
let monitoriaAtual = null;

async function carregarResumo() {
  if (!monitoriaId) return;
  const monitoria = await buscarMonitoriaPorId(monitoriaId);
  if (!monitoria) return;
  monitoriaAtual = monitoria;

  const nomeEl    = document.querySelector("#monitor-nome");
  const dataEl    = document.querySelector("#sessao-data");
  const formatoEl = document.querySelector("#sessao-formato");
  const assuntoEl = document.querySelector("#sessao-assunto");

  if (nomeEl)    nomeEl.textContent    = monitoria.monitor_nome || "Monitor";
  if (dataEl)    dataEl.textContent    = `${monitoria.data || "Data a combinar"} · ${monitoria.horario_inicio || "--:--"}–${monitoria.horario_fim || "--:--"}`;
  if (formatoEl) formatoEl.textContent = monitoria.formato === "online" ? "Online via Discord" : "Presencial";
  if (assuntoEl) assuntoEl.textContent = monitoria.assunto || "Monitoria";

  // Mostra sala do Discord se existir
  if (monitoria.link_discord) {
    mostrarBotaoDiscord(monitoria.link_discord, false);
  }
}

function mostrarBotaoDiscord(link, destacado = true) {
  // Evita duplicar
  document.getElementById("discord-section")?.remove();

  const section = document.createElement("div");
  section.id = "discord-section";
  section.style.cssText = `
    margin-top: 20px;
    padding: 16px;
    background: rgba(88,101,242,0.08);
    border: 1.5px solid rgba(88,101,242,0.25);
    border-radius: 12px;
    text-align: center;
  `;

  section.innerHTML = `
    <p style="font-size:13px;color:#5865F2;font-weight:600;margin-bottom:10px;">
      ${destacado ? "✅ Presença confirmada! Acesse a sala:" : "📍 Sala da monitoria:"}
    </p>
    <a href="${link}" target="_blank" rel="noopener"
      style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
             background:#5865F2;color:#fff;border-radius:10px;font-weight:700;
             font-size:14px;text-decoration:none;">
      <svg width="18" height="14" viewBox="0 0 71 55" fill="none">
        <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.7a40 40 0 0 0-1.8 3.6 54.2 54.2 0 0 0-16.3 0A40 40 0 0 0 25.6.7 58.4 58.4 0 0 0 11 4.9C1.6 19 -1 32.8.3 46.4a58.9 58.9 0 0 0 17.9 9.1 44.6 44.6 0 0 0 3.8-6.3 38.3 38.3 0 0 1-6-2.9l1.5-1.1a42 42 0 0 0 36 0l1.5 1.1a38.4 38.4 0 0 1-6 2.9 44.3 44.3 0 0 0 3.8 6.3 58.7 58.7 0 0 0 17.9-9.1C72 30.6 68.3 16.9 60 4.9ZM23.7 38c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.8 7.2-6.4 7.2Z" fill="currentColor"/>
      </svg>
      Entrar na sala do Discord
    </a>
    ${destacado ? `<p style="margin-top:10px;font-size:12px;color:#888;">
      Você também pode entrar por <b>Minhas Monitorias</b> depois.
    </p>` : ""}
  `;

  // Insere após os action-buttons
  const actionButtons = document.querySelector(".action-buttons");
  if (actionButtons) {
    actionButtons.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".confirmation-card")?.appendChild(section);
  }
}

carregarResumo();

document.querySelector("#btn-confirmar")?.addEventListener("click", async () => {
  if (!usuarioAtual || !monitoriaId) return;

  const btn = document.querySelector("#btn-confirmar");
  btn.disabled = true;
  btn.textContent = "Confirmando...";

  try {
    await inscreverAluno(monitoriaId, usuarioAtual.uid, usuarioAtual.displayName || "Aluno");

    // Esconde botões de ação
    document.querySelector(".action-buttons").style.display = "none";

    // Se tiver Discord, mostra o botão em destaque
    if (monitoriaAtual?.link_discord) {
      mostrarBotaoDiscord(monitoriaAtual.link_discord, true);
    } else {
      // Sem Discord: redireciona normalmente
      alert("Presença confirmada!");
      window.location.href = "./minhas-monitorias.html";
    }
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Confirmar agendamento";
    alert("Erro ao confirmar: " + err.message);
  }
});

document.querySelector("#btn-cancelar")?.addEventListener("click", () => {
  history.back();
});