# Âncora

Plataforma acadêmica para conectar alunos e monitores, com autenticação, agendamento de monitorias e acompanhamento de progresso por roadmap de turma.

## Status atual

- Autenticação com Firebase Auth (email/senha e Google)
- Integração com Firestore em telas principais
- Roadmap dinâmico por turma com progresso por usuário
- Deploy ativo em: https://ancora-black.vercel.app/

## Stack

- Front-end: HTML, CSS, JavaScript (ES Modules)
- Backend serverless: API route para configuração web do Firebase
- Banco de dados: Firebase Firestore
- Autenticação: Firebase Auth
- Deploy: Vercel

## Estrutura principal

- `index.html`: landing page
- `pages/`: telas da aplicação
- `js/`: scripts por página, componentes e utilitários
- `css/`: estilos globais, componentes e páginas
- `api/firebase-web-config.js`: endpoint que expõe config web do Firebase via variáveis de ambiente
- `vercel.json`: rewrites de rota para produção

## Como rodar localmente

1. Clone o repositório.
2. Crie um arquivo `.env` na raiz do projeto, usando `.env.example` como base.
3. Preencha as variáveis:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

4. Rode com servidor local estático (ex.: Live Server no VS Code) a partir da raiz do projeto.

Acesse:

- `/` para landing
- `/login` para autenticação
- `/home` para monitorias

## Rotas de produção (Vercel)

Definidas em `vercel.json`:

- `/`
- `/login`
- `/cadastro`
- `/home`
- `/calendario`
- `/confirmacao`
- `/minhas-monitorias`
- `/cadastrar-monitoria`
- `/roadmap`
- `/recursos`
- `/perfil`

## Firestore (coleções usadas)

- `usuarios`
- `monitorias`
- `inscricoes`
- `mensagens`
- `roadmaps`

## Fluxo recomendado para demonstração

1. Cadastro
2. Login
3. Home (listar monitorias)
4. Agendar monitoria (confirmação)
5. Minhas monitorias
6. Roadmap (carregamento por turma e atualização de progresso)

## Observações técnicas

- A configuração do Firebase no front é carregada por endpoint da pasta `api`, não por chave fixa no código.
- O arquivo `date.js` está vazio e não impacta o fluxo atual.
- O arquivo `user-manager.js` não é parte obrigatória do fluxo principal atual.

## Time

- Kauê: https://github.com/KaueSiqueira54
- Iasmin: https://github.com/IasminMoreira
- João: https://github.com/Joao2007Pedro
- Ryan: https://github.com/ryann-08
- Amanda: https://github.com/Amandach-sat