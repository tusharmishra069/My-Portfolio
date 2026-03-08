/* ═══════════════════════════════════════════════════
   NAROTTAM SHARAN PORTFOLIO — main.js v3
═══════════════════════════════════════════════════ */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

/* ── BOOT (no loader — instant) ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFeaturedVideo();
  initAutoVideoGallery();
  initCursor();
  initNav();
  initMobileMenu();
  initHeroCanvas();
  initHeroTilt();
  initTextReveal();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initTiltCards();
  initGlassTiltHighlights();
  initMagneticButtons();
  initServiceSpotlight();
  initTestimonials();
  initWorkCursorLabel();
  initWorkFilter();
  initParallax();
  initProgress();
  initForm();
  initPhotoUpload();
  initSmoothScroll();
});

function initFeaturedVideo() {
  const root = $('#featuredVideo');
  const trigger = $('#featuredVideoTrigger');
  const frame = $('#featuredVideoFrame');
  const title = $('#featuredVideoTitle');
  const meta = $('#featuredVideoMeta');
  const desc = $('#featuredVideoDesc');
  if (!root || !trigger || !frame) return;

  const videoId = root.dataset.videoId;
  const videoUrl = root.dataset.videoUrl;
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  trigger.addEventListener('click', () => {
    if (!frame.childElementCount) {
      const iframe = document.createElement('iframe');
      iframe.src = `${embedUrl}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = 'Narottam Sharan Featured Work';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
    }
    frame.classList.add('is-active');
    trigger.style.display = 'none';
  });

  fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`)
    .then((res) => res.ok ? res.json() : Promise.reject(new Error('oembed-failed')))
    .then((data) => {
      if (title) title.textContent = data.title || 'Featured Video';
      if (meta) meta.textContent = data.author_name ? `${data.author_name} / Featured Project` : 'Featured Project';
      if (desc) desc.textContent = 'A cinematic featured edit showcasing pacing, polish, and narrative-driven motion design.';
    })
    .catch(() => {
      if (title) title.textContent = 'Featured Video';
      if (meta) meta.textContent = 'Narottam Sharan / Featured Project';
      if (desc) desc.textContent = 'A cinematic featured edit showcasing pacing, polish, and narrative-driven motion design.';
    });
}

/* ── THEME ── */
function initTheme() {
  const btn  = $('#themeBtn');
  const html = document.documentElement;
  const saved = localStorage.getItem('ns-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ns-theme', next);
    // Rebuild canvas colors immediately
    if (window._canvasColorUpdate) window._canvasColorUpdate();
  });
}

/* ── CURSOR ── */
function initCursor() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const outer = $('#cursor-outer');
  const inner = $('#cursor-inner');
  const spot = $('#cursor-spotlight');
  let mx=0,my=0,ox=0,oy=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    inner.style.left=mx+'px'; inner.style.top=my+'px';
    if (spot) {
      spot.style.left = mx + 'px';
      spot.style.top = my + 'px';
    }
  });
  (function raf(){
    ox=lerp(ox,mx,.1); oy=lerp(oy,my,.1);
    outer.style.left=ox+'px'; outer.style.top=oy+'px';
    requestAnimationFrame(raf);
  })();
  const hoverEls = 'a,button,.exp-card,.review-card,.testimonial-card,.tool-tile,.reel-item,.long-item,.work-video-card,.srv-tile,.pill,.filt,.ci,.video-modal-close,.testimonial-btn';
  $$(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  });
  $$('input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-text'));
  });
}

/* ── NAV ── */
function initNav() {
  const nav = $('#nav');
  const sections = $$('section[id]');
  const links = $$('.nav-links a');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('stuck', scrollY > 60);
    const pos = scrollY + 130;
    sections.forEach(s => {
      const lnk = links.find(l => l.getAttribute('href') === '#' + s.id);
      if (!lnk) return;
      lnk.classList.toggle('active', pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight);
    });
  }, { passive: true });
}

/* ── MOBILE MENU ── */
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

/* ── WEBGL HERO CANVAS ── */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  const hero   = $('#hero');
  const gl     = canvas.getContext('webgl');
  if (!gl) return;

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    canvas.width=w; canvas.height=h;
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    gl.viewport(0,0,w,h);
  }
  resize();
  window.addEventListener('resize', resize);

  const N = 200;
  const pos = new Float32Array(N*2);
  const vel = [];
  for (let i=0;i<N;i++) {
    pos[i*2]=Math.random()*2-1; pos[i*2+1]=Math.random()*2-1;
    vel.push({vx:(Math.random()-.5)*.0018,vy:(Math.random()-.5)*.0018});
  }

  const vsSrc=`attribute vec2 a_pos;uniform float u_size;void main(){gl_Position=vec4(a_pos,0.,1.);gl_PointSize=u_size;}`;
  const fsSrc=`precision mediump float;uniform vec4 u_col;void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>.5)discard;gl_FragColor=vec4(u_col.rgb,u_col.a*(1.-d*2.));}`;
  function mkS(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
  const prog=gl.createProgram();
  gl.attachShader(prog,mkS(gl.VERTEX_SHADER,vsSrc));
  gl.attachShader(prog,mkS(gl.FRAGMENT_SHADER,fsSrc));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf=gl.createBuffer();
  const aPos=gl.getAttribLocation(prog,'a_pos');
  const uSz=gl.getUniformLocation(prog,'u_size');
  const uCol=gl.getUniformLocation(prog,'u_col');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  let mx=0,my=0;
  hero.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    mx=(e.clientX-r.left)/r.width*2-1;
    my=-((e.clientY-r.top)/r.height*2-1);
  });

  // Color helper — reads current theme
  function getColor() {
    const light = document.documentElement.getAttribute('data-theme')==='light';
    return light
      ? [154/255, 111/255, 48/255]   // darker gold for light bg — fully visible
      : [200/255, 169/255, 110/255]; // warm gold for dark bg
  }

  function draw() {
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    const [cr,cg,cb] = getColor();
    for (let i=0;i<N;i++) {
      const v=vel[i];
      const dx=mx-pos[i*2],dy=my-pos[i*2+1];
      if(Math.sqrt(dx*dx+dy*dy)<.4){v.vx+=dx*.00008;v.vy+=dy*.00008;}
      v.vx*=.998; v.vy*=.998;
      pos[i*2]+=v.vx; pos[i*2+1]+=v.vy;
      if(pos[i*2]>1.1)pos[i*2]=-1.1; if(pos[i*2]<-1.1)pos[i*2]=1.1;
      if(pos[i*2+1]>1.1)pos[i*2+1]=-1.1; if(pos[i*2+1]<-1.1)pos[i*2+1]=1.1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,pos,gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
    gl.uniform1f(uSz,2.8);
    gl.uniform4f(uCol,cr,cg,cb,.8);
    gl.drawArrays(gl.POINTS,0,N);

    const lines=[];
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
      const dx=pos[i*2]-pos[j*2],dy=pos[i*2+1]-pos[j*2+1];
      if(Math.sqrt(dx*dx+dy*dy)<.2)lines.push(pos[i*2],pos[i*2+1],pos[j*2],pos[j*2+1]);
    }
    if(lines.length){
      const lb=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,lb);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
      gl.uniform4f(uCol,cr,cg,cb,.22);
      gl.drawArrays(gl.LINES,0,lines.length/2);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── HERO TILT ── */
function initHeroTilt() {
  const card=$('#heroCard');
  if(!card)return;
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const rx=((e.clientY-r.top-r.height/2)/r.height)*-12;
    const ry=((e.clientX-r.left-r.width/2)/r.width)*12;
    card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transition='transform .6s cubic-bezier(.16,1,.3,1)';
    card.style.transform='perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    setTimeout(()=>card.style.transition='',600);
  });
}

/* ── TEXT REVEAL ── */
function initTextReveal(){
  const el = document.getElementById("heroNameTop");
  const text = el.textContent;
  el.innerHTML="";

  [...text].forEach((letter,i)=>{
    const span=document.createElement("span");
    span.textContent=letter;
    span.style.opacity="0";
    span.style.transform="translateY(30px)";
    span.style.display="inline-block";
    span.style.transition=`all .6s cubic-bezier(.16,1,.3,1) ${i*0.06}s`;
    el.appendChild(span);

    setTimeout(()=>{
      span.style.opacity="1";
      span.style.transform="translateY(0)";
    },200);
  });
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target);}});
  },{threshold:.1,rootMargin:'0px 0px -60px 0px'});
  $$('.sr,.sr-l,.sr-r,.sr-s').forEach(el=>obs.observe(el));
}

/* ── COUNTERS ── */
function initCounters() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target,tgt=+el.dataset.count,suf=el.dataset.suf||'';
      let start=null;
      const step=ts=>{
        if(!start)start=ts;
        const p=Math.min((ts-start)/1700,1);
        el.textContent=Math.round((1-Math.pow(1-p,3))*tgt)+suf;
        if(p<1)requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  },{threshold:.5});
  $$('[data-count]').forEach(el=>obs.observe(el));
}

/* ── SKILL BARS ── */
function initSkillBars() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('lit');obs.unobserve(e.target);}});
  },{threshold:.3});
  $$('.bar-item').forEach(b=>obs.observe(b));
}

/* ── TILT TILES ── */
function initTiltCards() {
  $$('[data-tilt]').forEach(tile=>{
    tile.addEventListener('mousemove',e=>{
      const r=tile.getBoundingClientRect();
      tile.style.transform=`perspective(600px) rotateX(${((e.clientY-r.top-r.height/2)/r.height)*-8}deg) rotateY(${((e.clientX-r.left-r.width/2)/r.width)*8}deg)`;
      tile.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      tile.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
    tile.addEventListener('mouseleave',()=>{
      tile.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';
      tile.style.transform='';
      setTimeout(()=>tile.style.transition='',500);
    });
  });
}

function initGlassTiltHighlights() {
  const cards = $$('.srv-tile,.testimonial-card,.work-video-card,.ci,.exp-card');
  cards.forEach((card) => {
    if (!card.querySelector('.glass-highlight')) {
      const glow = document.createElement('span');
      glow.className = 'glass-highlight';
      card.appendChild(glow);
    }

    card.classList.add('glass-tilt');
    if (card.dataset.glassBound === 'true') return;

    card.addEventListener('mousemove', (e) => {
      if (window.matchMedia('(pointer:coarse)').matches) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const glow = card.querySelector('.glass-highlight');
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
    });
    card.dataset.glassBound = 'true';
  });
}

/* ── MAGNETIC BUTTONS ── */
function initMagneticButtons() {
  $$('.mag-btn').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.2}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';
      btn.style.transform='';
      setTimeout(()=>btn.style.transition='',500);
    });
  });
}

/* ── SERVICE SPOTLIGHT ── */
function initServiceSpotlight() {
  $$('.srv-tile').forEach(tile=>{
    tile.addEventListener('mousemove',e=>{
      const r=tile.getBoundingClientRect();
      tile.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
      tile.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
    });
  });
}

/* ── WORK CURSOR LABEL ── */
function initWorkCursorLabel() {
  const label=$('#cursor-label');
  $$('.work-video-card').forEach(item=>{
    item.addEventListener('mouseenter',()=>{
      label.textContent='View';
      label.classList.add('show');
      document.body.classList.add('cur-link');
    });
    item.addEventListener('mousemove',e=>{label.style.left=e.clientX+'px';label.style.top=e.clientY+'px';});
    item.addEventListener('mouseleave',()=>{
      label.classList.remove('show');
      document.body.classList.remove('cur-link');
    });
  });
}

/* ── WORK FILTER ── */
function initWorkFilter() {
  const btns=$$('.filt');
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      btns.forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      const f=btn.dataset.f;
      const carouselWrap=$('#work-carousel-wrap');
      const threeDSection=$('#work-3d');
      if(f==='all'){
        workGalleryState.active='all';
        carouselWrap&&(carouselWrap.style.display='');
        threeDSection&&(threeDSection.style.display='none');
        renderCarousel('all');
      } else if(f==='reels'){
        workGalleryState.active='reels';
        carouselWrap&&(carouselWrap.style.display='');
        threeDSection&&(threeDSection.style.display='none');
        renderCarousel('reels');
      } else if(f==='longform'){
        workGalleryState.active='longform';
        carouselWrap&&(carouselWrap.style.display='');
        threeDSection&&(threeDSection.style.display='none');
        renderCarousel('longform');
      } else if(f==='3d'){
        workGalleryState.active='3d';
        carouselWrap&&(carouselWrap.style.display='none');
        threeDSection&&(threeDSection.style.display='');
      }
    });
  });
}

/* ── PARALLAX ── */
function initParallax() {
  const canvas=$('#hero-canvas');
  const workWrap=$('#work-carousel-wrap');
  window.addEventListener('scroll',()=>{
    if(canvas)canvas.style.transform=`translateY(${scrollY*.12}px)`;
    if(workWrap){
      const rect = workWrap.getBoundingClientRect();
      const offset = Math.max(-16, Math.min(16, rect.top * -0.03));
      workWrap.style.setProperty('--wall-parallax', `${offset}px`);
    }
  },{passive:true});
}

/* ── PROGRESS ── */
function initProgress() {
  const bar=$('#progress');
  window.addEventListener('scroll',()=>{
    bar.style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+'%';
  },{passive:true});
}

/* ── SMOOTH SCROLL ── */
function initSmoothScroll() {
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a)return;
    const t=document.querySelector(a.getAttribute('href'));
    if(!t)return;
    e.preventDefault();
    t.scrollIntoView({behavior:'smooth'});
  });
}

/* ── FORM ── */
function initForm() {
  const btn=$("#submitBtn");
  const success=$("#formSuccess");
  if(!btn)return;
  btn.addEventListener("click",()=>{
    const name=$("#fn").value.trim();
    const email=$("#fe").value.trim();
    if(!name){flash("#fn");return;}
    if(!email){flash("#fe");return;}
    const text=$(".c-submit-text", btn);
    const arrow=$(".c-submit-arrow", btn);
    const original=text ? text.textContent : "Send Message";
    if(success)success.classList.remove("show");
    if(text)text.textContent="Sending...";
    if(arrow)arrow.textContent="...";
    btn.disabled=true;
    setTimeout(()=>{
      if(text)text.textContent="Message Sent Successfully";
      if(arrow)arrow.textContent="\u2713";
      if(success)success.classList.add("show");
      setTimeout(()=>{
        if(text)text.textContent=original;
        if(arrow)arrow.innerHTML="&rarr;";
        btn.disabled=false;
        $$(".c-form input,.c-form textarea").forEach(el=>el.value="");
        if(success)success.classList.remove("show");
      },3000);
    },1500);
  });
  function flash(sel){
    const el=$(sel); if(!el)return;
    el.style.borderColor="#e05555"; el.focus();
    setTimeout(()=>el.style.borderColor="",2000);
  }
}

/* ── PHOTO UPLOAD ── */
function initPhotoUpload() {
  const wrap=$('#cardPhotoWrap');
  const input=$('#photoInput');
  const img=$('#cardPhoto');
  if(!wrap||!input||!img)return;
  wrap.addEventListener('click',()=>input.click());
  input.addEventListener('change',e=>{
    const file=e.target.files[0]; if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{ img.src=ev.target.result; };
    r.readAsDataURL(file); input.value='';
  });
}



/* AUTO VIDEO GALLERY */
const videos = [
  "https://www.youtube.com/embed/lz4s5zU7Bo0",
  "https://www.youtube.com/embed/j6ympOT2sXc",
  "https://www.youtube.com/embed/HHviymdkkBc",
  "https://youtube.com/embed/DGs_9L6PwrA",
  "https://youtube.com/embed/lXhpxEu82gY",
  "https://www.instagram.com/reel/DRduRXUjBe6/",
  "https://www.instagram.com/reel/DRc5vHzE09z/",
  "https://www.instagram.com/reel/DRqiCfmCE99/",
  "https://www.instagram.com/reel/DOlQhOBidrr/",
  "https://www.instagram.com/reel/DI6fvdkomzh/",
  "https://www.instagram.com/reel/DNnOoPXzQ9U/",
  "https://www.instagram.com/reel/DOiMIqAjMMd/"
];

// Plain YouTube embed URLs do not indicate whether the source is a Short or a long video.
// These IDs are treated as vertical until future links are added in /shorts/ format.
const knownShortIds = new Set([
  "DGs_9L6PwrA",
  "lXhpxEu82gY"
]);

const workGalleryState = {
  all: [],
  reels: [],
  longform: [],
  active: 'all',
  controlsReady: false
};

const testimonialData = [
  {
    initials: 'GD',
    name: 'GDG Bhilai',
    company: 'Google Developers Group',
    rating: 5,
    kpi: '30% retention boost',
    text: 'Narottam transformed our event content into cinematic recaps that felt premium and retained attention from a technical audience.'
  },
  {
    initials: 'SS',
    name: 'Santosh Suna',
    company: 'Content Creator',
    rating: 5,
    kpi: '15+ videos delivered',
    text: 'He was consistent, fast, and sharp with pacing. Every edit came back stronger than the last without requiring rounds of correction.'
  },
  {
    initials: 'NL',
    name: 'Nadavi Loans',
    company: 'Financial Services Brand',
    rating: 5,
    kpi: '100% on-time delivery',
    text: 'Complex messaging became clear, modern, and conversion-focused. The videos looked polished and landed with the right audience.'
  },
  {
    initials: 'TS',
    name: 'Techstars Weekend',
    company: 'Startup Event',
    rating: 5,
    kpi: 'Same-day highlight reel',
    text: 'The turnaround under deadline pressure was exceptional. We had a finished recap while the event still had momentum online.'
  },
  {
    initials: 'KP',
    name: 'Kriti Priya',
    company: 'Personal Brand',
    rating: 5,
    kpi: 'Stronger audience response',
    text: 'The storytelling, rhythm, and polish immediately elevated my brand. Viewers noticed the difference after the first few uploads.'
  }
];

const testimonialState = {
  index: 1,
  realIndex: 0,
  cardWidth: 0,
  intervalId: null,
  ready: false,
  resumeTimeoutId: null,
  controlsBound: false,
  inView: false
};

function detectVideo(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname.replace(/\/+$/, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (path === "/watch") {
      const id = url.searchParams.get("v");
      return id ? buildVideoMeta(rawUrl, "youtube", "long", id) : null;
    }
    if (path.startsWith("/shorts/")) {
      const id = path.split("/").filter(Boolean)[1];
      return id ? buildVideoMeta(rawUrl, "youtube", "reel", id) : null;
    }
    if (path.startsWith("/embed/")) {
      const id = path.split("/").filter(Boolean)[1];
      if (!id) return null;
      return buildVideoMeta(rawUrl, "youtube", knownShortIds.has(id) ? "reel" : "long", id);
    }
  }

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];
    return id ? buildVideoMeta(rawUrl, "youtube", "long", id) : null;
  }

  if (host === "instagram.com" || host === "instagr.am") {
    const parts = path.split("/").filter(Boolean);
    const bucket = parts[0];
    const id = parts[1];
    if ((bucket === "reel" || bucket === "reels") && id) {
      return buildVideoMeta(rawUrl, "instagram", "reel", id);
    }
  }

  return null;
}

function buildVideoMeta(rawUrl, provider, kind, id) {
  const layout = kind === "reel" ? "vertical" : "horizontal";

  return {
    id,
    rawUrl,
    provider,
    kind,
    layout,
    embedUrl: getEmbedUrl(provider, id),
    caption: getVideoCaption(provider, kind),
    title: getVideoTitle(provider, kind, id),
    thumbUrl: getThumbnailUrl(provider, id)
  };
}

function getEmbedUrl(provider, id) {
  if (provider === "instagram") return `https://www.instagram.com/reel/${id}/embed`;
  return `https://www.youtube.com/embed/${id}`;
}

function getThumbnailUrl(provider, id) {
  if (provider === "youtube") return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  return "";
}

function getPreviewUrl(video, autoplay = false) {
  if (video.provider === "instagram") {
    return `${video.embedUrl}${autoplay ? '?autoplay=1' : ''}`;
  }

  const params = autoplay
    ? '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + video.id + '&rel=0&modestbranding=1'
    : '?rel=0&modestbranding=1';

  return `${video.embedUrl}${params}`;
}

function getModalUrl(video) {
  if (video.provider === "instagram") return video.embedUrl;
  return `${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`;
}

function getVideoCaption(provider, kind) {
  if (provider === "instagram") return "Instagram Reel";
  if (kind === "reel") return "YouTube Short";
  return "YouTube Video";
}

function getVideoTitle(provider, kind, id) {
  if (provider === "instagram") return `Instagram Reel ${id.slice(0, 5)}`;
  if (kind === "reel") return `YouTube Short ${id.slice(0, 5)}`;
  return `YouTube Film ${id.slice(0, 5)}`;
}

function createVideoCard(video) {
  const card = document.createElement("article");
  card.className = `work-video-card ${video.layout === "vertical" ? "reel-item" : "long-item"} ${video.provider === "instagram" ? "is-instagram" : "is-youtube"}`;
  card.dataset.video = video.embedUrl;
  card.dataset.layout = video.layout;

  const thumb = video.provider === "youtube"
    ? document.createElement("img")
    : document.createElement("div");

  thumb.className = "work-video-thumb";

  if (video.provider === "youtube") {
    thumb.src = video.thumbUrl;
    thumb.alt = video.title;
    thumb.loading = "lazy";
    thumb.addEventListener('error', () => {
      thumb.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    }, { once: true });
  }

  const preview = document.createElement("div");
  preview.className = "work-video-preview";

  const play = document.createElement("div");
  play.className = "work-video-play";
  play.textContent = "Play";

  const overlay = document.createElement("div");
  overlay.className = "work-video-overlay";

  const tag = document.createElement("div");
  tag.className = "work-video-tag";
  tag.textContent = video.caption;

  const title = document.createElement("div");
  title.className = "work-video-title";
  title.textContent = video.title;

  overlay.appendChild(tag);
  overlay.appendChild(title);

  card.appendChild(thumb);
  card.appendChild(preview);
  card.appendChild(play);
  card.appendChild(overlay);

  card.addEventListener('click', () => openVideoModal(video));
  initVideoCardPreview(card, video, preview);
  initWorkCardTilt(card);

  return card;
}

function createEmptyCard() {
  const empty = document.createElement("div");
  empty.className = "work-empty";
  empty.textContent = "No videos added yet.";
  return empty;
}

function renderCarousel(filterKey = 'all') {
  const track = $('#workCarouselTrack');
  const carousel = $('#videoCarousel');
  if (!track || !carousel) return;

  const items = workGalleryState[filterKey] || [];
  track.innerHTML = "";

  if (!items.length) {
    track.appendChild(createEmptyCard());
    track.style.setProperty('--loop-width', '0px');
    track.style.setProperty('--carousel-duration', '1s');
    initGlassTiltHighlights();
    initWorkCursorLabel();
    return;
  }

  const renderSet = (videosToRender) => {
    videosToRender.forEach((video) => {
      track.appendChild(createVideoCard(video));
    });
  };

  renderSet(items);
  renderSet(items);

  requestAnimationFrame(() => {
    const loopWidth = track.scrollWidth / 2;
    const duration = Math.max(24, Math.round(loopWidth / 28));
    track.style.setProperty('--loop-width', `${loopWidth}px`);
    track.style.setProperty('--carousel-duration', `${duration}s`);
    initGlassTiltHighlights();
    initWorkCursorLabel();
  });
}

function initAutoVideoGallery() {
  const portfolioVideos = videos.map(detectVideo).filter(Boolean);
  workGalleryState.all = portfolioVideos;
  workGalleryState.reels = portfolioVideos.filter((video) => video.kind === "reel");
  workGalleryState.longform = portfolioVideos.filter((video) => video.kind === "long");

  renderCarousel('all');
  initWorkCursorLabel();
  initVideoModal();
  initCarouselResize();
  initCarouselControls();
}

function initWorkCardTilt(card) {
  card.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const r = card.getBoundingClientRect();
    const rx = (((e.clientY - r.top - r.height / 2) / r.height) * -8).toFixed(2);
    const ry = (((e.clientX - r.left - r.width / 2) / r.width) * 10).toFixed(2);
    card.style.setProperty('--tilt-x', `${rx}deg`);
    card.style.setProperty('--tilt-y', `${ry}deg`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
}

function initVideoModal() {
  const modal = $('#videoModal');
  const closeBtn = $('#videoModalClose');
  const backdrop = $('#videoModalBackdrop');
  if (!modal || modal.dataset.ready === 'true') return;

  const close = () => closeVideoModal();
  closeBtn && closeBtn.addEventListener('click', close);
  backdrop && backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  modal.dataset.ready = 'true';
}

function openVideoModal(video) {
  const modal = $('#videoModal');
  const frame = $('#videoModalFrame');
  if (!modal || !frame) return;

  frame.className = `video-modal-frame${video.layout === 'vertical' ? ' is-vertical' : ''}`;
  frame.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.src = getModalUrl(video);
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.title = video.title;
  frame.appendChild(iframe);

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  const modal = $('#videoModal');
  const frame = $('#videoModalFrame');
  if (!modal || !frame) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frame.innerHTML = '';
  document.body.style.overflow = '';
}

function initCarouselResize() {
  if (window._workCarouselResizeBound) return;
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if ($('#work-carousel-wrap')?.style.display !== 'none') {
        renderCarousel(workGalleryState.active);
        initWorkCursorLabel();
      }
    }, 120);
  });
  window._workCarouselResizeBound = true;
}

function initTestimonials() {
  const track = $('#testimonialTrack');
  const dots = $('#testimonialDots');
  const carousel = track?.parentElement;
  if (!track) return;

  track.innerHTML = '';
  dots && (dots.innerHTML = '');

  const loopedItems = [
    testimonialData[testimonialData.length - 1],
    ...testimonialData,
    testimonialData[0]
  ];

  loopedItems.forEach((item, idx) => {
    const card = createTestimonialCard(item);
    card.dataset.clone = idx === 0 || idx === loopedItems.length - 1 ? 'true' : 'false';
    track.appendChild(card);
  });

  testimonialData.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
    dot.addEventListener('click', () => goToTestimonial(idx + 1, true));
    dots && dots.appendChild(dot);
  });

  bindTestimonialControls();
  bindTestimonialLoop(track);
  updateTestimonialPosition(true);
  updateTestimonialStates();
  initGlassTiltHighlights();

  if (carousel && !carousel.dataset.bound) {
    carousel.addEventListener('mouseenter', () => {
      clearInterval(testimonialState.intervalId);
      clearTimeout(testimonialState.resumeTimeoutId);
    });
    carousel.addEventListener('mouseleave', () => pauseAndResumeTestimonials(2200));
    carousel.dataset.bound = 'true';
  }

  if (!testimonialState.ready) {
    window.addEventListener('resize', () => {
      updateTestimonialPosition(true);
      updateTestimonialStates();
    });
    initTestimonialObserver();
    testimonialState.ready = true;
  }
}

function createTestimonialCard(item) {
  const card = document.createElement('article');
  card.className = 'testimonial-card';

  const top = document.createElement('div');
  top.className = 'testimonial-top';

  const avatar = document.createElement('div');
  avatar.className = 'testimonial-avatar';
  avatar.textContent = item.initials;

  const meta = document.createElement('div');
  meta.className = 'testimonial-meta';

  const name = document.createElement('div');
  name.className = 'testimonial-name';
  name.textContent = item.name;

  const company = document.createElement('div');
  company.className = 'testimonial-company';
  company.textContent = item.company;

  meta.appendChild(name);
  meta.appendChild(company);
  top.appendChild(avatar);
  top.appendChild(meta);

  const stars = document.createElement('div');
  stars.className = 'testimonial-stars';
  stars.textContent = '★'.repeat(item.rating);

  const text = document.createElement('p');
  text.className = 'testimonial-text';
  text.textContent = item.text;

  const kpi = document.createElement('div');
  kpi.className = 'testimonial-kpi';
  kpi.textContent = item.kpi;

  card.appendChild(top);
  card.appendChild(stars);
  card.appendChild(text);
  card.appendChild(kpi);

  card.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
  card.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));

  return card;
}

function bindTestimonialControls() {
  if (testimonialState.controlsBound) return;
  const prev = $('#testimonialPrev');
  const next = $('#testimonialNext');
  prev && prev.addEventListener('click', () => stepTestimonial(-1, true));
  next && next.addEventListener('click', () => stepTestimonial(1, true));
  testimonialState.controlsBound = true;
}

function stepTestimonial(direction, fromUser = false) {
  testimonialState.index += direction;
  updateTestimonialPosition();
  updateTestimonialStates();
  if (fromUser) pauseAndResumeTestimonials();
}

function updateTestimonialPosition(skipTransition = false) {
  const track = $('#testimonialTrack');
  if (!track || !track.children.length) return;

  const first = track.children[0];
  const gap = 22;
  testimonialState.cardWidth = first.getBoundingClientRect().width + gap;
  if (skipTransition) track.style.transition = 'none';
  const viewport = track.parentElement?.getBoundingClientRect().width || 0;
  const offset = Math.max(0, (viewport - first.getBoundingClientRect().width) / 2);
  track.style.transform = `translateX(calc(${-testimonialState.index * testimonialState.cardWidth}px + ${offset}px))`;
  if (skipTransition) {
    requestAnimationFrame(() => {
      track.style.transition = '';
    });
  }
}

function restartTestimonialAutoSlide() {
  clearInterval(testimonialState.intervalId);
  if (!testimonialState.inView) return;
  testimonialState.intervalId = setInterval(() => {
    stepTestimonial(1);
  }, 4200);
}

function pauseAndResumeTestimonials(delay = 6500) {
  clearInterval(testimonialState.intervalId);
  clearTimeout(testimonialState.resumeTimeoutId);
  testimonialState.resumeTimeoutId = setTimeout(() => {
    restartTestimonialAutoSlide();
  }, delay);
}

function updateTestimonialStates() {
  const track = $('#testimonialTrack');
  const dots = $$('.testimonial-dot');
  if (!track) return;

  const cards = [...track.children];
  const total = testimonialData.length;
  let realIndex = testimonialState.index - 1;
  if (realIndex < 0) realIndex = total - 1;
  if (realIndex >= total) realIndex = 0;
  testimonialState.realIndex = realIndex;

  cards.forEach((card, idx) => {
    card.classList.remove('is-active', 'is-near');
    if (idx === testimonialState.index) card.classList.add('is-active');
    if (idx === testimonialState.index - 1 || idx === testimonialState.index + 1) card.classList.add('is-near');
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('is-active', idx === testimonialState.realIndex);
  });
}

function goToTestimonial(slideIndex, fromUser = false) {
  testimonialState.index = slideIndex;
  updateTestimonialPosition();
  updateTestimonialStates();
  if (fromUser) pauseAndResumeTestimonials();
}

function bindTestimonialLoop(track) {
  if (track.dataset.loopBound === 'true') return;
  track.addEventListener('transitionend', () => {
    if (testimonialState.index === 0) {
      testimonialState.index = testimonialData.length;
      updateTestimonialPosition(true);
      updateTestimonialStates();
    } else if (testimonialState.index === testimonialData.length + 1) {
      testimonialState.index = 1;
      updateTestimonialPosition(true);
      updateTestimonialStates();
    }
  });
  track.dataset.loopBound = 'true';
}

function initTestimonialObserver() {
  const section = $('#clients');
  if (!section) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        section.classList.add('testimonials-in');
        testimonialState.inView = true;
        restartTestimonialAutoSlide();
      } else {
        testimonialState.inView = false;
        clearInterval(testimonialState.intervalId);
      }
    });
  }, { threshold: 0.25 });
  observer.observe(section);
}

function initCarouselControls() {
  if (workGalleryState.controlsReady) return;
  const prev = $('#carouselPrevBtn');
  const next = $('#carouselNextBtn');
  prev && prev.addEventListener('click', () => stepCarousel('prev'));
  next && next.addEventListener('click', () => stepCarousel('next'));
  workGalleryState.controlsReady = true;
}

function stepCarousel(direction) {
  const key = workGalleryState.active;
  if (key === '3d') return;

  const items = workGalleryState[key];
  if (!items || items.length < 2) return;

  if (direction === 'next') {
    items.push(items.shift());
  } else {
    items.unshift(items.pop());
  }

  renderCarousel(key);
}

function initVideoCardPreview(card, video, preview) {
  let hoverTimer = null;

  const destroyPreview = () => {
    preview.classList.remove('show');
    preview.innerHTML = '';
  };

  card.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => {
      if (preview.childElementCount) return;
      const iframe = document.createElement('iframe');
      iframe.src = getPreviewUrl(video, true);
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.title = `${video.title} preview`;
      preview.appendChild(iframe);
      preview.classList.add('show');
    }, 180);
  });

  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    destroyPreview();
  });
}
