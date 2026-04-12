import { buscarMonitorias } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";
import { protegerPagina } from "../utils/auth-guard.js";

protegerPagina();

function renderPendingBanner() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isPendingMonitor = userData.perfil_solicitado === "monitor" && userData.aprovado === false;
  const main = document.querySelector(".main-content");
  if (!main || !isPendingMonitor || document.querySelector(".pending-monitor-banner")) return;

  const banner = document.createElement("section");
  banner.className = "pending-monitor-banner";
  banner.innerHTML = `
    <strong>Sua candidatura a monitor está em análise</strong>
    <p>Você já pode usar a plataforma como aluno enquanto a Amanda revisa sua solicitação.</p>
  `;

  const header = main.querySelector(".page-header");
  if (header && header.parentNode) {
    header.insertAdjacentElement("afterend", banner);
  } else {
    main.prepend(banner);
  }
}

observarSessao((usuario) => {
  if (!usuario) return;
  renderPendingBanner();
  carregarMonitorias();
});

async function carregarMonitorias(filtro = null) {
  const lista = document.querySelector("#lista-monitorias");
  lista.innerHTML = "<p class='loading'>Carregando...</p>";
  try {
    const filtros = filtro && filtro !== "todas" ? { assunto: filtro } : {};
    const monitorias = await buscarMonitorias({ ...filtros, status: "ativa" });
    if (monitorias.length === 0) {
      lista.innerHTML = "<p>Nenhuma monitoria disponível.</p>";
      return;
    }
    lista.innerHTML = monitorias.map(m => `
      <div class="card-monitoria">
        <div class="card-top">
          <img src="${m.monitor_foto || 'https://ui-avatars.com/api/?name=' + m.monitor_nome + '&background=3333FF&color=fff'}" 
               alt="${m.monitor_nome}" class="avatar">
          <div>
            <strong>${m.monitor_nome}</strong>
            <span class="badge">${m.assunto}</span>
          </div>
          <span class="badge-formato">${m.formato.toUpperCase()}</span>
        </div>
        <h3>${m.titulo}</h3>
        <div class="card-info">
          <span>${m.data} · ${m.horario_inicio}–${m.horario_fim}</span>
          <span>${m.vagas - (m.inscritos?.length || 0)} vagas</span>
        </div>
        <div class="card-acoes">
          <button class="btn-agendar" onclick="window.location.href='./confirmacao.html?id=${m.id}'">
            Agendar Monitoria
          </button>
          <button class="btn-perfil" onclick="window.location.href='./perfil.html?id=${m.monitor_id}'">
            Ver Perfil
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    lista.innerHTML = "<p>Erro ao carregar monitorias.</p>";
    console.error(err);
  }
}

document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    carregarMonitorias(btn.dataset.filtro);
  });
});