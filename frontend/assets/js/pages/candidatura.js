import { protegerPagina } from "../utils/auth-guard.js";
import { criarCandidatura, buscarCandidaturaDoUsuario } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

const estadoEl = document.querySelector("#estado-candidatura");
const formEl = document.querySelector("#form-candidatura");
const msgErro = document.querySelector("#msg-erro");

function mostrarEstado(candidatura) {
  if (!estadoEl || !formEl) return;

  formEl.style.display = "none";
  estadoEl.style.display = "block";

  const cores = {
    pendente: {
      bg: "var(--aviso)",
      texto: "Sua candidatura está em análise. Em breve você receberá uma resposta."
    },
    aprovada: {
      bg: "var(--sucesso)",
      texto: "Parabéns! Sua candidatura foi aprovada. Você já é um monitor."
    },
    rejeitada: {
      bg: "var(--erro)",
      texto: "Sua candidatura não foi aprovada desta vez. Tente novamente mais tarde."
    }
  };

  const estado = cores[candidatura?.status] || cores.pendente;
  estadoEl.style.background = estado.bg;
  estadoEl.innerHTML = `<p>${estado.texto}</p>`;
}

observarSessao(async (usuario) => {
  if (!usuario) return;

  try {
    const candidatura = await buscarCandidaturaDoUsuario(usuario.uid);

    if (candidatura) {
      mostrarEstado(candidatura);
      return;
    }

    if (formEl) {
      formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (msgErro) msgErro.textContent = "";

        try {
          const assuntos = [...document.querySelectorAll(".assunto-check input:checked")].map((cb) => cb.value);
          const motivo = document.querySelector("#motivo")?.value.trim() || "";

          if (assuntos.length === 0) {
            if (msgErro) msgErro.textContent = "Selecione pelo menos um assunto.";
            return;
          }

          if (motivo.length < 30) {
            if (msgErro) msgErro.textContent = "Escreva um pouco mais sobre sua motivação (mínimo 30 caracteres).";
            return;
          }

          await criarCandidatura(usuario.uid, usuario.displayName || "Aluno", usuario.email || "", assuntos, motivo);
          mostrarEstado({ status: "pendente" });
        } catch (err) {
          console.error("Erro ao enviar candidatura:", err);
          if (msgErro) msgErro.textContent = err.message || "Não foi possível enviar a candidatura.";
        }
      });
    }
  } catch (error) {
    console.error("Erro de candidatura:", error);
    if (msgErro) msgErro.textContent = "Erro ao carregar candidatura. Tente novamente.";
  }
});
