import { observarSessao } from "../auth.js";

export function protegerPagina() {
  observarSessao((usuario) => {
    if (!usuario) {
      window.location.href = "/frontend/pages/login.html";
    }
  });
}

export function redirecionarSeLogado() {
  observarSessao((usuario) => {
    if (usuario) {
      window.location.href = "/frontend/pages/home.html";
    }
  });
}
