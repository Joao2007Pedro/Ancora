import { protegerPagina } from "../utils/auth-guard.js";

protegerPagina();

document.addEventListener("DOMContentLoaded", function () {
  var calendar = document.querySelector(".calendar");
  if (!calendar) {
    return;
  }

  var slots = calendar.querySelectorAll(".col button");
  var dayHeaders = calendar.querySelectorAll(".day");
  var selectedDayShort = document.getElementById("selectedDayShort");
  var selectedDayNumber = document.getElementById("selectedDayNumber");
  var selectedDateTime = document.getElementById("selectedDateTime");

  function updateSelectionInfo(button) {
    var parentColumn = button.closest(".col");
    if (!parentColumn) {
      return;
    }

    var columns = Array.from(calendar.querySelectorAll(".col"));
    var columnIndex = columns.indexOf(parentColumn);
    var day = dayHeaders[columnIndex];

    if (!day) {
      return;
    }

    var dayShort = day.getAttribute("data-day-short") || "";
    var dayNumber = day.getAttribute("data-day-number") || "";
    var dayLabel = day.getAttribute("data-day-label") || dayShort;
    var hour = button.textContent.trim();

    if (selectedDayShort) {
      selectedDayShort.textContent = dayShort;
    }

    if (selectedDayNumber) {
      selectedDayNumber.textContent = dayNumber;
    }

    if (selectedDateTime) {
      selectedDateTime.textContent = dayLabel + " às " + hour;
    }
  }

  slots.forEach(function (button) {
    button.addEventListener("click", function () {
      if (button.disabled) {
        return;
      }

      calendar.querySelectorAll(".selected").forEach(function (selected) {
        selected.classList.remove("selected");
      });

      button.classList.add("selected");
      updateSelectionInfo(button);
    });
  });

  var initialSelected = calendar.querySelector(".col button.selected");
  if (initialSelected) {
    updateSelectionInfo(initialSelected);
  }
});