(function () {
  'use strict';

  const STORAGE_KEY = 'techshop_dropshipping_v1';
  const API_CANDIDATES = [
    '/api/pedidos'
  ];

  let pedidos = [];
  let selectedOrder = null;
  let apiDisponivel = false;

  const $ = (sel) => document.querySelector(sel);
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const safe = (value) => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveLocalMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function keyOf(order) {
    return String(order?.numero || order?.numeroPedido || order?.id || '');
  }

  function normalizeOrder(raw) {
    const numero = keyOf(raw);
    const produtos = Array.isArray(raw?.itens)
      ? raw.itens
      : Array.isArray(raw?.produtos)
        ? raw.produtos
        : [];

    const local = loadLocal()[numero] || {};
    const firstItem = produtos[0] || {};
    const total = Number(raw?.total ?? raw?.valorTotal ?? raw?.valor ?? 0);

    return {
      ...raw,
      numero,
      cliente: raw?.cliente || raw?.nome || 'Cliente não informado',
      telefone: raw?.telefone || raw?.clienteTelefone || '',
      email: raw?.email || raw?.clienteEmail || '',
      cpf: raw?.cpf || '',
      endereco: raw?.endereco || raw?.entrega?.endereco || '',
      numeroEndereco: raw?.numeroEndereco || raw?.entrega?.numero || raw?.numero || '',
      bairro: raw?.bairro || raw?.entrega?.bairro || '',
      cidade: raw?.cidade || raw?.entrega?.cidade || '',
      estado: raw?.estado || raw?.entrega?.estado || '',
      cep: raw?.cep || raw?.entrega?.cep || '',
      total,
      status: local.status || raw?.status || 'Pago',
      fornecedor: local.fornecedor || raw?.fornecedor || 'Mercado Livre',
      custoFornecedor: Number(local.custoFornecedor ?? raw?.custoFornecedor ?? 0),
      linkFornecedor: local.linkFornecedor || raw?.linkFornecedor || '',
      codigoFornecedor: local.codigoFornecedor || raw?.codigoFornecedor || '',
      rastreio: local.rastreio || raw?.rastreio || raw?.codigoRastreio || '',
      observacao: local.observacao || raw?.observacao || '',
      dataAtualizacao: local.dataAtualizacao || raw?.dataAtualizacao || '',
      itens: produtos.length ? produtos : [{ nome: raw?.produto || firstItem.nome || 'Produto do pedido', quantidade: Number(raw?.quantidade || 1) }]
    };
  }

  function saveOrderLocal(order) {
    const map = loadLocal();
    map[order.numero] = {
      status: order.status,
      fornecedor: order.fornecedor,
      custoFornecedor: order.custoFornecedor,
      linkFornecedor: order.linkFornecedor,
      codigoFornecedor: order.codigoFornecedor,
      rastreio: order.rastreio,
      observacao: order.observacao,
      dataAtualizacao: new Date().toISOString()
    };
    saveLocalMap(map);
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) throw new Error((data && data.erro) || (data && data.error) || `HTTP ${response.status}`);
    return data;
  }

  async function loadOrders() {
    setConnection('carregando', 'Carregando pedidos...');
    let found = null;
    for (const url of API_CANDIDATES) {
      try {
        const data = await fetchJson(url);
        found = Array.isArray(data) ? data : (data?.pedidos || data?.orders || null);
        if (Array.isArray(found)) {
          apiDisponivel = true;
          break;
        }
      } catch (error) {
        // Continua para a próxima rota candidata.
      }
    }

    if (Array.isArray(found)) {
      pedidos = found.map(normalizeOrder).filter((p) => p.numero);
      setConnection('online', 'API administrativa conectada');
    } else {
      apiDisponivel = false;
      const local = loadLocal();
      pedidos = Object.entries(local).map(([numero, data]) => normalizeOrder({ numero, ...data }));
      setConnection('local', 'Modo local — API administrativa não encontrada');
    }

    render();
  }

  async function syncOrder(order) {
    const payload = {
      fornecedor: order.fornecedor,
      custoFornecedor: Number(order.custoFornecedor || 0),
      linkFornecedor: order.linkFornecedor || '',
      codigoFornecedor: order.codigoFornecedor || '',
      rastreio: order.rastreio || '',
      status: order.status,
      observacao: order.observacao || ''
    };

    const routes = [
      `/api/pedidos/${encodeURIComponent(order.numero)}/dropshipping`
    ];

    let lastError = null;
    for (const url of routes) {
      try {
        await fetchJson(url, { method: 'PATCH', body: JSON.stringify(payload) });
        return true;
      } catch (error) {
        lastError = error;
      }
    }
    return !lastError;
  }

  async function persist(order) {
    saveOrderLocal(order);
    if (apiDisponivel) {
      const synced = await syncOrder(order);
      if (synced) {
        toast('✅ Pedido atualizado no sistema.');
      } else {
        toast('💾 Salvo localmente. A API de dropshipping ainda não respondeu.');
      }
    } else {
      toast('💾 Salvo neste navegador. Conecte a API administrativa para sincronizar com o servidor.');
    }
  }

  function setConnection(type, text) {
    const badge = $('#statusConexao');
    if (!badge) return;
    badge.textContent = text;
    badge.className = `status-badge ${type}`;
  }

  function toast(text) {
    const el = $('#dropToast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(window.__dropToastTimer);
    window.__dropToastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function statusClass(status) {
    const s = String(status || '').toLowerCase();
    if (s.includes('entreg')) return 'entregue';
    if (s.includes('envi')) return 'enviado';
    if (s.includes('compr') || s.includes('prepar')) return 'comprado';
    if (s.includes('cancel')) return 'cancelado';
    return 'pago';
  }

  function orderItemsText(order) {
    return order.itens.map((item) => `${item.quantidade || 1}x ${item.nome || item.name || 'Produto'}`).join(', ');
  }

  function render() {
    const search = ($('#busca')?.value || '').trim().toLowerCase();
    const status = $('#filtroStatus')?.value || '';
    const fornecedor = $('#filtroFornecedor')?.value || '';

    const filtered = pedidos.filter((p) => {
      const hay = [p.numero, p.cliente, p.email, p.telefone, p.rastreio, orderItemsText(p)].join(' ').toLowerCase();
      return (!search || hay.includes(search)) && (!status || status === p.status) && (!fornecedor || fornecedor === p.fornecedor);
    });

    const lista = $('#listaPedidos');
    if (!lista) return;

    if (!filtered.length) {
      lista.innerHTML = `<div class="empty-card"><div class="empty-icon">📦</div><h3>Nenhum pedido encontrado</h3><p>Assim que os pedidos aparecerem na API administrativa, eles serão listados aqui.</p></div>`;
    } else {
      lista.innerHTML = filtered.map(card).join('');
    }

    const total = filtered.reduce((acc, p) => acc + Number(p.total || 0), 0);
    $('#metricPedidos').textContent = String(pedidos.length);
    $('#metricPendentes').textContent = String(pedidos.filter(p => !['Enviado', 'Entregue', 'Cancelado'].includes(p.status)).length);
    $('#metricEnviados').textContent = String(pedidos.filter(p => ['Enviado', 'Entregue'].includes(p.status)).length);
    $('#metricVendas').textContent = money(total);
  }

  function card(p) {
    const margem = Number(p.total || 0) - Number(p.custoFornecedor || 0);
    return `
      <article class="order-card">
        <div class="order-top">
          <div>
            <span class="order-number">#${safe(p.numero)}</span>
            <span class="status-chip ${statusClass(p.status)}">${safe(p.status)}</span>
          </div>
          <strong>${money(p.total)}</strong>
        </div>
        <div class="order-grid">
          <div><span>Cliente</span><strong>${safe(p.cliente)}</strong></div>
          <div><span>Produtos</span><strong>${safe(orderItemsText(p))}</strong></div>
          <div><span>Fornecedor</span><strong>${safe(p.fornecedor)}</strong></div>
          <div><span>Custo</span><strong>${money(p.custoFornecedor)}</strong></div>
          <div><span>Resultado bruto</span><strong>${money(margem)}</strong></div>
          <div><span>Rastreio</span><strong>${safe(p.rastreio || 'Ainda não informado')}</strong></div>
        </div>
        <div class="order-actions">
          <button class="btn primary" onclick="Dropshipping.abrir('${encodeURIComponent(p.numero)}')">👁 Ver pedido</button>
          <button class="btn ghost" onclick="Dropshipping.copiar('${encodeURIComponent(p.numero)}')">📋 Copiar pedido</button>
          <button class="btn ghost" onclick="Dropshipping.abrir('${encodeURIComponent(p.numero)}', 'rastreio')">🚚 Rastreio</button>
        </div>
      </article>`;
  }

  function getOrder(numero) {
    return pedidos.find((p) => p.numero === numero) || null;
  }

  function open(numero, focus) {
    selectedOrder = getOrder(decodeURIComponent(numero));
    if (!selectedOrder) return;

    const modal = $('#modalPedido');
    const body = $('#modalBody');
    body.innerHTML = detail(selectedOrder);
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    if (focus === 'rastreio') setTimeout(() => $('#campoRastreio')?.focus(), 50);
  }

  function close() {
    $('#modalPedido')?.classList.remove('show');
    document.body.classList.remove('modal-open');
    selectedOrder = null;
  }

  function detail(p) {
    return `
      <div class="detail-head">
        <div><small>Pedido</small><h2>#${safe(p.numero)}</h2></div>
        <span class="status-chip ${statusClass(p.status)}">${safe(p.status)}</span>
      </div>
      <section class="detail-section">
        <h3>👤 Cliente</h3>
        <div class="detail-grid">
          <div><span>Nome</span><strong>${safe(p.cliente)}</strong></div>
          <div><span>Telefone</span><strong>${safe(p.telefone || '—')}</strong></div>
          <div><span>E-mail</span><strong>${safe(p.email || '—')}</strong></div>
          <div><span>CPF</span><strong>${safe(p.cpf || '—')}</strong></div>
        </div>
        <div class="address-box"><strong>📍 Endereço de entrega</strong><p>${safe([p.endereco, p.numeroEndereco, p.bairro, p.cidade && `${p.cidade} - ${p.estado}`, p.cep].filter(Boolean).join(', ') || 'Não informado')}</p></div>
      </section>
      <section class="detail-section">
        <h3>🛒 Produtos</h3>
        <div class="items-box">${p.itens.map((i) => `<div><span>${safe(i.nome || i.name || 'Produto')}</span><strong>x${Number(i.quantidade || 1)}</strong></div>`).join('')}</div>
        <div class="total-row"><span>Venda</span><strong>${money(p.total)}</strong></div>
      </section>
      <section class="detail-section">
        <h3>🚚 Dropshipping</h3>
        <div class="form-grid">
          <label>Fornecedor
            <select id="campoFornecedor">
              <option ${p.fornecedor === 'Mercado Livre' ? 'selected' : ''}>Mercado Livre</option>
              <option ${p.fornecedor === 'Shopee' ? 'selected' : ''}>Shopee</option>
              <option ${p.fornecedor === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
          </label>
          <label>Custo da compra
            <input id="campoCusto" type="number" min="0" step="0.01" value="${Number(p.custoFornecedor || 0).toFixed(2)}">
          </label>
          <label>Link do fornecedor
            <input id="campoLink" type="url" value="${safe(p.linkFornecedor)}" placeholder="https://...">
          </label>
          <label>Nº do pedido no fornecedor
            <input id="campoCodigoFornecedor" type="text" value="${safe(p.codigoFornecedor)}">
          </label>
          <label class="full">Código de rastreio
            <input id="campoRastreio" type="text" value="${safe(p.rastreio)}" placeholder="Ex.: BR123456789XX">
          </label>
          <label class="full">Observação
            <textarea id="campoObservacao" rows="3">${safe(p.observacao)}</textarea>
          </label>
        </div>
      </section>
      <section class="detail-section">
        <h3>⚡ Ações</h3>
        <div class="action-row">
          <button class="btn primary" onclick="Dropshipping.salvar()">💾 Salvar</button>
          <button class="btn ghost" onclick="Dropshipping.comprado()">🛒 Marcar comprado</button>
          <button class="btn ghost" onclick="Dropshipping.enviado()">🚚 Marcar enviado</button>
          <button class="btn ghost" onclick="Dropshipping.entregue()">✅ Marcar entregue</button>
          <button class="btn ghost" onclick="Dropshipping.copiar('${encodeURIComponent(p.numero)}')">📋 Copiar dados</button>
        </div>
      </section>`;
  }

  async function saveCurrent(statusOverride) {
    if (!selectedOrder) return;
    selectedOrder.fornecedor = $('#campoFornecedor').value;
    selectedOrder.custoFornecedor = Number($('#campoCusto').value || 0);
    selectedOrder.linkFornecedor = $('#campoLink').value.trim();
    selectedOrder.codigoFornecedor = $('#campoCodigoFornecedor').value.trim();
    selectedOrder.rastreio = $('#campoRastreio').value.trim();
    selectedOrder.observacao = $('#campoObservacao').value.trim();
    if (statusOverride) selectedOrder.status = statusOverride;
    saveOrderLocal(selectedOrder);
    await persist(selectedOrder);
    const i = pedidos.findIndex((p) => p.numero === selectedOrder.numero);
    if (i >= 0) pedidos[i] = { ...selectedOrder };
    render();
    $('#modalBody').innerHTML = detail(selectedOrder);
  }

  async function copy(numero) {
    const p = getOrder(decodeURIComponent(numero));
    if (!p) return;
    const texto = [
      `PEDIDO TECHSHOP #${p.numero}`,
      '',
      `Produto(s): ${orderItemsText(p)}`,
      `Total da venda: ${money(p.total)}`,
      '',
      `Cliente: ${p.cliente}`,
      `Telefone: ${p.telefone || '-'}`,
      `E-mail: ${p.email || '-'}`,
      `CPF: ${p.cpf || '-'}`,
      `Endereço: ${[p.endereco, p.numeroEndereco, p.bairro, p.cidade && `${p.cidade} - ${p.estado}`, p.cep].filter(Boolean).join(', ') || '-'}`,
      '',
      'Enviar diretamente ao cliente da TECHSHOP, sem preço de compra no pacote.'
    ].join('\n');

    try {
      await navigator.clipboard.writeText(texto);
      toast('📋 Pedido copiado.');
    } catch {
      window.prompt('Copie os dados do pedido:', texto);
    }
  }

  function addSample() {
    const sample = normalizeOrder({
      numero: `DEMO${Date.now().toString().slice(-5)}`,
      cliente: 'Pedido de teste',
      telefone: '(19) 99999-9999',
      cidade: 'Mogi Guaçu', estado: 'SP', cep: '13800-000',
      endereco: 'Rua de Teste', numeroEndereco: '100', bairro: 'Centro',
      total: 160,
      itens: [{ nome: 'Tela iPhone 11 Incell', quantidade: 1 }],
      status: 'Pago', fornecedor: 'Mercado Livre'
    });
    pedidos.unshift(sample);
    saveOrderLocal(sample);
    render();
    toast('🧪 Pedido de teste criado.');
  }

  window.Dropshipping = {
    abrir: open,
    fechar: close,
    copiar: copy,
    salvar: () => saveCurrent(),
    comprado: () => saveCurrent('Comprado'),
    enviado: () => saveCurrent('Enviado'),
    entregue: () => saveCurrent('Entregue'),
    adicionarTeste: addSample,
    recarregar: loadOrders
  };

  document.addEventListener('DOMContentLoaded', () => {
    $('#busca')?.addEventListener('input', render);
    $('#filtroStatus')?.addEventListener('change', render);
    $('#filtroFornecedor')?.addEventListener('change', render);
    $('#btnRecarregar')?.addEventListener('click', loadOrders);
    $('#btnRecarregarFiltro')?.addEventListener('click', loadOrders);
    $('#btnTeste')?.addEventListener('click', addSample);
    $('#fecharModal')?.addEventListener('click', close);
    $('#modalPedido')?.addEventListener('click', (e) => { if (e.target.id === 'modalPedido') close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    loadOrders();
  });
})();
