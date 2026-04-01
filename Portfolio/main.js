/* ═══════════════════════════════════════════════════
   NAROTTAM SHARAN PORTFOLIO — main.js v4
   Full rewrite — Advanced Developer
═══════════════════════════════════════════════════ */
'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ── VIDEO DATA ── */
const VIDEO_URLS = [
  "https://www.youtube.com/embed/lz4s5zU7Bo0",
  "https://www.youtube.com/embed/j6ympOT2sXc",
  "https://www.youtube.com/embed/HHviymdkkBc",
  "https://youtube.com/embed/DGs_9L6PwrA",
  "https://youtube.com/shorts/PQsPjbexW0o",
  "https://www.youtube.com/shorts/_doFcCKT92A",
  "https://www.instagram.com/reel/DOlQhOBidrr/",
  "https://www.instagram.com/reel/DI6fvdkomzh/",
  "https://www.instagram.com/reel/DNnOoPXzQ9U/",
   "https://youtu.be/JUniWk39d2I",
  "https://www.instagram.com/reel/DOiMIqAjMMd/"
];

/* IDs that are actually shorts even if URL says /embed/ */
const KNOWN_SHORT_IDS = new Set(["DGs_9L6PwrA", "lXhpxEu82gY"]);

/* ── TESTIMONIAL DATA ── */
const TESTIMONIAL_DATA = [
  { initials:'GD', name:'GDG Bhilai', company:'Google Developers Group', rating:5, kpi:'30% retention boost', text:'Narottam transformed our event content into cinematic recaps that felt premium and retained attention from a technical audience.' },
  { initials:'SS', name:'Santosh Suna', company:'Content Creator', rating:5, kpi:'15+ videos delivered', text:'He was consistent, fast, and sharp with pacing. Every edit came back stronger than the last without requiring rounds of correction.' },
  { initials:'NL', name:'Nadavi Loans', company:'Financial Services Brand', rating:5, kpi:'100% on-time delivery', text:'Complex messaging became clear, modern, and conversion-focused. The videos looked polished and landed with the right audience.' },
  { initials:'TS', name:'Techstars Weekend', company:'Startup Event', rating:5, kpi:'Same-day highlight reel', text:'The turnaround under deadline pressure was exceptional. We had a finished recap while the event still had momentum online.' },
  { initials:'KP', name:'Kriti Priya', company:'Personal Brand', rating:5, kpi:'Stronger audience response', text:'The storytelling, rhythm, and polish immediately elevated my brand. Viewers noticed the difference after the first few uploads.' }
];

/* ── STATE ── */
const appState = {
  gallery: { all: [], reels: [], longform: [], activeFilter: 'all' },
  testimonial: { index: 1, realIndex: 0, cardWidth: 0, intervalId: null, resumeId: null, bound: false, inView: false, ready: false },
  cursorEl: { outer: null, inner: null, spot: null, label: null },
  cursor: { mx: 0, my: 0, ox: 0, oy: 0 }
};

/* ═══════════════════ BOOT ═══════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  initNav();
  initMobileMenu();
  initHeroCanvas();
  initHeroTilt();
  initHeroNameReveal();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initTiltCards();
  initGlassTiltHighlights();
  initMagneticButtons();
  initServiceSpotlight();
  initFeaturedVideo();
  initNetflixGallery();
  initNetflixFilter();
  initVideoModal();
  initTestimonials();
  initProgress();
  initForm();
  initSmoothScroll();
  initParallax();
});

/* ═══════════════════ THEME ═══════════════════ */
function initTheme() {
  const btn = $('#themeBtn');
  const html = document.documentElement;
  const saved = localStorage.getItem('ns-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ns-theme', next);
    if (window._canvasColorUpdate) window._canvasColorUpdate();
  });
}

/* ═══════════════════ CURSOR ═══════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const { cursor, cursorEl } = appState;
  cursorEl.outer = $('#cursor-outer');
  cursorEl.inner = $('#cursor-inner');
  cursorEl.spot = $('#cursor-spotlight');
  cursorEl.label = $('#cursor-label');

  document.addEventListener('mousemove', e => {
    cursor.mx = e.clientX; cursor.my = e.clientY;
    cursorEl.inner.style.cssText = `left:${cursor.mx}px;top:${cursor.my}px`;
    if (cursorEl.spot) cursorEl.spot.style.cssText = `left:${cursor.mx}px;top:${cursor.my}px`;
    if (cursorEl.label) cursorEl.label.style.cssText = `left:${cursor.mx}px;top:${cursor.my}px`;
  });

  (function raf() {
    cursor.ox = lerp(cursor.ox, cursor.mx, .1);
    cursor.oy = lerp(cursor.oy, cursor.my, .1);
    cursorEl.outer.style.cssText = `left:${cursor.ox}px;top:${cursor.oy}px`;
    requestAnimationFrame(raf);
  })();

  const hoverSel = 'a,button,.exp-card,.testimonial-card,.tool-tile,.nf-card,.srv-tile,.pill,.filt,.ci,.video-modal-close,.testimonial-btn,.nf-btn';
  $$(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  });
  $$('input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-text'));
  });
}

/* ═══════════════════ NAV ═══════════════════ */
function initNav() {
  const nav = $('#nav');
  const sections = $$('section[id]');
  const links = $$('.nav-links a');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('stuck', scrollY > 60);
    const pos = scrollY + 130;
    sections.forEach(s => {
      const lnk = links.find(l => l.getAttribute('href') === '#' + s.id);
      if (lnk) lnk.classList.toggle('active', pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight);
    });
  }, { passive: true });
}

/* ═══════════════════ MOBILE MENU ═══════════════════ */
function initMobileMenu() {
  const ham = $('#hamburger');
  const menu = $('#mobMenu');
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  $$('#mobMenu a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open'); menu.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

/* ═══════════════════ WEBGL HERO CANVAS ═══════════════════ */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  const hero = $('#hero');
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    canvas.width = w; canvas.height = h;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    gl.viewport(0, 0, w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const N = 200;
  const pos = new Float32Array(N * 2);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 2] = Math.random() * 2 - 1; pos[i * 2 + 1] = Math.random() * 2 - 1;
    vel.push({ vx: (Math.random() - .5) * .0018, vy: (Math.random() - .5) * .0018 });
  }

  const vsSrc = `attribute vec2 a_pos;uniform float u_size;void main(){gl_Position=vec4(a_pos,0.,1.);gl_PointSize=u_size;}`;
  const fsSrc = `precision mediump float;uniform vec4 u_col;void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>.5)discard;gl_FragColor=vec4(u_col.rgb,u_col.a*(1.-d*2.));}`;
  const mkS = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
  const prog = gl.createProgram();
  gl.attachShader(prog, mkS(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, mkS(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  const uSz = gl.getUniformLocation(prog, 'u_size');
  const uCol = gl.getUniformLocation(prog, 'u_col');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let mx = 0, my = 0;
  hero.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width * 2 - 1;
    my = -((e.clientY - r.top) / r.height * 2 - 1);
  });

  const getColor = () => {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    return light ? [154 / 255, 111 / 255, 48 / 255] : [200 / 255, 169 / 255, 110 / 255];
  };

  window._canvasColorUpdate = () => {};

  const draw = () => {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    const [cr, cg, cb] = getColor();
    for (let i = 0; i < N; i++) {
      const v = vel[i];
      const dx = mx - pos[i * 2], dy = my - pos[i * 2 + 1];
      if (Math.sqrt(dx * dx + dy * dy) < .4) { v.vx += dx * .00008; v.vy += dy * .00008; }
      v.vx *= .998; v.vy *= .998;
      pos[i * 2] += v.vx; pos[i * 2 + 1] += v.vy;
      if (pos[i * 2] > 1.1) pos[i * 2] = -1.1; if (pos[i * 2] < -1.1) pos[i * 2] = 1.1;
      if (pos[i * 2 + 1] > 1.1) pos[i * 2 + 1] = -1.1; if (pos[i * 2 + 1] < -1.1) pos[i * 2 + 1] = 1.1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(uSz, 2.8);
    gl.uniform4f(uCol, cr, cg, cb, .8);
    gl.drawArrays(gl.POINTS, 0, N);
    const lines = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const dx = pos[i * 2] - pos[j * 2], dy = pos[i * 2 + 1] - pos[j * 2 + 1];
      if (Math.sqrt(dx * dx + dy * dy) < .2) lines.push(pos[i * 2], pos[i * 2 + 1], pos[j * 2], pos[j * 2 + 1]);
    }
    if (lines.length) {
      const lb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, lb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(uCol, cr, cg, cb, .22);
      gl.drawArrays(gl.LINES, 0, lines.length / 2);
    }
    requestAnimationFrame(draw);
  };
  draw();
}

/* ═══════════════════ HERO TILT ═══════════════════ */
function initHeroTilt() {
  const card = $('#heroCard');
  if (!card) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -12;
    const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 12;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    setTimeout(() => card.style.transition = '', 600);
  });
}

/* ═══════════════════ HERO NAME REVEAL ═══════════════════ */
function initHeroNameReveal() {
  const el = $('#heroNameTop');
  if (!el) return;
  const text = el.textContent;
  el.innerHTML = '';
  [...text].forEach((letter, i) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.cssText = `opacity:0;transform:translateY(30px);display:inline-block;transition:all .6s cubic-bezier(.16,1,.3,1) ${i * .06}s`;
    el.appendChild(span);
    setTimeout(() => { span.style.opacity = '1'; span.style.transform = 'translateY(0)'; }, 200);
  });
}

/* ═══════════════════ SCROLL REVEAL ═══════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -60px 0px' });
  $$('.sr,.sr-l,.sr-r,.sr-s').forEach(el => obs.observe(el));
}

/* ═══════════════════ COUNTERS ═══════════════════ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, tgt = +el.dataset.count, suf = el.dataset.suf || '';
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1700, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * tgt) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => obs.observe(el));
}

/* ═══════════════════ SKILL BARS ═══════════════════ */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lit'); obs.unobserve(e.target); } });
  }, { threshold: .3 });
  $$('.bar-item').forEach(b => obs.observe(b));
}

/* ═══════════════════ TILT TILES ═══════════════════ */
function initTiltCards() {
  $$('[data-tilt]').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      tile.style.transform = `perspective(600px) rotateX(${((e.clientY - r.top - r.height / 2) / r.height) * -8}deg) rotateY(${((e.clientX - r.left - r.width / 2) / r.width) * 8}deg)`;
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      tile.style.transform = '';
      setTimeout(() => tile.style.transition = '', 500);
    });
  });
}

/* ═══════════════════ GLASS TILT HIGHLIGHTS ═══════════════════ */
function initGlassTiltHighlights() {
  $$('.srv-tile,.testimonial-card,.ci,.exp-card,.nf-card').forEach(card => {
    if (!card.querySelector('.glass-highlight')) {
      const glow = document.createElement('span');
      glow.className = 'glass-highlight';
      card.appendChild(glow);
    }
    card.classList.add('glass-tilt');
    if (card.dataset.glassBound === 'true') return;
    card.addEventListener('mousemove', e => {
      if (window.matchMedia('(pointer:coarse)').matches) return;
      const r = card.getBoundingClientRect();
      const glow = card.querySelector('.glass-highlight');
      if (glow) { glow.style.left = `${e.clientX - r.left}px`; glow.style.top = `${e.clientY - r.top}px`; }
    });
    card.dataset.glassBound = 'true';
  });
}

/* ═══════════════════ MAGNETIC BUTTONS ═══════════════════ */
function initMagneticButtons() {
  $$('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px,${(e.clientY - r.top - r.height / 2) * .2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      btn.style.transform = '';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
}

/* ═══════════════════ SERVICE SPOTLIGHT ═══════════════════ */
function initServiceSpotlight() {
  $$('.srv-tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      tile.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
}

/* ═══════════════════ FEATURED VIDEO ═══════════════════ */
function initFeaturedVideo() {
  const root = $('#featuredVideo');
  const trigger = $('#featuredVideoTrigger');
  const frame = $('#featuredVideoFrame');
  const title = $('#featuredVideoTitle');
  const meta = $('#featuredVideoMeta');
  if (!root || !trigger || !frame) return;

  const videoId = root.dataset.videoId;
  const videoUrl = root.dataset.videoUrl;

  trigger.addEventListener('click', () => {
    if (!frame.childElementCount) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
    }
    frame.classList.add('is-active');
    trigger.style.display = 'none';
  });

  fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (title) title.textContent = data.title || 'Featured Video';
      if (meta) meta.textContent = data.author_name ? `${data.author_name} / Featured Project` : 'Featured Project';
    })
    .catch(() => {
      if (title) title.textContent = 'Featured Video';
      if (meta) meta.textContent = 'Narottam Sharan / Featured Project';
    });
}

/* ═══════════════════ VIDEO DETECTION ═══════════════════ */
function detectVideo(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const path = url.pathname.replace(/\/+$/, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (path === '/watch') {
      const id = url.searchParams.get('v');
      return id ? buildVideoMeta(rawUrl, 'youtube', 'long', id) : null;
    }
    if (path.startsWith('/shorts/')) {
      const id = path.split('/').filter(Boolean)[1];
      return id ? buildVideoMeta(rawUrl, 'youtube', 'reel', id) : null;
    }
    if (path.startsWith('/embed/')) {
      const id = path.split('/').filter(Boolean)[1];
      if (!id) return null;
      return buildVideoMeta(rawUrl, 'youtube', KNOWN_SHORT_IDS.has(id) ? 'reel' : 'long', id);
    }
  }
  if (host === 'youtu.be') {
    const id = path.split('/').filter(Boolean)[0];
    return id ? buildVideoMeta(rawUrl, 'youtube', 'long', id) : null;
  }
  if (host === 'instagram.com' || host === 'instagr.am') {
    const parts = path.split('/').filter(Boolean);
    if ((parts[0] === 'reel' || parts[0] === 'reels') && parts[1]) {
      return buildVideoMeta(rawUrl, 'instagram', 'reel', parts[1]);
    }
  }
  return null;
}

function buildVideoMeta(rawUrl, provider, kind, id) {
  return {
    id, rawUrl, provider, kind,
    layout: kind === 'reel' ? 'vertical' : 'horizontal',
    embedUrl: provider === 'instagram' ? `https://www.instagram.com/reel/${id}/embed` : `https://www.youtube.com/embed/${id}`,
    thumbUrl: provider === 'youtube' ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '',
    caption: provider === 'instagram' ? 'Instagram Reel' : kind === 'reel' ? 'YouTube Short' : 'YouTube Video',
    title: provider === 'instagram' ? `Reel ${id.slice(0, 5)}` : kind === 'reel' ? `Short ${id.slice(0, 5)}` : `Film ${id.slice(0, 5)}`
  };
}

/* ═══════════════════ NETFLIX GALLERY ═══════════════════ */
function initNetflixGallery() {
  const all = VIDEO_URLS.map(detectVideo).filter(Boolean);
  appState.gallery.all = all;
  appState.gallery.reels = all.filter(v => v.kind === 'reel');
  appState.gallery.longform = all.filter(v => v.kind === 'long');

  renderNetflixRow('reels', $('#reelsTrack'), $('#reelsCount'));
  renderNetflixRow('longform', $('#longformTrack'), $('#longformCount'));

  initNetflixScroll('reels', $('#reelsTrack'), $('#reelsPrev'), $('#reelsNext'));
  initNetflixScroll('longform', $('#longformTrack'), $('#longformPrev'), $('#longformNext'));

  initGlassTiltHighlights();
}

function renderNetflixRow(key, track, countEl) {
  if (!track) return;
  track.innerHTML = '';
  const videos = appState.gallery[key] || [];
  if (countEl) countEl.textContent = videos.length ? `${videos.length} videos` : '';
  videos.forEach((video, idx) => {
    const card = createNetflixCard(video, idx);
    track.appendChild(card);
  });
}

function createNetflixCard(video, idx) {
  const card = document.createElement('article');
  card.className = `nf-card ${video.layout === 'vertical' ? 'nf-vertical' : 'nf-horizontal'}`;
  card.dataset.videoId = video.id;

  // Top bar accent
  const topbar = document.createElement('div');
  topbar.className = 'nf-topbar';
  card.appendChild(topbar);

  // Thumbnail / background
  if (video.provider === 'youtube') {
    const img = document.createElement('img');
    img.className = 'nf-thumb';
    img.src = video.thumbUrl;
    img.alt = video.title;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    }, { once: true });
    card.appendChild(img);
  } else {
    const bg = document.createElement('div');
    bg.className = 'nf-instagram-bg';
    const label = document.createElement('div');
    label.className = 'nf-instagram-label';
    label.textContent = 'Instagram';
    const word = document.createElement('div');
    word.className = 'nf-instagram-word';
    word.textContent = 'Reel';
    bg.appendChild(label); bg.appendChild(word);
    card.appendChild(bg);
  }

  // Overlay gradient
  const overlay = document.createElement('div');
  overlay.className = 'nf-overlay';
  card.appendChild(overlay);

  // Play icon
  const play = document.createElement('div');
  play.className = 'nf-play';
  play.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  card.appendChild(play);

  // Info panel (shown on hover)
  const info = document.createElement('div');
  info.className = 'nf-info';
  const tag = document.createElement('div');
  tag.className = 'nf-tag';
  tag.textContent = video.caption;
  const title = document.createElement('div');
  title.className = 'nf-title';
  title.textContent = video.title;
  info.appendChild(tag); info.appendChild(title);
  card.appendChild(info);

  // Click to open modal
  card.addEventListener('click', () => openVideoModal(video));

  // Cursor label
  card.addEventListener('mouseenter', () => {
    document.body.classList.add('cur-link');
    const label = $('#cursor-label');
    if (label) { label.textContent = '▶ Play'; label.classList.add('show'); }
  });
  card.addEventListener('mouseleave', () => {
    document.body.classList.remove('cur-link');
    const label = $('#cursor-label');
    if (label) label.classList.remove('show');
  });

  return card;
}

function initNetflixScroll(key, track, prevBtn, nextBtn) {
  if (!track || !prevBtn || !nextBtn) return;
  const scrollBy = () => track.clientWidth * 0.75;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
}

/* ═══════════════════ NETFLIX FILTER ═══════════════════ */
function initNetflixFilter() {
  const btns = $$('.filt');
  const reelsRow = $('#reelsRow');
  const longformRow = $('#longformRow');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.f;
      appState.gallery.activeFilter = f;

      if (f === 'all') {
        reelsRow?.classList.remove('hidden');
        longformRow?.classList.remove('hidden');
      } else if (f === 'reels') {
        reelsRow?.classList.remove('hidden');
        longformRow?.classList.add('hidden');
      } else if (f === 'longform') {
        reelsRow?.classList.add('hidden');
        longformRow?.classList.remove('hidden');
      }
    });
  });
}

/* ═══════════════════ VIDEO MODAL ═══════════════════ */
function initVideoModal() {
  const modal = $('#videoModal');
  if (!modal || modal.dataset.ready === 'true') return;
  const closeBtn = $('#videoModalClose');
  const backdrop = $('#videoModalBackdrop');
  const close = () => closeVideoModal();
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  modal.dataset.ready = 'true';
}

function openVideoModal(video) {
  const modal = $('#videoModal');
  const frame = $('#videoModalFrame');
  if (!modal || !frame) return;
  frame.className = `video-modal-frame${video.layout === 'vertical' ? ' is-vertical' : ''}`;
  frame.innerHTML = '';
  const iframe = document.createElement('iframe');
  let src = video.provider === 'instagram' ? video.embedUrl : `${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`;
  iframe.src = src;
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  frame.appendChild(iframe);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  const modal = $('#videoModal');
  const frame = $('#videoModalFrame');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (frame) frame.innerHTML = '';
  document.body.style.overflow = '';
}

/* ═══════════════════ TESTIMONIALS ═══════════════════ */
function initTestimonials() {
  const track = $('#testimonialTrack');
  const dotsEl = $('#testimonialDots');
  if (!track) return;

  track.innerHTML = '';
  if (dotsEl) dotsEl.innerHTML = '';

  const looped = [
    TESTIMONIAL_DATA[TESTIMONIAL_DATA.length - 1],
    ...TESTIMONIAL_DATA,
    TESTIMONIAL_DATA[0]
  ];

  looped.forEach((item, idx) => {
    const card = buildTestimonialCard(item);
    card.dataset.clone = (idx === 0 || idx === looped.length - 1) ? 'true' : 'false';
    track.appendChild(card);
  });

  TESTIMONIAL_DATA.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
    dot.addEventListener('click', () => goToTestimonial(idx + 1, true));
    dotsEl?.appendChild(dot);
  });

  bindTestimonialLoop(track);
  bindTestimonialControls();
  updateTestimonialPosition(true);
  updateTestimonialStates();
  initGlassTiltHighlights();

  const carousel = track.parentElement;
  if (carousel && !carousel.dataset.bound) {
    carousel.addEventListener('mouseenter', () => {
      clearInterval(appState.testimonial.intervalId);
      clearTimeout(appState.testimonial.resumeId);
    });
    carousel.addEventListener('mouseleave', () => pauseAndResumeTestimonials(2200));
    carousel.dataset.bound = 'true';
  }

  if (!appState.testimonial.ready) {
    window.addEventListener('resize', () => { updateTestimonialPosition(true); updateTestimonialStates(); });
    initTestimonialObserver();
    appState.testimonial.ready = true;
  }
}

function buildTestimonialCard(item) {
  const card = document.createElement('article');
  card.className = 'testimonial-card';
  card.innerHTML = `
    <div class="testimonial-top">
      <div class="testimonial-avatar">${item.initials}</div>
      <div class="testimonial-meta">
        <div class="testimonial-name">${item.name}</div>
        <div class="testimonial-company">${item.company}</div>
      </div>
    </div>
    <div class="testimonial-stars">${'★'.repeat(item.rating)}</div>
    <p class="testimonial-text">${item.text}</p>
    <div class="testimonial-kpi">${item.kpi}</div>
  `;
  card.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
  card.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  return card;
}

function bindTestimonialControls() {
  if (appState.testimonial.bound) return;
  $('#testimonialPrev')?.addEventListener('click', () => stepTestimonial(-1, true));
  $('#testimonialNext')?.addEventListener('click', () => stepTestimonial(1, true));
  appState.testimonial.bound = true;
}

function bindTestimonialLoop(track) {
  if (track.dataset.loopBound === 'true') return;
  track.addEventListener('transitionend', () => {
    const { index } = appState.testimonial;
    if (index === 0) { appState.testimonial.index = TESTIMONIAL_DATA.length; updateTestimonialPosition(true); updateTestimonialStates(); }
    else if (index === TESTIMONIAL_DATA.length + 1) { appState.testimonial.index = 1; updateTestimonialPosition(true); updateTestimonialStates(); }
  });
  track.dataset.loopBound = 'true';
}

function stepTestimonial(dir, fromUser = false) {
  appState.testimonial.index += dir;
  updateTestimonialPosition();
  updateTestimonialStates();
  if (fromUser) pauseAndResumeTestimonials();
}

function goToTestimonial(slideIndex, fromUser = false) {
  appState.testimonial.index = slideIndex;
  updateTestimonialPosition();
  updateTestimonialStates();
  if (fromUser) pauseAndResumeTestimonials();
}

function updateTestimonialPosition(skipTransition = false) {
  const track = $('#testimonialTrack');
  if (!track || !track.children.length) return;
  const first = track.children[0];
  const gap = 22;
  appState.testimonial.cardWidth = first.getBoundingClientRect().width + gap;
  if (skipTransition) track.style.transition = 'none';
  const viewport = track.parentElement?.getBoundingClientRect().width || 0;
  const offset = Math.max(0, (viewport - first.getBoundingClientRect().width) / 2);
  track.style.transform = `translateX(calc(${-appState.testimonial.index * appState.testimonial.cardWidth}px + ${offset}px))`;
  if (skipTransition) requestAnimationFrame(() => { track.style.transition = ''; });
}

function updateTestimonialStates() {
  const track = $('#testimonialTrack');
  const dots = $$('.testimonial-dot');
  if (!track) return;
  const cards = [...track.children];
  const total = TESTIMONIAL_DATA.length;
  let ri = appState.testimonial.index - 1;
  if (ri < 0) ri = total - 1;
  if (ri >= total) ri = 0;
  appState.testimonial.realIndex = ri;
  cards.forEach((card, idx) => {
    card.classList.remove('is-active', 'is-near');
    if (idx === appState.testimonial.index) card.classList.add('is-active');
    if (idx === appState.testimonial.index - 1 || idx === appState.testimonial.index + 1) card.classList.add('is-near');
  });
  dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === appState.testimonial.realIndex));
}

function restartTestimonialAutoSlide() {
  clearInterval(appState.testimonial.intervalId);
  if (!appState.testimonial.inView) return;
  appState.testimonial.intervalId = setInterval(() => stepTestimonial(1), 4200);
}

function pauseAndResumeTestimonials(delay = 6500) {
  clearInterval(appState.testimonial.intervalId);
  clearTimeout(appState.testimonial.resumeId);
  appState.testimonial.resumeId = setTimeout(() => restartTestimonialAutoSlide(), delay);
}

function initTestimonialObserver() {
  const section = $('#clients');
  if (!section) return;
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        section.classList.add('testimonials-in');
        appState.testimonial.inView = true;
        restartTestimonialAutoSlide();
      } else {
        appState.testimonial.inView = false;
        clearInterval(appState.testimonial.intervalId);
      }
    });
  }, { threshold: .25 }).observe(section);
}

/* ═══════════════════ PARALLAX ═══════════════════ */
function initParallax() {
  const canvas = $('#hero-canvas');
  window.addEventListener('scroll', () => {
    if (canvas) canvas.style.transform = `translateY(${scrollY * .12}px)`;
  }, { passive: true });
}

/* ═══════════════════ PROGRESS ═══════════════════ */
function initProgress() {
  const bar = $('#progress');
  window.addEventListener('scroll', () => {
    bar.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  }, { passive: true });
}

/* ═══════════════════ SMOOTH SCROLL ═══════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ═══════════════════ FORM ═══════════════════ */
function initForm() {
  const btn = $('#submitBtn');
  const success = $('#formSuccess');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name = $('#fn').value.trim();
    const email = $('#fe').value.trim();
    if (!name) { flashField('#fn'); return; }
    if (!email) { flashField('#fe'); return; }
    const text = $('.c-submit-text', btn);
    const arrow = $('.c-submit-arrow', btn);
    if (text) text.textContent = 'Sending…';
    if (arrow) arrow.textContent = '…';
    btn.disabled = true;
    if (success) success.classList.remove('show');
    setTimeout(() => {
      if (text) text.textContent = 'Sent!';
      if (arrow) arrow.textContent = '✓';
      if (success) success.classList.add('show');
      setTimeout(() => {
        if (text) text.textContent = 'Send Message';
        if (arrow) arrow.innerHTML = '&rarr;';
        btn.disabled = false;
        $$('.c-form input,.c-form textarea').forEach(el => el.value = '');
        if (success) success.classList.remove('show');
      }, 3000);
    }, 1500);
  });
  function flashField(sel) {
    const el = $(sel); if (!el) return;
    el.style.borderColor = '#e05555'; el.focus();
    setTimeout(() => el.style.borderColor = '', 2000);
  }
}
