// ===== STORAGE.JS — camada de dados compartilhada =====
// Todos os dados ficam no localStorage do navegador.

const DB_KEY = 'ecaDigital_v2';

// Credenciais de admin — altere aqui para personalizar
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'eca2025';

// Projetos de exemplo (carregados na primeira abertura)
const EXEMPLOS = [
  {
    id: 1,
    titulo: 'Cyberbullying: Como o ECA nos protege online',
    autor: 'Ana Beatriz Silva',
    categoria: 'pesquisa',
    descricao: 'Análise dos artigos do ECA que garantem proteção contra o cyberbullying e como aplicá-los no dia a dia das redes sociais.',
    tags: ['cyberbullying', 'proteção', 'redes sociais'],
    link: '',
    data: '03/05/2025',
    status: 'aprovado'
  },
  {
    id: 2,
    titulo: 'Privacidade de dados e o adolescente digital',
    autor: 'Lucas Ferreira',
    categoria: 'redacao',
    descricao: 'Redação explorando como o ECA e a LGPD se complementam na proteção de dados pessoais de crianças e adolescentes.',
    tags: ['privacidade', 'LGPD', 'dados pessoais'],
    link: '',
    data: '01/05/2025',
    status: 'aprovado'
  },
  {
    id: 3,
    titulo: 'Infográfico: Seus Direitos na Internet',
    autor: 'Gabriela Costa',
    categoria: 'infografico',
    descricao: 'Infográfico visual que mapeia os principais direitos garantidos pelo ECA para crianças e adolescentes no ambiente digital.',
    tags: ['direitos', 'internet', 'visual'],
    link: 'https://example.com',
    data: '28/04/2025',
    status: 'aprovado'
  },
  {
    id: 4,
    titulo: 'Vídeo: O ECA e as Redes Sociais',
    autor: 'Pedro Mendes',
    categoria: 'video',
    descricao: 'Vídeo curto explicando quais artigos do ECA se aplicam ao uso de redes sociais por adolescentes.',
    tags: ['video', 'redes sociais', 'ECA'],
    link: '',
    data: '25/04/2025',
    status: 'pendente'
  }
];

// ===== FUNÇÕES DE ACESSO =====

function dbCarregar() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  // Primeira execução: salva os exemplos
  const inicial = { projetos: EXEMPLOS };
  localStorage.setItem(DB_KEY, JSON.stringify(inicial));
  return inicial;
}

function dbSalvar(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getProjetos() {
  return dbCarregar().projetos || [];
}

function getProjetosAprovados() {
  return getProjetos().filter(p => p.status === 'aprovado');
}

function getProjetosPendentes() {
  return getProjetos().filter(p => p.status === 'pendente');
}

function adicionarProjeto(projeto) {
  const db = dbCarregar();
  projeto.id = Date.now();
  projeto.status = 'pendente';
  db.projetos.unshift(projeto);
  dbSalvar(db);
}

function atualizarProjeto(id, dados) {
  const db = dbCarregar();
  db.projetos = db.projetos.map(p => p.id == id ? { ...p, ...dados } : p);
  dbSalvar(db);
}

function excluirProjeto(id) {
  const db = dbCarregar();
  db.projetos = db.projetos.filter(p => p.id != id);
  dbSalvar(db);
}

function aprovarProjeto(id) {
  atualizarProjeto(id, { status: 'aprovado' });
}

// ===== AUTENTICAÇÃO SIMPLES =====

function adminLogin(user, pass) {
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('ecaAdmin', '1');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem('ecaAdmin');
}

function isAdminLogado() {
  return sessionStorage.getItem('ecaAdmin') === '1';
}

// ===== UTILITÁRIOS =====

function formatarData(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function hoje() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function labelCat(cat) {
  return { pesquisa: 'Pesquisa', video: 'Vídeo', infografico: 'Infográfico', redacao: 'Redação', outro: 'Outro' }[cat] || cat;
}

function mostrarToast(msg, cor) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = cor || 'var(--texto)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}
