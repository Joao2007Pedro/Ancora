import { protegerPagina } from "../utils/auth-guard.js";
import { buscarInscricoesDoAluno, buscarMonitoriaPorId, cancelarInscricao } from "../utils/firebase-db.js";
import { observarSessao } from "../auth.js";

protegerPagina();

observarSessao(async (usuario) => {
  if (!usuario) return;

  const inscricoes = await buscarInscricoesDoAluno(usuario.uid);
  const lista = document.querySelector("#lista-minhas-monitorias");
  if (!lista) return;

  if (inscricoes.length === 0) {
    lista.innerHTML = "<p>Você ainda não tem monitorias agendadas.</p>";
    return;
  }

  const detalhes = await Promise.all(
    inscricoes.map(async (i) => {
      const m = await buscarMonitoriaPorId(i.monitoria_id);
      return { ...i, monitoria: m };
    })
  );

  const hoje = new Date().toISOString().split("T")[0];

  const proximas = detalhes.filter((i) => i.status === "confirmada" && i.monitoria?.data >= hoje);
  const passadas = detalhes.filter((i) => i.status === "confirmada" && i.monitoria?.data < hoje);
  const canceladas = detalhes.filter((i) => i.status === "cancelada");

  function renderCard(item, tipo) {
    const m = item.monitoria;
    if (!m) return "";
    return `
      <div class="card-monitoria ${tipo}">
        <strong>${m.assunto || "Monitoria"}</strong>
        <p>${m.monitor_nome || "Monitor"}</p>
        <p>${m.data || "Data a combinar"} · ${m.horario_inicio || "--:--"}–${m.horario_fim || "--:--"}</p>
        <span class="badge-formato">${(m.formato || "online").toUpperCase()}</span>
        ${tipo === "proxima" ? `
          <button class="btn-cancelar-inscricao"
            data-inscricao="${item.id}"
            data-monitoria="${item.monitoria_id}"
            data-uid="${item.aluno_id}">
            Cancelar
          </button>` : ""}
      </div>
    `;
  }

  lista.innerHTML = `
    <div class="aba-conteudo" id="tab-proximas">
      ${proximas.length ? proximas.map((i) => renderCard(i, "proxima")).join("") : "<p>Nenhuma monitoria próxima.</p>"}
    </div>
    <div class="aba-conteudo oculto" id="tab-passadas">
      ${passadas.length ? passadas.map((i) => renderCard(i, "passada")).join("") : "<p>Nenhuma monitoria passada.</p>"}
    </div>
    <div class="aba-conteudo oculto" id="tab-canceladas">
      ${canceladas.length ? canceladas.map((i) => renderCard(i, "cancelada")).join("") : "<p>Nenhuma monitoria cancelada.</p>"}
    </div>
  `;

  document.querySelectorAll(".aba-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".aba-btn").forEach((b) => b.classList.remove("ativo", "active"));
      document.querySelectorAll(".aba-conteudo").forEach((c) => c.classList.add("oculto"));
      btn.classList.add("ativo", "active");
      document.querySelector(`#tab-${btn.dataset.aba}`)?.classList.remove("oculto");
    });
  });

  lista.addEventListener("click", async (e) => {
    const target = e.target;
    if (!target.classList.contains("btn-cancelar-inscricao")) return;

    const { inscricao, monitoria, uid } = target.dataset;
    if (!confirm("Cancelar essa monitoria?")) return;

    await cancelarInscricao(inscricao, monitoria, uid);
    location.reload();
  });
});
