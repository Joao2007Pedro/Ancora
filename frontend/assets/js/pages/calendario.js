let protegerPagina = () => {};
let observarSessao = (callback) => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  callback(userData.uid ? { uid: userData.uid } : null);
};
let buscarMonitorias = async () => [];
let buscarMonitoriasDoMonitor = async () => [];

async function inicializarDependenciasAgenda() {
  try {
    const [guard, auth, db] = await Promise.all([
      import("../utils/auth-guard.js"),
      import("../auth.js"),
      import("../utils/firebase-db.js")
    ]);

    protegerPagina = guard.protegerPagina || protegerPagina;
    observarSessao = auth.observarSessao || observarSessao;
    buscarMonitorias = db.buscarMonitorias || buscarMonitorias;
    buscarMonitoriasDoMonitor = db.buscarMonitoriasDoMonitor || buscarMonitoriasDoMonitor;

    protegerPagina();
  } catch (error) {
    void error;
  }
}

const monthNames = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const weekDayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const weekDayFull = ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"];

const state = {
  currentUser: null,
  userType: "student",
  monitorias: [],
  visibleMonitorias: [],
  selectedDateIso: null,
  currentMonthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
};

function getUserType() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  if (userData.userType === "monitor" || userData.perfil === "monitor") {
    return "monitor";
  }
  return "student";
}

function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function getLocalTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isTodayOrFuture(monitoria) {
  const iso = toIsoDate(monitoria?.data);
  if (!iso) return false;
  const todayIso = getLocalTodayIso();
  return iso >= todayIso;
}

function formatDateTitle(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  const weekDay = weekDayFull[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = monthNames[d.getMonth()];
  return `${weekDay}, ${day} de ${month}`;
}

function buildEventCard(monitoria) {
  const formato = (monitoria.formato || "online").toUpperCase();
  const assunto = monitoria.assunto || "Monitoria";
  const titulo = monitoria.titulo || assunto;
  const descricao = monitoria.descricao || "Sem descricao.";
  const horarioInicio = monitoria.horario_inicio || "--:--";
  const horarioFim = monitoria.horario_fim || "--:--";
  const salaDiscord = monitoria.sala_discord_nome || "";
  const confirmarHref = monitoria.id ? `/confirmacao?id=${encodeURIComponent(monitoria.id)}` : "/confirmacao";

  return `
    <article class="event-item">
      <div class="event-top">
        <strong>${titulo}</strong>
        <span class="event-badge">${formato}</span>
      </div>
      <p class="event-topic">${assunto}</p>
      <p class="event-time">${horarioInicio} - ${horarioFim}</p>
      <p class="event-monitor">Monitor: ${monitoria.monitor_nome || "A definir"}</p>
      ${salaDiscord ? `<p class="event-room">${salaDiscord}</p>` : ""}
      <p class="event-description">${descricao}</p>
      <div class="event-actions">
        <a class="event-confirm" href="${confirmarHref}">Confirmar presença</a>
      </div>
    </article>
  `;
}

function updateFooterSelection(isoDate) {
  const dayShortEl = document.getElementById("selectedDayShort");
  const dayNumberEl = document.getElementById("selectedDayNumber");
  const dateTimeEl = document.getElementById("selectedDateTime");
  const dateTitleEl = document.getElementById("selectedDateTitle");

  if (!isoDate) {
    if (dayShortEl) dayShortEl.textContent = "---";
    if (dayNumberEl) dayNumberEl.textContent = "--";
    if (dateTimeEl) dateTimeEl.textContent = "Nenhuma data selecionada";
    if (dateTitleEl) dateTitleEl.textContent = "Selecione uma data";
    return;
  }

  const d = new Date(`${isoDate}T00:00:00`);
  if (dayShortEl) dayShortEl.textContent = weekDayShort[d.getDay()];
  if (dayNumberEl) dayNumberEl.textContent = String(d.getDate()).padStart(2, "0");
  if (dateTimeEl) dateTimeEl.textContent = formatDateTitle(isoDate);
  if (dateTitleEl) dateTitleEl.textContent = formatDateTitle(isoDate);
}

function renderEventsForDate(isoDate) {
  const eventsList = document.getElementById("eventsList");
  if (!eventsList) return;

  if (!isoDate) {
    eventsList.innerHTML = `<p class="empty">Selecione um dia para ver as monitorias.</p>`;
    return;
  }

  const events = state.visibleMonitorias
    .filter((m) => toIsoDate(m.data) === isoDate)
    .sort((a, b) => String(a.horario_inicio || "").localeCompare(String(b.horario_inicio || "")));

  if (events.length === 0) {
    eventsList.innerHTML = `<p class="empty">Nenhuma monitoria para esta data.</p>`;
    return;
  }

  eventsList.innerHTML = events.map(buildEventCard).join("");
}

function renderCalendar() {
  const monthLabel = document.getElementById("monthLabel");
  const calendarGrid = document.getElementById("calendarGrid");
  if (!monthLabel || !calendarGrid) return;

  const year = state.currentMonthDate.getFullYear();
  const month = state.currentMonthDate.getMonth();
  const firstDayWeekIndex = new Date(year, month, 1).getDay();
  const monthLength = new Date(year, month + 1, 0).getDate();

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const days = [];
  for (let i = 0; i < firstDayWeekIndex; i += 1) {
    days.push(`<button class="day-cell day-cell--empty" disabled></button>`);
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  for (let day = 1; day <= monthLength; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = state.visibleMonitorias.filter((m) => toIsoDate(m.data) === iso).length;
    const isToday = iso === todayIso;
    const isSelected = iso === state.selectedDateIso;

    days.push(`
      <button type="button" class="day-cell${isToday ? " day-cell--today" : ""}${isSelected ? " day-cell--selected" : ""}" data-date="${iso}">
        <span class="day-number">${day}</span>
        ${count > 0 ? `<span class="day-count">${count} monitoria${count > 1 ? "s" : ""}</span>` : ""}
      </button>
    `);
  }

  calendarGrid.innerHTML = days.join("");

  calendarGrid.querySelectorAll(".day-cell[data-date]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedDateIso = btn.dataset.date;
      renderCalendar();
      updateFooterSelection(state.selectedDateIso);
      renderEventsForDate(state.selectedDateIso);
    });
  });
}

async function loadAgendaForUser() {
  if (!state.currentUser?.uid) {
    state.monitorias = [];
    state.visibleMonitorias = [];
    state.selectedDateIso = new Date().toISOString().slice(0, 10);
    state.currentMonthDate = new Date(`${state.selectedDateIso}T00:00:00`);
    state.currentMonthDate.setDate(1);
    renderCalendar();
    updateFooterSelection(state.selectedDateIso);
    renderEventsForDate(state.selectedDateIso);
    return;
  }

  let monitoriasVisiveis = [];

  try {
    const resultados = await buscarMonitorias({ status: "ativa" });

    monitoriasVisiveis = resultados.filter((monitoria) => {
      const dataConvertida = toIsoDate(monitoria.data);
      const futuro = isTodayOrFuture(monitoria);
      return futuro;
    });
  } catch (error) {
    void error;
  }

  if (monitoriasVisiveis.length === 0 && state.userType === "monitor") {
    try {
      monitoriasVisiveis = (await buscarMonitoriasDoMonitor(state.currentUser.uid)).filter(isTodayOrFuture);
    } catch (error) {
      void error;
    }
  }

  state.monitorias = monitoriasVisiveis;
  state.visibleMonitorias = monitoriasVisiveis;

  const firstUpcoming = state.visibleMonitorias
    .map((m) => toIsoDate(m.data))
    .filter(Boolean)
    .sort()[0];

  state.selectedDateIso = firstUpcoming || new Date().toISOString().slice(0, 10);
  state.currentMonthDate = new Date(`${state.selectedDateIso}T00:00:00`);
  state.currentMonthDate.setDate(1);

  renderCalendar();
  updateFooterSelection(state.selectedDateIso);
  renderEventsForDate(state.selectedDateIso);
}

function bindStaticActions() {
  const btnPrev = document.getElementById("btnPrevMonth");
  const btnNext = document.getElementById("btnNextMonth");
  const btnHome = document.getElementById("btnGoHome");
  const btnMonitorias = document.getElementById("btnGoMonitorias");

  btnPrev?.addEventListener("click", () => {
    state.currentMonthDate = new Date(state.currentMonthDate.getFullYear(), state.currentMonthDate.getMonth() - 1, 1);
    renderCalendar();
  });

  btnNext?.addEventListener("click", () => {
    state.currentMonthDate = new Date(state.currentMonthDate.getFullYear(), state.currentMonthDate.getMonth() + 1, 1);
    renderCalendar();
  });

  btnHome?.addEventListener("click", () => {
    window.location.href = "/home";
  });

  btnMonitorias?.addEventListener("click", () => {
    window.location.href = "/minhas-monitorias";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindStaticActions();
  renderCalendar();
  updateFooterSelection(null);
  renderEventsForDate(null);

  void inicializarDependenciasAgenda();

  observarSessao(async (usuario) => {
    if (!usuario) return;
    state.currentUser = usuario;
    state.userType = getUserType();

    try {
      await loadAgendaForUser();
    } catch (error) {
      const eventsList = document.getElementById("eventsList");
      if (eventsList) {
        eventsList.innerHTML = `<p class="empty">Erro ao carregar agenda. Tente novamente.</p>`;
      }
      void error;
    }
  });
});
