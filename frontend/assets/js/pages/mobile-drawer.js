/* =============================================
   MOBILE DRAWER — Âncora
   Salvar em: assets/js/components/mobile-drawer.js
   Incluir com: <script defer src="../assets/js/components/mobile-drawer.js"></script>
   ============================================= */

(function () {
  'use strict';

  /* ── 1. Injeta o HTML do drawer e do overlay ── */
  function criarDrawer() {
    // Detecta página ativa pelo pathname
    const path = window.location.pathname;
    function isActive(page) {
      return path.includes(page) ? 'active' : '';
    }

    // Dados do usuário (localStorage)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const nome  = userData.nome || userData.displayName || 'Aluno';
    const foto  = userData.foto_url || userData.photoURL || null;
    const tipo  = userData.userType || 'student';
    const iniciais = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const avatarHtml = foto
      ? `<img src="${foto}" alt="${nome}">`
      : iniciais;

    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'drawerOverlay';

    const drawer = document.createElement('nav');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('aria-label', 'Navegação principal');
    drawer.innerHTML = `
      <!-- Header -->
      <div class="drawer-header">
        <div class="drawer-logo">
          <div class="drawer-logo-box">🔷</div>
          <div class="drawer-logo-text">
            <h2>Âncora</h2>
            <p>Portal de Estudos</p>
          </div>
        </div>
        <button class="drawer-close" id="drawerClose" aria-label="Fechar menu">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Usuário -->
      <div class="drawer-user">
        <div class="drawer-user-avatar" id="drawerAvatar">${avatarHtml}</div>
        <div>
          <div class="drawer-user-name" id="drawerUserName">${nome}</div>
          <div class="drawer-user-role">${tipo === 'monitor' ? 'Monitor' : 'Aluno'}</div>
        </div>
      </div>

      <!-- Nav principal -->
      <div class="drawer-nav">
        <a href="/home" class="drawer-nav-item ${isActive('home')}">
          <span class="material-symbols-outlined">home</span>
          <span>Home</span>
        </a>
        <a href="/calendario" class="drawer-nav-item ${isActive('calendario')}">
          <span class="material-symbols-outlined">calendar_today</span>
          <span>Agenda</span>
        </a>
        <a href="/minhas-monitorias" class="drawer-nav-item ${isActive('minhas-monitorias')}">
          <span class="material-symbols-outlined">history_edu</span>
          <span>Minhas Monitorias</span>
        </a>
        <a href="/recursos" class="drawer-nav-item ${isActive('recursos')}">
          <span class="material-symbols-outlined">library_books</span>
          <span>Recursos</span>
        </a>
        <a href="/roadmap" class="drawer-nav-item ${isActive('roadmap')}">
          <span class="material-symbols-outlined">map</span>
          <span>RoadMap</span>
        </a>

        <div class="drawer-nav-divider"></div>

        <a href="#" class="drawer-nav-item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
      </div>

      <!-- CTA Tornar-se Monitor -->
      ${tipo !== 'monitor' ? `
      <div class="drawer-cta">
        <button class="drawer-cta-btn" id="drawerBecomeMonitor">
          <span class="material-symbols-outlined">school</span>
          Tornar-se Monitor
        </button>
      </div>` : ''}

      <!-- Footer -->
      <div class="drawer-footer">
        <a href="#" class="drawer-footer-item">
          <span class="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
        <button class="drawer-footer-item logout" id="drawerLogout">
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  /* ── 2. Controla abertura / fechamento ── */
  function initDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const drawer  = document.getElementById('mobileDrawer');

    // Botão hambúrguer da topbar (classe topbar-menu)
    const burgerBtn = document.querySelector('.topbar-menu');

    function abrirDrawer() {
      overlay.style.display = 'block';
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
        drawer.classList.add('open');
      });
      document.body.style.overflow = 'hidden';
    }

    function fecharDrawer() {
      overlay.classList.remove('visible');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { overlay.style.display = 'none'; }, 280);
    }

    if (burgerBtn) {
      burgerBtn.addEventListener('click', abrirDrawer);
    }

    document.getElementById('drawerClose')?.addEventListener('click', fecharDrawer);
    overlay.addEventListener('click', fecharDrawer);

    // Fecha ao navegar
    drawer.querySelectorAll('.drawer-nav-item, .drawer-footer-item').forEach(item => {
      item.addEventListener('click', () => {
        if (!item.id || item.id !== 'drawerLogout') fecharDrawer();
      });
    });

    // Fechar com swipe para a esquerda
    let touchStartX = 0;
    drawer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    drawer.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (diff > 60) fecharDrawer();
    }, { passive: true });

    // Logout
    document.getElementById('drawerLogout')?.addEventListener('click', async () => {
      fecharDrawer();
      try {
        const { auth } = await import('../firebase-config.js');
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await signOut(auth);
      } catch {}
      localStorage.removeItem('userData');
      window.location.href = '/login';
    });

    document.getElementById('drawerBecomeMonitor')?.addEventListener('click', async () => {
      if (typeof window.appSolicitarMonitor !== 'function') {
        alert('Não foi possível solicitar agora. Recarregue a página e tente novamente.');
        return;
      }

      try {
        const result = await window.appSolicitarMonitor();
        if (result?.status === 'ja-monitor') {
          alert('Você já é monitor.');
          return;
        }
        if (result?.status === 'ja-pendente') {
          alert('Sua solicitação já está em análise.');
          return;
        }
        alert('Solicitação enviada com sucesso!');
        fecharDrawer();
      } catch (error) {
        console.error('Erro ao solicitar monitoria:', error);
        alert('Erro ao enviar solicitação. Tente novamente.');
      }
    });
  }

  /* ── 3. Atualiza avatar quando usuário logar via Firebase ── */
  async function sincronizarUsuario() {
    try {
      const { auth }      = await import('../firebase-config.js');
      const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

      onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const nome    = user.displayName || 'Aluno';
        const iniciais = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        const avatar = document.getElementById('drawerAvatar');
        const nameEl = document.getElementById('drawerUserName');

        if (avatar) {
          avatar.innerHTML = user.photoURL
            ? `<img src="${user.photoURL}" alt="${nome}">`
            : iniciais;
        }
        if (nameEl) nameEl.textContent = nome;
      });
    } catch { /* Firebase indisponível */ }
  }

  /* ── Init ── */
  function init() {
    // Só roda no mobile
    if (window.innerWidth > 640) return;
    criarDrawer();
    initDrawer();
    sincronizarUsuario();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Recria se janela for redimensionada para mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 640 && !document.getElementById('mobileDrawer')) {
      init();
    }
  });

})();
