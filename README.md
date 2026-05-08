# 📚 ECA Digital — Site da Turma do 3º Ano

Site colaborativo com painel de administração para gerenciar projetos sobre o ECA Digital.

---

## 🚀 Como abrir no VS Code

1. Extraia a pasta `eca-digital`
2. No VS Code: **Arquivo → Abrir Pasta** → selecione `eca-digital`
3. Instale a extensão **Live Server** (`Ctrl+Shift+X` → buscar "Live Server")
4. Clique com botão direito em `index.html` → **"Open with Live Server"**

---

## 🔐 Acesso ao Painel Admin

- **URL:** `admin.html`
- **Usuário padrão:** `admin`
- **Senha padrão:** `eca2025`

> ⚠️ Para mudar as credenciais, edite o arquivo `js/storage.js`:
> ```js
> const ADMIN_USER = 'admin';   // ← mude aqui
> const ADMIN_PASS = 'eca2025'; // ← mude aqui
> ```

---

## ✨ Funcionalidades

### Site público (`index.html`)
- Visualizar projetos **aprovados** pelo admin
- Filtrar por categoria e buscar
- Formulário para enviar trabalhos (ficam pendentes até aprovação)
- Contadores de projetos e alunos

### Painel Admin (`admin.html`)
- Login com usuário + senha
- **Resumo:** pendentes, aprovados, total e alunos
- **Aprovar** projetos enviados pelos alunos
- **Revogar** aprovação (volta para pendente)
- **Editar** qualquer campo + status do projeto
- **Excluir** com confirmação
- Filtro por abas: Pendentes / Aprovados / Todos
- Busca por título, autor ou tag

---

## 📁 Estrutura de arquivos

```
eca-digital/
├── index.html        ← Página pública
├── admin.html        ← Painel de administração
├── css/
│   ├── style.css     ← Estilos gerais
│   └── admin.css     ← Estilos do painel
├── js/
│   ├── storage.js    ← Banco de dados (localStorage) + utilitários
│   ├── app.js        ← Lógica da página pública
│   └── admin.js      ← Lógica do painel admin
└── README.md
```

---

## 💡 Observações

- Os dados ficam salvos no **localStorage** do navegador
- Cada computador/navegador tem sua própria lista local
- Para compartilhar entre alunos de computadores diferentes, seria necessário um servidor online (Firebase, por exemplo)

---

Projeto escolar · 3º Ano 2025 🌱
