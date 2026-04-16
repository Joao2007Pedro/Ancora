import { observarSessao } from "../auth.js";
import { protegerPagina } from "../utils/auth-guard.js";

protegerPagina();

document.addEventListener("click", (event) => {
  const botao = event.target.closest(".resource-link");
  if (!botao) return;

  const url = botao.dataset.url;
  if (!url) return;

  window.open(url, "_blank", "noopener,noreferrer");
});

function getUserTypeFromStorage() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return userData.userType === "monitor" || userData.perfil === "monitor" ? "monitor" : "student";
}

function atualizarCopyDaPagina() {
  const userType = getUserTypeFromStorage();
  const titulo = document.querySelector(".titles-header h1");
  const subtitulo = document.querySelector(".titles-header p");

  document.title = userType === "monitor"
    ? "Âncora — Recursos"
    : "Âncora — Indicações";

  if (titulo) {
    titulo.textContent = userType === "monitor" ? "Recursos" : "Indicações";
  }

  if (subtitulo) {
    subtitulo.textContent = userType === "monitor"
      ? "Documentação, livros e vídeos para apoiar suas monitorias."
      : "Documentação, livros e vídeos para impulsionar seus estudos.";
  }
}

atualizarCopyDaPagina();

observarSessao((usuario) => {
  if (!usuario) return;

  const headerActions = document.querySelector("app-header-actions");
  if (!headerActions) return;

  if (usuario.photoURL) {
    headerActions.setAttribute("avatar-src", usuario.photoURL);
  }

  if (usuario.displayName) {
    headerActions.setAttribute("profile-name", usuario.displayName);
  }
});
