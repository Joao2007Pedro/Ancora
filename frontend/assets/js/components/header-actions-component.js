class AppHeaderActions extends HTMLElement {
  static get observedAttributes() {
    return ["search-placeholder", "avatar-src", "avatar-alt", "profile-name"];
  }

  connectedCallback() {
    if (!this._onUserDataUpdated) {
      this._onUserDataUpdated = () => this.render();
      window.addEventListener("ancora-user-data-updated", this._onUserDataUpdated);
    }
    this.render();
  }

  disconnectedCallback() {
    if (this._onUserDataUpdated) {
      window.removeEventListener("ancora-user-data-updated", this._onUserDataUpdated);
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const userData = window.__ancoraUserData || JSON.parse(localStorage.getItem("userData") || "{}");
    const nome = userData.nome || "Perfil";
    const fallbackAvatar = userData.foto_url
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=3333FF&color=fff&size=96`;

    const placeholder = this.getAttribute("search-placeholder") || "Buscar...";
    const avatarSrc = this.getAttribute("avatar-src") || fallbackAvatar;
    const avatarAlt = this.getAttribute("avatar-alt") || nome;
    const profileName = this.getAttribute("profile-name") || userData.nome || "";

    const hasName = profileName.trim().length > 0;
    const profileClass = hasName
      ? "header-actions-component__profile header-actions-component__profile--chip"
      : "header-actions-component__profile header-actions-component__profile--avatar-only";

    this.innerHTML = `
      <div class="header-actions-component">
        <label class="header-actions-component__search" aria-label="Buscar">
          <span class="material-symbols-outlined header-actions-component__search-icon">search</span>
          <input class="header-actions-component__search-input" type="text" placeholder="${placeholder}" />
        </label>

        <button type="button" class="header-actions-component__notify" aria-label="Notificações">
          <span class="material-symbols-outlined">notifications</span>
        </button>

        <div class="${profileClass}">
          <div class="header-actions-component__avatar">
            <img src="${avatarSrc}" alt="${avatarAlt}" />
          </div>
          <span class="header-actions-component__status-dot" aria-hidden="true"></span>
          ${hasName ? `<span class="header-actions-component__name">${profileName}</span>` : ""}
        </div>
      </div>
    `;
  }
}

customElements.define("app-header-actions", AppHeaderActions);
