# 📋 Relatório Final — Projeto Âncora

**Data:** 15 de Abril de 2026  
**Status:** ✅ Produção — Vercel Deploy Ativo  
**Deploy:** https://ancora-black.vercel.app/

---

## 📌 Resumo Executivo

O Âncora é uma plataforma de monitorias colaborativas (tutoria entre pares) construída com **ES Modules + Firebase** no frontend e **Firestore + Auth** no backend. O projeto passou por ciclo completo de:

1. **Estabilização funcional** — corrigir bugs críticos de navegação e dados
2. **Responsividade** — adaptar para mobile/tablet/desktop
3. **Polish visual** — usar ciclos de refinamento CSS
4. **QA mobile** — validar menu hambúrguer e UX em viewport pequenas

**Última sprint:** Adicionado mobile-drawer (hamburger menu) a 9 páginas autenticadas.

---

## 🏗️ Arquitetura do Projeto

### Stack Técnico
- **Frontend:** HTML5 + CSS3 + JavaScript ES6+ (módulos nativos)
- **Backend/Database:** Firebase Firestore + Firebase Auth
- **Deploy:** Vercel (rewrites, serverless functions)
- **Componentes Web:** Custom Web Components (sidebar, header-actions)
- **Responsividade:** Mobile-first com breakpoints 390px, 640px, 768px, 1024px

### Estrutura de Diretórios
```
frontend/
├── pages/                          # Páginas HTML (13 arquivos)
│   ├── home.html                   # Dashboard monitorias (perfil student/monitor)
│   ├── calendario.html             # Agenda de monitorias
│   ├── minhas-monitorias.html      # Sessões agendadas do usuário
│   ├── cadastrar-monitoria.html    # Wizard 3-passos para criar monitoria
│   ├── roadmap.html                # Learning path com progresso
│   ├── recursos.html               # Cards informativos (recomendações)
│   ├── candidatura.html            # Formulário para candidatar-se monitor
│   ├── admin-dashboard.html        # Painel para aprovar candidaturas/monitorias
│   ├── perfil.html                 # Dashboard monitor + estatísticas
│   ├── confirmacao.html            # Resumo agendamento
│   ├── dashboard.html || cadastro.html  # Telas de onboarding
│   └── login.html                  # Autenticação Firebase
│
├── assets/
│   ├── css/
│   │   ├── global.css              # Reset + variáveis CSS (cores, shadows, typography)
│   │   ├── components.css          # Componentes reutilizáveis (botões, cartas, abas)
│   │   └── pages/                  # Estilos por página (13 arquivos CSS)
│   │       ├── mobile-drawer.css   # Overlay + drawer slide-in (280px, z-index 400)
│   │       ├── home.css (✅ responsivo, sidebar mobile hidden)
│   │       ├── calendario.css (✅ polish 390px)
│   │       ├── minhas-monitorias.css (✅ polish 640px/390px)
│   │       ├── cadastrar-monitoria.css (✅ polish 420px)
│   │       ├── login.css (✅ polish 420px)
│   │       ├── cadastro.css (✅ polish 420px)
│   │       ├── recursos.css (✅ polish 420px, min-height 420px)
│   │       ├── roadmap.css (✅ polish 390px, width clamp)
│   │       ├── admin-dashboard.css, candidatura.css, perfil.css, etc.
│   │
│   ├── js/
│   │   ├── auth.js                 # Auth module (login/logout/session)
│   │   ├── firebase-config.js      # Init Firebase + fallback Live Server
│   │   │
│   │   ├── components/
│   │   │   ├── sidebar-component.js   # Custom Element (menu lateral fixa)
│   │   │   ├── header-actions-component.js # Search + avatar header
│   │   │   └── mobile-drawer.js       # NOVO: Drawer overlay + nav mobile (280px)
│   │   │
│   │   ├── utils/
│   │   │   ├── auth-guard.js       # Redirect não-autenticado → login
│   │   │   ├── firebase-db.js      # Firestore CRUD + helpers
│   │   │   └── user-manager.js     # Gerencia userData em localStorage
│   │   │
│   │   └── pages/
│   │       ├── home.js (✅ async-resilient, clean routes)
│   │       ├── calendario.js (✅ date-filter, local timezone, fallback monitor)
│   │       ├── minhas-monitorias.js (✅ loading/empty states, sem mock cards)
│   │       ├── cadastrar-monitoria.js (✅ wizard + non-blocking init)
│   │       ├── roadmap.js (✅ canonical team mapping, legacy key compat)
│   │       └── [login, candidatura, admin-dashboard, perfil, confirmacao, etc]
│   │
│   └── images/
│       ├── logo/
│       ├── login/
│       ├── recursos/
│       └── [other assets]
│
├── firebase-config.js              # Web config endpoint (/api/firebase-web-config)
└── firebase-web-config.js          # API route config

firestore.rules                      # Security rules (access control monitoria lifecycle)
vercel.json                          # Rewrites, serverless routes, headers
README.md
```

---

## ✅ Funcionalidades Implementadas & Validadas

### 1. Autenticação & User Management
- ✅ Login/Logout Firebase Auth
- ✅ Persistent userData em localStorage
- ✅ Auth-guard check em cada página autenticada
- ✅ Roles: Student, Monitor, Admin
- ✅ Session restore on page reload

### 2. Monitorias (Core Feature)
- ✅ **Criar Monitoria:** Wizard 3-passos (subjects, schedule, review)
- ✅ **Listar Monitorias:** Home com filtros (matéria, turno, destaque)
- ✅ **Editar/Aprovar:** Admin dashboard, candidatura flow
- ✅ **Agendamento:** Calendario mostra eventos + detalhes session
- ✅ **Confirmação:** Resumo antes do commit

### 3. User Profiles & Dashboard
- ✅ Dashboard Monitor: sessões agendadas, estatísticas
- ✅ Dashboard Aluno: monitorias em que participa (próximas/passadas/canceladas)
- ✅ Perfil: coordenadas, turno favorito, avaliação
- ✅ Minhas Monitorias: tabs responsivas, loading/empty states

### 4. Learning Path (Roadmap)
- ✅ Canonical team mapping: `java-manha`/`java-tarde` → `java`
- ✅ Progress per modulo (0-100%)
- ✅ Status: Concluído, Em Andamento, A Aprender
- ✅ Legacy progress key compatibility

### 5. Navegação & UX
- ✅ Sidebar fixa (16rem) em desktop
- ✅ **Mobile Drawer:** Slide-in (280px, z-index 400) com overlay
- ✅ Topbar mobile: hambúrguer + search + bell + avatar
- ✅ Routes limpas: `/home`, `/calendario`, `/admin-dashboard`, etc.
- ✅ Redirect automático: não-autenticado → login

---

## 🔧 Problemas Resolvidos Nesta Sprint

| Problema | Causa Raiz | Solução | Status |
|----------|-----------|--------|--------|
| **Menu hambúrguer não aparecia em muitas páginas** | mobile-drawer.js carregado apenas em home.html | Adicionado script + CSS em 9 páginas autenticadas (calendar, admin, cadastrar, minhas, candidatura, perfil, confirmacao, roadmap, recursos) | ✅ Resolvido |
| **Botões cadastro-monitoria inativos** | Top-level async import bloqueava event listeners | Movido async dentro de DOM ready event + non-blocking init pattern | ✅ Resolvido |
| **Agenda vazia apesar de dados** | Filter por data futura sem fallback + campo sessionDate inconsistente | Implementado fallback para monitor-owned sessions, local timezone filter (`YYYY-MM-DD` compare) | ✅ Resolvido |
| **Fake prototype cards em minhas-monitorias** | Static mock HTML não removido | Deletado cards template, implementado loading + empty states dinâmicos | ✅ Resolvido |
| **Páginas não responsivas <640px** | Fixed widths (800px, 470px), grandes font-size, sidebar rigid | Polish breakpoints: 390px, 420px com clamp(), min/max constraints | ✅ Resolvido |
| **Roadmap: java-manha/tarde sem dados** | Firestore só tem documento `java` | Canonical mapping em firebase-db.js com legacy key fallback | ✅ Resolvido |
| **Live Server 404 /api/firebase-web-config** | Endpoint serverless não disponível em localhost | Fallback Firebase config hardcoded em firebase-config.js | ✅ Resolvido |

---

## 📊 Mudanças Implementadas (Histórico)

### Sprint 1: Route Cleanup & Deploy Sync
- Padronizadas rotas limpas (sem .html)
- Testado deploy live em https://ainda-black.vercel.app
- Validado sync git (rebase conflicts resoltos)

### Sprint 2: Functional Bug Fixes
- **cadastrar-monitoria.js:** Event delegation para date buttons, non-blocking async init
- **calendario.js:** Local date filter, monitor fallback, render resilience
- **firebase-db.js:** Helper `buscarMonitoriasDoMonitor()`, canonical roadmap fetch
- **minhas-monitorias:** Removido mock cards, loading/empty states
- **home.js, confirmacao.js:** Routes limpas, redirects robustos

### Sprint 3: Responsividade Estrutural
- Sidebar hidden em 900px breakpoint
- Margin-left removido em todas as telas mobile
- 7 CSS files padronizadas (mobile-drawer pattern standard)

### Sprint 4: CSS Polish & Micro-adjustments
- **roadmap.css:** Glow-bg width/height com `min(90vw, 800px)`, header clamp, 390px breakpoint
- **recursos.css:** Cards min-height 420px, 420px breakpoint com botões compactos
- **cadastro.css:** 420px breakpoint com tipografia reduzida, inputs 46px
- **login.css:** 420px breakpoint idêntico ao cadastro
- **minhas-monitorias.css:** Tabs/cards 640px + 390px com flex melhorado

### Sprint 5: Mobile Drawer Consistency ✅ HOJE
- Adicionado mobile-drawer em 9 páginas autenticadas
- CSS + JS agora carregam em todas (não só home.html)
- Drawer funciona: click hambúrguer → slide-in overlay + nav

---

## 🎯 Breakpoints & Responsividade

| Viewport | Use Case | Sidebar | Drawer | Typography | Notes |
|----------|----------|---------|--------|--------------|-------|
| **390px** | iPhone SE, small Android | Hidden | Visible ✅ | clamp(1.45rem, 9vw, 2.5rem) | Teste crítico, muitos taps |
| **420px** | Samsung S21 | Hidden | Visible ✅ | 18-20px headings, 11px body | Breakpoint específico para formulários |
| **640px** | iPad mini landscape | Hidden | Visible ✅ | 1.65rem h1, tabs stacked | Transição mobile→tablet |
| **768px** | iPad portrait, tablet | Hidden | Visible | Normale | Standard tablet size |
| **1024px** | iPad landscape, small desktop | Visible (70px narrow) | Hidden | Normale | Sidebar narrow layout |
| **1440px+** | Desktop full | Visible (16rem) | Hidden | Normale | Production target |

---

## 🚀 Deploy & CI/CD

### Vercel Configuration
```json
{
  "rewrites": [
    {"source": "/api/firebase-web-config", "destination": "/api/firebase-web-config.js"},
    {"source": "/:path((?!api|_next/static|favicon.ico).*)", "destination": "/index.html"}
  ]
}
```

### Git Workflow
- Main branch em produção (auto-deploy on push)
- Commits antigos com mensagens estruturadas (feat/fix/docs)
- Rebase conflicts resolvos manualmente

### Testing
- Manual testing em Vercel live
- Chrome DevTools: 390px, 640px, 768px, 1024px viewports
- Firebase Rules checked: read/write access controls

---

## 📝 Firestore Rules & Security

```javascript
// Monitoria creation
allow create: if request.auth.uid == request.resource.data.tutorId
           && request.resource.data.status == "pending"

// Read own/public monitorias
allow read: if request.auth.uid == get(/databases/... ).data.tutorId
          || resource.data.isPublic == true

// Admin approve/reject
allow update: if request.auth.token.role == 'admin'
           && request.resource.data.status in ['approved', 'rejected']
```

---

## 🎨 Design System (CSS Variables)

### Cores
```css
--primary: #1300e1 (Azul Principal)
--primary-container: #3333ff
--navy: #0A0F5C
--cyan: #0891b2
--lime: #CCFF00
--error: #ba1a1a
```

### Tipografia
- **Headlines:** Clash Grotesk, Space Grotesk (bold, large)
- **Body:** Plus Jakarta Sans (medium weight, 0.875rem default)
- **Mono:** Fallback para code snippets

### Espaçamento
- Tokens: 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem
- Sidebar width: 16rem (256px desktop) / 70px (mobile narrow)
- Drawer width: 280px (fixed)

### Componentes Padrão
- Botões: inline-flex, 0.75rem padding, 9999px border-radius
- Cards: border-left 8px (primária/cinza/erro), border-radius 0.5rem
- Abas: active bg-primary, font-weight bold, shadow ao ativo

---

## 🔍 Code Quality Checks

### Validações Realizadas
- ✅ Syntax check (CSS) — sem erros
- ✅ HTML structure — semântica correta
- ✅ Firebase config — init robusta + fallback
- ✅ Module imports — ES6 modules sem circular deps
- ✅ Responsive — viewport testing 390-1440px

### TO-DO (Não-bloqueadores)
- [ ] Minify CSS/JS pré-prod (Vercel já faz)
- [ ] PWA manifest + service worker
- [ ] Lighthouse audit (performance, accessibility)
- [ ] i18n (português é default, expandir se necessário)
- [ ] Analytics integração (Hotjar, Sentry)

---

## 📚 Recursos Importantes

### Arquivos Críticos
1. **firebase-db.js** — Toda lógica Firestore (CRUD, filtering, canonical mapping)
2. **firebase-config.js** — Inicialização Firebase com fallback
3. **cadastrar-monitoria.js** — Wizard complexo com states
4. **mobile-drawer.js** — Geração dinâmica drawer HTML/CSS

### Endpoints
- `GET /` → redirect `/home` (logged) ou `/login` (guest)
- `GET /api/firebase-web-config` → retorna {apiKey, projectId, ...}
- All pages require auth except `/login` e `/cadastro`

### localStorage Keys
- `userData` — nome, role, email, foto_url, userType
- `userData.roadmapProgress` — {java: {m1: 30, m2: 50, ...}}

---

## ⚠️ Observações para Próxima Análise

1. **Mobile Drawer Comportamento:** Verifica se está aparecendo em 100% dos taps. Se ainda há intermitência, revisar z-index stacking + event delegation.

2. **Firestore Rules:** Revise regras de acesso para `update` em monitorias agendadas (rastreamento de progresso).

3. **Escalabilidade:** Calendario lista pode crescer muito. Considere:
   - Paginação Firestore (cursor-based)
   - Virtual scrolling em listas de 100+ items
   - Índices Firestore para queries complexas (materia + turno + status)

4. **Performance:** 
   - Lazy load images em cards
   - Debounce search input
   - Cache Firebase queries em service worker

5. **A/B Testing:** Posição do drawer (left vs right), topbar layout em mobile.

---

## 📞 Contato & Logs

- **Projeto:** https://github.com/Joao2007Pedro/Ancora
- **Deploy:** https://ancora-black.vercel.app
- **Last Commit:** `a687d83` — "feat: add mobile-drawer (hamburger menu) to all authenticated pages"
- **Relatório Data:** 15 Abril 2026

---

## ✨ Checklist Final

- [x] Menu hambúrguer funciona em todas as páginas
- [x] Responsividade testada 390px-1440px
- [x] CSS polido sem erros
- [x] Routes limpas sem .html
- [x] Firebase config + fallback
- [x] Mobile drawer com overlay
- [x] Sidebar mobile hidden
- [x] Git commits estruturados
- [x] Deploy live ativo
- [x] Relatório gerado ✅

