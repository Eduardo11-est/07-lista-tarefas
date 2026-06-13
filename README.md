# ⚡ Agilis — Seu fluxo inteligente

O **Agilis** é um sistema completo e de alto desempenho para gestão de tarefas e fluxos de trabalho (To-Do List & Kanban), construído com uma experiência de usuário (UX/UI) moderna, limpa e extremamente responsiva. Integrado com o ecossistema Supabase, ele oferece persistência em tempo real, segurança baseada em funções (RBAC), dashboards interativos e ferramentas avançadas de manutenção como exportação e restauração de dados.

---

## ✨ Recursos Principais

### 📋 Visualização Dinâmica de Tarefas
*   A listagem principal de tarefas oculta itens concluídos automaticamente na aba "Todas", mantendo o foco exclusivo nas pendências.
*   Ao marcar uma tarefa, ela é imediatamente movida para a aba de "Concluídas".

### 📊 Painel de Análises Integrado
*   Análise visual de produtividade em tempo real com estatísticas de tarefas concluídas, pendentes e taxas de progresso.
*   Gráfico de rosca para categorização de tarefas (Trabalho, Pessoal, Estudos).
*   Gráfico de barras para distribuição de prioridades (Alta, Média, Baixa).

### 🏷️ Formulário em Modal Flutuante
*   Criação de novas tarefas com controle simplificado e completo (Título, Descrição, Categoria, Prioridade e Data de Vencimento).
*   Interface em modal sobreposta com fundo desfocado (`backdrop-filter`) para foco total do usuário.

### 📌 Quadro Kanban Vibrante
*   Distribuição de tarefas em 4 colunas estáticas: **Em espera**, **Ativo**, **Resolvido** e **Closed**.
*   Suporte a movimentação por **Drag & Drop** (arrastar e soltar) nativo.
*   Destaques de cores pastel vibrantes e sólidas de acordo com cada coluna, mantendo a opacidade suavizada apenas na coluna "Closed" para evidenciar a conclusão.

### 🌙 Dark Mode Automático e Manual
*   Detecção automática do horário local: ativa o Modo Escuro após as 18h.
*   Seletor manual no cabeçalho (Claro, Escuro e Auto) persistido diretamente no perfil de dados do usuário.

### 🔐 Administração de Acessos (RBAC)
*   Segurança avançada no banco de dados com políticas de RLS no Supabase.
*   Sub-aba administrativa para cadastro síncrono de novas contas de usuário usando uma RPC segura com privilégios de `SECURITY DEFINER`.
*   Painel de controle de permissões que permite alterar as funções dos usuários (`Usuário` ou `Administrador`) em tempo real.

### 💾 Central de Backup e Restauração
*   **Exportação:** Baixe toda a sua base de dados de tarefas no formato JSON local com um clique.
*   **Importação:** Restaure backups arrastando e soltando arquivos JSON, realizando inserções síncronas em lote (bulk insert) no Supabase.

---

## 🚀 Tecnologias Utilizadas

*   **Core:** React 19 (Hooks e Context API para gerenciamento de estado global)
*   **Construção:** Vite (Ferramental de HMR ultrarrápido)
*   **Banco de Dados & Auth:** Supabase (PostgreSQL, RLS e RPC Functions)
*   **Estilo:** Vanilla CSS (Design system estruturado por variáveis)

---

## 🛠️ Configuração e Instalação Local

### 1. Pré-requisitos
*   Node.js (versão 18 ou superior)
*   npm ou yarn

### 2. Clonar o Repositório
```bash
git clone https://github.com/Eduardo11-est/07-lista-tarefas.git
cd 07-lista-tarefas
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`:
```bash
cp .env.example .env
```
Substitua os valores com as credenciais do seu projeto Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
```

### 5. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará rodando localmente em `http://localhost:5173`.

---

## 👨‍💻 Desenvolvido por:
*   **DEV Eduardo Oliveira**
