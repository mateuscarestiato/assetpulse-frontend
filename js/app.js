/**
 * AssetPulse - Aplicação SPA (Single Page Application) Vanilla JS
 * Comunicação direta com a API Flask RESTful em conformidade com as key constraints.
 * Totalmente compatível com execução direta no navegador (protocolo file://).
 */

// URL base da API Flask
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Estado local da aplicação cliente
const state = {
    ativos: [],
    transacoes: [],
    dashboard: null,
    filtroTexto: '',
    filtroCategoria: '',
    filtroTipoTransacao: '',
    modoVisualizacao: 'cards', // 'cards' ou 'table'
    ativoParaExcluir: null,
    ativoEmDetalhes: null
};

// ==========================================================================
// Formatação e Helpers
// ==========================================================================

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
};

const formatarNumero = (valor, decimais = 2) => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimais
    }).format(valor || 0);
};

const formatarDataBR = (dataString) => {
    if (!dataString) return '-';
    // Corrige fuso interpretando como data local simples
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
};

const obterClasseAvatar = (categoria) => {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('ações') || cat.includes('acoes')) return 'avatar-acoes';
    if (cat.includes('fii')) return 'avatar-fiis';
    if (cat.includes('cripto')) return 'avatar-cripto';
    if (cat.includes('renda')) return 'avatar-rendafixa';
    return 'avatar-outros';
};

const obterIconeCategoria = (categoria) => {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('ações') || cat.includes('acoes')) return 'fa-solid fa-arrow-trend-up';
    if (cat.includes('fii')) return 'fa-solid fa-building';
    if (cat.includes('cripto')) return 'fa-brands fa-bitcoin';
    if (cat.includes('renda')) return 'fa-solid fa-shield-halved';
    return 'fa-solid fa-vault';
};

// ==========================================================================
// Sistema de Toasts de Notificação
// ==========================================================================

function showToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    let icone = 'fa-solid fa-circle-check text-success';
    if (tipo === 'danger') icone = 'fa-solid fa-circle-xmark text-danger';
    if (tipo === 'warning') icone = 'fa-solid fa-triangle-exclamation text-amber';
    if (tipo === 'info') icone = 'fa-solid fa-circle-info text-primary';

    toast.innerHTML = `
        <i class="${icone}"></i>
        <div style="flex: 1;">${mensagem}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================================================
// Verificação de Status da API
// ==========================================================================

async function verificarStatusApi() {
    const statusEl = document.getElementById('api-status');
    const textEl = document.getElementById('api-status-text');

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, { method: 'GET' });
        if (response.ok) {
            statusEl.className = 'api-status-badge status-online';
            textEl.textContent = 'API Conectada (Flask)';
            return true;
        } else {
            throw new Error();
        }
    } catch (err) {
        statusEl.className = 'api-status-badge status-offline';
        textEl.textContent = 'API Offline (Inicie o backend)';
        return false;
    }
}

// ==========================================================================
// 1. ROTA: GET /api/dashboard (Métricas Executivas da Carteira)
// ==========================================================================

async function carregarDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Erro ao consultar dashboard');

        const dados = await response.json();
        state.dashboard = dados;

        // Atualiza KPIs principais
        document.getElementById('kpi-patrimonio').textContent = formatarMoeda(dados.patrimonio_investido);
        document.getElementById('kpi-proventos').textContent = formatarMoeda(dados.total_proventos);
        document.getElementById('kpi-ativos').textContent = dados.quantidade_ativos;
        document.getElementById('kpi-transacoes-count').textContent = `${dados.quantidade_transacoes} movimentações registradas`;

        const qtdClasses = dados.distribuicao_categorias.length;
        document.getElementById('kpi-classes').textContent = `${qtdClasses} Classe${qtdClasses > 1 ? 's' : ''}`;

        if (dados.distribuicao_categorias.length > 0) {
            const top = dados.distribuicao_categorias[0];
            document.getElementById('kpi-maior-alocacao').textContent = `Maior peso: ${top.categoria} (${top.percentual}%)`;
        }

        // Renderiza barras de alocação
        renderizarBarrasAlocacao(dados.distribuicao_categorias, dados.patrimonio_investido);

    } catch (error) {
        console.warn('Não foi possível carregar o dashboard:', error);
    }
}

function renderizarBarrasAlocacao(categorias, totalInvestido) {
    const container = document.getElementById('allocation-bars-container');
    if (!container) return;

    if (!categorias || categorias.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-pie"></i>
                <p>Nenhuma distribuição registrada ainda. Cadastre seus ativos e compras para visualizar.</p>
            </div>
        `;
        return;
    }

    const cores = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

    container.innerHTML = categorias.map((cat, idx) => {
        const cor = cores[idx % cores.length];
        return `
            <div class="allocation-item">
                <div class="allocation-info">
                    <span class="allocation-cat-name">
                        <i class="fa-solid fa-circle" style="color: ${cor}; font-size: 0.65rem; margin-right: 0.4rem;"></i>
                        ${cat.categoria} (${cat.quantidade_ativos} ativo${cat.quantidade_ativos > 1 ? 's' : ''})
                    </span>
                    <div class="allocation-values">
                        <span>${formatarMoeda(cat.total_investido)}</span>
                        <strong>${cat.percentual}%</strong>
                    </div>
                </div>
                <div class="allocation-track">
                    <div class="allocation-fill" style="width: ${cat.percentual}%; background-color: ${cor};"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// 2. ROTA: GET /api/ativos (Listagem Completa de Ativos)
// ==========================================================================

async function carregarAtivos() {
    const cardsContainer = document.getElementById('assets-cards-container');
    const tableBody = document.getElementById('assets-table-body');

    try {
        const response = await fetch(`${API_BASE_URL}/ativos`);
        if (!response.ok) throw new Error('Falha ao obter lista de ativos');

        const dados = await response.json();
        state.ativos = dados.ativos || [];

        atualizarSelectsDeAtivos(state.ativos);
        renderizarAtivos();

    } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation text-danger"></i>
                <p>Erro ao conectar com a API em <code>${API_BASE_URL}</code>.</p>
                <button class="btn btn-sm btn-outline" onclick="inicializarApp()">Tentar Novamente</button>
            </div>
        `;
    }
}

function filtrarAtivos() {
    return state.ativos.filter(ativo => {
        const matchTexto = 
            ativo.codigo.toLowerCase().includes(state.filtroTexto.toLowerCase()) ||
            ativo.nome.toLowerCase().includes(state.filtroTexto.toLowerCase());
        const matchCategoria = !state.filtroCategoria || ativo.categoria === state.filtroCategoria;
        return matchTexto && matchCategoria;
    });
}

function renderizarAtivos() {
    const ativosFiltrados = filtrarAtivos();
    const cardsContainer = document.getElementById('assets-cards-container');
    const tableBody = document.getElementById('assets-table-body');

    if (ativosFiltrados.length === 0) {
        const htmlVazio = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>Nenhum ativo localizado com os filtros selecionados.</p>
                <button class="btn btn-sm btn-primary" onclick="abrirModal('modal-ativo')">
                    <i class="fa-solid fa-plus"></i> Cadastrar Novo Ativo
                </button>
            </div>
        `;
        cardsContainer.innerHTML = htmlVazio;
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">Nenhum ativo encontrado.</td></tr>`;
        return;
    }

    // Renderização dos CARDS
    cardsContainer.innerHTML = ativosFiltrados.map(ativo => {
        const avatarClass = obterClasseAvatar(ativo.categoria);
        const iconClass = obterIconeCategoria(ativo.categoria);

        return `
            <div class="asset-card" data-id="${ativo.id}">
                <div>
                    <div class="asset-card-header">
                        <div class="asset-ticker-box">
                            <div class="asset-avatar ${avatarClass}">
                                <i class="${iconClass}"></i>
                            </div>
                            <div class="asset-title">
                                <h3>${ativo.codigo}</h3>
                                <p title="${ativo.nome}">${ativo.nome}</p>
                            </div>
                        </div>
                        <span class="asset-category-pill">${ativo.categoria}</span>
                    </div>

                    <div class="asset-metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Custódia</span>
                            <span class="metric-val">${formatarNumero(ativo.quantidade_custodia, 4)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Preço Médio</span>
                            <span class="metric-val">${formatarMoeda(ativo.preco_medio)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Total Aportado</span>
                            <span class="metric-val">${formatarMoeda(ativo.total_investido)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Proventos</span>
                            <span class="metric-val text-emerald">${formatarMoeda(ativo.total_proventos)}</span>
                        </div>
                    </div>
                </div>

                <div class="asset-card-actions">
                    <button class="btn btn-sm btn-outline" onclick="abrirDetalhesAtivo(${ativo.id})">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Detalhes
                    </button>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="btn-icon" title="Nova Movimentação" onclick="abrirTransacaoParaAtivo(${ativo.id})">
                            <i class="fa-solid fa-plus-minus"></i>
                        </button>
                        <button class="btn-icon" title="Editar Ativo" onclick="abrirEdicaoAtivo(${ativo.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-icon btn-icon-danger" title="Excluir Ativo" onclick="solicitarExclusaoAtivo(${ativo.id}, '${ativo.codigo}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Renderização da TABELA
    tableBody.innerHTML = ativosFiltrados.map(ativo => `
        <tr>
            <td><strong>${ativo.codigo}</strong></td>
            <td>${ativo.nome}</td>
            <td><span class="badge badge-info">${ativo.categoria}</span></td>
            <td>${formatarNumero(ativo.quantidade_custodia, 4)}</td>
            <td>${formatarMoeda(ativo.preco_medio)}</td>
            <td><strong>${formatarMoeda(ativo.total_investido)}</strong></td>
            <td class="text-emerald">${formatarMoeda(ativo.total_proventos)}</td>
            <td>${ativo.meta_alocacao}%</td>
            <td>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn-icon" title="Extrato / Detalhes" onclick="abrirDetalhesAtivo(${ativo.id})">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Editar" onclick="abrirEdicaoAtivo(${ativo.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon btn-icon-danger" title="Excluir" onclick="solicitarExclusaoAtivo(${ativo.id}, '${ativo.codigo}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function atualizarSelectsDeAtivos(ativos) {
    const select = document.getElementById('trans-ativo-id');
    if (!select) return;

    if (ativos.length === 0) {
        select.innerHTML = `<option value="">Nenhum ativo disponível</option>`;
        return;
    }

    select.innerHTML = ativos.map(a => `
        <option value="${a.id}">${a.codigo} - ${a.nome} (${a.categoria})</option>
    `).join('');
}

// ==========================================================================
// 3. ROTA: GET /api/ativo (Busca Detalhada com Histórico 1:N)
// ==========================================================================

async function abrirDetalhesAtivo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/ativo?id=${id}`);
        if (!response.ok) throw new Error('Falha ao buscar detalhes do ativo');

        const ativo = await response.json();
        state.ativoEmDetalhes = ativo;

        document.getElementById('detalhe-titulo').innerHTML = `<i class="fa-solid fa-chart-line text-primary"></i> ${ativo.codigo} - ${ativo.nome}`;
        document.getElementById('detalhe-subtitulo').textContent = `Classe: ${ativo.categoria} • Meta de Alocação: ${ativo.meta_alocacao}%`;

        document.getElementById('detalhe-custodia').textContent = formatarNumero(ativo.quantidade_custodia, 4);
        document.getElementById('detalhe-preco-medio').textContent = formatarMoeda(ativo.preco_medio);
        document.getElementById('detalhe-total-investido').textContent = formatarMoeda(ativo.total_investido);
        document.getElementById('detalhe-total-proventos').textContent = formatarMoeda(ativo.total_proventos);

        document.getElementById('detalhe-observacoes').textContent = ativo.observacoes || 'Nenhuma observação cadastrada para este ativo.';

        const tbody = document.getElementById('detalhe-transacoes-tbody');
        if (!ativo.transacoes || ativo.transacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhuma transação cadastrada para este ativo.</td></tr>`;
        } else {
            tbody.innerHTML = ativo.transacoes.map(t => {
                let badgeClass = 'badge-success';
                if (t.tipo === 'VENDA') badgeClass = 'badge-warning';
                if (t.tipo === 'DIVIDENDO') badgeClass = 'badge-purple';

                return `
                    <tr>
                        <td>${formatarDataBR(t.data_transacao)}</td>
                        <td><span class="badge ${badgeClass}">${t.tipo}</span></td>
                        <td>${formatarNumero(t.quantidade, 4)}</td>
                        <td>${formatarMoeda(t.preco_unitario)}</td>
                        <td><strong>${formatarMoeda(t.valor_total)}</strong></td>
                        <td>${t.descricao || '-'}</td>
                    </tr>
                `;
            }).join('');
        }

        abrirModal('modal-detalhes-ativo');

    } catch (err) {
        showToast('Erro ao carregar detalhes do ativo.', 'danger');
    }
}

// ==========================================================================
// 4. ROTA: POST /api/ativo (Cadastro de Ativo)
// ==========================================================================

async function submeterNovoAtivo(e) {
    e.preventDefault();

    const codigo = document.getElementById('ativo-codigo').value.trim().toUpperCase();
    const nome = document.getElementById('ativo-nome').value.trim();
    const categoria = document.getElementById('ativo-categoria').value;
    const meta_alocacao = parseFloat(document.getElementById('ativo-meta').value) || 0.0;
    const observacoes = document.getElementById('ativo-obs').value.trim();

    const payload = { codigo, nome, categoria, meta_alocacao, observacoes };
    const btnSubmit = document.getElementById('btn-submit-ativo');

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';

        const response = await fetch(`${API_BASE_URL}/ativo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201) {
            showToast(`Ativo ${data.codigo} cadastrado com sucesso!`, 'success');
            fecharModal('modal-ativo');
            document.getElementById('form-cadastrar-ativo').reset();
            // Atualiza dados
            await carregarAtivos();
            await carregarDashboard();
        } else {
            showToast(data.mensagem || 'Falha ao salvar ativo.', 'danger');
        }

    } catch (err) {
        showToast('Erro de rede ao conectar com a API.', 'danger');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Ativo';
    }
}

// ==========================================================================
// 5. ROTA: PUT /api/ativo (Atualização de Ativo)
// ==========================================================================

function abrirEdicaoAtivo(id) {
    const ativo = state.ativos.find(a => a.id === id);
    if (!ativo) return;

    document.getElementById('edit-ativo-id').value = ativo.id;
    document.getElementById('edit-ativo-codigo').value = ativo.codigo;
    document.getElementById('edit-ativo-nome').value = ativo.nome;
    document.getElementById('edit-ativo-categoria').value = ativo.categoria;
    document.getElementById('edit-ativo-meta').value = ativo.meta_alocacao;
    document.getElementById('edit-ativo-obs').value = ativo.observacoes || '';

    abrirModal('modal-editar-ativo');
}

async function submeterEdicaoAtivo(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('edit-ativo-id').value);
    const nome = document.getElementById('edit-ativo-nome').value.trim();
    const categoria = document.getElementById('edit-ativo-categoria').value;
    const meta_alocacao = parseFloat(document.getElementById('edit-ativo-meta').value) || 0.0;
    const observacoes = document.getElementById('edit-ativo-obs').value.trim();

    const payload = { id, nome, categoria, meta_alocacao, observacoes };

    try {
        const response = await fetch(`${API_BASE_URL}/ativo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Ativo ${data.codigo} atualizado com sucesso!`, 'success');
            fecharModal('modal-editar-ativo');
            await carregarAtivos();
            await carregarDashboard();
        } else {
            showToast(data.mensagem || 'Falha ao atualizar ativo.', 'danger');
        }

    } catch (err) {
        showToast('Erro de comunicação com a API.', 'danger');
    }
}

// ==========================================================================
// 6. ROTA: DELETE /api/ativo (Exclusão em Cascata)
// ==========================================================================

function solicitarExclusaoAtivo(id, codigo) {
    state.ativoParaExcluir = { id, codigo };
    document.getElementById('delete-ativo-nome').textContent = codigo;
    abrirModal('modal-confirm-delete');
}

async function confirmarExclusaoAtivo() {
    if (!state.ativoParaExcluir) return;

    const { id, codigo } = state.ativoParaExcluir;
    const btn = document.getElementById('btn-confirm-delete-action');

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Excluindo...';

        const response = await fetch(`${API_BASE_URL}/ativo?id=${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Ativo ${codigo} excluído com sucesso!`, 'info');
            fecharModal('modal-confirm-delete');
            state.ativoParaExcluir = null;
            await carregarAtivos();
            await carregarTransacoes();
            await carregarDashboard();
        } else {
            showToast(data.mensagem || 'Erro ao excluir ativo.', 'danger');
        }

    } catch (err) {
        showToast('Erro ao comunicar exclusão com a API.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Excluir Definitivamente';
    }
}

// ==========================================================================
// 7. ROTA: POST /api/transacao (Registro de Movimentação)
// ==========================================================================

function abrirTransacaoParaAtivo(ativoId) {
    const select = document.getElementById('trans-ativo-id');
    if (select) select.value = ativoId;
    abrirModal('modal-transacao');
}

async function submeterNovaTransacao(e) {
    e.preventDefault();

    const ativo_id = parseInt(document.getElementById('trans-ativo-id').value);
    const tipo = document.getElementById('trans-tipo').value;
    const data_transacao = document.getElementById('trans-data').value;
    const quantidade = parseFloat(document.getElementById('trans-quantidade').value);
    const preco_unitario = parseFloat(document.getElementById('trans-preco').value);
    const descricao = document.getElementById('trans-descricao').value.trim();

    if (!ativo_id || isNaN(ativo_id)) {
        showToast('Selecione um ativo válido.', 'warning');
        return;
    }

    const payload = {
        ativo_id,
        tipo,
        data_transacao,
        quantidade,
        preco_unitario,
        descricao
    };

    const btn = document.getElementById('btn-submit-transacao');

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registrando...';

        const response = await fetch(`${API_BASE_URL}/transacao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201) {
            showToast(`Operação de ${tipo} registrada com sucesso!`, 'success');
            fecharModal('modal-transacao');
            document.getElementById('form-cadastrar-transacao').reset();
            configurarDataPadraoTransacao();
            atualizarCalculoTotalTransacao();

            // Atualiza todas as visualizações afetadas
            await carregarAtivos();
            await carregarTransacoes();
            await carregarDashboard();

            // Se o modal de detalhes do ativo estiver aberto, atualiza-o também
            if (state.ativoEmDetalhes && state.ativoEmDetalhes.id === ativo_id) {
                await abrirDetalhesAtivo(ativo_id);
            }
        } else {
            showToast(data.mensagem || 'Falha ao registrar transação.', 'danger');
        }

    } catch (err) {
        showToast('Erro de rede ao registrar movimentação.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Registrar Movimentação';
    }
}

// ==========================================================================
// 8. ROTA: GET /api/transacoes (Histórico Geral de Movimentações)
// ==========================================================================

async function carregarTransacoes() {
    const tbody = document.getElementById('transactions-table-body');
    let url = `${API_BASE_URL}/transacoes`;

    if (state.filtroTipoTransacao) {
        url += `?tipo=${encodeURIComponent(state.filtroTipoTransacao)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();

        const dados = await response.json();
        state.transacoes = dados.transacoes || [];

        if (state.transacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhuma movimentação registrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = state.transacoes.map(t => {
            let badgeClass = 'badge-success';
            if (t.tipo === 'VENDA') badgeClass = 'badge-warning';
            if (t.tipo === 'DIVIDENDO') badgeClass = 'badge-purple';

            return `
                <tr>
                    <td>${formatarDataBR(t.data_transacao)}</td>
                    <td><strong>${t.ativo_codigo || `ID #${t.ativo_id}`}</strong></td>
                    <td><span class="badge ${badgeClass}">${t.tipo}</span></td>
                    <td>${formatarNumero(t.quantidade, 4)}</td>
                    <td>${formatarMoeda(t.preco_unitario)}</td>
                    <td><strong>${formatarMoeda(t.valor_total)}</strong></td>
                    <td>${t.descricao || '-'}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.warn('Erro ao carregar transações:', err);
    }
}

// ==========================================================================
// Controle de Modais
// ==========================================================================

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function configurarDataPadraoTransacao() {
    const hoje = new Date().toISOString().split('T')[0];
    const input = document.getElementById('trans-data');
    if (input) input.value = hoje;
}

function atualizarCalculoTotalTransacao() {
    const qtd = parseFloat(document.getElementById('trans-quantidade').value) || 0;
    const preco = parseFloat(document.getElementById('trans-preco').value) || 0;
    const preview = document.getElementById('trans-total-preview');
    if (preview) {
        preview.textContent = formatarMoeda(qtd * preco);
    }
}

// ==========================================================================
// Inicialização e Event Listeners
// ==========================================================================

async function inicializarApp() {
    const conectou = await verificarStatusApi();
    configurarDataPadraoTransacao();

    if (conectou) {
        await Promise.all([
            carregarDashboard(),
            carregarAtivos(),
            carregarTransacoes()
        ]);
    } else {
        // Tenta reconectar em segundo plano periodicamente
        setTimeout(inicializarApp, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização da aplicação
    inicializarApp();

    // Eventos de Abertura de Modais pelo Navbar
    document.getElementById('btn-open-ativo-modal').addEventListener('click', () => abrirModal('modal-ativo'));
    document.getElementById('btn-open-transacao-modal').addEventListener('click', () => abrirModal('modal-transacao'));

    // Botão Adicionar Transação a partir do modal de Detalhes
    document.getElementById('btn-add-transacao-direta').addEventListener('click', () => {
        if (state.ativoEmDetalhes) {
            fecharModal('modal-detalhes-ativo');
            abrirTransacaoParaAtivo(state.ativoEmDetalhes.id);
        }
    });

    // Fechamento genérico de modais por data-close
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            fecharModal(modalId);
        });
    });

    // Fechar ao clicar no backdrop (overlay)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModal(overlay.id);
        });
    });

    // Fechar ao teclar ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => fecharModal(m.id));
        }
    });

    // Formulários
    document.getElementById('form-cadastrar-ativo').addEventListener('submit', submeterNovoAtivo);
    document.getElementById('form-editar-ativo').addEventListener('submit', submeterEdicaoAtivo);
    document.getElementById('form-cadastrar-transacao').addEventListener('submit', submeterNovaTransacao);
    document.getElementById('btn-confirm-delete-action').addEventListener('click', confirmarExclusaoAtivo);

    // Atualização em tempo real do preview da transação
    document.getElementById('trans-quantidade').addEventListener('input', atualizarCalculoTotalTransacao);
    document.getElementById('trans-preco').addEventListener('input', atualizarCalculoTotalTransacao);

    // Filtros de Pesquisa e Categoria
    document.getElementById('search-input').addEventListener('input', (e) => {
        state.filtroTexto = e.target.value;
        renderizarAtivos();
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filtroCategoria = e.target.value;
        renderizarAtivos();
    });

    document.getElementById('filter-transacao-tipo').addEventListener('change', (e) => {
        state.filtroTipoTransacao = e.target.value;
        carregarTransacoes();
    });

    // Botão de Atualizar Tudo
    document.getElementById('btn-refresh-all').addEventListener('click', async () => {
        showToast('Atualizando dados...', 'info');
        await inicializarApp();
    });

    // Alternância de Visualização (Cards vs Tabela)
    const btnCards = document.getElementById('btn-view-cards');
    const btnTable = document.getElementById('btn-view-table');
    const cardsGrid = document.getElementById('assets-cards-container');
    const tableWrap = document.getElementById('assets-table-container');

    btnCards.addEventListener('click', () => {
        btnCards.classList.add('active');
        btnTable.classList.remove('active');
        cardsGrid.style.display = 'grid';
        tableWrap.style.display = 'none';
        state.modoVisualizacao = 'cards';
    });

    btnTable.addEventListener('click', () => {
        btnTable.classList.add('active');
        btnCards.classList.remove('active');
        cardsGrid.style.display = 'none';
        tableWrap.style.display = 'block';
        state.modoVisualizacao = 'table';
    });
});
