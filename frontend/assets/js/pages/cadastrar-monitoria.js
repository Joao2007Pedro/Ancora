import { protegerPagina } from "../utils/auth-guard.js";
import { criarMonitoria } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

let usuarioAtual = null;
observarSessao((u) => {
  usuarioAtual = u;
});

document.addEventListener("DOMContentLoaded", function () {
  var count = 8;
  var countEl = document.getElementById("count");
  var plusButton = document.getElementById("plus");
  var minusButton = document.getElementById("minus");
  var addSlotButton = document.getElementById("addSlot");
  var slotsContainer = document.getElementById("slots");
  var criarButton = document.getElementById("btn-criar-monitoria");
  var cancelarButton = document.getElementById("btn-cancelar-monitoria");
  var discordStatusEl = document.getElementById("discord-status");
  var salaSelecionada = null;

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
    });
  }

  criarButton?.addEventListener("click", async function () {
    if (!usuarioAtual) return;

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
        sala_discord_nome: salaDiscordNome,
        link_discord: linkDiscord,
        status: "pendente_aprovacao"
      });
      alert("Monitoria enviada para aprovação do admin.");
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      alert("Erro ao criar monitoria: " + err.message);
    }
  });

  cancelarButton?.addEventListener("click", function () {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/home";
  });

  renderCount();
});