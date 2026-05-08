/* ============================================================
   FestivalCalendar.online — Filters & URL Params
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  applyUrlParams();
  populateCityDropdown();
  populateCategoryDropdown();
  initActiveFilters();
});

/* ── URL Param Parsing ─────────────────────────────────────── */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    city:     params.get('city')     || '',
    state:    params.get('state')    || '',
    category: params.get('cat')      || params.get('category') || '',
    id:       params.get('id')       || '',
    date:     params.get('date')     || ''
  };
}

function applyUrlParams() {
  const { city, state, category, id } = getUrlParams();

  // City page
  const cityNameEls = document.querySelectorAll('[data-dynamic="city-name"]');
  if (city && cityNameEls.length) {
    cityNameEls.forEach(el => el.textContent = city);
    document.querySelectorAll('[data-dynamic="city-title"]').forEach(el => {
      el.textContent = `Festivals in ${city}`;
    });
    document.title = `Festivals in ${city} | FestivalCalendar.online`;
    const results = FESTIVALS_DATA.filter(f => f.city.toLowerCase() === city.toLowerCase());
    renderFestivalCards(results.length ? results : FESTIVALS_DATA.slice(0,6), 'city-results');
    renderOtherCities(city);
  }

  // State page
  const stateNameEls = document.querySelectorAll('[data-dynamic="state-name"]');
  if (state && stateNameEls.length) {
    stateNameEls.forEach(el => el.textContent = state);
    document.title = `Festivals in ${state} | FestivalCalendar.online`;
    document.querySelectorAll('[data-dynamic="state-title"]').forEach(el => {
      el.textContent = `Festivals in ${state}`;
    });
    const results = FESTIVALS_DATA.filter(f =>
      f.state.toLowerCase() === state.toLowerCase() ||
      f.stateCode.toLowerCase() === state.toLowerCase()
    );
    renderFestivalCards(results.length ? results : FESTIVALS_DATA.slice(0,6), 'state-results');
    renderStateCategoryHeadings(state, results);
  }

  // Category page
  const catNameEls = document.querySelectorAll('[data-dynamic="cat-name"]');
  const CAT_EMOJI  = { music: '🎵', food: '🍕', art: '🎨', wellness: '🧘', cultural: '🌍', spiritual: '✨' };
  const CAT_DESC   = {
    music:     'Discover live music festivals from intimate local showcases to massive multi-stage events. Find your next concert experience.',
    food:      'From street food fairs to gourmet culinary events, explore food festivals celebrating local flavors and world cuisines.',
    art:       'Galleries, installations, murals, and performances — find art festivals that inspire creativity and community.',
    wellness:  'Yoga retreats, meditation gatherings, sound healing, and holistic health festivals for mind, body, and soul.',
    cultural:  'Celebrate the richness of human heritage at multicultural festivals showcasing food, music, dance, and tradition.',
    spiritual: 'Metaphysical fairs, conscious living expos, and spiritual gatherings for seekers and practitioners.'
  };
  if (category && catNameEls.length) {
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    const emoji = CAT_EMOJI[category.toLowerCase()] || '🎪';
    catNameEls.forEach(el => el.textContent = `${emoji} ${label} Festivals`);
    document.querySelectorAll('[data-dynamic="cat-desc"]').forEach(el => {
      el.textContent = CAT_DESC[category.toLowerCase()] || `Discover the best ${label} festivals near you.`;
    });
    document.title = `${label} Festivals Near You | FestivalCalendar.online`;
    const results = FESTIVALS_DATA.filter(f => f.category.toLowerCase() === category.toLowerCase());
    renderFestivalCards(results.length ? results : FESTIVALS_DATA.slice(0,6), 'category-results');
  }

  // Event detail page
  if (id) {
    renderEventDetail(id);
  }

  // Pre-fill search inputs from params
  if (city) {
    document.querySelectorAll('input[name="city"]').forEach(i => i.value = city);
  }
  if (category) {
    document.querySelectorAll('select[name="category"]').forEach(s => {
      if ([...s.options].some(o => o.value.toLowerCase() === category.toLowerCase())) {
        s.value = category.charAt(0).toUpperCase() + category.slice(1);
      }
    });
  }
}

/* ── Dynamic Dropdowns ─────────────────────────────────────── */
function populateCityDropdown() {
  const selects = document.querySelectorAll('select[name="city-select"], select[data-populate="cities"]');
  if (!selects.length || typeof FESTIVALS_DATA === 'undefined') return;
  const cities = [...new Set(FESTIVALS_DATA.map(f => f.city))].sort();
  selects.forEach(sel => {
    const placeholder = sel.querySelector('option[value=""]') || document.createElement('option');
    placeholder.value = ''; placeholder.textContent = 'All Cities';
    sel.innerHTML = '';
    sel.appendChild(placeholder);
    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      sel.appendChild(opt);
    });
  });
}

function populateCategoryDropdown() {
  const selects = document.querySelectorAll('select[data-populate="categories"]');
  if (!selects.length || typeof FESTIVALS_DATA === 'undefined') return;
  const cats = [...new Set(FESTIVALS_DATA.map(f => f.category))].sort();
  selects.forEach(sel => {
    const placeholder = sel.querySelector('option[value=""]') || document.createElement('option');
    placeholder.value = ''; placeholder.textContent = 'All Categories';
    sel.innerHTML = '';
    sel.appendChild(placeholder);
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      sel.appendChild(opt);
    });
  });
}

/* ── Active Filters UI ─────────────────────────────────────── */
function initActiveFilters() {
  const { city, category } = getUrlParams();
  if (city || category) {
    document.querySelectorAll('.filter-chip').forEach(chip => {
      if (city     && chip.dataset.city?.toLowerCase()     === city.toLowerCase())     chip.classList.add('active');
      if (category && chip.dataset.category?.toLowerCase() === category.toLowerCase()) chip.classList.add('active');
    });
  }
}

/* ── City bubbles on city page ─────────────────────────────── */
function renderOtherCities(currentCity) {
  const el = document.getElementById('other-cities');
  if (!el) return;
  const cities = [...new Set(FESTIVALS_DATA.map(f => f.city))].filter(c => c !== currentCity);
  el.innerHTML = cities.map(c =>
    `<a href="city.html?city=${encodeURIComponent(c)}" class="filter-chip">${c}</a>`
  ).join('');
}

/* ── State category headings ───────────────────────────────── */
function renderStateCategoryHeadings(state, festivals) {
  const el = document.getElementById('state-category-headings');
  if (!el) return;
  const cats = [...new Set(festivals.map(f => f.category))];
  el.innerHTML = cats.map(cat => {
    const items = festivals.filter(f => f.category === cat);
    return `<h2 class="mb-16">${cat} Festivals in ${state}</h2><div class="festivals-grid mb-48">${items.map(buildCard).join('')}</div>`;
  }).join('');
}

/* ── Event Detail Renderer ─────────────────────────────────── */
function renderEventDetail(id) {
  const fest = FESTIVALS_DATA.find(f => f.id === id);
  const container = document.getElementById('event-detail');
  if (!container) return;
  if (!fest) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">😔</div><h3>Festival not found</h3><p>This event may have been removed. <a href="index.html">Browse all festivals →</a></p></div>`;
    return;
  }
  document.title = `${fest.title} | FestivalCalendar.online`;
  document.querySelectorAll('[data-dynamic="event-title"]').forEach(el => el.textContent = fest.title);

  const dateStr = window.festivalUtils?.formatDateRange(fest.date, fest.endDate) || `${fest.date} – ${fest.endDate}`;
  const tagsHtml = (fest.tags || []).map(t => `<span class="event-tag">${t}</span>`).join('');
  const more = FESTIVALS_DATA.filter(f => f.city === fest.city && f.id !== fest.id).slice(0, 3);

  container.innerHTML = `
    <div class="event-hero">
      <div class="card-image-placeholder" style="font-size:3.5rem;margin-bottom:16px">${fest.emoji || '🎪'}</div>
      <span class="category-badge ${fest.category.toLowerCase()}">${fest.category}</span>
      ${fest.featured ? '<span class="featured-badge" style="position:relative;top:auto;right:auto;margin-left:8px">Featured</span>' : ''}
      <h1 data-dynamic="event-title" style="margin:12px 0">${fest.title}</h1>
      <div class="event-meta-bar">
        <div class="event-meta-item">📍 ${fest.city}, ${fest.stateCode}</div>
        <div class="event-meta-item">🗓 ${dateStr}</div>
        <div class="event-meta-item">💰 ${fest.price}</div>
        <div class="event-meta-item">🏢 ${fest.organizer}</div>
      </div>
      <div class="event-tags">${tagsHtml}</div>
      <div class="event-actions">
        <a href="${fest.ticketUrl}" class="btn btn-primary btn-lg">Get Tickets</a>
        <a href="https://id.thenooworld.com?redirect=${encodeURIComponent(location.href)}" class="btn btn-outline">⭐ Save Festival</a>
        <button class="btn btn-ghost" onclick="navigator.clipboard.writeText(location.href);this.textContent='✓ Copied!'">🔗 Share</button>
      </div>
    </div>

    <div class="event-content-grid">
      <div class="event-body">
        <h2 style="margin-bottom:16px">About This Festival</h2>
        <p style="font-size:1.05rem;line-height:1.8;color:var(--text-secondary)">${fest.description}</p>
        ${more.length ? `
          <div style="margin-top:48px">
            <h2 style="margin-bottom:24px">More Festivals in ${fest.city}</h2>
            <div class="festivals-grid">${more.map(buildCard).join('')}</div>
          </div>
        ` : ''}
      </div>
      <aside class="event-sidebar">
        <h4>Quick Info</h4>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px">Dates</div><div style="font-size:0.95rem;color:var(--text-primary)">${dateStr}</div></div>
          <div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px">Location</div><div style="font-size:0.95rem;color:var(--text-primary)">${fest.city}, ${fest.state}</div></div>
          <div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px">Category</div><div style="font-size:0.95rem;color:var(--text-primary)">${fest.category}</div></div>
          <div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px">Price</div><div style="font-size:0.95rem;color:var(--text-primary)">${fest.price}</div></div>
          <div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px">Organizer</div><div style="font-size:0.95rem;color:var(--text-primary)">${fest.organizer}</div></div>
        </div>
        <div style="margin-top:24px;display:flex;flex-direction:column;gap:10px">
          <a href="${fest.ticketUrl}" class="btn btn-primary btn-block">Get Tickets</a>
          <a href="https://id.thenooworld.com?redirect=${encodeURIComponent(location.href)}" class="btn btn-outline btn-block">Sign in to Save</a>
        </div>
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
          <p style="font-size:0.8rem;color:var(--text-muted)">Is your festival info outdated? <a href="contact.html" style="color:var(--orange)">Let us know</a></p>
        </div>
      </aside>
    </div>`;
}
