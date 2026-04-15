let protegerPagina = () => {};
let criarMonitoria = async () => {
  throw new Error("Serviço indisponível no momento.");
};
let observarSessao = (callback) => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  callback(userData.uid ? { uid: userData.uid, displayName: userData.nome || "", photoURL: userData.foto_url || "" } : null);
};

let usuarioAtual = null;

async function inicializarDependencias() {
  try {
    const [guard, db, auth] = await Promise.all([
      import("../utils/auth-guard.js"),
      import("../utils/firebase-db.js"),
      import("../auth.js")
    ]);

    protegerPagina = guard.protegerPagina || protegerPagina;
    criarMonitoria = db.criarMonitoria || criarMonitoria;
    observarSessao = auth.observarSessao || observarSessao;

    protegerPagina();
    observarSessao((u) => {
      usuarioAtual = u;
    });

    console.log("[Ancora] Integrações de cadastro carregadas com sucesso.");
  } catch (error) {
    console.error("[Ancora] Falha crítica nas dependências do cadastro:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  void inicializarDependencias();

  var count = 8;
  var currentStep = 1;
  var countEl = document.getElementById("count");
  var plusButton = document.getElementById("plus");
  var minusButton = document.getElementById("minus");
  var addSlotButton = document.getElementById("addSlot");
  var slotsContainer = document.getElementById("slots");
  var stepPanels = Array.from(document.querySelectorAll(".wizard-step"));
  var criarButton = document.getElementById("btn-criar-monitoria");
  var cancelarButton = document.getElementById("btn-cancelar-monitoria");
  var voltarButton = document.getElementById("btn-voltar-monitoria");
  var proximoButton = document.getElementById("btn-proximo-monitoria");
  var progressSpan = document.querySelector(".progress span");
  var progressFill = document.querySelector(".fill");
  var resumoMonitoria = document.getElementById("resumo-monitoria");
  var discordStatusEl = document.getElementById("discord-status");
  var salaSelecionada = null;
  var horariosSelecionados = [];

  function gerarProximasDatas() {
    var diasWrap = document.querySelector(".days");
    if (!diasWrap) return;

    var base = new Date();
    base.setHours(0, 0, 0, 0);
    var botoes = [];

    for (var i = 0; i < 5; i += 1) {
      var d = new Date(base);
      d.setDate(base.getDate() + i);
      var iso = d.toISOString().slice(0, 10);
      botoes.push(
        '<button type="button" class="day' + (i === 0 ? ' active' : '') + '" data-data="' + iso + '">' + d.getDate() + '</button>'
      );
    }

    diasWrap.innerHTML = botoes.join("");
  }

  gerarProximasDatas();

  var firstDay = document.querySelector(".day");
  if (firstDay) {
    firstDay.classList.add("active");
  }

  const diasWrap = document.querySelector('.days');
  diasWrap?.addEventListener('click', function (event) {
    const day = event.target.closest('.day');
    if (!day || !diasWrap.contains(day)) return;

    document.querySelectorAll('.day').forEach(function (item) {
      item.classList.remove('active');
    });

    day.classList.add('active');
  });

  function renderCount() {
    if (countEl) {
      countEl.textContent = String(count);
    }
  }

  if (plusButton) {
    plusButton.addEventListener("click", function () {
      count += 1;
      renderCount();
    });
  }

  if (minusButton) {
    minusButton.addEventListener("click", function () {
      if (count > 1) {
        count -= 1;
        renderCount();
      }
    });
  }

  document.querySelectorAll(".chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (chip) {
        chip.classList.remove("active");
      });
      btn.classList.add("active");
    });
  });

  document.querySelectorAll(".toggle-group").forEach(function (group) {
    var buttons = group.querySelectorAll("button");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });
  });

  function obterValorAtivo(selector, fallback) {
    var active = document.querySelector(selector);
    return active ? (active.dataset?.nivel || active.dataset?.formato || active.textContent.trim()) : fallback;
  }

  function atualizarResumo() {
    if (!resumoMonitoria) return;

    var assunto = document.querySelector(".chip.active")?.textContent.trim() || "Não definido";
    var titulo = document.querySelector("#titulo-monitoria")?.value.trim() || "Sem título";
    var descricao = document.querySelector("#descricao-monitoria")?.value.trim() || "Sem descrição";
    var nivel = document.querySelector(".nivel-btn.active")?.textContent.trim() || "Não definido";
    var formato = document.querySelector(".formato-btn.active")?.textContent.trim() || "Não definido";
    var vagas = document.querySelector("#count")?.textContent.trim() || "0";
    var dia = document.querySelector(".day.active")?.dataset.data || "Sem data";
    var inicio = document.querySelector("#horario-inicio")?.value || "--:--";
    var fim = document.querySelector("#horario-fim")?.value || "--:--";
    var sala = salaSelecionada?.nome || "Sem sala selecionada";
    var listaHorarios = horariosSelecionados.length
      ? horariosSelecionados.map(function (item) { return `<li>${item}</li>`; }).join("")
      : `<li>Dia ${dia} • ${inicio} - ${fim}</li>`;

    resumoMonitoria.innerHTML = `
      <div class="review-item"><strong>Título</strong><p>${titulo}</p></div>
      <div class="review-item"><strong>Tema</strong><p>${assunto}</p></div>
      <div class="review-item"><strong>Descrição</strong><p>${descricao}</p></div>
      <div class="review-grid">
        <div class="review-item"><strong>Nível</strong><p>${nivel}</p></div>
        <div class="review-item"><strong>Formato</strong><p>${formato}</p></div>
        <div class="review-item"><strong>Vagas</strong><p>${vagas}</p></div>
        <div class="review-item"><strong>Sala</strong><p>${sala}</p></div>
      </div>
      <div class="review-item"><strong>Horários</strong><ul>${listaHorarios}</ul></div>
    `;
  }

  function atualizarUIStep() {
    stepPanels.forEach(function (panel) {
      panel.classList.toggle("active", Number(panel.dataset.step) === currentStep);
    });

    if (progressSpan) {
      progressSpan.textContent = "PASSO " + String(currentStep).padStart(2, "0") + " DE 03";
    }

    if (progressFill) {
      progressFill.style.width = (currentStep / 3) * 100 + "%";
    }

    if (voltarButton) {
      voltarButton.hidden = currentStep === 1;
    }

    if (proximoButton) {
      proximoButton.hidden = currentStep !== 1 && currentStep !== 2;
    }

    if (criarButton) {
      criarButton.hidden = currentStep !== 3;
    }

    atualizarResumo();
  }

  function irParaStep(step) {
    currentStep = Math.min(3, Math.max(1, step));
    atualizarUIStep();
  }

  function validarStep1() {
    var titulo = document.querySelector("#titulo-monitoria")?.value.trim();
    if (!titulo) {
      alert("Preencha o título antes de continuar.");
      return false;
    }
    return true;
  }

  function validarStep2() {
    var inicio = document.querySelector("#horario-inicio")?.value || "";
    var fim = document.querySelector("#horario-fim")?.value || "";
    if (!inicio || !fim) {
      alert("Preencha o horário antes de continuar.");
      return false;
    }
    return true;
  }

  /* ── Seleção de sala Discord ── */
  function atualizarStatusDiscord() {
    if (!discordStatusEl) return;

    if (salaSelecionada?.link) {
      discordStatusEl.textContent = "Sala selecionada: " + (salaSelecionada.nome || "Discord");
      return;
    }

    discordStatusEl.textContent = "Discord opcional. Nenhuma sala selecionada.";
  }

  document.querySelectorAll(".sala-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".sala-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      var link = btn.dataset.link || "";
      var nome = btn.dataset.nome || btn.querySelector(".sala-nome")?.textContent.trim() || "";

      if (link) {
        btn.classList.add("active");
        salaSelecionada = { link: link, nome: nome || "Sala" };
      } else {
        salaSelecionada = null;
      }

      var linkInput = document.getElementById("link-discord");
      if (linkInput) linkInput.value = link;

      atualizarStatusDiscord();
      atualizarResumo();
    });
  });

  atualizarStatusDiscord();

  if (addSlotButton && slotsContainer) {
    addSlotButton.addEventListener("click", function () {
      var start = document.querySelector("#horario-inicio")?.value || "";
      var end = document.querySelector("#horario-fim")?.value || "";
      var activeDay = document.querySelector(".day.active");
      var day = activeDay ? activeDay.textContent.trim() : "--";

      if (!start || !end) {
        return;
      }

      var slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = "Dia " + day + " • " + start + " - " + end;

      slotsContainer.appendChild(slot);
      horariosSelecionados.push(slot.textContent);
      atualizarResumo();
    });
  }

  proximoButton?.addEventListener("click", function () {
    if (currentStep === 1 && !validarStep1()) return;
    if (currentStep === 2 && !validarStep2()) return;
    irParaStep(currentStep + 1);
  });

  voltarButton?.addEventListener("click", function () {
    irParaStep(currentStep - 1);
  });

  criarButton?.addEventListener("click", async function () {
    if (!usuarioAtual?.uid) {
      alert("Sua sessão ainda não foi carregada. Recarregue a página e entre novamente.");
      return;
    }

    var assunto = document.querySelector(".chip.active")?.textContent.trim();
    var titulo = document.querySelector("#titulo-monitoria")?.value.trim();
    var descricao = document.querySelector("#descricao-monitoria")?.value.trim();
    var nivel = document.querySelector(".nivel-btn.active")?.dataset.nivel;
    var formato = document.querySelector(".formato-btn.active")?.dataset.formato;
    var vagas = parseInt(document.querySelector("#count")?.textContent, 10) || 10;
    var data = document.querySelector(".day.active")?.dataset.data || "";
    var horarioInicio = document.querySelector("#horario-inicio")?.value || "";
    var horarioFim = document.querySelector("#horario-fim")?.value || "";
    var linkDiscord = document.querySelector("#link-discord")?.value || "";
    var salaDiscordNome = salaSelecionada?.nome || "";
    var horarios = horariosSelecionados.length
      ? horariosSelecionados.slice()
      : ["Dia " + (document.querySelector(".day.active")?.textContent.trim() || "--") + " • " + horarioInicio + " - " + horarioFim];

    if (!assunto || !titulo) {
      alert("Preencha pelo menos o assunto e o título.");
      return;
    }

    try {
      var userData = window.__ancoraUserData || JSON.parse(localStorage.getItem("userData") || "{}");

      await criarMonitoria({
        titulo,
        descricao,
        assunto,
        nivel,
        formato,
        vagas,
        monitor_id: usuarioAtual.uid,
        monitor_nome: userData.nome || usuarioAtual.displayName || "Monitor",
        monitor_foto: userData.foto_url || usuarioAtual.photoURL || "",
        data,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        horarios,
        sala_discord_nome: salaDiscordNome,
        link_discord: linkDiscord,
        status: "pendente_aprovacao"
      });
      alert("Monitoria enviada para aprovação do admin.");
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      alert("Erro ao criar monitoria: " + (err?.message || "falha inesperada"));
    }
  });

  cancelarButton?.addEventListener("click", function () {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/home";
  });

  ["input", "change", "click"].forEach(function (eventName) {
    document.addEventListener(eventName, function () {
      atualizarResumo();
    }, true);
  });

  atualizarUIStep();
  renderCount();
});