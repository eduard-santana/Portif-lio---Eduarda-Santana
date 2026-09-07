const SECTIONS = [
  { id: 'hero', folder: 'hero', label: 'Página Inicial' },
  { id: 'sobre', folder: 'sobre', label: 'Sobre' },
  { id: 'servicos', folder: 'servicos', label: 'Projetos' },
  { id: 'certificados', folder: 'certificados', label: 'Certificados' },
  { id: 'contatos', folder: 'contatos', label: 'Contatos' },
  { id: 'contrate-me', folder: 'contrate-me', label: 'Contrate-me' },
];

const main = document.getElementById('main');
const navTabs = document.getElementById('navTabs');

function buildNavbar() {
  SECTIONS.forEach((s) => {
    const a = document.createElement('a');
    a.href = `#${s.id}`;
    a.className = 'navbar__tab';
    a.dataset.target = s.id;
    a.innerHTML = `<span class="navbar__tab-dot"></span>${s.label}`;
    navTabs.appendChild(a);
  });
}

async function loadSection(s) {
  const section = document.createElement('section');
  section.id = s.id;
  section.className = 'section-container';
  main.appendChild(section);

  try {
    const res = await fetch(`${s.folder}/index.html`);
    if (!res.ok) throw new Error(`Falha ao carregar ${s.folder}/index.html`);
    section.innerHTML = await res.text();
  } catch (err) {
    section.innerHTML = `<div class="container"><p style="font-family:var(--font-mono);color:var(--text-muted);padding:60px 0;">
      ⚠️ não foi possível carregar "${s.folder}/index.html". Rode o projeto em um servidor local (ex.: Live Server).
    </p></div>`;
    console.warn(err);
  }

  section.dataset.loaded = 'true';

  loadSectionCss(s.folder);
  await loadSectionScript(s.folder);

  // observa os elementos .reveal recém-inseridos
  section.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // clique numa aba cuja section ainda não existia (rede lenta / deploy)
  if (pendingScrollId === s.id) {
    pendingScrollId = null;
    goToSection(s.id);
  }
}

function loadSectionCss(folder) {
  if (document.querySelector(`link[data-section="${folder}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${folder}/style.css`;
  link.dataset.section = folder;
  document.head.appendChild(link);
}

function loadSectionScript(folder) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${folder}/script.js`;
    script.dataset.section = folder;
    script.defer = true;
    script.onload = resolve;
    script.onerror = resolve;
    document.body.appendChild(script);
  });
}

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);

/* ---------- navbar: aba ativa via scroll + menu mobile ----------
   A aba ativa é calculada a partir da posição real de scroll, e não
   por IntersectionObserver: as sections entram no DOM aos poucos
   (fetch sequencial), então qualquer observer registrado num tempo
   fixo perde as sections que ainda não existiam — em rede lenta
   (deploy) isso deixava as últimas abas nunca marcadas.
   ------------------------------------------------------------- */
let activeTabId = null;
let pendingScrollId = null;

const sectionEls = () => SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);

/* rola até a section, se ela já estiver carregada.
   Retorna false quando ainda não dá — aí o clique fica pendente. */
function goToSection(id) {
  const el = document.getElementById(id);
  if (!el || !el.dataset.loaded) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function setActiveTab(id) {
  if (id === activeTabId) return;
  activeTabId = id;
  navTabs.querySelectorAll('.navbar__tab').forEach((t) => {
    t.classList.toggle('is-active', t.dataset.target === id);
  });
}

function updateActiveTab() {
  const sections = sectionEls();
  if (!sections.length) return;

  const navbar = document.getElementById('navbar');
  // linha de referência: logo abaixo da navbar fixa
  const line = (navbar ? navbar.offsetHeight : 64) + 12;

  // no fim da página a última section sempre vence (ela pode ser
  // curta demais para alcançar a linha de referência sozinha)
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) {
    setActiveTab(sections[sections.length - 1].id);
    return;
  }

  let current = sections[0];
  for (const el of sections) {
    if (el.getBoundingClientRect().top <= line) current = el;
  }
  setActiveTab(current.id);
}

let tabTicking = false;
function requestActiveTabUpdate() {
  if (tabTicking) return;
  tabTicking = true;
  requestAnimationFrame(() => {
    tabTicking = false;
    updateActiveTab();
  });
}

function setupNavbarBehaviour() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');

  toggle.addEventListener('click', () => navbar.classList.toggle('is-open'));

  navTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.navbar__tab');
    if (!tab) return;
    const id = tab.dataset.target;
    navbar.classList.remove('is-open');
    setActiveTab(id); // feedback imediato, antes do scroll terminar

    // section pronta -> deixa a âncora nativa rolar (href="#id").
    // ainda não carregada -> segura o clique e rola quando ela chegar,
    // senão a âncora aponta para um elemento vazio e nada acontece.
    const el = document.getElementById(id);
    if (!el || !el.dataset.loaded) {
      e.preventDefault();
      history.replaceState(null, '', `#${id}`);
      pendingScrollId = id;
    }
  });

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('has-scrolled', window.scrollY > 12);
    requestActiveTabUpdate();
  }, { passive: true });

  window.addEventListener('resize', requestActiveTabUpdate);
  // imagens carregando tarde mudam a altura das sections
  window.addEventListener('load', requestActiveTabUpdate);
}

/* ---------- boot ---------- */
(async function init() {
  buildNavbar();
  setupNavbarBehaviour();

  // link direto (ex.: .../#estudantes): a âncora ainda não existe no load
  const hashId = location.hash.slice(1);
  if (SECTIONS.some((s) => s.id === hashId)) {
    pendingScrollId = hashId;
    setActiveTab(hashId);
  }

  for (const s of SECTIONS) {
    await loadSection(s);
    requestActiveTabUpdate(); // recalcula conforme as sections vão chegando
  }
})();