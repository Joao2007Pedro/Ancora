import { cadastrarEmail } from "../auth.js";

const form    = document.querySelector("#form-cadastro");
const msgErro = document.querySelector("#msg-erro");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome   = document.querySelector("#nome").value;
  const email  = document.querySelector("#email").value;
  const senha  = document.querySelector("#senha").value;
  const perfil = document.querySelector(".perfil-card.ativo")?.dataset.perfil || "aluno";
  const equipe = document.querySelector("#equipe")?.value || "";
  try {
    await cadastrarEmail(nome, email, senha, perfil, equipe);
    window.location.href = "./home.html";
  } catch (err) {
    msgErro.textContent = "Erro ao criar conta: " + err.message;
  }
});