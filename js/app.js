// ===== APP.JS — Página pública =====

let categoriaAtiva = 'todos';

// ===== RENDERIZAÇÃO =====
function renderizar() {
  const busca = document.getElementById('busca').value.toLowerCase();
  const aprovados = getProjetosAprovados();

  const lista = aprovados.filter(p => {
    const matchCat = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
    const matchBusca = !busca ||
      p.titulo.toLowerCase().includes(busca) ||
      p.autor.toLowerCase().includes(busca) ||
      (p.tags || []).some(t => t.toLowerCase().includes(busca));
    return matchCat && matchBusca;
  });

  const grid = document.getElementById('cardsGrid');
  const empty = document.getElementById('empty');

  if (lista.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = lista.map(cardHTML).join('');
}

function cardHTML(p) {
  const tags = (p.tags || []).map(t =>
    `<span class="tag">#${escapeHTML(t.trim())}</span>`
  ).join('');

  const link = p.link
    ? `<a href="${escapeHTML(p.link)}" target="_blank" rel="noopener" class="card-link">Ver trabalho →</a>`
    : '';

  return `
    <div class="card">
      <div class="card-top">
        <span class="card-cat cat-${p.categoria}">${labelCat(p.categoria)}</span>
        <span class="card-data">${p.data}</span>
      </div>
      <h3 class="card-titulo">${escapeHTML(p.titulo)}</h3>
      <div class="card-autor">
        <div class="avatar">${iniciais(p.autor)}</div>
        ${escapeHTML(p.autor)}
      </div>
      <p class="card-desc">${escapeHTML(p.descricao)}</p>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      ${link}
    </div>`;
}

// ===== STATS =====
function atualizarStats() {
  const aprovados = getProjetosAprovados();
  document.getElementById('numProjetos').textContent = aprovados.length;
  const autores = new Set(aprovados.map(p => p.autor.toLowerCase()));
  document.getElementById('numAutores').textContent = autores.size;
}

// ===== FILTROS =====
document.querySelectorAll('.filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    categoriaAtiva = btn.dataset.cat;
    renderizar();
  });
});

// ===== MODAL PUBLICAR =====
function abrirModal() {
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('f-titulo').focus();
}

function fecharModal() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  limparForm();
}

function fecharFora(e) {
  if (e.target === document.getElementById('overlay')) fecharModal();
}

function limparForm() {
  ['f-titulo','f-autor','f-desc','f-link','f-tags'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-cat').value = '';
  document.getElementById('f-erro').style.display = 'none';
}

// ===== PUBLICAR =====
function publicar() {
  const titulo = document.getElementById('f-titulo').value.trim();
  const autor  = document.getElementById('f-autor').value.trim();
  const cat    = document.getElementById('f-cat').value;
  const desc   = document.getElementById('f-desc').value.trim();
  const link   = document.getElementById('f-link').value.trim();
  const tagsRaw= document.getElementById('f-tags').value.trim();
  const erro   = document.getElementById('f-erro');

  if (!titulo || !autor || !cat || !desc) {
    erro.textContent = '⚠️ Preencha todos os campos obrigatórios (*).';
    erro.style.display = 'block';
    return;
  }
  if (link && !link.startsWith('http')) {
    erro.textContent = '⚠️ O link deve começar com http:// ou https://';
    erro.style.display = 'block';
    return;
  }
  erro.style.display = 'none';

  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  adicionarProjeto({ titulo, autor, categoria: cat, descricao: desc, link, tags, data: hoje() });

  fecharModal();
  atualizarStats();
  renderizar();
  mostrarToast('✅ Enviado! Aguardando aprovação do admin.', '#179e73');
}

// ===== MENU MOBILE =====
function toggleMenu() {
  document.getElementById('navMobile').classList.toggle('open');
}

// ===== INIT =====
atualizarStats();
renderizar();
