import { site, resources, news } from './src/content.js';
import { mountLab } from './src/lab.js';

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'long', timeZone: 'America/Santiago',
});
const monthFormatter = new Intl.DateTimeFormat('es-CL', {
  month: 'long', year: 'numeric', timeZone: 'America/Santiago',
});
const asDate = (value) => new Date(`${value.length === 7 ? `${value}-01` : value}T12:00:00Z`);
const formatDate = (value) => {
  if (value.length === 7) {
    const label = monthFormatter.format(asDate(value));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  return dateFormatter.format(asDate(value));
};

document.querySelectorAll('[data-cycle]').forEach((element) => { element.textContent = site.cycle; });
document.querySelectorAll('[data-email]').forEach((element) => {
  const subject = element.getAttribute('href').split('?')[1];
  element.href = `mailto:${site.email}${subject ? `?${subject}` : ''}`;
  if (element.firstChild?.textContent.includes('@')) element.firstChild.textContent = `${site.email} `;
});
document.querySelectorAll('[data-updated]').forEach((element) => {
  element.dateTime = site.updated;
  element.textContent = formatDate(site.updated);
});

const milestones = document.querySelector('#milestones');
milestones?.replaceChildren(...site.milestones.map((milestone, index) => {
  const row = document.createElement('li');
  const number = document.createElement('span');
  number.className = 'milestone-number';
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('span');
  title.className = 'milestone-title';
  title.textContent = milestone.title;
  const date = document.createElement(milestone.date && !milestone.endDate ? 'time' : 'span');
  date.className = 'milestone-date';
  if (milestone.date && !milestone.endDate) date.dateTime = milestone.date;
  date.textContent = milestone.endDate
    ? dateFormatter.formatRange(asDate(milestone.date), asDate(milestone.endDate))
    : milestone.date ? formatDate(milestone.date) : 'Por anunciar';
  row.append(number, title, date);
  if (milestone.location) {
    const location = document.createElement('span');
    location.className = 'milestone-location';
    location.textContent = `Lugar: ${milestone.location}`;
    row.append(location);
  }
  return row;
}));

// Una única navegación móvil; sin JavaScript, los enlaces siguen siendo visibles.
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
function closeMenu() {
  header.classList.remove('menu-is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.hidden = false;
header.classList.add('has-mobile-menu');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-is-open', open);
});
navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

// Pestañas con flechas, Inicio y Fin; el contenido completo queda disponible sin JS.
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  tabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
}
const tabsNavigation = document.querySelector('[data-tabs-nav]');
if (tabsNavigation) tabsNavigation.hidden = false;
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(tabs[next], true); }
  });
});
if (tabs.length) activateTab(tabs[0]);
document.querySelectorAll('[data-open-tab]').forEach((link) => {
  link.addEventListener('click', () => activateTab(document.getElementById(`tab-${link.dataset.openTab}`)));
});

const icons = {
  compass: '<circle cx="20" cy="20" r="14"/><path d="m26 14-4 8-8 4 4-8Z"/>',
  nodes: '<circle cx="8" cy="20" r="3"/><circle cx="21" cy="8" r="3"/><circle cx="21" cy="32" r="3"/><circle cx="33" cy="20" r="3"/><path d="m11 18 7-8m-7 12 7 8m6-20 6 8m-6 12 6-8"/>',
  map: '<path d="m5 10 10-4 10 4 10-4v24l-10 4-10-4-10 4Zm10-4v24m10-20v24"/>',
  code: '<path d="m14 11-9 9 9 9m12-18 9 9-9 9m-4-25-4 32"/>',
};
const resourceGrid = document.querySelector('#resource-grid');
if (resourceGrid) resources.forEach((resource) => {
  const article = document.createElement('article');
  article.className = 'resource-card';
  article.dataset.category = resource.category;
  const link = document.createElement('a');
  link.href = resource.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const top = document.createElement('div');
  top.className = 'resource-top';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'tiny-label';
  eyebrow.textContent = resource.eyebrow;
  const icon = document.createElement('span');
  icon.className = 'resource-icon';
  icon.innerHTML = `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[resource.icon]}</svg>`;
  top.append(eyebrow, icon);
  const title = document.createElement('h3');
  title.textContent = resource.title;
  const description = document.createElement('p');
  description.textContent = resource.description;
  const source = document.createElement('span');
  source.className = 'resource-source';
  source.textContent = resource.source;
  const action = document.createElement('span');
  action.className = 'resource-action';
  action.textContent = resource.label;
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  const hint = document.createElement('span');
  hint.className = 'sr-only';
  hint.textContent = ' (abre una pestaña nueva)';
  action.append(arrow, hint);
  link.append(top, title, description, source, action);
  article.append(link);
  resourceGrid.append(article);
});
const resourceToolbar = document.querySelector('.resource-toolbar');
if (resourceToolbar) resourceToolbar.hidden = false;
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
    let count = 0;
    document.querySelectorAll('.resource-card').forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector('#resource-count').textContent = `${count} ${count === 1 ? 'recurso' : 'recursos'}`;
  });
});

// Los anuncios nuevos se agregan en src/content.js y tienen una página permanente.
document.querySelectorAll('[data-news-list]').forEach((list) => {
  const limit = Number(list.dataset.newsLimit) || news.length;
  const entries = [...news].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, limit);
  list.replaceChildren(...entries.map((item) => {
    const article = document.createElement('article');
    article.className = 'news-item';
    const photo = document.createElement('img');
    photo.className = 'news-image';
    photo.src = item.image || './assets/ocia-logo.svg';
    photo.alt = item.imageAlt ?? 'Logo de la OCIA';
    photo.width = 400;
    photo.height = 400;
    photo.loading = 'lazy';
    if (!item.image || item.imageFit === 'contain') photo.classList.add('news-image-contain');
    const body = document.createElement('div');
    body.className = 'news-copy';
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.title;
    heading.append(link);
    body.append(heading);
    if (item.date) {
      const date = document.createElement('time');
      date.className = 'news-date';
      date.dateTime = item.date;
      date.textContent = formatDate(item.date);
      body.append(date);
    }
    const summary = document.createElement('p');
    summary.textContent = item.summary;
    const action = document.createElement('a');
    action.className = 'text-link';
    action.href = item.url;
    action.textContent = 'Leer noticia';
    action.setAttribute('aria-label', `Leer noticia: ${item.title}`);
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    action.append(arrow);
    body.append(summary, action);
    article.append(photo, body);
    return article;
  }));
});

if (document.querySelector('#lab-graph')) mountLab();
