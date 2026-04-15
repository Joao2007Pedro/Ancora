import { protegerPagina } from "../utils/auth-guard.js";
import { observarSessao } from "../auth.js";
import { buscarUsuarioPorUid, atualizarPerfil, buscarMonitorias, gerarAvatar } from "../utils/firebase-db.js";

protegerPagina();

const state = {
  user: null,
  perfil: null,
  monitorias: []
};

function isMonitor(userData) {
  return userData.userType === "monitor" || userData.perfil === "monitor";
}

function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function sanitizeText(value, fallback = "") {
  const v = String(value || "").trim();
  return v || fallback;
}

function updateSessionUserData(patch) {
  const current = window.__ancoraUserData || JSON.parse(localStorage.getItem("userData") || "{}");
  const merged = { ...current, ...patch };
  localStorage.setItem("userData", JSON.stringify(merged));
  window.__ancoraUserData = merged;
  window.dispatchEvent(new CustomEvent("ancora-user-data-updated", { detail: merged }));
}

function renderIdentity() {
  if (!state.perfil) return;

  const nome = sanitizeText(state.perfil.nome, "Monitor");
  const equipe = sanitizeText(state.perfil.equipe, "Equipe");
  const foto = sanitizeText(state.perfil.foto_url, "") || gerarAvatar(nome);
  const sobre = sanitizeText(
    state.perfil.descricao_monitor || state.perfil.sobre || state.perfil.bio,
    "Adicione uma descrição do seu perfil para que os alunos conheçam melhor sua experiência."
  );

  const monitorNome = document.getElementById("monitorNome");
  const monitorRole = document.getElementById("monitorRole");
  const monitorAvatar = document.getElementById("monitorAvatar");
  const sobreTexto = document.getElementById("sobreTexto");
  const headerActions = document.querySelector("app-header-actions");

  if (monitorNome) monitorNome.textContent = nome;
  if (monitorRole) monitorRole.textContent = `Monitor • ${equipe}`;
  if (monitorAvatar) monitorAvatar.src = foto;
  if (sobreTexto) sobreTexto.textContent = sobre;

  if (headerActions) {
    headerActions.setAttribute("avatar-src", foto);
    headerActions.setAttribute("profile-name", nome);
    headerActions.setAttribute("avatar-alt", nome);
  }

  updateSessionUserData({ nome, foto_url: foto, equipe });
}

function renderTags() {
  const tagsRow = document.getElementById("tagsRow");
  if (!tagsRow) return;

  const assuntos = new Set();
  state.monitorias.forEach((m) => {
    if (m.assunto) assuntos.add(m.assunto);
  });

  const tags = Array.from(assuntos).slice(0, 4);
  if (!tags.length) {
    tagsRow.innerHTML = '<span class="tag">Sem tags ainda</span>';
    return;
  }

  tagsRow.innerHTML = tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function renderStats() {
  const total = state.monitorias.length;
  const hoje = new Date().toISOString().slice(0, 10);
  const ativas = state.monitorias.filter((m) => (m.status || "ativa") === "ativa").length;
  const proximas = state.monitorias
    .filter((m) => {
      const iso = toIsoDate(m.data);
      return iso && iso >= hoje;
    })
    .sort((a, b) => String(toIsoDate(a.data)).localeCompare(String(toIsoDate(b.data))));

  const statMonitorias = document.getElementById("statMonitorias");
  if (statMonitorias) statMonitorias.textContent = String(total);

  const statBoxes = document.querySelectorAll(".stat-box");
  if (statBoxes.length >= 1) {
    statBoxes[0].querySelector("strong").textContent = String(total);
    const activeCount = ativas === 1 ? "1 ativa" : `${ativas} ativas`;
    statBoxes[0].querySelector("small").textContent = `${activeCount} no momento`;
  }

  if (statBoxes.length >= 4) {
    const proxima = proximas[0];
    if (proxima) {
      statBoxes[3].querySelector("strong").textContent = proxima.horario_inicio || "--:--";
      statBoxes[3].querySelector("small").textContent = `${proxima.data || "Data a definir"} • ${proxima.assunto || "Monitoria"}`;
    } else {
      statBoxes[3].querySelector("strong").textContent = "--:--";
      statBoxes[3].querySelector("small").textContent = "Sem sessões futuras";
    }
  }
}

function renderHorarios() {
  const horariosList = document.getElementById("horariosList");
  if (!horariosList) return;

  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = state.monitorias
    .filter((m) => {
      const iso = toIsoDate(m.data);
      return iso && iso >= hoje;
    })
    .sort((a, b) => String(toIsoDate(a.data)).localeCompare(String(toIsoDate(b.data))))
    .slice(0, 4);

  if (!proximas.length) {
    horariosList.innerHTML = `
      <div class="horario-item">
        <div class="horario-info">
          <span class="dia">Nenhuma agenda cadastrada</span>
          <span class="hora">Crie uma nova monitoria para aparecer aqui.</span>
        </div>
        <button class="btn-disponivel" disabled>Sem agenda</button>
      </div>
    `;
    return;
  }

  horariosList.innerHTML = proximas
    .map((m) => {
      const hora = `${m.horario_inicio || "--:--"} - ${m.horario_fim || "--:--"}`;
      return `
        <div class="horario-item">
          <div class="horario-info">
            <span class="dia">${m.data || "Data a definir"}</span>
            <span class="hora">${hora} • ${m.assunto || "Monitoria"}</span>
          </div>
          <button class="btn-disponivel">Disponível</button>
        </div>
      `;
    })
    .join("");
}

function renderProximasMonitorias() {
  const nextList = document.querySelector(".next-list");
  if (!nextList) return;

  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = state.monitorias
    .filter((m) => {
      const iso = toIsoDate(m.data);
      return iso && iso >= hoje;
    })
    .sort((a, b) => String(toIsoDate(a.data)).localeCompare(String(toIsoDate(b.data))))
    .slice(0, 2);

  if (!proximas.length) {
    nextList.innerHTML = `
      <div class="next-item">
        <div>
          <strong>Sem monitorias próximas</strong>
          <p>Cadastre uma nova monitoria para começar.</p>
        </div>
        <span class="next-badge next-badge--alt">Aguardando</span>
      </div>
    `;
    return;
  }

  nextList.innerHTML = proximas
    .map((m) => {
      const inscritos = Array.isArray(m.inscritos) ? m.inscritos.length : 0;
      const badgeClass = (m.formato || "online").toLowerCase() === "online" ? "next-badge" : "next-badge next-badge--alt";
      const badgeText = (m.formato || "online").toLowerCase() === "online" ? "Online" : "Presencial";
      return `
        <div class="next-item">
          <div>
            <strong>${m.titulo || m.assunto || "Monitoria"}</strong>
            <p>${m.data || "Data a definir"} • ${m.horario_inicio || "--:--"} • ${inscritos} inscrito(s)</p>
          </div>
          <span class="${badgeClass}">${badgeText}</span>
        </div>
      `;
    })
    .join("");
}

async function editarPerfil() {
  if (!state.user || !state.perfil) return;

  const descricaoAtual = sanitizeText(
    state.perfil.descricao_monitor || state.perfil.sobre || state.perfil.bio,
    ""
  );

  const novaDescricao = window.prompt("Atualize sua descrição de perfil:", descricaoAtual);
  if (novaDescricao === null) return;

  const descricaoLimpa = sanitizeText(novaDescricao);
  if (!descricaoLimpa) {
    alert("A descrição não pode ficar vazia.");
    return;
  }

  const equipeAtual = sanitizeText(state.perfil.equipe, "");
  const novaEquipe = window.prompt("Atualize sua equipe (opcional):", equipeAtual);
  if (novaEquipe === null) return;

  const patch = {
    descricao_monitor: descricaoLimpa,
    equipe: sanitizeText(novaEquipe, equipeAtual)
  };

  await atualizarPerfil(state.user.uid, patch);
  state.perfil = { ...state.perfil, ...patch };
  renderIdentity();
  alert("Perfil atualizado com sucesso!");
}

function bindActions() {
  const actions = [
    { id: "btnNovaMonitoria", href: "./cadastrar-monitoria.html" },
    { id: "btnVerMonitorias", href: "./minhas-monitorias.html" },
    { id: "btnVerAgenda", href: "./calendario.html" },
    { id: "btnVerRecursos", href: "./recursos.html" }
  ];

  actions.forEach((action) => {
    const el = document.getElementById(action.id);
    if (!el) return;
    el.addEventListener("click", () => {
      window.location.href = action.href;
    });
  });

  const btnEditarPerfil = document.getElementById("btnEditarPerfil");
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener("click", async () => {
      try {
        await editarPerfil();
      } catch (error) {
        console.error("Erro ao editar perfil:", error);
        alert("Não foi possível atualizar o perfil. Tente novamente.");
      }
    });
  }
}

async function loadPerfil(usuario) {
  state.user = usuario;

  const userData = window.__ancoraUserData || JSON.parse(localStorage.getItem("userData") || "{}");
  if (!isMonitor(userData)) {
    window.location.href = "./home.html";
    return;
  }

  const perfil = await buscarUsuarioPorUid(usuario.uid);
  if (!perfil) {
    alert("Não foi possível carregar seu perfil.");
    return;
  }

  state.perfil = perfil;
  const todasMonitorias = await buscarMonitorias({ status: "ativa" });
  state.monitorias = todasMonitorias.filter((m) => m.monitor_id === usuario.uid);

  renderIdentity();
  renderTags();
  renderStats();
  renderHorarios();
  renderProximasMonitorias();
}

document.addEventListener("DOMContentLoaded", () => {
  bindActions();

  observarSessao(async (usuario) => {
    if (!usuario) return;

    try {
      await loadPerfil(usuario);
    } catch (error) {
      console.error("Erro ao carregar dashboard do monitor:", error);
      const monitorNome = document.getElementById("monitorNome");
      if (monitorNome) monitorNome.textContent = "Erro ao carregar perfil";
    }
  });
});
