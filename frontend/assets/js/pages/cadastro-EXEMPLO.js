/**
 * EXEMPLO DE INTEGRAÇÃO NO CADASTRO
 * 
 * Este arquivo demonstra como integrar o sistema de tipo de usuário
 * durante o processo de cadastro
 */

// ============================================================
// 1. ADICIONAR NO HTML DO CADASTRO (cadastro.html)
// ============================================================

/*
<section class="form-section">
  <label for="user-type">Tipo de Usuário</label>
  
  <div class="user-type-options">
    <label class="option-card">
      <input type="radio" name="userType" value="student" checked>
      <div class="option-content">
        <h3>Sou Aluno</h3>
        <p>Busco monitorias para melhorar meus estudos</p>
      </div>
    </label>
    
    <label class="option-card">
      <input type="radio" name="userType" value="monitor">
      <div class="option-content">
        <h3>Sou Monitor</h3>
        <p>Quero oferecer monitorias e ajudar outros alunos</p>
      </div>
    </label>
  </div>
</section>
*/

// ============================================================
// 2. FUNÇÃO DE SUBMISSÃO DO CADASTRO
// ============================================================

function submitCadastro() {
  const formData = {
    // Dados pessoais
    name: document.querySelector('input[name="name"]').value,
    email: document.querySelector('input[name="email"]').value,
    password: document.querySelector('input[name="password"]').value,
    
    // Tipo de usuário
    userType: document.querySelector('input[name="userType"]:checked').value,
    
    // Dados adicionais baseado no tipo
    subject: document.querySelector('input[name="subject"]')?.value, // Para monitores
    bio: document.querySelector('textarea[name="bio"]')?.value,      // Para ambos
  };

  // Validar dados
  if (!formData.name || !formData.email || !formData.password || !formData.userType) {
    alert('Por favor preencha todos os campos obrigatórios');
    return false;
  }

  // Criar usuário no Firebase/Backend
  createUserInBackend(formData)
    .then((response) => {
      console.log('Usuário cadastrado com sucesso:', response);
      
      // Definir tipo de usuário no localStorage
      setUserType(formData.userType, {
        id: response.userId,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        bio: formData.bio,
        verifiedEmail: false
      });

      // Salvar token de autenticação
      localStorage.setItem('userToken', response.token);

      // Redirecionar para página apropriada
      redirectAfterSignUp(formData.userType);
    })
    .catch((error) => {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar usuário: ' + error.message);
    });
}

// ============================================================
// 3. REDIRECIONAR APÓS CADASTRO
// ============================================================

function redirectAfterSignUp(userType) {
  if (userType === 'student') {
    // Redirecionar aluno para página de início de aluno
    window.location.href = '../pages/home.html';
  } else if (userType === 'monitor') {
    // Redirecionar monitor para configuração de perfil
    window.location.href = '../pages/monitor-setup.html';
  }
}

// ============================================================
// 4. CRIAR USUÁRIO NO BACKEND (EXEMPLO COM FIREBASE)
// ============================================================

async function createUserInBackend(userData) {
  try {
    // Usando Firebase Authentication
    const auth = firebase.auth();
    const userCredential = await auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    const userId = userCredential.user.uid;

    // Salvar dados adicionais no Firestore
    await firebase.firestore().collection('users').doc(userId).set({
      id: userId,
      name: userData.name,
      email: userData.email,
      userType: userData.userType,
      subject: userData.subject || null,
      bio: userData.bio || null,
      createdAt: new Date(),
      profileComplete: false,
      emailVerified: false
    });

    // Enviar email de verificação
    await userCredential.user.sendEmailVerification();

    return {
      userId: userId,
      token: userCredential.user.getIdToken(),
      success: true
    };

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error(error.message);
  }
}

// ============================================================
// 5. EXEMPLO DE CONDICIONAL NA PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Obter tipo de usuário
  const userType = getUserType();

  if (userType === 'student') {
    // Lógica específica para alunos
    console.log('Página sendo carregada para aluno');
    loadStudentResources();
  } else if (userType === 'monitor') {
    // Lógica específica para monitores
    console.log('Página sendo carregada para monitor');
    loadMonitorResources();
  } else {
    // Usuário não autenticado
    console.log('Usuário não autenticado, redirecionando para login');
    window.location.href = '../pages/login.html';
  }
});

// ============================================================
// 6. CSS PARA AS OPÇÕES DE TIPO DE USUÁRIO NO CADASTRO
// ============================================================

/*
.user-type-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.option-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: #1300e1;
}

.option-card:hover {
  border-color: #1300e1;
  background-color: rgba(19, 0, 225, 0.05);
}

.option-card input[type="radio"]:checked + .option-content,
.option-card input[type="radio"]:checked {
  color: #1300e1;
}

.option-card input:checked ~ {
  border-color: #1300e1;
  background-color: rgba(19, 0, 225, 0.1);
}

.option-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #090e5b;
}

.option-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

@media (max-width: 768px) {
  .user-type-options {
    grid-template-columns: 1fr;
  }
}
*/
