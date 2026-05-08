/* ============================================================
   FestivalCalendar.online — Main JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initPage();
  initForms();
});

/* ── Nav ───────────────────────────────────────────────────── */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
  // Active link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

/* ── Page router ───────────────────────────────────────────── */
function initPage() {
  const body = document.body.dataset.page;
  if (document.getElementById('featured-festivals'))    renderFeaturedSection();
  if (document.getElementById('this-weekend-festivals')) renderWeekendSection();
  if (document.getElementById('near-me-results'))       renderNearMeSection();
  if (document.getElementById('weekend-results'))       renderWeekendResultsSection();
}

/* ── Card builder ──────────────────────────────────────────── */
function buildCard(fest) {
  const badgeClass = fest.category.toLowerCase();
  const priceClass = fest.price === 'Paid' ? 'paid' : '';
  const featured   = fest.featured ? '<span class="featured-badge">Featured</span>' : '';
  const dateStr    = formatDateRange(fest.date, fest.endDate);
  const desc       = fest.description.length > 120 ? fest.description.slice(0, 120) + '…' : fest.description;
  return `
    <article class="festival-card fade-up">
      <div class="card-image">
        <div class="card-image-placeholder">${fest.emoji || '🎪'}</div>
        ${featured}
      </div>
      <div class="card-body">
        <span class="category-badge ${badgeClass}">${fest.category}</span>
        <h3 class="card-title">${fest.title}</h3>
        <p class="card-meta">📍 ${fest.city}, ${fest.stateCode} &nbsp;·&nbsp; 🗓 ${dateStr}</p>
        <p class="card-description">${desc}</p>
        <div class="card-footer">
          <span class="price-tag ${priceClass}">${fest.price}</span>
          <a href="event.html?id=${fest.id}" class="btn btn-sm btn-primary">View Details</a>
        </div>
      </div>
    </article>`;
}

function renderFestivalCards(festivals, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!festivals || festivals.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No festivals found</h3><p>Try adjusting your search or <a href="submit.html">submit a festival</a>.</p></div>`;
    return;
  }
  el.innerHTML = festivals.map(buildCard).join('');
}

/* ── Data helpers ──────────────────────────────────────────── */
function getFeaturedFestivals() {
  return FESTIVALS_DATA.filter(f => f.featured).slice(0, 6);
}

function getThisWeekendFestivals() {
  const today    = new Date();
  const day      = today.getDay();
  const fri      = new Date(today); fri.setDate(today.getDate() + ((5 - day + 7) % 7 || 7));
  const sun      = new Date(fri);   sun.setDate(fri.getDate() + 2);
  return FESTIVALS_DATA.filter(f => {
    const start = new Date(f.date);
    const end   = new Date(f.endDate);
    return start <= sun && end >= fri;
  });
}

function getByCategory(cat) {
  return FESTIVALS_DATA.filter(f => f.category.toLowerCase() === cat.toLowerCase());
}

function getByCity(city) {
  return FESTIVALS_DATA.filter(f => f.city.toLowerCase() === city.toLowerCase());
}

function getByState(state) {
  return FESTIVALS_DATA.filter(f =>
    f.state.toLowerCase() === state.toLowerCase() ||
    f.stateCode.toLowerCase() === state.toLowerCase()
  );
}

function searchFestivals({ city = '', category = '', date = '' }) {
  return FESTIVALS_DATA.filter(f => {
    const cityMatch = !city || f.city.toLowerCase().includes(city.toLowerCase()) ||
                                f.state.toLowerCase().includes(city.toLowerCase()) ||
                                f.stateCode.toLowerCase().includes(city.toLowerCase());
    const catMatch  = !category || f.category.toLowerCase() === category.toLowerCase();
    const dateMatch = !date || f.date <= date && f.endDate >= date;
    return cityMatch && catMatch && dateMatch;
  });
}

/* ── Section renderers ─────────────────────────────────────── */
function renderFeaturedSection() {
  renderFestivalCards(getFeaturedFestivals(), 'featured-festivals');
}

function renderWeekendSection() {
  const weekend = getThisWeekendFestivals();
  const festivals = weekend.length > 0 ? weekend : FESTIVALS_DATA.slice(0, 3);
  renderFestivalCards(festivals, 'this-weekend-festivals');
}

function renderNearMeSection() {
  renderFestivalCards(FESTIVALS_DATA, 'near-me-results');
}

function renderWeekendResultsSection() {
  const weekend = getThisWeekendFestivals();
  const festivals = weekend.length > 0 ? weekend : FESTIVALS_DATA.slice(0, 6);
  renderFestivalCards(festivals, 'weekend-results');
}

/* ── Search form ───────────────────────────────────────────── */
function initForms() {
  // Main search form
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const city     = searchForm.querySelector('[name="city"]')?.value?.trim() || '';
      const category = searchForm.querySelector('[name="category"]')?.value || '';
      const date     = searchForm.querySelector('[name="date"]')?.value || '';
      const results  = searchFestivals({ city, category, date });
      const target   = document.getElementById('near-me-results') ||
                       document.getElementById('search-results') ||
                       document.getElementById('weekend-results');
      if (target) renderFestivalCards(results, target.id);
    });
  }

  // Email signup forms
  document.querySelectorAll('.email-signup-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const success = form.querySelector('.form-success');
      if (success) { success.style.display = 'block'; }
      form.querySelector('input[type="email"]').value = '';
    });
  });

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const success = contactForm.querySelector('.form-success');
      if (success) success.style.display = 'block';
      contactForm.reset();
    });
  }

  // Submit festival form
  const submitForm = document.getElementById('submit-festival-form');
  if (submitForm) {
    submitForm.addEventListener('submit', e => {
      e.preventDefault();
      const success = submitForm.querySelector('.form-success');
      if (success) success.style.display = 'block';
      submitForm.reset();
    });
  }

  // Vendor form
  const vendorForm = document.getElementById('vendor-form');
  if (vendorForm) {
    vendorForm.addEventListener('submit', e => {
      e.preventDefault();
      const success = vendorForm.querySelector('.form-success');
      if (success) success.style.display = 'block';
      vendorForm.reset();
    });
  }

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      if (group) {
        document.querySelectorAll(`.filter-chip[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
      }
      chip.classList.toggle('active');
    });
  });
}

/* ── Utilities ─────────────────────────────────────────────── */
function formatDateRange(start, end) {
  if (!start) return '';
  const s = new Date(start + 'T00:00:00');
  if (!end || start === end) return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const e = new Date(end + 'T00:00:00');
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function getWeekendLabel() {
  const today = new Date();
  const day = today.getDay();
  const fri = new Date(today); fri.setDate(today.getDate() + ((5 - day + 7) % 7 || 7));
  const sun = new Date(fri);   sun.setDate(fri.getDate() + 2);
  return `${fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Expose for inline use
window.festivalUtils = { formatDateRange, getWeekendLabel, getByCity, getByCategory, getByState, searchFestivals, renderFestivalCards };
