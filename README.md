# 🌐 AssetPulse Web - Interface SPA (Single Page Application)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Architecture](https://img.shields.io/badge/Architecture-Roy%20Fielding%20REST-brightgreen)
![SPA](https://img.shields.io/badge/SPA-Single%20Page%20Application-blueviolet)
![License](https://img.shields.io/badge/license-MIT-purple)

O **AssetPulse Web** é uma Single Page Application (SPA) autoral, elegante e responsiva, desenvolvida exclusivamente com **HTML5 semântico, CSS3 moderno e JavaScript Vanilla puro** (sem o uso de frameworks pesados como React, Vue ou Angular). A interface consome integralmente a API RESTful em Flask e foi projetada com arquitetura client-server desacoplada para execução imediata no navegador via duplo clique no arquivo `index.html`.

A solução oferece acompanhamento patrimonial em tempo real, visualização analítica flexível (Cards modernos vs Tabela consolidada), modais interativos para gestão de posições e movimentações financeiras, e feedback instantâneo ao usuário por notificações toast animadas.

---

## 🏛️ Padrões Arquiteturais & Diretrizes de Roy Fielding

A aplicação cliente foi concebida respeitando os pilares fundamentais da web estabelecidos por Roy Fielding:

- **Separação de Responsabilidades (Client-Server)**: O front-end atua de forma estritamente desacoplada da camada de dados. Toda a persistência, cálculos de média ponderada e integridade relacional residem no back-end, comunicando-se por meio de requisições assíncronas assentes no formato padrão JSON.
- **Ausência de Estado no Cliente (Stateless Communication)**: Cada requisição enviada ao servidor contém todas as informações necessárias para ser interpretada, sem dependência de estado de sessão compartilhado.
- **Execução Direta sem Servidor Local (`file://`)**: A arquitetura do código cliente utiliza scripts nativos e recursos sem bloqueios de CORS, permitindo execução direta por duplo clique no arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari), sem requerer Node.js, Webpack, Vite ou extensões como Live Server.
- **Zero Dependências Pesadas (Vanilla Web)**: Desenvolvido com máxima fidelidade aos padrões nativos da web, garantindo alta performance de renderização, footprint levíssimo de memória e controle fino sobre o ciclo de vida do DOM.

---

## 🎨 Design System & Experiência do Usuário (UI/UX)

- **Dark Theme Sofisticado**: Paleta de cores harmônica fundamentada em tons de ardósia profunda (`#0f172a`), superfícies elevadas em glassmorphism e cores de destaque semânticas (azul índigo para ações primárias, esmeralda para rendimentos, roxo para proventos e âmbar para alertas).
- **Tipografia Moderna**: Integração da família tipográfica *Inter* (Google Fonts), balanceando legibilidade e densidade de informação em dashboards financeiros.
- **Micro-Animações & Feedback Visual**:
  - Toasts de notificação flutuantes e contextuais (sucesso, aviso, erro).
  - Indicador de status em tempo real da conexão com a API Flask no topo da aplicação.
  - Animações suaves de transição nos modais e efeitos táteis de elevação nos cards ao passar o cursor.
- **Visualização Dupla Alternável**:
  - **Modo Cards**: Apresentação visual rica com avatares dinâmicos por categoria (Ações, FIIs, Cripto, Renda Fixa) e indicadores-chave em destaque.
  - **Modo Tabela**: Exibição analítica densa com todas as colunas numéricas estruturadas para conferência rápida de custódia e aportes.

---

## 🚀 Funcionalidades da Aplicação

1. **Dashboard de Indicadores Executivos (KPIs)**:
   - Resumo em tempo real do Patrimônio Total Investido.
   - Montante acumulado de Proventos e Rendimentos (Dividendos e JCP).
   - Contagem dinâmica de Ativos e Movimentações registradas.
   - Barras de progresso com a distribuição percentual da carteira por categoria de investimento.
2. **Gestão Completa de Ativos**:
   - Cadastro ágil com código/ticker único, razão social, classe e meta de alocação (%).
   - Edição de informações cadastrais e notas de tese de investimento.
   - Exclusão com confirmação em modal e remoção em efeito cascata no banco de dados.
3. **Módulo de Movimentações & Extrato Cronológico (1:N)**:
   - Registro de operações financeiras: `COMPRA`, `VENDA` e `DIVIDENDO`.
   - Seleção de data da operação, quantidade negociada, preço unitário e cálculo em tempo real do valor total.
   - Modal de extrato detalhado por ativo, exibindo todo o histórico individual de operações vinculadas.
4. **Filtros e Busca Instantânea**:
   - Campo de pesquisa em tempo real por ticker (ex: `PETR4`) ou razão social.
   - Filtro seletor de ativos por classe de investimento.
   - Filtro do extrato geral de movimentações por tipo de operação.

---

## 🔗 Mapeamento de Consumo dos Endpoints da API

Todas as rotas implementadas no back-end são ativamente consumidas pelo JavaScript client ([js/app.js](js/app.js)):

| Método | Endpoint | Ação na Interface |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Alimenta os cards de KPI de topo e o gráfico de barras de alocação patrimonial |
| `GET` | `/api/ativos` | Carrega os dados dos cards e linhas da visualização tabular |
| `GET` | `/api/ativo?id={id}` | Invocado ao abrir o modal de detalhes/extrato completo de um ativo |
| `POST` | `/api/ativo` | Submissão do formulário no modal de inclusão de novo ativo |
| `PUT` | `/api/ativo` | Submissão das alterações no modal de edição cadastral |
| `DELETE` | `/api/ativo?id={id}` | Ação do modal de confirmação de exclusão com expurgo em cascata |
| `POST` | `/api/transacao` | Submissão do formulário de aporte, alienação ou dividendo |
| `GET` | `/api/transacoes` | Alimenta a tabela de extrato geral e responde aos filtros por tipo |

---

## ⚙️ Instruções de Execução

A interface foi projetada para execução imediata sem etapas de compilação ou instalação de dependências:

### Pré-requisitos
- Um navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox ou Safari).
- O serviço de back-end (`assetpulse-backend`) em execução na porta `5000` (`http://127.0.0.1:5000`).

### Modo 1: Duplo Clique (Recomendado)
1. Clone ou acesse o repositório local:
   ```bash
   git clone https://github.com/mateuscarestiato/assetpulse-frontend.git
   cd assetpulse-frontend
   ```
2. No Explorador de Arquivos do Windows (ou Finder do macOS), dê um duplo clique no arquivo **`index.html`**.
3. A aplicação abrirá instantaneamente via protocolo `file://` conectando-se automaticamente à API local.

### Modo 2: Via Terminal (PowerShell / Bash)
```powershell
start index.html
```

---

## 📁 Estrutura de Pastas

```
assetpulse-frontend/
│
├── index.html          # Marcação semântica, acessibilidade e estrutura modular da SPA
├── css/
│   └── style.css       # Design System autoral, variáveis CSS (tokens), tema dark e layout responsivo
├── js/
│   └── app.js          # Lógica da aplicação, gerenciamento de estado cliente, consumo Fetch e modais
├── .gitignore          # Regras de exclusão do Git
└── README.md           # Documentação técnica completa da interface
```

---

## 👨‍💻 Autor

Desenvolvido por **Mateus Carestiato**  
GitHub: [@mateuscarestiato](https://github.com/mateuscarestiato)
