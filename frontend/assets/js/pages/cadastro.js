import { cadastrarEmail } from "../auth.js";
import { redirecionarSeLogado } from "../utils/auth-guard.js";

redirecionarSeLogado();

const form    = document.querySelector("#form-cadastro");
const msgErro = document.querySelector("#msg-erro");

function getCadastroErrorMessage(err) {
  switch (err?.code) {
    case "auth/configuration-not-found":
      return "Firebase Auth não configurado. Ative Email/Senha no Console.";
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "Senha fraca. Use pelo menos 6 caracteres.";
    default:
      return "Erro ao criar conta. Tente novamente.";
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgErro.textContent = "";
  const nome   = document.querySelector("#nome").value;
  const email  = document.querySelector("#email").value;
  const senha  = document.querySelector("#senha").value;
  const perfil = document.querySelector(".perfil-card.ativo")?.dataset.perfil || "aluno";
  const equipe = document.querySelector("#equipe")?.value || "";
  try {
    window.__ancoraAuthFlowInProgress = true;
    await cadastrarEmail(nome, email, senha, perfil, equipe);
    window.location.href = "/home";
  } catch (err) {
    msgErro.textContent = getCadastroErrorMessage(err);
    console.error("Erro cadastro:", err?.code, err?.message);
  } finally {
    window.__ancoraAuthFlowInProgress = false;
  }
});