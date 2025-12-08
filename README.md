# Projeto de Segurança em Aplicações Web (Node.js + SQLite)

Este projeto consiste em uma aplicação Web desenvolvida para demonstrar a implementação prática de mecanismos de segurança e defesa contra vulnerabilidades críticas, focando em SQL Injection, Cross-Site Scripting (XSS), Controle de Acesso e Criptografia.

A aplicação simula um portal acadêmico com áreas restritas para Alunos e Professores, além de uma busca pública de cursos com dados sensíveis criptografados.

---

## 🚀 Como Executar o Projeto

**Pré-requisitos:** Node.js instalado.

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Inicie o servidor:**
    ```bash
    node server.js
    ```
3.  **Acesse:** Abra o navegador em `http://localhost:3005`

---

## Roteiro de Apresentação

A apresentação técnica está dividida em 3 partes fundamentais.

### 👤 Parte 1: Arquitetura, Stack Tecnológica e Banco de Dados

* **Visão Geral:** Explicar que a aplicação é um sistema escolar simplificado com 3 perfis de acesso: Público (Visitante), Aluno e Professor.
* **A Stack (Tecnologias):**
    * **Backend:** Node.js com Express (rápido, leve e não oculta a lógica de segurança).
    * **Frontend:** Server-Side Rendering (SSR) utilizando EJS. Isso garante que o HTML já chegue pronto ao navegador, facilitando o controle de XSS no servidor.
    * **Banco de Dados:** SQLite rodando em memória (`:memory:`). Explicar que o banco é recriado a cada execução, ideal para testes de segurança sem deixar resíduos.
* **Estrutura de Dados (`database.js`):**
    * Mostrar a criação das tabelas `users` e `courses`.
    * **Ponto Chave:** Destacar que o campo `name_encrypted` na tabela de cursos **não armazena o texto plano**, provando que o banco é ilegível se vazado.

---

### 👤 Parte 2: Controle de Acesso e Autenticação

* **Fluxo de Login:**
    * Explicar como o sistema valida o usuário.
    * Uso de `cookie-session` para manter o estado do usuário logado de forma segura (`httpOnly`).
* **Controle de Acesso (RBAC - Role Based Access Control):**
    * Explicar o conceito de *Middlewares* no Express.
    * Mostrar a função `requireAuth`: Bloqueia quem não está logado.
    * Mostrar a função `requireRole`: Garante que alunos não acessem a rota `/professores` e vice-versa (Prevenção de *Broken Access Control*).

---

### 👤 Parte 3: Criptografia Avançada e Prevenção de Injeção (SQLi e XSS)

* **Criptografia de Senhas (`security.js`):**
    * Não usamos MD5 (que é fraco).
    * **Solução:** Implementação manual de **PBKDF2** (Password-Based Key Derivation Function 2) com **Salt Aleatório**.
    * Explicar que o *Salt* garante que usuários com a mesma senha tenham hashes diferentes no banco.
* **Criptografia de Dados Sensíveis (Encryption at Rest):**
    * Os nomes dos cursos são gravados com **AES-256-CBC**.
    * Mostrar que o dado é descriptografado (`decryptData`) apenas no momento exato da renderização na tela de busca, e nunca antes.
* **Prevenção de SQL Injection:**
    * Mostrar a consulta `db.get("... WHERE username = ?", [username])`.
    * Explicar que o uso do `?` (Placeholder) faz com que o banco trate a entrada estritamente como dado, e não como comando, neutralizando ataques como `' OR '1'='1`.
* **Prevenção de XSS (Cross-Site Scripting):**
    * Explicar que o EJS faz o "escape" automático de caracteres especiais. Se alguém tentar inserir `<script>alert('hack')</script>`, o sistema converte para texto seguro (`&lt;script&gt;`) antes de enviar ao navegador.

## 🧪 Credenciais para Teste

Para validar as diferentes permissões e o acesso às rotas protegidas:

Perfil,Usuário,Senha,Acesso Permitido
Estudante,aluno,Aluno@2025!Sup3rS3cur3,"/alunos, /busca"
Docente,professor,Prof#2025$H4rdP4ssw0rd,"/professores, /busca"