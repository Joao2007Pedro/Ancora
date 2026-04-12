class SidebarMenu extends HTMLElement {
  connectedCallback() {
    if (!this._onUserDataUpdated) {
      this._onUserDataUpdated = () => {
        this.connectedCallback();
      };
      window.addEventListener('ancora-user-data-updated', this._onUserDataUpdated);
    }

    // Detectar tipo de usuário
    this.renderByCurrentUserType();
    this.setActiveClass();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    if (this._onUserDataUpdated) {
      window.removeEventListener('ancora-user-data-updated', this._onUserDataUpdated);
    }
  }

  renderByCurrentUserType() {
    if (this.getUserType() === 'monitor') {
      this.renderMonitorSidebar();
    } else {
      this.renderStudentSidebar();
    }
  }

  /**
   * Obtém o tipo de usuário do localStorage
   * @returns {string} 'monitor' ou 'student'
   */
  getUserType() {
    const userData = window.__ancoraUserData || JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.userType === 'monitor' || userData.perfil === 'monitor') {
      return 'monitor';
    }

    return 'student';
  }

  /**
   * Renderiza a sidebar para alunos
   */
  renderStudentSidebar() {
    this.innerHTML = `
      <aside class="sidebar">
        <!-- Header com Logo -->
        <div class="sidebar-header">
          <div class="logo-box">
            <div class="logo-placeholder">🔷</div>
          </div>
          <div class="logo-text">
            <h2>Âncora</h2>
            <p>Portal do Aluno</p>
          </div>
        </div>

        <!-- Navegação Principal -->
        <nav class="sidebar-nav">
          <a href="home.html" class="nav-item" data-page="home">
            <span class="material-symbols-outlined">home</span>
            <span>Home</span>
          </a>
          <a href="calendario.html" class="nav-item" data-page="agenda">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>Agenda</span>
          </a>
          <a href="minhas-monitorias.html" class="nav-item" data-page="minhas-monitorias">
            <span class="material-symbols-outlined">history_edu</span>
            <span>Monitorias Agendadas</span>
          </a>
          <a href="recursos.html" class="nav-item" data-page="recursos">
            <span class="material-symbols-outlined">library_books</span>
            <span>Indicações</span>
          </a>
          <a href="roadmap.html" class="nav-item" data-page="roadmap">
            <span class="material-symbols-outlined">map</span>
            <span>RoadMap</span>
          </a>
          <a href="#chat" class="nav-item" data-page="chat">
            <span class="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </a>
        </nav>

        <!-- Ações Principais -->
        <div class="sidebar-action">
          <button class="btn-sidebar-primary btn-become-monitor" onclick="tornarMonitor()">
            <span class="material-symbols-outlined">add</span>
            <span>Tornar-se Monitor</span>
          </button>
        </div>

        <!-- Rodapé -->
        <div class="sidebar-footer">
          <a href="#settings" class="nav-item-footer" data-page="configuracoes">
            <span class="material-symbols-outlined">settings</span>
            <span>Configurações</span>
          </a>
          <a href="#" class="nav-item-footer logout" onclick="fazerLogout(event)">
            <span class="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </a>
        </div>
      </aside>
    `;
  }

  /**
   * Renderiza a sidebar para monitores
   */
  renderMonitorSidebar() {
    this.innerHTML = `
      <aside class="sidebar">
        <!-- Header com Logo -->
        <div class="sidebar-header">
          <div class="logo-box">
            <div class="logo-placeholder">🔷</div>
          </div>
          <div class="logo-text">
            <h2>Âncora</h2>
            <p>Painel do Monitor</p>
          </div>
        </div>

        <!-- Navegação Principal -->
        <nav class="sidebar-nav">
          <a href="home.html" class="nav-item" data-page="home">
            <span class="material-symbols-outlined">home</span>
            <span>Home</span>
          </a>
          <a href="calendario.html" class="nav-item" data-page="agenda">
            <span class="material-symbols-outlined">calendar_today</span>
            <span>Agenda</span>
          </a>
          <a href="minhas-monitorias.html" class="nav-item" data-page="minhas-monitorias">
            <span class="material-symbols-outlined">history_edu</span>
            <span>Minhas Monitorias</span>
          </a>
          <a href="recursos.html" class="nav-item" data-page="recursos">
            <span class="material-symbols-outlined">library_books</span>
            <span>Recursos</span>
          </a>
          <a href="roadmap.html" class="nav-item" data-page="roadmap">
            <span class="material-symbols-outlined">map</span>
            <span>Roadmap</span>
          </a>
          <a href="#chat" class="nav-item" data-page="chat">
            <span class="material-symbols-outlined">chat</span>
            <span>Chat</span>
          </a>
          <a href="perfil.html" class="nav-item" data-page="dashboard">
            <span class="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
        </nav>

        <!-- Ações Principais -->
        <div class="sidebar-action">
          <button class="btn-sidebar-primary btn-new-monitoring" onclick="abrirNovaMonitoria()">
            <span class="material-symbols-outlined">add</span>
            <span>Nova Monitoria</span>
          </button>
        </div>

        <!-- Rodapé -->
        <div class="sidebar-footer">
          <a href="#settings" class="nav-item-footer" data-page="configuracoes">
            <span class="material-symbols-outlined">settings</span>
            <span>Configurações</span>
          </a>
          <a href="#" class="nav-item-footer logout" onclick="fazerLogout(event)">
            <span class="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </a>
        </div>
      </aside>
    `;
  }

  /**
   * Destaca o link da página atual
   */
  setActiveClass() {
    const currentPath = window.location.pathname;
    const items = this.querySelectorAll('.nav-item');
    
    items.forEach(item => {
      const href = item.getAttribute('href');
      if (href && !href.startsWith('#')) {
        // Comparar caminhos
        if (currentPath.includes(href.replace('../', '').split('/').pop())) {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      }
    });
  }

  /**
   * Anexa event listeners aos elementos
   */
  attachEventListeners() {
    // Delegação de eventos para links com hash
    this.addEventListener('click', (e) => {
      const clickedItem = e.target.closest('.nav-item[href^="#"]');
      if (clickedItem) {
        e.preventDefault();
        this.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        clickedItem.classList.add('active');
      }
    });
  }

  /**
   * Muda o tipo de usuário dinamicamente (útil para testes)
   * @param {string} userType - 'student' ou 'monitor'
   */
  changeUserType(userType) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    userData.userType = userType;
    userData.perfil = userType === 'monitor' ? 'monitor' : 'aluno';
    localStorage.setItem('userData', JSON.stringify(userData));
    window.__ancoraUserData = userData;
    window.dispatchEvent(new CustomEvent('ancora-user-data-updated', { detail: userData }));
    
    // Rerender a sidebar
    this.connectedCallback();
  }
}

customElements.define('sidebar-menu', SidebarMenu);

/**
 * Abre formulário para nova monitoria
 */
function abrirNovaMonitoria() {
  window.location.href = 'cadastrar-monitoria.html';
}

/**
 * Ação para tornar-se monitor
 */
function tornarMonitor() {
  console.log('Abrindo página para tornar-se monitor...');
  window.location.href = 'cadastro.html';
}

/**
 * Faz logout do usuário
 */
function fazerLogout(event) {
  event.preventDefault();

  if (confirm('Deseja realmente sair?')) {
    if (typeof window.appLogout === 'function') {
      window.appLogout();
      return;
    }

    // Fallback caso o helper global não esteja disponível
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    window.location.href = 'login.html';
  }
}