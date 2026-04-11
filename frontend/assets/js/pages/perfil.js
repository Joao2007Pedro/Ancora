import { protegerPagina } from "../utils/auth-guard.js";

/**
 * perfil.js
 *
 * Interações da página de perfil do monitor.
 * Em produção, os dados devem vir de firebase-db.js.
 */

// ─────────────────────────────────────────────
// MOCK DATA  (replace with firebase-db calls)
// ─────────────────────────────────────────────
const monitorData = {
  id: "monitor_001",
  nome: "Ricardo Santos",
  role: "Monitor • Equipe 1",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFfABGNLMoZ-8X_jfXvc6GdUUdwVVWKJkY0cxC-TfTDAmGiVt2bjp4zOH_Yf6fYuQyfwPuueo8QCq1zIU7Zf_Udb4QkclkQV8ukX81urZkcAiGZcWiMravBNuPdX56dxUH5q4esZRql_nj3ysolX7OK7nulJbDFRJ_PJOK1WqgvR4N-cvWTqadwAKUQjypwgpBl-Sc5Qa9qDjQ6nxv7J4OcfFgASj2sV9grBF0NxfQgGjlJd3Q6jHorgFOTlRqDSbL6CD0zgiaCMWh",
  rating: 4.9,
  avaliacoes: 32,
  tags: ["HTML & CSS", "JavaScript", "Git"],
  sobre:
    "Apaixonado por desenvolvimento web desde os 14 anos. Tenho experiência sólida em HTML, CSS e JavaScript e gosto de ensinar com exemplos práticos do dia a dia.",
  online: true,
  horarios: [
    { dia: "Terça-Feira", hora: "14:00 - 15:00" },
    { dia: "Sexta-Feira", hora: "14:00 - 15:00" },
  ],
};

const feitasData = [
  {
    id: "g1",
    curso: "CURSO BÁSICO DE HTML E CSS",
    aula: "AULA 1",
    titulo: "Práticas de Flexbox",
    tags: ["HTML & CSS", "INICIANTE"],
    descricao:
      "Nesta aula, você vai aprender como o Flexbox revolucionou o layout no CSS. Esqueça o uso de float ou cálculos complexos de margens: aprenda a alinhar elementos de forma inteligente e responsiva com...",
    thumb: null,
  },
  {
    id: "g2",
    curso: "CURSO BÁSICO DE HTML E CSS",
    aula: "AULA 1",
    titulo: "Práticas de Flexbox",
    tags: ["HTML & CSS", "INICIANTE"],
    descricao:
      "Nesta aula, você vai aprender como o Flexbox revolucionou o layout no CSS. Esqueça o uso de float ou cálculos complexos de margens: aprenda a alinhar elementos de forma inteligente e responsiva com...",
    thumb: null,
  },
  {
    id: "g3",
    curso: "CURSO BÁSICO DE HTML E CSS",
    aula: "AULA 2",
    titulo: "Grid Layout na Prática",
    tags: ["HTML & CSS", "INICIANTE"],
    descricao:
      "Aprenda a usar CSS Grid para criar layouts complexos de forma simples e eficiente. Veja exemplos reais e como combinar Grid com Flexbox para máxima flexibilidade...",
    thumb: null,
  },
  {
    id: "g4",
    curso: "CURSO BÁSICO DE HTML E CSS",
    aula: "AULA 3",
    titulo: "Animações com CSS",
    tags: ["HTML & CSS", "INTERMEDIÁRIO"],
    descricao:
      "Descubra como usar keyframes, transitions e transform para criar animações fluidas e profissionais diretamente no CSS, sem JavaScript...",
    thumb: null,
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Build star HTML for a given rating (0–5, supports half).
 * We keep it simple: all full stars since the mock is 4.9.
 */
function buildStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = "";
  for (let i = 0; i < full; i++) {
    html += `<span class="material-symbols-outlined icon-filled star">star</span>`;
  }
  if (half) {
    html += `<span class="material-symbols-outlined icon-filled star">star_half</span>`;
  }
  return html;
}

/**
 * Renders a single monitoria feita card element from data.
 */
function createFeitaCard(item, savedIds) {
  const isSaved = savedIds.has(item.id);
  const card = document.createElement("div");
  card.className = "feita-card";
  card.dataset.id = item.id;

  const tagHtml = item.tags
    .map((t, idx) =>
      `<span class="gtag ${idx === 0 ? "gtag-dark" : "gtag-accent"}">${escapeHtml(t)}</span>`
    )
    .join("");

  const thumbContent = item.thumb
    ? `<img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.titulo)}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
       <div class="thumb-fallback" style="display:none">
         <span class="material-symbols-outlined">play_circle</span>
       </div>`
    : `<div class="thumb-fallback">
         <span class="material-symbols-outlined">play_circle</span>
       </div>`;

  card.innerHTML = `
    <div class="feita-thumb">
      ${thumbContent}
      <div class="thumb-overlay">
        <div class="tag-curso">${escapeHtml(item.curso)}</div>
        <div class="tag-aula">${escapeHtml(item.aula)}</div>
      </div>
      <button class="btn-bookmark${isSaved ? " saved" : ""}" aria-label="Salvar" data-id="${item.id}">
        <span class="material-symbols-outlined">bookmark</span>
      </button>
      <button class="btn-play-overlay" aria-label="Reproduzir ${escapeHtml(item.titulo)}">
        <span class="material-symbols-outlined icon-filled">play_circle</span>
      </button>
    </div>
    <div class="feita-info">
      <div class="feita-tags">${tagHtml}</div>
      <h4>${escapeHtml(item.titulo)}</h4>
      <p>${escapeHtml(item.descricao)}</p>
    </div>
  `;

  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────
// SAVED / BOOKMARK STATE  (localStorage)
// ─────────────────────────────────────────────
const SAVED_KEY = "proa_saved_feitas";

function getSavedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function toggleSaved(id) {
  const saved = getSavedIds();
  if (saved.has(id)) {
    saved.delete(id);
  } else {
    saved.add(id);
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
  return saved.has(id);
}

// ─────────────────────────────────────────────
// RENDER PROFILE
// ─────────────────────────────────────────────
function renderProfile(data) {
  // Avatar
  const avatarImg = document.getElementById("monitorAvatar");
  if (avatarImg && data.avatar) avatarImg.src = data.avatar;

  const headerActions = document.querySelector("app-header-actions");
  if (headerActions && data.avatar) {
    headerActions.setAttribute("avatar-src", data.avatar);
    headerActions.setAttribute("profile-name", data.nome);
  }

  // Online badge
  const onlineBadge = document.getElementById("onlineBadge");
  if (onlineBadge) onlineBadge.style.display = data.online ? "block" : "none";

  // Name / role
  const nomeEl = document.getElementById("monitorNome");
  if (nomeEl) nomeEl.textContent = data.nome;

  const roleEl = document.getElementById("monitorRole");
  if (roleEl) roleEl.textContent = data.role;

  // Rating
  const ratingRow = document.getElementById("ratingRow");
  if (ratingRow) {
    ratingRow.querySelector(".stars").innerHTML = buildStars(data.rating);
    ratingRow.querySelector(".rating-value").textContent = String(data.rating).replace(".", ",");
    ratingRow.querySelector(".rating-count").textContent = `(${data.avaliacoes} Avaliações)`;
  }

  // Tags
  const tagsRow = document.getElementById("tagsRow");
  if (tagsRow) {
    tagsRow.innerHTML = data.tags
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");
  }

  // Sobre
  const sobreEl = document.getElementById("sobreTexto");
  if (sobreEl) sobreEl.textContent = data.sobre;

  // Horarios
  const horariosList = document.getElementById("horariosList");
  if (horariosList) {
    horariosList.innerHTML = data.horarios
      .map(
        (h) => `
        <div class="horario-item">
          <div class="horario-info">
            <span class="dia">${escapeHtml(h.dia)}</span>
            <span class="hora">${escapeHtml(h.hora)}</span>
          </div>
          <button class="btn-disponivel">Disponível</button>
        </div>
      `
      )
      .join("");

    // Bind schedule buttons
    horariosList.querySelectorAll(".btn-disponivel").forEach((btn) => {
      btn.addEventListener("click", () => handleAgendarSessao(btn));
    });
  }
}

// ─────────────────────────────────────────────
// RENDER FEITAS
// ─────────────────────────────────────────────
const PAGE_SIZE = 2;
let visibleCount = PAGE_SIZE;

function renderFeitas() {
  const grid = document.getElementById("feitasGrid");
  const loadMoreSection = document.getElementById("loadMoreSection");
  const loadMoreLabel = document.getElementById("loadMoreLabel");
  if (!grid) return;

  const savedIds = getSavedIds();

  grid.innerHTML = "";
  feitasData.slice(0, visibleCount).forEach((item) => {
    grid.appendChild(createFeitaCard(item, savedIds));
  });

  // Update label
  if (loadMoreLabel) {
    loadMoreLabel.textContent = `Exibindo ${Math.min(visibleCount, feitasData.length)} de ${feitasData.length} monitorias feitas`;
  }

  // Hide load-more when all are shown
  if (loadMoreSection) {
    if (visibleCount >= feitasData.length) {
      loadMoreSection.classList.add("all-loaded");
    } else {
      loadMoreSection.classList.remove("all-loaded");
    }
  }

  // Re-bind bookmark buttons
  bindBookmarks();
}

// ─────────────────────────────────────────────
// BOOKMARK INTERACTION
// ─────────────────────────────────────────────
function bindBookmarks() {
  document.querySelectorAll(".btn-bookmark").forEach((btn) => {
    // Remove old listeners by cloning
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = fresh.dataset.id;
      const isNowSaved = toggleSaved(id);
      fresh.classList.toggle("saved", isNowSaved);
      fresh.setAttribute(
        "aria-label",
        isNowSaved ? "Remover dos salvos" : "Salvar"
      );

      // Brief visual feedback
      fresh.style.transform = "scale(1.3)";
      setTimeout(() => {
        fresh.style.transform = "";
      }, 200);
    });
  });
}

// ─────────────────────────────────────────────
// SCHEDULE BUTTON
// ─────────────────────────────────────────────
function handleAgendarSessao(btn) {
  const item = btn.closest(".horario-item");
  const dia = item?.querySelector(".dia")?.textContent || "";
  const hora = item?.querySelector(".hora")?.textContent || "";

  // Visual feedback
  btn.textContent = "Agendado ✓";
  btn.style.background = "var(--lime)";
  btn.style.color = "var(--navy)";
  btn.disabled = true;

  // In production: call agendarSessao(monitorData.id, dia, hora)
  console.info(`[perfil-do-monitor] Agendar sessão — ${dia} ${hora}`);
}

// ─────────────────────────────────────────────
// BACK BUTTON
// ─────────────────────────────────────────────
function initBackButton() {
  const btn = document.getElementById("btnVoltar");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // In production: history.back() or navigate to /monitorias
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "./minhas-monitorias.html";
    }
  });
}

// ─────────────────────────────────────────────
// LOAD MORE
// ─────────────────────────────────────────────
function initLoadMore() {
  const btn = document.getElementById("btnCarregarMais");
  if (!btn) return;

  btn.addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderFeitas();

    // Scroll to newly added cards smoothly
    const grid = document.getElementById("feitasGrid");
    if (grid) {
      const cards = grid.querySelectorAll(".feita-card");
      const firstNew = cards[visibleCount - PAGE_SIZE];
      if (firstNew) {
        firstNew.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });
}

// ─────────────────────────────────────────────
// URL PARAMS  (for real navigation: ?monitorId=xxx)
// ─────────────────────────────────────────────
function getMonitorIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("monitorId") || null;
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  protegerPagina();

  // In production you would do:
  // const monitorId = getMonitorIdFromUrl();
  // const data = await buscarMonitorPorId(monitorId);
  // renderProfile(data);

  renderProfile(monitorData);
  renderFeitas();
  initBackButton();
  initLoadMore();

  console.info("[perfil-do-monitor] Página inicializada.");
});