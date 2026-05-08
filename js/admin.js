// ===== ADMIN.JS — Painel de administração =====

let abaAtiva = 'pendentes';
let idParaExcluir = null;

// ===== AUTH =====
function fazerLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const erro = document.getElementById('loginErro');

  if (adminLogin(user, pass)) {
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'block';
    iniciarPainel();
  } else {
    erro.style.display = 'block';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function fazerLogout() {
  adminLogout();
  document.getElementById('painelAdmin').style.display = 'none';
  document.getElementById('telaLogin').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErro').style.display = 'none';
}

// Verifica se já estava logado na sessão
window.addEventListener('DOMContentLoaded', () => {
  if (isAdminLogado()) {
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('painelAdmin').style.display = 'block';
    iniciarPainel();
  }
});

// ===== PAINEL =====
function iniciarPainel() {
  atualizarResumo();
  renderAdmin();
}

function atualizarResumo() {
  const todos      = getProjetos();
  const pendentes  = getProjetosPendentes();
  const aprovados  = getProjetosAprovados();
  const autores    = new Set(todos.map(p => p.autor.toLowerCase()));

  document.getElementById('r-pendentes').textContent = pendentes.length;
  document.getElementById('r-aprovados').textContent = aprovados.length;
  document.getElementById('r-total').textContent     = todos.length;
  document.getElementById('r-autores').textContent   = autores.size;

  document.getElementById('badge-pendentes').textContent = pendentes.length;
  document.getElementById('badge-aprovados').textContent = aprovados.length;
}

// ===== ABAS =====
function mudarAba(aba) {
  abaAtiva = aba;
  document.querySelectorAll('.aba').forEach(b => {
    b.classList.toggle('active', b.dataset.aba === aba);
  });
  renderAdmin();
}

// ===== RENDERIZAR TABELA =====
function renderAdmin() {
  const busca = (document.getElementById('adminBusca').value || '').toLowerCase();
  let lista = getProjetos();

  if (abaAtiva === 'pendentes')  lista = lista.filter(p => p.status === 'pendente');
  if (abaAtiva === 'aprovados')  lista = lista.filter(p => p.status === 'aprovado');

  if (busca) {
    lista = lista.filter(p =>
      p.titulo.toLowerCase().includes(busca) ||
      p.autor.toLowerCase().includes(busca) ||
      (p.tags || []).some(t => t.toLowerCase().includes(busca))
    );
  }

  const tbody = document.getElementById('tabelaBody');
  const empty = document.getElementById('adminEmpty');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = lista.map(linhaHTML).join('');
}

function linhaHTML(p) {
  const tags = (p.tags || []).map(t => `#${escapeHTML(t)}`).join(', ');

  const btnAprovar = p.status === 'pendente'
    ? `<button class="btn-acao btn-aprovar" onclick="aprovar(${p.id})">✓ Aprovar</button>`
    : `<button class="btn-acao btn-aprovar" onclick="revogar(${p.id})" title="Voltar para pendente">↩ Revogar</button>`;

  return `
    <tr>
      <td class="titulo-cell">
        ${escapeHTML(p.titulo)}
        <small>${tags || '—'}</small>
      </td>
      <td>${escapeHTML(p.autor)}</td>
      <td><span class="card-cat cat-${p.categoria}">${labelCat(p.categoria)}</span></td>
      <td>${p.data}</td>
      <td><span class="status-pill status-${p.status}">${p.status === 'aprovado' ? '✅ Aprovado' : '⏳ Pendente'}</span></td>
      <td>
        <div class="acoes">
          ${btnAprovar}
          <button class="btn-acao btn-editar" onclick="abrirEdit(${p.id})">✏ Editar</button>
          <button class="btn-acao btn-excluir" onclick="pedirExclusao(${p.id})">🗑 Excluir</button>
        </div>
      </td>
    </tr>`;
}

// ===== APROVAR / REVOGAR =====
function aprovar(id) {
  aprovarProjeto(id);
  atualizarResumo();
  renderAdmin();
  mostrarToast('✅ Projeto aprovado!', '#179e73');
}

function revogar(id) {
  atualizarProjeto(id, { status: 'pendente' });
  atualizarResumo();
  renderAdmin();
  mostrarToast('↩ Projeto voltou para pendente.', '#854f0b');
}

// ===== EDITAR =====
function abrirEdit(id) {
  const p = getProjetos().find(x => x.id == id);
  if (!p) return;

  document.getElementById('e-id').value    = p.id;
  document.getElementById('e-titulo').value = p.titulo;
  document.getElementById('e-autor').value  = p.autor;
  document.getElementById('e-cat').value    = p.categoria;
  document.getElementById('e-desc').value   = p.descricao;
  document.getElementById('e-link').value   = p.link || '';
  document.getElementById('e-tags').value   = (p.tags || []).join(', ');
  document.getElementById('e-status').value = p.status;
  document.getElementById('e-erro').style.display = 'none';

  document.getElementById('overlayEdit').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharEdit() {
  document.getElementById('overlayEdit').classList.remove('open');
  document.body.style.overflow = '';
}

function fecharEditFora(e) {
  if (e.target === document.getElementById('overlayEdit')) fecharEdit();
}

function salvarEdicao() {
  const id     = document.getElementById('e-id').value;
  const titulo = document.getElementById('e-titulo').value.trim();
  const autor  = document.getElementById('e-autor').value.trim();
  const cat    = document.getElementById('e-cat').value;
  const desc   = document.getElementById('e-desc').value.trim();
  const link   = document.getElementById('e-link').value.trim();
  const tagsRaw= document.getElementById('e-tags').value.trim();
  const status = document.getElementById('e-status').value;
  const erro   = document.getElementById('e-erro');

  if (!titulo || !autor || !cat || !desc) {
    erro.textContent = '⚠️ Preencha todos os campos obrigatórios.';
    erro.style.display = 'block';
    return;
  }

  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  atualizarProjeto(id, { titulo, autor, categoria: cat, descricao: desc, link, tags, status });

  fecharEdit();
  atualizarResumo();
  renderAdmin();
  mostrarToast('💾 Alterações salvas!', '#3c3489');
}

// ===== EXCLUIR =====
function pedirExclusao(id) {
  idParaExcluir = id;
  document.getElementById('overlayDel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharDel() {
  idParaExcluir = null;
  document.getElementById('overlayDel').classList.remove('open');
  document.body.style.overflow = '';
}

function fecharDelFora(e) {
  if (e.target === document.getElementById('overlayDel')) fecharDel();
}

function confirmarExclusao() {
  if (!idParaExcluir) return;
  excluirProjeto(idParaExcluir);
  fecharDel();
  atualizarResumo();
  renderAdmin();
  mostrarToast('🗑 Projeto excluído.', '#e24b4a');
}
