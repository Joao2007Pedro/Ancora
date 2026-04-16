# 🔬 Documento Técnico Detalhado — Âncora

**Para:** Análise de IA especialista  
**Contexto:** Stack Frontend + Firebase, Mobile-First, SPĀ Pattern

---

## 🏛️ Arquitetura Geral

### Padrão de Carregamento

```
HTML (vercel.json rewrite) 
  ↓
sidebar-component.js (injectado)
  ↓
page-specific.js (módulo ES6)
  ↓
firebase-config.js (inicializa Firebase)
  ↓
firebase-db.js (queries + CRUD)
  ↓
auth.js (session/login/logout)
```

### Flow de Autenticação

```
User não autenticado
  ↓ (acessa /calendario)
  ↓ (verifica localStorage.userData)
  ↓ Não existe! → auth-guard redirect
  ↓
Login page (firebase.auth.signInWithPopup)
  ↓ Popup Google Auth
  ↓ Usuario consente
  ↓ Firebase retorna token + uid
  ↓ Salva userData em localStorage
  ↓ Redirect /home
```

### Data Flow: Criar Monitoria

```
User clica "Cadastrar" → /cadastrar-monitoria
↓
cadastrar-monitoria.js (non-blocking init no DOM ready)
↓
Wizard Step 1: Select subjects → armazenar em sessionStorage
↓
Step 2: Select schedule + turno → agregar
↓
Step 3: Review → mostrar summary
↓
User clica "Confirmar"
↓
firebase-db.criarMonitoria({
  tutorId: currentUser.uid,
  subjects: [...],
  schedule: {...},
  status: 'pending',
  createdAt: serverTimestamp()
})
↓
Firestore save + Security rule check
↓
Redirect /confirmacao (summary)
```

---

## 📦 Módulo Core: firebase-db.js

Este arquivo concentra TODA lógica de Firestore. Padrão:

```javascript
// 1. Helper: Buscar monitoria por ID (com fallback)
export async function buscarMonitoria(id) {
  const doc = await db.collection('monitorias').doc(id).get();
  return doc.exists ? doc.data() : null;
}

// 2. CRUD: Criar documento
export async function criarMonitoria(data) {
  const ref = await db.collection('monitorias').add({
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

// 3. Query complexa: Filtrar por critério múltiplo
export async function buscarMonitoriasDoMonitor(monitorId) {
  const snap = await db.collection('monitorias')
    .where('tutorId', '==', monitorId)
    .where('status', 'in', ['approved', 'pending'])
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

// 4. Canonical mapping: tratamento de IDs especiais
export async function buscarRoadmap(teamId) {
  let docId = teamId;
  // Fallback: java-manha → java, java-tarde → java
  if (teamId.startsWith('java-')) docId = 'java';
  
  try {
    const roadmap = await db.collection('roadmaps').doc(docId).get();
    return roadmap.data() || null;
  } catch {
    return null; // fallback vazio se 404
  }
}
```

### Padrão de Inicialização (Non-Blocking)

**Problema Identificado:** Top-level `await` + módulo import bloqueava event listeners antes de disparar.

**Solução Implementada:**

```javascript
// ❌ ERRADO (antigo)
import { buscarMonitorias } from '../utils/firebase-db.js';
const dados = await buscarMonitorias(); // Bloqueia DOM ready!

// ✅ CERTO (novo)
// Importar apenas a function
import { buscarMonitorias } from '../utils/firebase-db.js';

// Depois do DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Aqui sim, pode fazer await
  const dados = await buscarMonitorias();
  renderDados(dados);
  
  // Listeners funcionam normalmente
  document.getElementById('btn-submit').addEventListener('click', () => {
    console.log('Button works!');
  });
});
```

---

## 🎯 Páginas Críticas & Lógica

### 1. home.js — Dashboard Monitorias

**Estado:** ✅ Funcional  
**Algoritmo:**

```javascript
async function loadMonitorias() {
  // 1. Fetch todas monitorias públicas
  const allMonitorias = await buscarMonitorias();
  
  // 2. Filtro por subject (user selected)
  const bySubject = filterBySubject(allMonitorias, selectedSubject);
  
  // 3. Filtro por turno
  const filtered = filterByTurno(bySubject, selectedTurno);
  
  // 4. Sort por "destaque" (rating, clicks, recent)
  const sorted = sorted.sort((a, b) => b.rating - a.rating);
  
  // 5. Renderizar primeiros 4, "load more" button
  renderMonitorias(sorted.slice(0, 4));
}

// Event listeners
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('filtro-btn')) {
    selectedSubject = e.target.dataset.filtro;
    loadMonitorias(); // Reload on filter change
  }
});
```

### 2. calendario.js — Agenda com Local Timezone

**Problema:** Firestore armazena datas com UTC, mas usuário vê em timezone local. Datetimelocal input silenciosamente converte, gerando inconsistências.

**Solução:** Compare sempre em `YYYY-MM-DD` string local:

```javascript
function isTodayOrFuture(eventDateString) {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${
    String(today.getMonth() + 1).padStart(2, '0')}-${
    String(today.getDate()).padStart(2, '0')}`;
  return eventDateString >= todayISO;
}

async function loadAgendaForUser(userId) {
  const sessions = await buscarSessoesAluno(userId);
  
  // Filtro: só hoje/futuro
  const upcomingSessions = sessions.filter(s => 
    isTodayOrFuture(s.sessionDate) // string compare!
  );
  
  render(upcomingSessions);
}
```

**Fallback Monitor:** Se aluno, tenta ler suas próprias monitorias. Se monitor, tenta ler monitorias que criou:

```javascript
let sessions;
try {
  sessions = await buscarSessoesAluno(currentUser.uid);
} catch (e) {
  // Fallback: talvez seja monitor, tenta suas monitorias
  sessions = await buscarMonitoriasDoMonitor(currentUser.uid);
}
```

### 3. cadastrar-monitoria.js — Wizard 3-Passos

**Estado:** ✅ Non-blocking, event listeners funcionam  
**Pattern:**

```javascript
let wizardState = {
  step: 1,
  subjects: [],
  schedule: {},
  tutorId: null
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Init firebase (agora sem bloquear listeners)
  const user = await getCurrentUser();
  wizardState.tutorId = user.uid;
  
  // 2. Bind buttons
  document.getElementById('btn-next').addEventListener('click', () => {
    if (validateStep(wizardState.step)) {
      wizardState.step += 1;
      renderStep(wizardState.step);
    }
  });
  
  document.getElementById('btn-finish').addEventListener('click', async () => {
    const monitoriaId = await criarMonitoria(wizardState);
    window.location.href = `/confirmacao?id=${monitoriaId}`;
  });
});

function validateStep(step) {
  if (step === 1) return wizardState.subjects.length > 0;
  if (step === 2) return wizardState.schedule.weekday && wizardState.schedule.time;
  if (step === 3) return true;
  return false;
}
```

### 4. roadmap.js — Canonical Team Mapping

**Problema Original:** Firestore tem `roadmaps/java`, mas frontend pede `java-manha` ou `java-tarde`.

**Solução:** Mapeamento canônico + leitura progress com fallback de key:

```javascript
async function loadRoadmap() {
  // Usuário selecionou equipe
  const selectedTeam = 'java-manha'; // input do user
  
  // Canonical: java-manha → java
  const canonicalTeam = mapaagemCanonica(selectedTeam); // retorna 'java'
  
  // Fetch documento canônico
  const roadmapData = await buscarRoadmap(canonicalTeam);
  
  // Leitura progresso: tenta legacy key primeiro
  const progressKey = `roadmapProgress-${selectedTeam}`; // 'roadmapProgress-java-manha'
  let progress = localStorage.getItem(progressKey);
  
  if (!progress) {
    // Fallback: tenta chave canônica
    progress = localStorage.getItem(`roadmapProgress-${canonicalTeam}`);
  }
  
  renderRoadmap(roadmapData, progress);
}

function mapaagemCanonica(teamId) {
  if (teamId.startsWith('java-')) return 'java';
  if (teamId.startsWith('python-')) return 'python';
  return teamId; // passthrough se já canônico
}
```

### 5. minhas-monitorias.js — Loading/Empty States

**Antes:** Renderizava cards fake (mock HTML).  
**Agora:** Estados bem definidos:

```javascript
async function loadMinhásMonitorias() {
  const container = document.getElementById('lista-minhas-monitorias');
  
  // 1. Show loading
  container.innerHTML = '<div class="monitorias-loading"><p>Carregando...</p></div>';
  
  // 2. Fetch dados
  const sessions = await buscarSessoesAluno(currentUser.uid);
  
  // 3. Se vazio
  if (sessions.length === 0) {
    container.innerHTML = '<div class="monitorias-empty"><p>Nenhuma monitoria agendada</p></div>';
    return;
  }
  
  // 4. Se tem dados, renderiza cards
  container.innerHTML = sessions.map(s => makeCardHTML(s)).join('');
}
```

**CSS correspondente:**

```css
.monitorias-loading,
.monitorias-empty {
  grid-column: 1 / -1;
  padding: 2rem;
  border: 1px dashed var(--outline-variant);
  border-radius: 20px;
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🎨 CSS Architecture

### Estratégia Responsividade

**Mobile-first:** Começar com mobile, expandir para desktop.

```css
/* Base (mobile, <640px) */
.header__title {
  font-size: 1.5rem; /* Pequeno por default */
}

.main {
  margin-left: 0; /* Sem sidebar em mobile */
}

/* Tablet (640px+) */
@media (min-width: 640px) {
  .header__title {
    font-size: 2rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .main {
    margin-left: var(--sidebar-width); /* Agora sim sidebar */
  }
}
```

### Padrão: Mobile Drawer z-index

```
.drawer-overlay   { z-index: 300; }    ← Background semi-transparent
.mobile-drawer    { z-index: 400; }    ← Drawer sobre overlay
.sidebar          { z-index: 100; }    ← Sidebar desktop (sempre atrás)
```

### Tipografia Dinâmica com clamp()

```css
/* Escala fluid entre 1.5rem (390px) e 2.5rem (1440px) */
.header__title {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

/* Expande com viewport, mas nunca sai dos limites */
```

### Breakpoint Estratégia

```
390px  → iPhone SE, muito pequeno, tars difíceis
420px  → Samsung S21, formulários lêem melhor
640px  → iPad mini landscape, transição mobile→tablet
768px  → iPad portrait
1024px → Sidebar ativa, layout "split"
1440px → Tela grande, espaço aproveitado
```

---

## 🔐 Firebase Security & Rules

### Estrutura Firestore

```
/users/{userId}
  - nome, email, role, foto_url, userType, etc.

/monitorias/{id}
  - tutorId (usuario que criou)
  - alunoIds[] (participants)
  - subjects[], schedule, status ('pending'|'approved'|'rejected')
  - ratings, createdAt, updatedAt

/roadmaps/{teamId}
  - modulos[] (progress per modulo)
  - description, etc.

/candidaturas/{id}
  - userId, assuntos[], motivacao, status, createdAt
```

### Regras de Acesso

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: só podem ler/escrever seu próprio documento
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Monitorias: criador lê/escreve, admin lê tudo
    match /monitorias/{monitoriaId} {
      allow create: if request.auth.uid != null
                   && request.resource.data.tutorId == request.auth.uid;
      
      allow read: if request.auth.uid == resource.data.tutorId
                  || resource.data.isPublic == true
                  || request.auth.token.role == 'admin';
      
      allow update: if request.auth.uid == resource.data.tutorId
                    || request.auth.token.role == 'admin';
    }
    
    // Roadmaps: todos lêm
    match /roadmaps/{teamId} {
      allow read: if request.auth != null;
    }
  }
}
```

---

## ⚡ Performance Considerations

### Frontend Optimization

**Já feito:**
- Lazy load images (implicit via browser)
- Defer scripts (`<script defer>`)
- CSS crítico inline (components.css)

**Não implementado (nice-to-have):**
- Code splitting (webpack/vite)
- Service Worker cache
- IndexedDB para dados locais
- Virtual scrolling para listas grandes (100+ items)

### Firestore Optimization

**Índices criados:**
- `/monitorias` + subjects + status + createdAt (query complexa)
- `/users` + role (filter admin)

**Recomendações:**
- Usar `.limit(20)` em queries by default
- Implementar cursor pagination (startAfter/endBefore)
- Desnormalizar dados (ex: tutorName em monitoria) para N+1 queries

---

## 🔍 Debugging & Logs

### Firebase Config Fallback

```javascript
// Em produção (Vercel)
fetch('/api/firebase-web-config')
  .then(r => r.json())
  .then(config => initializeApp(config))

// Em localhost (Live Server)
  .catch(() => {
    const fallbackConfig = {
      apiKey: 'YOUR_KEY',
      projectId: 'YOUR_PROJECT'
      // ...
    };
    initializeApp(fallbackConfig);
  });
```

### Console Logs Estratégicos

```javascript
// Em calendario.js durante carregamento
console.log('[CALENDARIO] Loading sessions:', sessions);
console.log('[CALENDARIO] Today filter result:', upcomingSessions);

// Em cadastrar-monitoria.js
console.log('[WIZARD] Step', wizardState.step, wizardState);

// Remove logs em produção (ou use environment check)
if (process.env.NODE_ENV !== 'production') {
  console.log(...);
}
```

---

## 🚀 Deployment & CI/CD

### Vercel Workflow

1. Push pra `main` branch
2. Vercel webhook acionada
3. Build: `npm install` (if package.json) ou apenas serve static files
4. Deploy: upload `/frontend` dir
5. Propagar DNS global (2-5 segundos)

### Git Workflow

```bash
# Feature branch
git checkout -b feature/mobile-drawer

# Commit semantic
git commit -m "feat: add mobile-drawer to 9 pages"

# Push + Pull Request (optional)
git push origin feature/mobile-drawer

# Merge to main (ou direto se solo)
git checkout main
git merge feature/mobile-drawer
git push

# Vercel auto-redeploy
```

---

## 📋 Testing Checklist

### Manual Testing (Current)
- [x] Login flow (Google Auth)
- [x] Create monitoria (wizard 3 steps)
- [x] Calendar filter + display
- [x] Responsive 390-1440px
- [x] Mobile drawer toggle

### Automated Testing (Recommended)
- [ ] Unit tests (Jest): firebase-db.js helpers
- [ ] E2E tests (Cypress): user journey (login→create→confirm)
- [ ] Visual regression (Percy): CSS changes
- [ ] Lighthouse (CI): performance, accessibility

### Mobile Device Testing (Real)
- [ ] iPhone SE (390px) — button taps
- [ ] Samsung S21 (412px) — form inputs
- [ ] iPad Air (820px) — sidebar toggle
- [ ] Landscape mode — reflow

---

## 📞 Próximas Melhorias (Roadmap)

### P0 (Crítico)
- [ ] Revisar Firestore indexes após load testing
- [ ] Mobile drawer z-index stacking em casos edge (modals, toasts)

### P1 (Importante)
- [ ] Implementar paginação Firestore
- [ ] Add TypeScript (type safety)
- [ ] Unit tests firebase-db.js

### P2 (Nice-to-have)
- [ ] PWA manifest + offline support
- [ ] Dark mode (CSS vars já preparadas)
- [ ] Internationalization (i18n)

---

## 📎 Anexos

### Comandos Úteis

```bash
# Git
git log --oneline -10                 # Last 10 commits
git diff HEAD~1                       # Changes in last commit
git rebase -i HEAD~3                  # Squash 3 commits

# Vercel
vercel env pull                       # Download .env
vercel deploy --prod                  # Manual deploy

# Browser DevTools
# Device toolbar: Ctrl+Shift+M
# Throttling: Network tab → "Slow 3G"
# Local overrides: Sources tab
```

### Firebase CLI

```bash
firebase init firestore              # Setup rules
firebase deploy --only firestore:rules
firebase emulator:start               # Local testing
```

---

**Fim do documento técnico.**  
*Relatório gerado: 15 Abril 2026*

