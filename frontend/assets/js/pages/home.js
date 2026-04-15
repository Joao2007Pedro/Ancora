/* ─────────────────────────────────────────
   IMPORTS DINÂMICOS — Firebase opcional
   Se falhar, usa dados de demonstração
───────────────────────────────────────── */
let buscarMonitorias = async () => [];
let observarSessao   = (cb) => cb(null);

try {
  const fb    = await import("../firebase-config.js");
  const db    = await import("../utils/firebase-db.js");
  const auth  = await import("../auth.js");
  const guard = await import("../utils/auth-guard.js");

  buscarMonitorias = db.buscarMonitorias;
  observarSessao   = auth.observarSessao;
  guard.protegerPagina();
} catch {
  /* Firebase indisponível — modo demo ativo */
  console.info("[Âncora] Firebase não encontrado, usando dados de exemplo.");
}

/* ─────────────────────────────────────────
   DADOS DE DEMONSTRAÇÃO
───────────────────────────────────────── */
const DEMO = [
  {
    id: "d1", monitor_id: "u1",
    monitor_nome: "Ricardo Santos",
    monitor_foto: "https://ui-avatars.com/api/?name=RS&background=3333FF&color=fff&size=96",
    assunto: "HTML & CSS",
    titulo: "Flexbox e Grid do zero ao avançado",
    descricao: "Vamos montar layouts reais juntos. Traga seu projeto ou exercício da aula.",
    tags: ["HTML & CSS", "JavaScript", "Git"],
    formato: "online", turno: "tarde",
    data: "Terça, 22 Abr", horario_inicio: "14:00", horario_fim: "15:30",
    horarios: ["Terça 14h", "Quinta 15h", "Sexta 20h"],
    vagas: 5, inscritos: ["a1", "a2"], avaliacao: 4.9, avaliacoes_count: 32,
    destaque: true, equipe: "Equipe 1"
  },
  {
    id: "d2", monitor_id: "u2",
    monitor_nome: "Ana Paula",
    monitor_foto: "https://ui-avatars.com/api/?name=AP&background=7C3AED&color=fff&size=96",
    assunto: "Lógica",
    titulo: "Lógica de Programação com exemplos do dia a dia",
    descricao: "Focamos em exercícios práticos de if/else, loops e funções com linguagem simples.",
    tags: ["Lógica", "Python", "Algoritmos"],
    formato: "presencial", turno: "manha",
    data: "Quarta, 23 Abr", horario_inicio: "10:00", horario_fim: "11:30",
    horarios: ["Seg 13h", "Qua 10h"],
    vagas: 4, inscritos: ["a3"], avaliacao: 4.7, avaliacoes_count: 18,
    destaque: true, equipe: "Equipe 2"
  },
  {
    id: "d3", monitor_id: "u3",
    monitor_nome: "Carlos Mendes",
    monitor_foto: "https://ui-avatars.com/api/?name=CM&background=059669&color=fff&size=96",
    assunto: "JavaScript",
    titulo: "Manipulação do DOM e eventos no JS puro",
    descricao: "Aprenda a deixar suas páginas interativas sem framework. Exercícios ao vivo.",
    tags: ["JavaScript", "DOM", "ES6"],
    formato: "online", turno: "noite",
    data: "Quinta, 24 Abr", horario_inicio: "18:00", horario_fim: "19:30",
    horarios: ["Ter 18h", "Qui 18h"],
    vagas: 6, inscritos: ["a4", "a5", "a6"], avaliacao: 4.6, avaliacoes_count: 11,
    destaque: false, equipe: "Equipe 1"
  },
  {
    id: "d4", monitor_id: "u4",
    monitor_nome: "Beatriz Lima",
    monitor_foto: "https://ui-avatars.com/api/?name=BL&background=D97706&color=fff&size=96",
    assunto: "HTML & CSS",
    titulo: "Responsividade e Mobile First na prática",
    descricao: "Como fazer seu site funcionar bem em qualquer tela. Media queries e breakpoints.",
    tags: ["HTML & CSS", "Responsividade", "Figma"],
    formato: "online", turno: "tarde",
    data: "Sexta, 25 Abr", horario_inicio: "15:00", horario_fim: "16:30",
    horarios: ["Seg 15h", "Qua 16h", "Sex 15h"],
    vagas: 5, inscritos: [], avaliacao: 5.0, avaliacoes_count: 7,
    destaque: true, equipe: "Equipe 3"
  },
  {
    id: "d5", monitor_id: "u5",
    monitor_nome: "Pedro Alves",
    monitor_foto: "https://ui-avatars.com/api/?name=PA&background=DC2626&color=fff&size=96",
    assunto: "Python",
    titulo: "Python para iniciantes: variáveis, listas e funções",
    descricao: "Sessão introdutória ideal pra quem ainda tá no começo. Ambiente configurado juntos.",
    tags: ["Python", "Lógica", "Algoritmos"],
    formato: "online", turno: "manha",
    data: "Segunda, 28 Abr", horario_inicio: "09:30", horario_fim: "11:00",
    horarios: ["Seg 09h30", "Qua 10h"],
    vagas: 5, inscritos: ["a7"], avaliacao: 4.8, avaliacoes_count: 14,
    destaque: false, equipe: "Equipe 2"
  },
  {
    id: "d6", monitor_id: "u6",
    monitor_nome: "Julia Ferreira",
    monitor_foto: "https://ui-avatars.com/api/?name=JF&background=0891B2&color=fff&size=96",
    assunto: "Java",
    titulo: "Orientação a Objetos em Java: Classes e Herança",
    descricao: "Entenda de vez como funciona POO com exemplos que aparecem nas provas do PROA.",
    tags: ["Java", "POO", "Spring"],
    formato: "presencial", turno: "tarde",
    data: "Terça, 29 Abr", horario_inicio: "14:30", horario_fim: "16:00",
    horarios: ["Ter 14h30", "Qui 15h"],
    vagas: 3, inscritos: ["a8", "a9"], avaliacao: 4.5, avaliacoes_count: 9,
    destaque: false, equipe: "Equipe 4"
  },
  {
    id: "d7", monitor_id: "u7",
    monitor_nome: "Marcos Souza",
    monitor_foto: "https://ui-avatars.com/api/?name=MS&background=BE185D&color=fff&size=96",
    assunto: "Lógica",
    titulo: "Pseudocódigo e fluxogramas para resolver qualquer problema",
    descricao: "A base que ninguém ensina direito. Aprenda a pensar antes de codificar.",
    tags: ["Lógica", "Pseudocódigo", "Algoritmos"],
    formato: "online", turno: "noite",
    data: "Quarta, 30 Abr", horario_inicio: "19:00", horario_fim: "20:30",
    horarios: ["Qua 19h", "Sex 20h"],
    vagas: 4, inscritos: [], avaliacao: 4.9, avaliacoes_count: 21,
    destaque: true, equipe: "Equipe 1"
  },
  {
    id: "d8", monitor_id: "u8",
    monitor_nome: "Larissa Costa",
    monitor_foto: "https://ui-avatars.com/api/?name=LC&background=15803D&color=fff&size=96",
    assunto: "Python",
    titulo: "Trabalhando com arquivos e listas em Python",
    descricao: "Leitura de CSV, manipulação de listas e dicionários. Exercícios com dados reais.",
    tags: ["Python", "Listas", "Arquivos"],
    formato: "online", turno: "manha",
    data: "Quinta, 01 Mai", horario_inicio: "10:00", horario_fim: "11:30",
    horarios: ["Ter 09h", "Qui 10h"],
    vagas: 5, inscritos: ["a10"], avaliacao: 4.7, avaliacoes_count: 16,
    destaque: false, equipe: "Equipe 3"
  },
  {
    id: "d9", monitor_id: "u9",
    monitor_nome: "Felipe Nunes",
    monitor_foto: "https://ui-avatars.com/api/?name=FN&background=6366F1&color=fff&size=96",
    assunto: "JavaScript",
    titulo: "Git e GitHub na prática: branches, merge e pull request",
    descricao: "Pare de ter medo do Git. Vamos resolver conflito de merge ao vivo e criar seu primeiro PR.",
    tags: ["Git", "GitHub", "JavaScript"],
    formato: "online", turno: "tarde",
    data: "Sexta, 02 Mai", horario_inicio: "16:00", horario_fim: "17:30",
    horarios: ["Sex 16h", "Seg 17h"],
    vagas: 8, inscritos: ["a11", "a12"], avaliacao: 4.8, avaliacoes_count: 27,
    destaque: true, equipe: "Equipe 2"
  },
  {
    id: "d10", monitor_id: "u10",
    monitor_nome: "Camila Rocha",
    monitor_foto: "https://ui-avatars.com/api/?name=CR&background=F43F5E&color=fff&size=96",
    assunto: "HTML & CSS",
    titulo: "Semântica HTML e acessibilidade web",
    descricao: "Como escrever HTML do jeito certo: tags certas, roles e ARIA para sites acessíveis.",
    tags: ["HTML & CSS", "Semântica", "Acessibilidade"],
    formato: "online", turno: "manha",
    data: "Segunda, 05 Mai", horario_inicio: "11:00", horario_fim: "12:30",
    horarios: ["Seg 11h", "Qua 11h"],
    vagas: 6, inscritos: [], avaliacao: 4.6, avaliacoes_count: 5,
    destaque: false, equipe: "Equipe 4"
  }
];

/* ─────────────────────────────────────────
   ESTADO DOS FILTROS
───────────────────────────────────────── */
let filtroMateria  = "todas";
let filtroTurno    = "todos";
let filtroDestaque = false;
let todasMonitorias = [];

/* ─────────────────────────────────────────
   CARREGA IMEDIATAMENTE com DEMO,
   depois tenta Firebase em background
───────────────────────────────────────── */
todasMonitorias = DEMO;
aplicarFiltros();

// tenta Firebase em paralelo
buscarMonitorias({ status: "ativa" })
  .then(resultado => {
    if (resultado?.length) {
      todasMonitorias = resultado;
      aplicarFiltros();
    }
  })
  .catch(() => { /* mantém DEMO */ });

/* ─────────────────────────────────────────
   AVATAR do usuário logado
───────────────────────────────────────── */
observarSessao((usuario) => {
  if (!usuario) return;
  const userData = window.__ancoraUserData || JSON.parse(localStorage.getItem("userData") || "{}");
  const nome = userData.nome || usuario.displayName || "Aluno";
  const foto = userData.foto_url || usuario.photoURL || "";
  const iniciais = nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const mob = document.getElementById("avatarMobile");
  if (mob) {
    mob.innerHTML = foto
      ? `<img src="${foto}" alt="${nome}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : iniciais;
  }
  renderPendingBanner();
});

/* ─────────────────────────────────────────
   BANNER: candidatura pendente
───────────────────────────────────────── */
function renderPendingBanner() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isPending = userData.perfil_solicitado === "monitor" && userData.aprovado === false;
  const main = document.querySelector(".main-content");
  if (!main || !isPending || document.querySelector(".pending-monitor-banner")) return;
  const banner = document.createElement("section");
  banner.className = "pending-monitor-banner";
  banner.innerHTML = `
    <strong>Sua candidatura a monitor está em análise</strong>
    <p>Você já pode usar a plataforma como aluno enquanto a Amanda revisa sua solicitação.</p>`;
  const header = main.querySelector(".page-header");
  header ? header.insertAdjacentElement("afterend", banner) : main.prepend(banner);
}

/* ─────────────────────────────────────────
   FILTROS — matéria
───────────────────────────────────────── */
document.querySelectorAll("#filtrosMateria .filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#filtrosMateria .filtro-btn")
      .forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    filtroMateria = btn.dataset.filtro;
    atualizarLabel();
    aplicarFiltros();
  });
});

/* ─────────────────────────────────────────
   FILTROS — turno
───────────────────────────────────────── */
document.querySelectorAll("#filtrosTurno .filtro-btn:not(.destaque)").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#filtrosTurno .filtro-btn:not(.destaque)")
      .forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    filtroTurno = btn.dataset.turno;
    aplicarFiltros();
  });
});

document.querySelector(".filtro-btn.destaque")?.addEventListener("click", function () {
  filtroDestaque = !filtroDestaque;
  this.classList.toggle("ativo", filtroDestaque);
  aplicarFiltros();
});

/* ─────────────────────────────────────────
   BUSCA
───────────────────────────────────────── */
let debounce;
document.getElementById("searchInput")?.addEventListener("input", e => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    const t = e.target.value.toLowerCase();
    document.querySelectorAll(".card-monitoria").forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(t) ? "" : "none";
    });
  }, 350);
});

/* ─────────────────────────────────────────
   LABEL DA SEÇÃO
───────────────────────────────────────── */
function atualizarLabel() {
  const label = document.getElementById("sectionLabel");
  if (!label) return;
  label.textContent = filtroMateria === "todas"
    ? "Em destaque esta semana"
    : "Monitorias de " + filtroMateria;
}

/* ─────────────────────────────────────────
   APLICA FILTROS
───────────────────────────────────────── */
function aplicarFiltros() {
  let resultado = [...todasMonitorias];

  if (filtroMateria !== "todas") {
    resultado = resultado.filter(m =>
      m.assunto?.toLowerCase() === filtroMateria.toLowerCase()
    );
  }
  if (filtroTurno !== "todos") {
    resultado = resultado.filter(m => m.turno === filtroTurno);
  }
  if (filtroDestaque) {
    resultado = resultado.filter(m => m.destaque === true);
  }

  renderLista(resultado);
}

/* ─────────────────────────────────────────
   RENDERIZA LISTA
───────────────────────────────────────── */
function renderLista(monitorias) {
  const lista  = document.getElementById("lista-monitorias");
  const lmWrap = document.getElementById("loadMore");
  if (!lista) return;

  if (!monitorias.length) {
    lista.innerHTML = `
      <div class="loading-state no-anim">
        <span class="material-symbols-outlined">search_off</span>
        Nenhuma monitoria encontrada.
      </div>`;
    lmWrap.style.display = "none";
    return;
  }

  lista.innerHTML = monitorias.map(renderCard).join("");
  document.getElementById("loadMoreLabel").textContent =
    `Exibindo ${monitorias.length} de ${todasMonitorias.length} monitorias`;
  lmWrap.style.display = "block";
}

/* ─────────────────────────────────────────
   RENDERIZA CARD
───────────────────────────────────────── */
function renderCard(m) {
  const foto = m.monitor_foto
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.monitor_nome)}&background=3333FF&color=fff&size=96`;

  const online = (m.formato || "online").toLowerCase() === "online";
  const rating = m.avaliacao || 4.9;

  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="material-symbols-outlined"
      style="font-variation-settings:'FILL' ${i < Math.floor(rating) ? 1 : 0}">star</span>`
  ).join("");

  const tagsList = (m.tags?.length ? m.tags : [m.assunto])
    .map(t => `<span class="tag-materia">${t}</span>`).join("");

  const slots = m.horarios?.length
    ? m.horarios.map(s => `<span class="slot">${s}</span>`).join("")
    : `<span class="slot">${m.data || "A definir"}</span>
       <span class="slot">${m.horario_inicio || "–"}–${m.horario_fim || "–"}</span>`;

  const vagasRestantes = (m.vagas || 5) - (m.inscritos?.length || 0);
  const vagasLabel = vagasRestantes <= 1
    ? `<span class="vagas-alerta">${vagasRestantes} vaga restante</span>`
    : `<span class="vagas-ok">${vagasRestantes} vagas</span>`;
  const equipe = m.equipe || "Equipe 1";

  return `
    <article class="card-monitoria">
      <div class="card-dot"></div>
      <div class="card-top">
        <img src="${foto}" alt="${m.monitor_nome}" class="card-avatar"
             onerror="this.src='https://ui-avatars.com/api/?name=M&background=3333FF&color=fff&size=96'">
        <div class="card-meta">
          <span class="card-nome">${m.monitor_nome}</span>
          <span class="card-sub">Monitor \u2022 ${equipe}</span>
        </div>
        <span class="badge-formato ${online ? "badge-online" : "badge-presencial"}">
          ${online ? "ONLINE" : "PRESENCIAL"}
        </span>
      </div>
      ${m.titulo ? `<p class="card-titulo">${m.titulo}</p>` : ""}
      <div class="card-tags">${tagsList}</div>
      <div class="card-rating">
        <div class="stars-row">${stars}</div>
        <span class="rating-num">${rating.toFixed(1).replace(".", ",")}</span>
        <span class="rating-cnt">(${m.avaliacoes_count || 0} Avaliações)</span>
        <span class="rating-sep">\u00b7</span>
        ${vagasLabel}
      </div>
      <div class="card-slots">${slots}</div>
      <div class="card-acoes">
        <button class="btn-agendar"
          onclick="window.location.href='/confirmacao?id=${m.id}'">
          Agendar Monitoria
        </button>
        <button class="btn-perfil"
          onclick="window.location.href='/perfil?id=${m.monitor_id}'">
          Ver Perfil
        </button>
      </div>
    </article>`;
}