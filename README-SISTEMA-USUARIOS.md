# Sistema de Gerenciamento de Tipos de Usuário - Âncora

## 📋 Visão Geral

O projeto Âncora agora possui um sistema completo de diferenciação entre dois tipos de usuários:
- **Aluno (Student)**: Busca por monitorias e recursos educacionais
- **Monitor**: Oferece monitorias e gerencia sessões

Cada tipo de usuário tem uma **sidebar diferente**, **permissões específicas** e **recursos únicos**.

---

## 🔑 Componentes Principais

### 1. **Sidebar Component** (`sidebar-component.js`)
- WebComponent que renderiza dinamicamente a sidebar
- Detecta o tipo de usuário automaticamente
- Exibe menus diferentes para alunos e monitores

#### Sidebar para Alunos:
- Home
- Agenda
- Minhas Monitorias
- Recursos
- RoadMap
- Chat
- Dashboard
- **Botão**: Nova Monitoria
- **Rodapé**: Configurações, Sair

#### Sidebar para Monitores:
- Home
- Agenda
- Minhas Monitorias
- Recursos
- RoadMap
- Chat
- **Botão**: Tornar-se Monitor
- **Rodapé**: Settings, Logout

### 2. **User Manager** (`user-manager.js`)
Sistema de gerenciamento de usuários com as seguintes funções:

#### Funções Principais:
```javascript
// Definir tipo de usuário (após cadastro/login)
setUserType('student', userData);
setUserType('monitor', userData);

// Obter informações do usuário
getUserType();           // Retorna 'student' ou 'monitor'
getUserData();           // Retorna objeto completo do usuário
isStudent();            // boolean
isMonitor();            // boolean

// Verificar permissões
hasPermission('resource');
checkPermissionOrRedirect('resource', 'redirectURL');

// Converter aluno para monitor
upgradeToMonitor();

// Desconectar
logoutUser();
```

#### Permissões por Tipo:
**Aluno**:
- ✅ Home, Agenda, Minhas Monitorias, Recursos, RoadMap, Chat
- ✅ Dashboard
- ✅ Criar Monitorias (Nova Monitoria)
- ❌ Gerenciar Aulas
- ❌ Visualizar Dashboard de Monitor

**Monitor**:
- ✅ Home, Agenda, Minhas Monitorias, Recursos, RoadMap, Chat
- ✅ Gerenciar Aulas
- ✅ Visualizar Dashboard de Monitor
- ❌ Dashboard (de aluno)
- ❌ Criar Monitorias adicionais

---

## 🔄 Fluxo de Cadastro

1. **Página de Cadastro** (`cadastro.html`)
   - Usuário escolhe seu tipo (Aluno ou Monitor)
   - Preenche formulário com dados pessoais
   - Seleciona matéria (se for monitor)

2. **Submissão** (`cadastro.js`)
   - Validar dados
   - Chamar API backend/Firebase
   - Criar usuário no banco de dados

3. **Definir Tipo no localStorage**
   ```javascript
   setUserType(userType, {
     id: userId,
     name: userName,
     email: userEmail,
     subject: subject (para monitors),
     bio: bio
   });
   ```

4. **Redirecionar**
   - Alunos → Home
   - Monitores → Configuração de Perfil Monitor

5. **Próximas Visitas**
   - Sidebar carrega automaticamente o tipo correto
   - Componentes respeitam as permissões do usuário

---

## 💾 Armazenamento de Dados

### localStorage - userData
```json
{
  "userType": "student",
  "id": "user123",
  "name": "João Silva",
  "email": "joao@email.com",
  "subject": "Mathematics",
  "bio": "Explicação bio do usuário",
  "createdAt": "2026-04-10T...",
  "verifiedEmail": false
}
```

### localStorage - userToken
- Token JWT para autenticação em requisições

---

## 🎯 Casos de Uso

### Aluno Acessando a Página
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (isStudent()) {
    // Mostrar opção de nova monitoria
    // Permitir agendar sessões
    // Mostrar histórico de sessões
  }
});
```

### Monitor Acessando a Página
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (isMonitor()) {
    // Mostrar dashboard de monitorias
    // Permitir gerenciar horários disponíveis
    // Mostrar alunos agendados
  }
});
```

### Verificar Permissão Antes de Ação
```javascript
function novaMonitoria() {
  if (!checkPermissionOrRedirect('canCreateMonitoring')) {
    return;
  }
  // Proceed with creating new monitoring
}
```

---

## 🔐 Segurança

1. **Validação no Backend**: Sempre validar `userType` no servidor
2. **Token JWT**: Incluir tipo de usuário no token para verificação backend
3. **Permissões Backend**: Replicar lógica de permissões no servidor
4. **localStorage**: Não armazenar dados sensíveis, apenas tipo e ID

---

## 📱 Responsividade

A sidebar é responsiva e se adapta a diferentes tamanhos de tela:

- **Desktop** (> 768px): Sidebar completa com textos
- **Tablet** (768px - 480px): Sidebar reduzida, ícones com textos em hover
- **Mobile** (< 480px): Sidebar com ícones apenas

---

## 🔄 Upgrade de Aluno para Monitor

```javascript
// Quando aluno quer se tornar monitor
function tornarMonitor() {
  upgradeToMonitor();
  // A sidebar será recarregada automaticamente
}
```

---

## ⚙️ Integração com Componentes Existentes

### Adicionar em Cada Página
```html
<!-- No head -->
<script src="../assets/js/utils/user-manager.js"></script>

<!-- before </body> -->
<script src="../assets/js/components/sidebar-component.js"></script>
```

### Usar a Sidebar
```html
<sidebar-menu></sidebar-menu>
```

---

## 📚 Exemplo Completo de Página

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home - Âncora</title>
  <link rel="stylesheet" href="../assets/css/global.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="../assets/css/pages/home.css">
  
  <script src="../assets/js/components/sidebar-component.js"></script>
  <script src="../assets/js/utils/user-manager.js"></script>
</head>
<body>
  <sidebar-menu></sidebar-menu>
  
  <main>
    <div id="student-content" style="display:none;">
      <!-- Conteúdo para alunos -->
    </div>
    
    <div id="monitor-content" style="display:none;">
      <!-- Conteúdo para monitores -->
    </div>
  </main>
  
  <script src="../assets/js/pages/home.js"></script>
  
  <script>
    // Mostrar conteúdo apropriado
    if (isStudent()) {
      document.getElementById('student-content').style.display = 'block';
    } else if (isMonitor()) {
      document.getElementById('monitor-content').style.display = 'block';
    } else {
      window.location.href = '../pages/login.html';
    }
  </script>
</body>
</html>
```

---

## 🐛 Troubleshooting

### Sidebar não muda entre tipos
- Limpar localStorage: `localStorage.clear()`
- Recarregar página: `window.location.reload()`
- Verificar console para erros

### Permissões não funcionam
- Verificar se `user-manager.js` está carregado
- Verificar se `userData` está no localStorage
- Testar função: `console.log(getUserType())`

### Sidebar desapareceu
- Verificar se `sidebar-component.js` está carregado
- Verificar se `<sidebar-menu></sidebar-menu>` está no HTML
- Verificar console para erros de WebComponent

---

## 📄 Arquivos Envolvidos

- `sidebar-component.js` - WebComponent da sidebar
- `user-manager.js` - Gerenciador de tipos de usuário
- `cadastro.html` - Página de cadastro
- `cadastro-EXEMPLO.js` - Exemplo de implementação
- `components.css` - Estilos da sidebar
- Páginas que usam a sidebar: `home.html`, `confirmacao.html`, etc.

---

## ✅ Checklist de Implementação

- [ ] Adicionar seletor de tipo na página de cadastro
- [ ] Implementar função de submissão com setUserType()
- [ ] Testar sidebar para aluno
- [ ] Testar sidebar para monitor
- [ ] Adicionar user-manager.js em todas as páginas
- [ ] Implementar lógica condicional de conteúdo
- [ ] Testar permissões em ações críticas
- [ ] Testar logout e limpeza de dados
- [ ] Testar upgrade de aluno para monitor
- [ ] Testar responsividade em mobile
