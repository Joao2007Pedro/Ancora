import { observarSessao } from "../auth.js";
import { verificarSeAdmin } from "./firebase-db.js";

export function protegerPagina() {
  observarSessao((usuario) => {
    if (!usuario) {
      window.location.href = "/login";
    }
  });
}

export function redirecionarSeLogado() {
  observarSessao((usuario) => {
    if (usuario && !window.__ancoraAuthFlowInProgress) {
      window.location.href = "/home";
    }
  });
}

export function protegerPaginaAdmin() {
  observarSessao(async (usuario) => {
    if (!usuario) {
      window.location.href = "/login";
      return;
    }

    try {
      const isAdmin = await verificarSeAdmin(usuario.uid);
      if (!isAdmin) {
        window.location.href = "/home";
      }
    } catch {
      window.location.href = "/home";
    }
  });
}
