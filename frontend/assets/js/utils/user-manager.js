/**
 * Gerenciador de Tipo de Usuário
 * Responsável por gerenciar o tipo de usuário (aluno ou monitor)
 * e suas permissões de acesso
 */

const USER_TYPES = {
  STUDENT: 'student',
  MONITOR: 'monitor'
};

/**
 * Define o tipo de usuário no localStorage
 * Deve ser chamado após a autenticação/cadastro
 * @param {string} userType - 'student' ou 'monitor'
 * @param {object} userData - Dados adicionais do usuário
 */
function setUserType(userType, userData = {}) {
  if (!Object.values(USER_TYPES).includes(userType)) {
    console.error('Tipo de usuário inválido:', userType);
    return false;
  }

  const userInfo = {
    userType,
    ...userData,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('userData', JSON.stringify(userInfo));
  console.log(`Usuário definido como ${userType}`);
  
  // Recarregar a sidebar se existir
  const sidebar = document.querySelector('sidebar-menu');
  if (sidebar && sidebar.changeUserType) {
    sidebar.changeUserType(userType);
  }
  
  return true;
}

/**
 * Obtém o tipo de usuário atual
 * @returns {string} 'student' ou 'monitor'
 */
function getUserType() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return userData.userType || null;
}

/**
 * Obtém os dados completos do usuário
 * @returns {object} Dados do usuário
 */
function getUserData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}

/**
 * Verifica se o usuário é aluno
 * @returns {boolean}
 */
function isStudent() {
  return getUserType() === USER_TYPES.STUDENT;
}

/**
 * Verifica se o usuário é monitor
 * @returns {boolean}
 */
function isMonitor() {
  return getUserType() === USER_TYPES.MONITOR;
}

/**
 * Muda o tipo de usuário para monitor
 * (Utilitário para conversão de aluno para monitor)
 */
function upgradeToMonitor() {
  const currentUser = getUserData();
  setUserType(USER_TYPES.MONITOR, {
    ...currentUser,
    upgradedAt: new Date().toISOString()
  });
  return true;
}

/**
 * Obtém as permissões de acordo com o tipo de usuário
 * @returns {object} Objeto com as permissões do usuário
 */
function getUserPermissions() {
  const userType = getUserType();

  const permissions = {
    student: {
      home: true,
      agenda: true,
      minhasMonitorias: true,
      recursos: true,
      roadmap: true,
      chat: true,
      dashboard: true,
      canCreateMonitoring: true,
      canViewMonitorDashboard: false,
      canBecomeMonitor: true,
      canManageLessons: false
    },
    monitor: {
      home: true,
      agenda: true,
      minhasMonitorias: true,
      recursos: true,
      roadmap: true,
      chat: true,
      dashboard: false,
      canCreateMonitoring: false,
      canViewMonitorDashboard: true,
      canBecomeMonitor: false,
      canManageLessons: true
    }
  };

  return permissions[userType] || {};
}

/**
 * Verifica se o usuário tem acesso a um recurso específico
 * @param {string} resource - Nome do recurso
 * @returns {boolean}
 */
function hasPermission(resource) {
  const permissions = getUserPermissions();
  return permissions[resource] === true;
}

/**
 * Redireciona se o usuário não tiver acesso ao recurso
 * @param {string} resource - Nome do recurso
 * @param {string} redirectTo - URL para redirecionar
 * @returns {boolean} true se tem permissão
 */
function checkPermissionOrRedirect(resource, redirectTo = '../pages/login.html') {
  if (!hasPermission(resource)) {
    console.warn(`Acesso negado ao recurso: ${resource}`);
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

/**
 * Fecha a sessão do usuário
 */
function logoutUser() {
  localStorage.removeItem('userData');
  localStorage.removeItem('userToken');
  sessionStorage.clear();
  console.log('Usuário desconectado');
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    USER_TYPES,
    setUserType,
    getUserType,
    getUserData,
    isStudent,
    isMonitor,
    upgradeToMonitor,
    getUserPermissions,
    hasPermission,
    checkPermissionOrRedirect,
    logoutUser
  };
}
