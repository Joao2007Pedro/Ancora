import { buscarMonitorias } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";
import { protegerPagina } from "../utils/auth-guard.js";

protegerPagina();

observarSessao((usuario) => {
  if (!usuario) return;
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
          <button class="btn-perfil" onclick="window.location.href='/perfil?id=${m.monitor_id}'">
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