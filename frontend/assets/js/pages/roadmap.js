/* ============================================
   DOM READY
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {

    /* --- Animate progress bar on load --- */
    var progressFill = document.getElementById("progressFill");
    if (progressFill) {
        setTimeout(function () {
            progressFill.style.width = "33.33%";
        }, 300);
    }

    /* --- Filter bar toggle --- */
    var filterBar = document.getElementById("filterBar");
    if (filterBar) {
        var filterButtons = filterBar.querySelectorAll(".filter-btn");

        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                filterButtons.forEach(function (b) {
                    b.classList.remove("filter-btn--active");
                });
                btn.classList.add("filter-btn--active");
            });
        });
    }

    /* --- "Continuar Estudo" button feedback --- */
    var btnContinue = document.getElementById("btnContinue");
    if (btnContinue) {
        var originalContinueHtml = btnContinue.innerHTML;
        var resetContinueTimer = null;

        btnContinue.addEventListener("click", function () {
            if (btnContinue.disabled) {
                return;
            }

            btnContinue.textContent = "Carregando...";
            btnContinue.disabled = true;
            btnContinue.style.opacity = "0.6";

            if (resetContinueTimer) {
                clearTimeout(resetContinueTimer);
            }

            resetContinueTimer = setTimeout(function () {
                btnContinue.innerHTML = originalContinueHtml;
                btnContinue.disabled = false;
                btnContinue.style.opacity = "1";
            }, 1500);
        });
    }

    /* --- "Novo Estudo" button bounce --- */
    var btnNewStudy = document.getElementById("btnNewStudy");
    if (btnNewStudy) {
        btnNewStudy.addEventListener("click", function () {
            btnNewStudy.style.transform = "scale(0.95)";
            setTimeout(function () {
                btnNewStudy.style.transform = "scale(1)";
            }, 150);
        });
    }

});