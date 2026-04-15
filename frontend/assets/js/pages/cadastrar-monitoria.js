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

  document.querySelectorAll(".day").forEach(function (day) {
    day.addEventListener("click", function () {
      document.querySelectorAll(".day").forEach(function (item) {
        item.classList.remove("active");
      });
      day.classList.add("active");
    });
  });

  /* ── Seleção de sala Discord ── */
  document.querySelectorAll(".sala-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".sala-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var linkInput = document.getElementById("link-discord");
      if (linkInput) linkInput.value = btn.dataset.link;
    });
  });

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

    if (!assunto || !titulo) {
      alert("Preencha pelo menos o assunto e o título.");
      return;
    }

    try {
      await criarMonitoria({
        titulo,
        descricao,
        assunto,
        nivel,
        formato,
        vagas,
        monitor_id: usuarioAtual.uid,
        monitor_nome: usuarioAtual.displayName || "Monitor",
        monitor_foto: usuarioAtual.photoURL || "",
        data,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        link_discord: linkDiscord
      });
      alert("Monitoria criada com sucesso!");
      window.location.href = "./home.html";
    } catch (err) {
      console.error(err);
      alert("Erro ao criar monitoria: " + err.message);
    }
  });

  renderCount();
});