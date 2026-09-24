# 🌐 AssetPulse Web - Interface SPA (Single Page Application)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![SPA](https://img.shields.io/badge/SPA-Single%20Page%20Application-blueviolet)
![License](https://img.shields.io/badge/license-MIT-purple)

Repositório oficial do **Front-end do MVP da Sprint de Desenvolvimento Full Stack Básico** (Pós-Graduação).

O **AssetPulse Web** é uma Single Page Application (SPA) autoral, elegante e responsiva, desenvolvida exclusivamente com **HTML5, CSS3 e JavaScript Vanilla puro** (sem o uso de frameworks pesados como React, Vue ou Angular). A interface consome integralmente a API RESTful em Flask e foi projetada para execução imediata no navegador via duplo clique no arquivo `index.html`.

---

## 🏛️ Atendimento às Diretrizes de Roy Fielding & Requisitos do MVP

- **Separação de Responsabilidades (Client-Server)**: O front-end atua de forma totalmente desacoplada, tratando apenas da camada de apresentação e experiência do usuário (UX), consumindo os dados da API via requisições assíncronas assentes no formato padronizado JSON.
- **Execução Direta sem Servidor Local (`file://`)**: O projeto foi estruturado para funcionar perfeitamente ao dar um duplo clique no arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox), sem a necessidade de extensões como Live Server, Node.js ou bundlers.
- **Zero Frameworks SPA**: Total aderência às regras do curso (sem React, Vue ou Angular).
- **Design System Autoral**: Estilização rica em dark theme, com tipografia *Inter* (Google Fonts), cores harmônicas HSL, efeitos de glassmorphism sutil, micro-animações, cards interativos, badges de status e modais fluidos.
- **Consumo de 100% das Rotas da API**: Todas as rotas implementadas no back-end são acionadas na interface.

---

## 🚀 Funcionalidades da Aplicação

1. **Dashboard de Indicadores (KPIs)**:
   - Resumo dinâmico do Patrimônio Total Investido.
   - Total acumulado de Proventos/Dividendos.
   - Contagem de Ativos e Movimentações.
   - Gráfico de barras de progresso visual exibindo a alocação por categoria de investimento (Ações, FIIs, Cripto, Renda Fixa, etc.).
2. **Visualização Dupla e Alternável**:
   - Modo **Cards**: Apresentação moderna com avatares estilizados por classe de ativo, métricas consolidadas (custódia, preço médio, total aportado e proventos) e botões de ação rápida.
   - Modo **Tabela**: Visão gerencial consolidada tabular com ordenação e detalhes de todos os ativos.
3. **Filtros e Busca em Tempo Real**:
   - Barra de pesquisa instantânea por código/ticker (ex: `PETR4`) ou nome do ativo.
   - Filtro seletor por classe de ativos.
   - Filtro do histórico de transações por tipo (`COMPRA`, `VENDA`, `DIVIDENDO`).
4. **Modais Interativos com Validação**:
   - **Novo Ativo**: Cadastro rápido com código, categoria, nome, meta percentual e anotações.
   - **Nova Transação**: Registro de movimentações com data selecionável, quantidade, preço unitário e cálculo em tempo real do valor total.
   - **Edição de Ativo**: Atualização dos dados cadastrais do ativo selecionado.
   - **Extrato Detalhado do Ativo**: Visualização aprofundada com histórico cronológico de todas as compras, vendas e proventos vinculados especificamente àquele ativo (Relacionamento 1:N).
   - **Confirmação de Exclusão**: Modal de alerta antes da remoção em cascata do ativo.
5. **Feedback Visual Imediato**:
   - Toasts animados de sucesso, atenção e erro.
   - Indicador de status em tempo real da conexão com a API Flask no topo da página.

---

## 📋 Pré-requisitos

Para executar a interface do front-end, você precisará apenas de:
- Um navegador web moderno instalado (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, etc.).
- Ter a API do back-end (`assetpulse-backend`) em execução na porta `5000` (`http://127.0.0.1:5000`).

---

## ⚙️ Instruções de Execução

A execução é extremamente simples e não requer nenhuma instalação de pacotes ou comandos de build:

### Método 1: Duplo Clique (Recomendado)
1. Clone ou acesse o repositório:
```bash
git clone https://github.com/mateuscarestiato/assetpulse-frontend.git
cd assetpulse-frontend
```
2. Navegue até a pasta `assetpulse-frontend` no Explorador de Arquivos do Windows ou no Finder do Mac.
3. Dê um duplo clique sobre o arquivo **`index.html`**.
4. O projeto será aberto instantaneamente no seu navegador padrão via protocolo `file://`.

### Método 2: Via Linha de Comando
No PowerShell ou terminal:
```powershell
start index.html
```

---

## 🔗 Chamadas aos Endpoints da API

Abaixo está o mapeamento de onde cada rota da API é consumida pelo JavaScript (`js/app.js`):

| Método | Endpoint | Função na Interface |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Atualiza os cards de KPI no topo e a distribuição percentual da carteira |
| `GET` | `/api/ativos` | Carrega os dados dos cards e linhas da tabela principal |
| `GET` | `/api/ativo?id={id}` | Carrega os detalhes específicos e o extrato de um ativo no modal |
| `POST` | `/api/ativo` | Submissão do formulário de cadastro de novo ativo |
| `PUT` | `/api/ativo` | Submissão das alterações no formulário de edição de ativo |
| `DELETE` | `/api/ativo?id={id}` | Ação do botão de confirmação de exclusão do ativo |
| `POST` | `/api/transacao` | Submissão do formulário de nova compra, venda ou provento |
| `GET` | `/api/transacoes` | Carrega a tabela de histórico recente e aplica filtros por tipo |

---

## 📁 Estrutura de Pastas

```
mvp-invest-web/
│
├── index.html          # Estrutura semântica e esqueleto da SPA
├── css/
│   └── style.css       # Design system completo, variáveis, tema escuro e responsividade
├── js/
│   └── app.js          # Lógica cliente, consumo da Fetch API, gerenciamento de modais e DOM
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Documentação completa do front-end
```
