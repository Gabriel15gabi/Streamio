// ==============================
// STREAMIO – SPA (Home + Detalle) en un solo JS
// ==============================

/* --------------------------------
   0) TMDB CONFIG + HELPERS
--------------------------------- */
const TMDB_KEY = '12ea9e45f784893cdfa6d81381617e33';
const TMDB = 'https://api.themoviedb.org/3';
const IMG = (path, size = 'w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : '../media/imagen/placeholder.jpg';

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* --------------------------------
   1) THEME (icons + state)
--------------------------------- */
const THEME_KEY = 'streamio:theme';

const ICON_SUN = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="5"></circle>
  <line x1="12" y1="1" x2="12" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="23"></line>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
  <line x1="1" y1="12" x2="3" y2="12"></line>
  <line x1="21" y1="12" x2="23" y2="12"></line>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>`;

const ICON_MOON = `
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"></path>
</svg>`;

/* --------------------------------
   2) ADAPTERS / MAPPING
--------------------------------- */
const mapGenre = (ids = []) => {
  if (ids.includes(28)) return 'action';
  if (ids.includes(35)) return 'comedy';
  if (ids.includes(18)) return 'drama';
  const priority = [28, 35, 18];
  const found = ids.find(id => priority.includes(id));
  return found === 28 ? 'action' : found === 35 ? 'comedy' : 'drama';
};

const adaptTMDB = (item, type) => ({
  id: item.id,
  tmdb_id: item.id,
  title: item.title || item.name || 'Sin título',
  image: IMG(item.poster_path),
  description: item.overview || '',
  genre: mapGenre(item.genre_ids || []),
  type: type === 'tv' ? 'series' : 'movie'
});

/* --------------------------------
   3) LOCAL DATA (fallback)
--------------------------------- */
const moviesLocal = [
  { title: "Top Gun",    genre: "action", image: "../media/imagen/topgun.jpg",      description: "Tom Cruise vuelve a subirse en un avion esta vez para enseñar", type: "movie" },
  { title: "Spider-man", genre: "action", image: "../media/imagen/spiderman.jpg",   description: "El hombre araña convertido en heroe", type: "movie" },
  { title: "Titanic",    genre: "drama",  image: "../media/imagen/titanic.jpg",     description: "Una historia de amor trágica a bordo del famoso transatlántico.", type: "movie" },
  { title: "Avengers",   genre: "action", image: "../media/imagen/avengers.webp",   description: "Los héroes más poderosos de la Tierra se unen para salvar el planeta.", type: "movie" },
  { title: "Deadpool",   genre: "comedy", image: "../media/imagen/deadpool.webp",   description: "Un mercenario con un sentido del humor único busca venganza.", type: "movie" }
];
const seriesLocal = [
  { title: "Stranger Things", genre: "drama",  image: "../media/imagen/strangerthings.jpg", description: "Un grupo de amigos descubre un mundo alterno y algo más.", type: "series" },
  { title: "The Witcher",     genre: "action", image: "../media/imagen/thewitcher.jpg",      description: "Geralt caza monstruos mientras lidia con su destino.", type: "series" },
  { title: "Lupin",           genre: "drama",  image: "../media/imagen/lupin.jpg",           description: "Un ladrón caballeroso inspirado por Arsène Lupin.", type: "series" },
  { title: "Wednesday",       genre: "comedy", image: "../media/imagen/wednesday.jpg",       description: "Miércoles Addams en la Academia Nunca Más.", type: "series" },
  { title: "Dragon Ball",     genre: "action", image: "../media/imagen/dragonball.jpg",      description: "Goku aterriza en la Tierra. Un Super Saiyan.", type: "series" },
  { title: "Breaking Bad",    genre: "drama",  image: "../media/imagen/breakingbad.WEBP",    description: "Walter White pasa de profesor de química a fabricante de metanfetamina.", type: "series" },
  { title: "Game of Thrones", genre: "drama",  image: "../media/imagen/gameofthrones.jpg",   description: "Nobles familias luchan por el Trono de Hierro en Poniente.", type: "series" },
  { title: "The Mandalorian", genre: "action", image: "../media/imagen/mandalorian.jpg",     description: "Un cazarrecompensas explora la galaxia tras la caída del Imperio.", type: "series" },
  { title: "Dark",            genre: "drama",  image: "../media/imagen/dark.jpg",            description: "Cuatro familias en un pueblo alemán descubren secretos y viajes en el tiempo.", type: "series" },
  { title: "Peaky Blinders",  genre: "drama",  image: "../media/imagen/peakyblinders.jpg",   description: "La familia Shelby construye un imperio criminal en Birmingham.", type: "series" }
];

let CATALOG = [...moviesLocal, ...seriesLocal];

/* --------------------------------
   4) DOM HOOKS + STATE
--------------------------------- */
const carousel        = $('.movie-carousel');
const filterButtons   = $$('.filter-btn');
const sectionButtons  = $$('.section-btn');
const mScope          = $('#m-scope');
const mGenre          = $('#m-genre');

const HOME   = $('#home-root');
const DETAIL = $('#detail-root');

const SCOPE_KEY = 'streamio:scope';
const GENRE_KEY = 'streamio:genre';
const STATE = {
  scope: localStorage.getItem(SCOPE_KEY) || 'all',
  genre: localStorage.getItem(GENRE_KEY) || 'all',
};

/* --------------------------------
   5) TOASTS + SKELETON + EMPTY
--------------------------------- */
const toastWrap = document.getElementById('toast-wrap') || (() => {
  const el = document.createElement('div');
  el.id = 'toast-wrap';
  el.className = 'toast-wrap';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  document.body.appendChild(el);
  return el;
})();

function showToast(msg, { type = 'ok', timeout = 3000 } = {}) {
  const node = document.createElement('div');
  node.className = `toast toast--${type}`;
  node.textContent = msg;
  toastWrap.appendChild(node);
  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(4px)';
    setTimeout(() => node.remove(), 200);
  }, timeout);
}

function renderSkeletonCarousel(n = 10) {
  if (!carousel) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const card = document.createElement('article');
    card.className = 'movie-card skel-card';
    card.innerHTML = `
      <div class="skel skel-img"></div>
      <div class="skel skel-title" style="width:70%; margin:.5rem auto 0;"></div>
      <div class="skel skel-tag"></div>
    `;
    frag.appendChild(card);
  }
  carousel.innerHTML = '';
  carousel.appendChild(frag);
}

function renderEmptyCarousel(message = 'No se han encontrado resultados con los filtros actuales.') {
  if (!carousel) return;
  carousel.innerHTML = `
    <div class="empty">
      <h3>Sin resultados</h3>
      <p>${message}</p>
    </div>
  `;
}

/* --------------------------------
   6) RENDER CARRUSEL + FILTROS
--------------------------------- */
function renderCarousel(items) {
  if (!carousel) return;
  const frag = document.createDocumentFragment();

  items.forEach(it => {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.genre = it.genre;
    card.dataset.type = it.type;
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${it.image}" alt="${it.title}" loading="lazy" decoding="async">
      <div class="movie-meta">
        <h3>${it.title}</h3>
        <p class="tag">${it.type === 'series' ? 'Serie' : 'Película'} · ${it.genre}</p>
      </div>
    `;

    const goDetail = () => {
      if (it.tmdb_id) {
        const mediaType = it.type === 'series' ? 'tv' : 'movie';
        openDetailSPA(it.tmdb_id, mediaType);
      } else {
        openMovieModal(it);
      }
    };
    card.addEventListener('click', goDetail);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(); }
    });

    frag.appendChild(card);
  });

  carousel.innerHTML = '';
  carousel.appendChild(frag);
}

function applyFilters() {
  let list = CATALOG;
  if (STATE.scope !== 'all') {
    const need = STATE.scope === 'movies' ? 'movie' : 'series';
    list = list.filter(i => i.type === need);
  }
  if (STATE.genre !== 'all') {
    list = list.filter(i => i.genre === STATE.genre);
  }
  if (list.length === 0) return renderEmptyCarousel('Prueba con otra sección o género.');
  renderCarousel(list);
}

function setPressed(btns, predicate) {
  btns.forEach(b => b.setAttribute('aria-pressed', predicate(b) ? 'true' : 'false'));
}
function syncButtonsUI() {
  setPressed(sectionButtons, b => b.dataset.scope === STATE.scope);
  setPressed(filterButtons,  b => b.dataset.genre  === STATE.genre);
  if (mScope) mScope.value = STATE.scope;
  if (mGenre) mGenre.value = STATE.genre;
}

sectionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    STATE.scope = btn.dataset.scope;
    localStorage.setItem(SCOPE_KEY, STATE.scope);
    syncButtonsUI();
    applyFilters();
  });
});
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    STATE.genre = btn.dataset.genre;
    localStorage.setItem(GENRE_KEY, STATE.genre);
    syncButtonsUI();
    applyFilters();
  });
});
if (mScope) mScope.addEventListener('change', () => {
  STATE.scope = mScope.value;
  localStorage.setItem(SCOPE_KEY, STATE.scope);
  syncButtonsUI();
  applyFilters();
});
if (mGenre) mGenre.addEventListener('change', () => {
  STATE.genre = mGenre.value;
  localStorage.setItem(GENRE_KEY, STATE.genre);
  syncButtonsUI();
  applyFilters();
});

/* --------------------------------
   7) H-SCROLL CARRUSEL
--------------------------------- */
if (carousel) {
  carousel.addEventListener('wheel', (e) => {
    const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    if (!isVertical) return;
    e.preventDefault();
    carousel.scrollLeft += e.deltaY;
  }, { passive: false });
}

/* --------------------------------
   8) MODAL GENÉRICO (open/close)
--------------------------------- */
const body = document.body;
const movieModal = document.createElement('div');
movieModal.className  = 'modal';
movieModal.setAttribute('role', 'dialog');
movieModal.setAttribute('aria-modal', 'true');
movieModal.setAttribute('aria-hidden', 'true');
movieModal.innerHTML  = `
  <div class="modal-content" role="document">
    <button class="close-btn" aria-label="Cerrar">&times;</button>
    <img class="modal-img" src="" alt="">
    <h2 class="modal-title"></h2>
    <p class="modal-description"></p>
  </div>
`;
body.appendChild(movieModal);

function closeModal(el) {
  if (!el) return;
  el.setAttribute('aria-hidden', 'true');
  const esc = el.__onEsc;
  const click = el.__onBackdrop;
  if (esc)   document.removeEventListener('keydown', esc);
  if (click) el.removeEventListener('click', click);
  el.__onEsc = el.__onBackdrop = null;
}
function openModal(el) {
  if (!el) return;
  el.setAttribute('aria-hidden', 'false');
  const onEsc = (e) => { if (e.key === 'Escape') closeModal(el); };
  document.addEventListener('keydown', onEsc);
  el.__onEsc = onEsc;
  const onBackdrop = (e) => {
    const content = el.querySelector('.login-modal-content, .search-modal-content, .modal-content');
    if (!content || !content.contains(e.target)) closeModal(el);
  };
  el.addEventListener('click', onBackdrop);
  el.__onBackdrop = onBackdrop;
}

function openMovieModal(item) {
  const img = $('.modal-img', movieModal);
  const title = $('.modal-title', movieModal);
  const desc = $('.modal-description', movieModal);
  img.src = item.image;
  img.alt = item.title;
  title.textContent = item.title;
  desc.textContent = item.description || 'Sin descripción.';

  const oldActions = movieModal.querySelector('.modal-actions');
  if (oldActions) oldActions.remove();

  if (item.tmdb_id) {
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    actions.style.marginTop = '1rem';
    actions.style.display = 'flex';
    actions.style.justifyContent = 'center';

    const a = document.createElement('button');
    a.className = 'btn-cta';
    a.textContent = 'Ver más';
    a.addEventListener('click', () => {
      const mediaType = item.type === 'series' ? 'tv' : 'movie';
      closeModal(movieModal);
      openDetailSPA(item.tmdb_id, mediaType);
    });

    actions.appendChild(a);
    $('.modal-content', movieModal).appendChild(actions);
  }

  openModal(movieModal);
}

/* --------------------------------
   9) BÚSQUEDA TMDB + UI
--------------------------------- */
async function searchTMDB(query) {
  const q = encodeURIComponent(query);
  const url = `${TMDB}/search/multi?api_key=${TMDB_KEY}&language=es-ES&query=${q}&include_adult=false&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB search error');
  const data = await res.json();
  const items = (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
  return items.map(r => adaptTMDB(r, r.media_type));
}

function runSearch(query) {
  const q = (query || '').trim();
  if (!q) { applyFilters(); return; }
  renderSkeletonCarousel(8);
  searchTMDB(q)
    .then(results => {
      const filtered = results.filter(i => {
        const okScope = STATE.scope === 'all' ? true : (STATE.scope === 'movies' ? i.type === 'movie' : i.type === 'series');
        const okGenre = STATE.genre === 'all' ? true : i.genre === STATE.genre;
        return okScope && okGenre;
      });
      if (filtered.length === 0) renderEmptyCarousel('Sin resultados para esa búsqueda.');
      else renderCarousel(filtered);
    })
    .catch(() => {
      showToast('No se pudo buscar en TMDB. Mostrando catálogo local.', { type: 'error' });
      const local = CATALOG.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));
      if (local.length === 0) renderEmptyCarousel('Sin resultados locales.');
      else renderCarousel(local);
    });
}

const searchBtn       = $('#search-btn');
const searchDialog    = $('#search-dialog');
const searchCloseBtn  = searchDialog ? $('.search-close-btn', searchDialog) : null;
const searchInput     = searchDialog ? $('#search-input', searchDialog) : null;

// Asegura la lupa SVG que hereda color (blanco en oscuro / negro en claro)
(() => {
  const btn = document.getElementById('search-btn');
  if (btn) {
    btn.innerHTML = `
      <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
        <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      </svg>
    `;
  }
})();

if (searchBtn) {
  if (searchDialog && searchInput && searchCloseBtn) {
    searchBtn.addEventListener('click', () => openModal(searchDialog));
    searchCloseBtn.addEventListener('click', () => closeModal(searchDialog));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { runSearch(e.currentTarget.value); closeModal(searchDialog); }
    });
  } else {
    searchBtn.addEventListener('click', () => {
      const q = prompt('Buscar por título:');
      if (q !== null) runSearch(q);
    });
  }
}

/* --------------------------------
   10) FETCH POPULAR / TOP-RATED
--------------------------------- */
async function fetchPopular(type = 'movie', page = 1) {
  const url = `${TMDB}/${type}/popular?api_key=${TMDB_KEY}&language=es-ES&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB popular error');
  const data = await res.json();
  return (data.results || []).map(m => adaptTMDB(m, type));
}

async function fetchTopRated(type = 'movie', page = 1) {
  const url = `${TMDB}/${type}/top_rated?api_key=${TMDB_KEY}&language=es-ES&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB top rated error');
  const data = await res.json();
  return (data.results || []).map(m => adaptTMDB(m, type));
}

function loadInitialData() {
  if (!carousel) return;
  renderSkeletonCarousel();
  Promise.all([ fetchPopular('movie', 1), fetchPopular('tv', 1) ])
    .then(([movies, tv]) => {
      CATALOG = [...movies, ...tv].sort((a, b) => a.title.localeCompare(b.title, 'es'));
      showToast('Catálogo cargado desde TMDB', { type: 'ok' });
      syncButtonsUI();
      applyFilters();
    })
    .catch(() => {
      CATALOG = [...moviesLocal, ...seriesLocal];
      showToast('No se pudo cargar TMDB. Usando catálogo local.', { type: 'error' });
      syncButtonsUI();
      applyFilters();
    });
}

/* --------------------------------
   11) HOME SECTIONS (Recent / Series / Top Rated)
--------------------------------- */
// Recent
const recentGrid = document.getElementById('recent-grid');
function renderRecent(list) {
  if (!recentGrid) return;
  const frag = document.createDocumentFragment();
  list.forEach(m => {
    const card = document.createElement('article');
    card.className = 'recent-card';
    card.dataset.genre = m.genre;
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${m.image}" alt="${m.title}" loading="lazy" decoding="async">
      <div class="recent-meta">
        <h3 class="recent-title">${m.title}</h3>
        <p class="recent-tag">${m.genre}</p>
      </div>
    `;
    card.addEventListener('click', () => openMovieModal(m));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMovieModal(m); }
    });
    frag.appendChild(card);
  });
  recentGrid.innerHTML = '';
  recentGrid.appendChild(frag);
}
renderRecent([
  { title: "Dune: Parte Dos",  genre: "drama",  image: "../media/imagen/dune2.WEBP",       description: "Paul y los Fremen cambian el destino de Arrakis.", type:"movie" },
  { title: "Furiosa",          genre: "action", image: "../media/imagen/furiosa.jpg",      description: "La leyenda del Wasteland antes de Mad Max.", type:"movie" },
  { title: "Wonka",            genre: "comedy", image: "../media/imagen/wonka.jpg",        description: "El origen del chocolatero más famoso.", type:"movie" },
  { title: "Oppenheimer",      genre: "drama",  image: "../media/imagen/oppenheimer.jpg",  description: "El proyecto Manhattan y sus dilemas.", type:"movie" },
  { title: "The Batman",       genre: "action", image: "../media/imagen/thebatman.jpg",    description: "Un detective oscuro acecha Gotham.", type:"movie" }
]);

// Series (grid clásico)
const seriesGrid = document.getElementById('series-grid');
function renderSeries(list) {
  if (!seriesGrid) return;
  const frag = document.createDocumentFragment();
  list.forEach(s => {
    const card = document.createElement('article');
    card.className = 'series-card';
    card.dataset.genre = s.genre;
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${s.image}" alt="${s.title}" loading="lazy" decoding="async">
      <div class="series-meta">
        <h3 class="series-title">${s.title}</h3>
        <p class="series-tag">${s.genre}</p>
      </div>
    `;
    card.addEventListener('click', () => openMovieModal(s));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMovieModal(s); }
    });
    frag.appendChild(card);
  });
  seriesGrid.innerHTML = '';
  seriesGrid.appendChild(frag);
}
renderSeries(seriesLocal);

// Top Rated
const topRatedGrid = document.getElementById('top-rated-grid');
function renderTopRated(list) {
  if (!topRatedGrid) return;
  const frag = document.createDocumentFragment();
  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'top-rated-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      <div class="top-rated-meta">
        <h3 class="top-rated-title">${item.title}</h3>
        <p class="top-rated-tag">${item.type === 'series' ? 'Serie' : 'Película'}</p>
      </div>
    `;
    const open = () => {
      if (item.tmdb_id) {
        const mediaType = item.type === 'series' ? 'tv' : 'movie';
        openDetailSPA(item.tmdb_id, mediaType);
      } else {
        openMovieModal(item);
      }
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    frag.appendChild(card);
  });
  topRatedGrid.innerHTML = '';
  topRatedGrid.appendChild(frag);
}
fetchTopRated('movie', 1)
  .then(renderTopRated)
  .catch(() => renderTopRated(moviesLocal.slice(0, 5)));

/* --------------------------------
   12) SPA: HOME <-> DETAIL
--------------------------------- */
function showHome()  { if (HOME) HOME.style.display = '';    if (DETAIL) DETAIL.style.display = 'none'; }
function showDetail(){ if (HOME) HOME.style.display = 'none'; if (DETAIL) DETAIL.style.display = '';    }

async function fetchDetail(type, id) {
  const url = `${TMDB}/${type}/${id}?api_key=${TMDB_KEY}&language=es-ES`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB detail error');
  return res.json();
}

function renderDetail(type, data) {
  const poster   = $('.detail__poster', DETAIL);
  const titleEl  = $('.detail__title', DETAIL);
  const bType    = $('.badge--type', DETAIL);
  const bYear    = $('.badge--year', DETAIL);
  const bRuntime = $('.badge--runtime', DETAIL);
  const bGenres  = $('.badge--genres', DETAIL);
  const overview = $('.detail__overview', DETAIL);
  const tmdbLink = $('#tmdb-link', DETAIL);

  const title   = type === 'movie' ? (data.title || data.original_title) : (data.name || data.original_name);
  const year    = (type === 'movie' ? data.release_date : data.first_air_date || '').slice(0,4) || '—';
  const runtime = type === 'movie'
    ? (data.runtime ? `${data.runtime} min` : '—')
    : (Array.isArray(data.episode_run_time) && data.episode_run_time[0] ? `${data.episode_run_time[0]} min/ep` : '—');
  const genres  = (data.genres || []).map(g => g.name).join(', ') || '—';

  if (poster)   { poster.src = IMG(data.poster_path, 'w500'); poster.alt = title; }
  if (titleEl)  titleEl.textContent = title;
  if (bType)    bType.textContent = type === 'movie' ? 'Película' : 'Serie';
  if (bYear)    bYear.textContent = year;
  if (bRuntime) bRuntime.textContent = runtime;
  if (bGenres)  bGenres.textContent = genres;
  if (overview) overview.textContent = data.overview || 'Sin descripción.';
  if (tmdbLink) {
    const path = type === 'movie' ? 'movie' : 'tv';
    tmdbLink.href = `https://www.themoviedb.org/${path}/${data.id}`;
  }
}

async function openDetailSPA(id, type /* 'movie' | 'tv' */) {
  const url = new URL(location.href);
  url.searchParams.set('id', id);
  url.searchParams.set('type', type);
  history.pushState({ id, type }, '', url);

  showDetail();
  const titleEl = $('.detail__title', DETAIL);
  if (titleEl) titleEl.textContent = 'Cargando…';

  try {
    const data = await fetchDetail(type, id);
    renderDetail(type, data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    if (DETAIL) {
      DETAIL.innerHTML = `
        <div class="empty">
          <h3>Error</h3>
          <p>No se pudo cargar la información.</p>
          <p><button class="btn-cta" id="btn-back-home-err">⬅ Volver</button></p>
        </div>`;
      const b = $('#btn-back-home-err');
      if (b) b.addEventListener('click', goHome);
    }
  }
}

function goHome() {
  history.pushState({}, '', location.pathname);
  showHome();
}
const backBtn = $('#btn-back-home');
if (backBtn) backBtn.addEventListener('click', goHome);

// Logo: limpia filtros y vuelve a home
const logoImg = document.querySelector('.logo img');
if (logoImg) {
  logoImg.addEventListener('click', () => {
    STATE.scope = 'all';
    STATE.genre = 'all';
    localStorage.setItem(SCOPE_KEY, 'all');
    localStorage.setItem(GENRE_KEY, 'all');
    syncButtonsUI();
    applyFilters();
    goHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Back/forward del navegador
window.addEventListener('popstate', () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');
  const type = qs.get('type');
  if (id && (type === 'movie' || type === 'tv')) {
    showDetail();
    fetchDetail(type, id).then(data => renderDetail(type, data));
  } else {
    showHome();
  }
});

/* --------------------------------
   13) LOGIN (apertura modal + validación mínima) – LEGACY
   * Se conserva tal cual para no cambiar comportamiento.
--------------------------------- */
(() => {
  const btn   = document.getElementById('login-btn');
  const modal = document.getElementById('login-modal');
  if (!btn || !modal) return;
  btn.addEventListener('click', () => openModal(modal));
})();

(() => {
  const form    = document.getElementById('login-form');
  const user    = document.getElementById('user');
  const pass    = document.getElementById('pass');
  const userMsg = document.getElementById('user-msg');
  const passMsg = document.getElementById('pass-msg');
  const submit  = document.getElementById('login-submit');
  const modal   = document.getElementById('login-modal');

  if (!form || !user || !pass || !submit) return;

  const USER_RE = /^[a-zA-Z0-9._-]{4,16}$/;
  const PASS_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  const validateUser = () => {
    const v = user.value.trim();
    const ok = USER_RE.test(v);
    user.setAttribute('aria-invalid', ok ? 'false' : 'true');
    user.classList.toggle('input-error', !ok && v !== '');
    user.classList.toggle('input-ok', ok);
    if (userMsg) userMsg.textContent = ok || v === '' ? '' : 'El usuario debe tener 4-16 caracteres (letras, números, . _ -).';
    return ok;
  };

  const validatePass = () => {
    const v = pass.value;
    const ok = PASS_RE.test(v);
    pass.setAttribute('aria-invalid', ok ? 'false' : 'true');
    pass.classList.toggle('input-error', !ok && v !== '');
    pass.classList.toggle('input-ok', ok);
    if (passMsg) passMsg.textContent = ok || v === '' ? '' : 'Mínimo 8 caracteres, al menos 1 letra y 1 número.';
    return ok;
  };

  const updateSubmit = () => { submit.disabled = !(validateUser() && validatePass()); };

  user.addEventListener('input', () => { validateUser(); updateSubmit(); });
  pass.addEventListener('input', () => { validatePass(); updateSubmit(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const okUser = validateUser();
    const okPass = validatePass();
    if (!okUser) { user.focus(); return; }
    if (!okPass) { pass.focus(); return; }

    showToast(`¡Bienvenido, ${user.value.trim()}!`, { type: 'ok' });

    form.reset();
    user.classList.remove('input-ok','input-error');
    pass.classList.remove('input-ok','input-error');
    submit.disabled = true;

    if (modal) closeModal(modal);
  });
})();

/* --------------------------------
   13b) LOGIN SIMULADO (localStorage)
   * Mantiene mismo comportamiento visual + estado persistente.
--------------------------------- */
const LOGIN_KEY   = 'streamio:isLoggedIn';
const USER_KEY    = 'streamio:username';
const loginBtn    = document.getElementById('login-btn');
const loginModal  = document.getElementById('login-modal');
const loginForm   = document.getElementById('login-form');
const inputUser   = document.getElementById('user');
const inputPass   = document.getElementById('pass');
const userMsg     = document.getElementById('user-msg');
const passMsg     = document.getElementById('pass-msg');
const loginSubmit = document.getElementById('login-submit');

function openLoginModal() { if (loginModal) { loginModal.setAttribute('aria-hidden', 'false'); inputUser?.focus(); } }
function closeLoginModal() { if (loginModal) loginModal.setAttribute('aria-hidden', 'true'); }

// Click fuera → cerrar (sin botón X)
if (loginModal) {
  loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && loginModal && loginModal.getAttribute('aria-hidden') === 'false') closeLoginModal();
});

function setLoggedInUI(username) {
  if (!loginBtn) return;
  loginBtn.textContent = `Hola, ${username}`;
  loginBtn.classList.add('logged');
}
function setLoggedOutUI() {
  if (!loginBtn) return;
  loginBtn.textContent = 'Iniciar sesión';
  loginBtn.classList.remove('logged');
}

const USER_RE = /^[a-zA-Z0-9._-]{4,16}$/;
const PASS_MIN = 6;

function validateUser2() {
  const v = (inputUser?.value || '').trim();
  const ok = USER_RE.test(v);
  inputUser?.setAttribute('aria-invalid', ok ? 'false' : 'true');
  inputUser?.classList.toggle('input-error', !ok && v !== '');
  inputUser?.classList.toggle('input-ok', ok);
  if (userMsg) userMsg.textContent = ok || v === '' ? '' : 'Usuario 4–16 (letras, números, . _ -).';
  return ok;
}
function validatePass2() {
  const v = inputPass?.value || '';
  const ok = v.length >= PASS_MIN;
  inputPass?.setAttribute('aria-invalid', ok ? 'false' : 'true');
  inputPass?.classList.toggle('input-error', !ok && v !== '');
  inputPass?.classList.toggle('input-ok', ok);
  if (passMsg) passMsg.textContent = ok || v === '' ? '' : `Mínimo ${PASS_MIN} caracteres.`;
  return ok;
}
function updateSubmit2() { if (loginSubmit) loginSubmit.disabled = !(validateUser2() && validatePass2()); }

inputUser?.addEventListener('input', () => { validateUser2(); updateSubmit2(); });
inputPass?.addEventListener('input', () => { validatePass2(); updateSubmit2(); });

loginBtn?.addEventListener('click', () => {
  const isLogged = localStorage.getItem(LOGIN_KEY) === 'true';
  if (isLogged) {
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(USER_KEY);
    setLoggedOutUI();
    showToast('Sesión cerrada', { type: 'ok' });
  } else {
    openLoginModal();
  }
});

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const okU = validateUser2();
  const okP = validatePass2();
  if (!okU) { inputUser?.focus(); return; }
  if (!okP) { inputPass?.focus(); return; }

  const username = (inputUser?.value || '').trim();
  localStorage.setItem(LOGIN_KEY, 'true');
  localStorage.setItem(USER_KEY, username);

  loginForm.reset();
  inputUser?.classList.remove('input-ok', 'input-error');
  inputPass?.classList.remove('input-ok', 'input-error');
  if (loginSubmit) loginSubmit.disabled = true;

  setLoggedInUI(username);
  closeLoginModal();
  showToast('¡Sesión iniciada!', { type: 'ok' });
});

(function restoreLoginState() {
  const isLogged = localStorage.getItem(LOGIN_KEY) === 'true';
  const username = localStorage.getItem(USER_KEY) || '';
  if (isLogged && username) setLoggedInUI(username);
  else setLoggedOutUI();
})();

/* --------------------------------
   14) THEME APPLY + BOOT
--------------------------------- */
const themeBtn = document.getElementById('theme-toggle');
function applyTheme(mode) {
  const light = mode === 'light';
  document.body.classList.toggle('theme-light', light);
  localStorage.setItem(THEME_KEY, mode);
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(light));
    themeBtn.innerHTML = light ? ICON_MOON : ICON_SUN;
    themeBtn.title = `Cambiar a tema ${light ? 'oscuro' : 'claro'} (Shift+D)`;
  }
}
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const mode = saved || (prefersLight ? 'light' : 'dark');
  applyTheme(mode);
})();
themeBtn?.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
  applyTheme(next);
});

// Boot
(function boot() {
  if (carousel) { syncButtonsUI(); loadInitialData(); }
  const qs = new URLSearchParams(location.search);
  const id = qs.get('id');
  const type = qs.get('type');
  if (id && (type === 'movie' || type === 'tv')) {
    showDetail();
    fetchDetail(type, id).then(data => renderDetail(type, data));
  } else {
    showHome();
  }
})();
