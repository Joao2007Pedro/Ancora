import { loginEmail, loginGoogle } from "../auth.js";

const formLogin = document.querySelector("#form-login");
const btnGoogle = document.querySelector("#btn-google");
const msgErro   = document.querySelector("#msg-erro");

formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;
  try {
    await loginEmail(email, senha);
    window.location.href = "./home.html";
  } catch (err) {
    msgErro.textContent = "E-mail ou senha incorretos.";
  }
});

btnGoogle?.addEventListener("click", async () => {
  try {
    await loginGoogle();
    window.location.href = "./home.html";
  } catch (err) {
    msgErro.textContent = "Erro ao entrar com Google.";
  }
});