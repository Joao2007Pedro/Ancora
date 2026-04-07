class SidebarMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-box">
            <img src="https://link-da-sua-logo.png" alt="Logo">
          </div>
          <div class="logo-text">
            <h2>Proa Scholar</h2>
            <p>Tutoring Portal</p>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a href="dashboard.html" class="nav-item">
            <span class="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a href="agenda.html" class="nav-item">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>Agenda</span>
          </a>
          <a href="monitorias.html" class="nav-item active">
            <span class="material-symbols-outlined icon-filled">history_edu</span>
            <span>My Sessions</span>
          </a>
        </nav>
        <!-- ... resto do seu código da sidebar ... -->
      </aside>
    `;
    this.setActiveClass();
  }

  // Lógica para destacar o link da página atual automaticamente
  setActiveClass() {
    const currentPath = window.location.pathname;
    const items = this.querySelectorAll('.nav-item');
    items.forEach(item => {
      if (item.getAttribute('href') && currentPath.includes(item.getAttribute('href'))) {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  }
}

customElements.define('sidebar-menu', SidebarMenu);