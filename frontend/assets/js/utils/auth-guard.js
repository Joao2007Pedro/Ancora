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
  return new Promise((resolve, reject) => {
    let resolvido = false;

    observarSessao(async (usuario) => {
      if (resolvido) return; // Evita executar o callback múltiplas vezes

      if (!usuario) {
        resolvido = true;
        window.location.href = "/login";
        reject(new Error('Não autenticado'));
        return;
      }

      try {
        const isAdmin = await verificarSeAdmin(usuario.uid);
        if (!isAdmin) {
          resolvido = true;
          window.location.href = "/home";
          reject(new Error('Não é admin'));
        } else {
          resolvido = true;
          resolve();
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        resolvido = true;
        window.location.href = "/home";
        reject(error);
      }
    });
  });
}
