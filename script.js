// Asynchronous fetch operations - async/await, loading, error handling, search, filter and pagination.
const API = 'https://rickandmortyapi.com/api/character';
const SAMPLE = [['Rick Sanchez','Alive','Human','Earth'],['Morty Smith','Alive','Human','Earth'],['Summer Smith','Alive','Human','Earth'],['Beth Smith','Alive','Human','Earth'],['Jerry Smith','Alive','Human','Earth'],['Birdperson','Dead','Bird-Person','Bird World']]
  .map(([name, status, species, o]) => ({ name, status, species, origin: { name: o }, image: '' }));
const $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let next = null, timer, token = 0;

const card = c => `<article class="card"><div class="pic" ${c.image ? 'hidden' : ''}>${esc(c.name[0])}</div>${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">` : ''}
  <div class="b"><span class="badge ${c.status.toLowerCase()}">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p>${esc(c.species)} · ${esc(c.origin.name)}</p></div></article>`;
const skeletons = n => Array.from({ length: n }, () => '<div class="sk"></div>').join('');

function banner(msg, kind, retry) {
  const b = $('banner'); b.hidden = !msg; b.className = 'banner ' + (kind || ''); b.innerHTML = msg ? `<span></span>${retry ? '<button type="button" id="retry">Try again</button>' : ''}` : '';
  if (msg) { b.firstChild.textContent = msg; if (retry) $('retry').onclick = () => load(true); }
}
async function getJSON(url) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 8000);
  try { const r = await fetch(url, { signal: ctl.signal }); if (r.status === 404) return { results: [], info: {} }; if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function load(reset) {
  const my = ++token; $('grid').setAttribute('aria-busy', 'true'); $('more').disabled = true;
  if (reset) { $('grid').innerHTML = skeletons(8); next = null; $('more').hidden = true; }
  const url = reset ? `${API}?name=${encodeURIComponent($('q').value.trim())}&status=${$('st').value}` : next;
  try {
    const d = await getJSON(url); if (my !== token) return; banner('');
    if (reset) $('grid').innerHTML = '';
    $('grid').insertAdjacentHTML('beforeend', d.results.map(card).join('') || (reset ? '<p class="empty">No characters match your search.</p>' : ''));
    next = d.info.next || null;
  } catch (e) {
    if (my !== token) return;
    if (reset) $('grid').innerHTML = SAMPLE.map(card).join('');
    banner(e.name === 'AbortError' ? 'The request timed out.' : 'Could not load live data. Showing sample cards. Check your internet connection.', 'err', true);
  } finally { if (my === token) { $('grid').setAttribute('aria-busy', 'false'); $('more').hidden = !next; $('more').disabled = false; } }
}
$('f').addEventListener('submit', e => e.preventDefault());
$('q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => load(true), 400); });   // debounce
$('st').addEventListener('change', () => load(true));
$('more').addEventListener('click', () => load(false));
load(true);
