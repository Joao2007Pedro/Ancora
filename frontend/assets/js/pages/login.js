import { loginEmail, loginGoogle } from "../auth.js";
import { redirecionarSeLogado } from "../utils/auth-guard.js";

redirecionarSeLogado();

const formLogin = document.querySelector("#form-login");
const btnGoogle = document.querySelector("#btn-google");
const msgErro   = document.querySelector("#msg-erro");

function getAuthErrorMessage(err) {
  switch (err?.code) {
    case "auth/configuration-not-found":
      return "Firebase Auth não configurado. Ative Email/Senha e Google no Console.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/popup-closed-by-user":
      return "Login com Google cancelado.";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase Auth.";
    default:
      return "Erro de autenticação. Tente novamente.";
  }
}

formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgErro.textContent = "";
  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;
  try {
    await loginEmail(email, senha);
    window.location.href = "./home.html";
  } catch (err) {
    msgErro.textContent = getAuthErrorMessage(err);
    console.error("Erro login email:", err?.code, err?.message);
  }
});

btnGoogle?.addEventListener("click", async () => {
  msgErro.textContent = "";
  try {
    await loginGoogle();
    window.location.href = "./home.html";
  } catch (err) {
    msgErro.textContent = getAuthErrorMessage(err);
    console.error("Erro login Google:", err?.code, err?.message);
  }
});