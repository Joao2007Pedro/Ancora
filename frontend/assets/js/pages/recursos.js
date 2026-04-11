import { observarSessao } from "../auth.js";
import { protegerPagina } from "../utils/auth-guard.js";

protegerPagina();

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
