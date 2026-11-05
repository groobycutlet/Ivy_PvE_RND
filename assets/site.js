// Ivy PvE — JSON-powered content. All page content remains styled by assets/style.css.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const safeImage = value => {
  const path = String(value || '').trim();
  if (!path || path.startsWith('/') || path.includes('..') || /^https?:/i.test(path)) return '';
  return path;
};
async function getData(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}
function loadError(node, path) {
  node.innerHTML = `<p class="muted">Unable to load ${esc(path)}. Check that the JSON file exists and contains valid JSON.</p>`;
}
async function renderItems() {
  const node = document.getElementById('items-list');
  if (!node) return;
  let items;
  try { items = await getData(node.dataset.json); } catch { loadError(node,node.dataset.json); return; }
  if (!Array.isArray(items)) { loadError(node,node.dataset.json); return; }
  if (!items.length) {
    node.innerHTML = '<p class="muted">No equipment entries yet. Add entries to data/items.json.</p>';
    return;
  }

  const icons = {medical:'✚',clothing:'▧',tools:'⬡',weapons:'⌁'};
  const classes = {medical:'art-med',clothing:'art-cloth',tools:'art-tools',weapons:'art-weapons'};
  const groups = new Map();
  items.forEach((item,index) => {
    const category = String(item.category || 'other').trim().toLowerCase() || 'other';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({item,index});
  });

  const itemCard = ({item,index}) => {
    const cat = String(item.category || 'other').toLowerCase();
    const img = safeImage(item.image);
    const media = img
      ? `<div class="catalog-photo"><img src="${esc(img)}" alt="${esc(item.name)}" loading="lazy"></div>`
      : `<div class="catalog-art ${classes[cat] || 'art-tools'}">${icons[cat] || '⬡'}<small>${esc(item.artLabel || item.categoryLabel || cat.toUpperCase())}</small></div>`;
    const extras = [
      item.rarity && !String(item.rarity).startsWith('ADD ') ? `RARITY: ${esc(item.rarity)}` : '',
      item.capacity && !String(item.capacity).startsWith('ADD ') ? `CAPACITY: ${esc(item.capacity)}` : '',
      item.obtainable && !String(item.obtainable).startsWith('ADD ') ? `OBTAIN: ${esc(item.obtainable)}` : ''
    ].filter(Boolean).join(' · ');
    return `<article class="catalog-card">${media}<div class="catalog-copy">
      <span class="tag">${esc(item.categoryLabel || cat)}</span><h3>${esc(item.name || 'Unnamed item')}</h3>
      <p>${esc(item.description || '')}</p>${extras ? `<p class="catalog-details">${extras}</p>` : ''}
      <span class="catalog-id">ITEM ID: ${esc(item.classname || 'NOT PROVIDED')}</span></div></article>`;
  };

  node.innerHTML = [...groups.entries()].map(([category,entries],groupIndex) => {
    const label = entries[0].item.categoryLabel || category.replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    return `<section class="item-category-section">
      <div class="item-category-heading">
        <span class="item-category-index">${String(groupIndex+1).padStart(2,'0')}</span>
        <div><p class="eyebrow">EQUIPMENT CLASS / CATEGORY</p><h2>${esc(label)}</h2></div>
        <span class="item-category-count">${entries.length} ${entries.length===1?'ITEM':'ITEMS'}</span>
      </div>
      <div class="catalog-grid">${entries.map(itemCard).join('')}</div>
    </section>`;
  }).join('');
}
async function renderVehicles() {
  const node = document.getElementById('vehicles-list');
  if (!node) return;
  let vehicles;
  try { vehicles = await getData(node.dataset.json); } catch { loadError(node,node.dataset.json); return; }
  if (!Array.isArray(vehicles)) { loadError(node,node.dataset.json); return; }
  if (!vehicles.length) {
    node.innerHTML = '<p class="muted">No vehicles yet. Add entries to data/vehicles.json.</p>';
    return;
  }

  const groups = new Map();
  vehicles.forEach((vehicle, index) => {
    const mod = String(vehicle.mod || 'Unassigned').trim() || 'Unassigned';
    if (!groups.has(mod)) groups.set(mod, []);
    groups.get(mod).push({ vehicle, index });
  });

  const vehicleCard = ({ vehicle: v, index: i }) => {
    const img = safeImage(v.image);
    const media = img
      ? `<div class="vehicle-image"><img class="vehicle-photo" src="${esc(img)}" alt="${esc(v.name)}" loading="lazy"></div>`
      : `<div class="vehicle-image vehicle-${['one','two','three'][i%3]}"><span>IVY MOTORPOOL / ${String(i+1).padStart(3,'0')}</span><div class="vehicle-symbol">▰</div></div>`;
    return `<article class="vehicle-card">${media}<div class="vehicle-copy">
      <div class="entry-meta"><span class="tag">${esc(v.category || 'VEHICLE')}</span><span>CLASS: ${esc(v.classname || 'TBD')}</span></div>
      <h3>${esc(v.name || 'Unnamed vehicle')}</h3><p>${esc(v.description || '')}</p>
      <div class="spec-grid"><div><small>STORAGE</small><b>${esc(v.storage || 'NOT LISTED')}</b></div><div><small>FUEL</small><b>${esc(v.fuel || 'NOT LISTED')}</b></div><div><small>ACCESS</small><b>${esc(v.access || 'NOT LISTED')}</b></div></div>
      </div></article>`;
  };

  node.innerHTML = [...groups.entries()].map(([mod, entries], groupIndex) => `
    <section class="vehicle-mod-section">
      <div class="vehicle-mod-heading">
        <span class="vehicle-mod-index">${String(groupIndex + 1).padStart(2, '0')}</span>
        <div><p class="eyebrow">VEHICLE SOURCE / MOD</p><h2>${esc(mod)}</h2></div>
        <span class="vehicle-mod-count">${entries.length} ${entries.length === 1 ? 'VEHICLE' : 'VEHICLES'}</span>
      </div>
      <div class="vehicle-grid">${entries.map(vehicleCard).join('')}</div>
    </section>
  `).join('');
}
async function renderNews() {
  const node = document.getElementById('news-list');
  const home = document.getElementById('home-news');
  if (!node && !home) return;
  const path = (node || home).dataset.json;
  let posts;
  try { posts = await getData(path); } catch { if(node)loadError(node,path); if(home)loadError(home,path); return; }
  if (!Array.isArray(posts)) { if(node)loadError(node,path); if(home)loadError(home,path); return; }
  if (node) node.innerHTML = posts.map((p,i) => `<article class="news-entry">
    <div class="entry-meta"><span class="tag ${i ? 'tag-outline' : ''}">${esc(p.category || 'NEWS')}</span><span>${esc(p.date || '')}</span></div>
    <h2>${esc(p.title || 'Untitled announcement')}</h2>${p.subtitle ? `<p class="lead">${esc(p.subtitle)}</p>` : ''}
    <p>${esc(p.content || '')}</p><div class="entry-foot">POSTED BY ${esc(p.author || 'IVY STAFF')}<span>${String(i+1).padStart(2,'0')} / ${String(posts.length).padStart(2,'0')}</span></div>
    </article>`).join('') || '<p class="muted">No announcements yet. Add entries to data/news.json.</p>';
  if (home) home.innerHTML = posts.slice(0,3).map(p => `<a class="latest-news-card" href="news.html">
    <span class="tag">${esc(p.category || 'NEWS')}</span><small>${esc(p.date || '')}</small><h3>${esc(p.title || 'Untitled announcement')}</h3>
    <p>${esc(p.subtitle || p.content || '')}</p><span class="card-link">READ UPDATE ↗</span></a>`).join('');
}

async function renderNewsSidebar() {
  const node = document.getElementById('news-sidebar');
  if (!node) return;
  let data;
  try { data = await getData(node.dataset.json); } catch { loadError(node,node.dataset.json); return; }
  const links = Array.isArray(data.quickLinks) ? data.quickLinks : [];
  const note = data.adminNote || {};
  node.innerHTML = `<p class="eyebrow">${esc(data.quickLinksTitle || 'QUICK LINKS')}</p>
    ${links.map(link => `<a href="${esc(link.url || '#')}">${esc(link.label || 'Open link')} ↗</a>`).join('')}
    <div class="side-note"><strong>${esc(note.title || 'ADMIN NOTE')}</strong><p>${esc(note.content || '')}</p></div>`;
}

async function renderServer() {
  const node = document.getElementById('server-profile');
  if (!node) return;
  let data;
  try { data = await getData(node.dataset.json); } catch { loadError(node,node.dataset.json); return; }
  const p = data.profile || {};
  const h2 = node.querySelector('h2');
  const description = node.querySelector('.info-banner p:not(.eyebrow)');
  const status = node.querySelector('.status-placeholder');
  if(h2) h2.textContent = p.name || 'IVY PVE — BADLANDS';
  if(description) description.textContent = p.description || '';
  if(status) status.innerHTML = `<span class="status-dot"></span> SERVER STATUS: ${esc(p.status || 'NOT PROVIDED')}`;
  const discord = p.discordUrl ? `<a class="text-link" href="${esc(p.discordUrl)}" target="_blank" rel="noopener">${esc(p.discordLabel || 'JOIN DISCORD')} ↗</a>` : esc(p.discordLabel || 'ADD DISCORD INVITE');
  const fields = [['Server name',p.serverName],['IP address',p.ip],['Game port',p.port],['Map',p.map],['Platform',p.platform],['Discord',discord]];
  const dl = document.getElementById('connection-details');
  if(dl) dl.innerHTML = fields.map(([label,value]) => `<dt>${esc(label)}</dt><dd>${label==='Discord'?value:esc(value || 'NOT PROVIDED')}</dd>`).join('');
  const gameplay = document.getElementById('gameplay-list');
  if(gameplay) gameplay.innerHTML = (data.gameplay || []).map((x,i) => `<li><b>${String(i+1).padStart(2,'0')}</b><span><strong>${esc(x.title)}</strong><br>${esc(x.description)}</span></li>`).join('');
  const team = document.getElementById('team-list');
  if(team) {
    try {
      const members = await getData(team.dataset.json || 'data/team.json');
      team.innerHTML = (Array.isArray(members) ? members : []).map((member,i) => `
        <div class="team-member">
          <span class="team-number">${String(i+1).padStart(2,'0')}</span>
          <div><strong>${esc(member.role || 'TEAM MEMBER')}</strong><span>${esc(member.name || 'NAME NOT LISTED')}</span>
          ${member.description ? `<p>${esc(member.description)}</p>` : ''}</div>
        </div>`).join('') || '<p class="muted">Team information will be announced soon.</p>';
    } catch { loadError(team, team.dataset.json || 'data/team.json'); }
  }
  const rules = document.getElementById('rules-list');
  if(rules) rules.innerHTML = (data.rules || []).map((x,i) => `<div><b>${String(i+1).padStart(2,'0')}</b><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></div>`).join('');
}
renderItems(); renderVehicles(); renderNews(); renderNewsSidebar(); renderServer();
