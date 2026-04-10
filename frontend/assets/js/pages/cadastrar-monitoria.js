document.addEventListener("DOMContentLoaded", function () {
  var count = 8;
  var countEl = document.getElementById("count");
  var plusButton = document.getElementById("plus");
  var minusButton = document.getElementById("minus");
  var addSlotButton = document.getElementById("addSlot");
  var slotsContainer = document.getElementById("slots");

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

  if (addSlotButton && slotsContainer) {
    addSlotButton.addEventListener("click", function () {
      var times = document.querySelectorAll('input[type="time"]');
      var start = times[0] ? times[0].value : "";
      var end = times[1] ? times[1].value : "";
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

  renderCount();
});