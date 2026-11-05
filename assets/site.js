// Ivy PvE site behaviour: navigation plus JSON-powered page content.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const cleanImage = value => {
  const path = String(value || '').trim();
  // Images should be local website assets; allow ordinary relative paths only.
  if (!path || path.startsWith('/') || path.includes('..') || /^https?:/i.test(path)) return '';
  return path;
};
async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
  return response.json();
}
function showLoadError(container, file) {
  container.innerHTML = `<p class="muted">Unable to load ${esc(file)}. Check that the JSON file exists and contains valid JSON.</p>`;
}

async function renderItems() {
  const container = document.getElementById('items-list');
  if (!container) return;
  let items;
  try { items = await readJson(container.dataset.json); }
  catch (error) { showLoadError(container, container.dataset.json); return; }
  if (!Array.isArray(items)) { showLoadError(container, container.dataset.json); return; }
  const artClasses = {medical:'art-med', clothing:'art-cloth', tools:'art-tools', weapons:'art-weapons'};
  const artSymbols = {medical:'✚', clothing:'▧', tools:'⬡', weapons:'⌁'};
  container.innerHTML = items.map(item => {
    const category = String(item.category || 'other').toLowerCase();
    const image = cleanImage(item.image);
    const art = artClasses[category] || 'art-tools';
    const media = image
      ? `<img src="${esc(image)}" alt="${esc(item.name)}" loading="lazy">`
      : `<div class="catalog-art ${art}">${artSymbols[category] || '⬡'}<small>${esc(item.artLabel || item.categoryLabel || category.toUpperCase())}</small></div>`;
    const details = [
      item.rarity && item.rarity !== 'ADD RARITY' ? `<span>RARITY: ${esc(item.rarity)}</span>` : '',
      item.capacity && item.capacity !== 'ADD CAPACITY' ? `<span>CAPACITY: ${esc(item.capacity)}</span>` : '',
      item.obtainable && item.obtainable !== 'ADD SOURCE' ? `<span>OBTAIN: ${esc(item.obtainable)}</span>` : ''
    ].filter(Boolean).join(' · ');
    return `<article class="catalog-card" data-category="${esc(category)}">
      ${media}<div class="catalog-copy"><span class="tag">${esc(item.categoryLabel || category)}</span>
      <h3>${esc(item.name || 'Unnamed item')}</h3><p>${esc(item.description || '')}</p>
      ${details ? `<p class="catalog-details">${details}</p>` : ''}
      <span class="catalog-id">ITEM ID: ${esc(item.classname || 'NOT PROVIDED')}</span></div></article>`;
  }).join('') || '<p class="muted">No equipment has been added yet. Add entries to data/items.json.</p>';
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === button));
      const filter = button.dataset.filter;
      container.querySelectorAll('.catalog-card').forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
}

async function renderVehicles() {
  const container = document.getElementById('vehicles-list');
  if (!container) return;
  let vehicles;
  try { vehicles = await readJson(container.dataset.json); }
  catch (error) { showLoadError(container, container.dataset.json); return; }
  if (!Array.isArray(vehicles)) { showLoadError(container, container.dataset.json); return; }
  container.innerHTML = vehicles.map((vehicle, index) => {
    const image = cleanImage(vehicle.image);
    const media = image
      ? `<img class="vehicle-photo" src="${esc(image)}" alt="${esc(vehicle.name)}" loading="lazy">`
      : `<div class="vehicle-image vehicle-${['one','two','three'][index % 3]}"><span>IVY MOTORPOOL / ${String(index+1).padStart(3,'0')}</span><div class="vehicle-symbol">▰</div></div>`;
    return `<article class="vehicle-card">${media}<div class="vehicle-copy">
      <div class="entry-meta"><span class="tag">${esc(vehicle.category || 'VEHICLE')}</span><span>CLASS: ${esc(vehicle.classname || 'TBD')}</span></div>
      <h3>${esc(vehicle.name || 'Unnamed vehicle')}</h3><p>${esc(vehicle.description || '')}</p>
      <div class="spec-grid"><div><small>STORAGE</small><b>${esc(vehicle.storage || 'NOT LISTED')}</b></div>
      <div><small>FUEL</small><b>${esc(vehicle.fuel || 'NOT LISTED')}</b></div>
      <div><small>ACCESS</small><b>${esc(vehicle.access || 'NOT LISTED')}</b></div></div></div></article>`;
  }).join('') || '<p class="muted">No vehicles have been added yet. Add entries to data/vehicles.json.</p>';
}

async function renderNews() {
  const container = document.getElementById('news-list');
  if (!container) return;
  let posts;
  try { posts = await readJson(container.dataset.json); }
  catch (error) { showLoadError(container, container.dataset.json); return; }
  if (!Array.isArray(posts)) { showLoadError(container, container.dataset.json); return; }
  container.innerHTML = posts.map((post, index) => `<article class="news-entry">
    <div class="entry-meta"><span class="tag ${index ? 'tag-outline' : ''}">${esc(post.category || 'NEWS')}</span><span>${esc(post.date || '')}</span></div>
    <h2>${esc(post.title || 'Untitled announcement')}</h2>
    ${post.subtitle ? `<p class="lead">${esc(post.subtitle)}</p>` : ''}
    <p>${esc(post.content || '')}</p>
    <div class="entry-foot">POSTED BY ${esc(post.author || 'IVY STAFF')} <span>${String(index+1).padStart(2,'0')} / ${String(posts.length).padStart(2,'0')}</span></div>
    </article>`).join('') || '<p class="muted">No announcements yet. Add posts to data/news.json.</p>';
  const home = document.getElementById('home-news');
  if (home) home.innerHTML = posts.slice(0,3).map(post => `<a class="latest-news-card" href="news.html">
    <span class="tag">${esc(post.category || 'NEWS')}</span><small>${esc(post.date || '')}</small>
    <h3>${esc(post.title || 'Untitled announcement')}</h3><p>${esc(post.subtitle || post.content || '')}</p><span class="card-link">READ UPDATE ↗</span></a>`).join('');
}

async function renderServer() {
  const profile = document.getElementById('server-profile');
  if (!profile) return;
  let data;
  try { data = await readJson(profile.dataset.json); }
  catch (error) { showLoadError(profile, profile.dataset.json); return; }
  const p = data.profile || {};
  profile.querySelector('h2').textContent = p.name || 'IVY PVE — BADLANDS';
  profile.querySelector('.info-banner p:not(.eyebrow)').textContent = p.description || '';
  profile.querySelector('.status-placeholder').innerHTML = `<span class="status-dot"></span> SERVER STATUS: ${esc(p.status || 'NOT PROVIDED')}`;
  const discord = p.discordUrl
    ? `<a class="text-link" href="${esc(p.discordUrl)}" target="_blank" rel="noopener">${esc(p.discordLabel || 'JOIN DISCORD')} ↗</a>`
    : esc(p.discordLabel || 'ADD DISCORD INVITE');
  const rows = [['Server name',p.serverName],['IP address',p.ip],['Game port',p.port],['Map',p.map],['Platform',p.platform],['Discord',discord]];
  document.getElementById('connection-details').innerHTML = rows.map(([label,value]) =>
    `<dt>${esc(label)}</dt><dd>${label === 'Discord' ? value : esc(value || 'NOT PROVIDED')}</dd>`).join('');
  const gameplay = document.getElementById('gameplay-list');
  gameplay.innerHTML = (data.gameplay || []).map((entry,i) => `<li><b>${String(i+1).padStart(2,'0')}</b><span><strong>${esc(entry.title)}</strong><br>${esc(entry.description)}</span></li>`).join('');
  const rules = document.getElementById('rules-list');
  rules.innerHTML = (data.rules || []).map((entry,i) => `<div><b>${String(i+1).padStart(2,'0')}</b><h3>${esc(entry.title)}</h3><p>${esc(entry.description)}</p></div>`).join('');
}

renderItems();
renderVehicles();
renderNews();
renderServer();
