class AppHeaderActions extends HTMLElement {
  connectedCallback() {
    const placeholder = this.getAttribute("search-placeholder") || "Buscar...";
    const avatarSrc = this.getAttribute("avatar-src") || "";
    const avatarAlt = this.getAttribute("avatar-alt") || "Perfil";
    const profileName = this.getAttribute("profile-name") || "";

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
