/* ═══════════════════════════════════════════════════
   NAROTTAM SHARAN PORTFOLIO — main.js v3
═══════════════════════════════════════════════════ */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

/* ── BOOT (no loader — instant) ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
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
  initMagneticButtons();
  initServiceSpotlight();
  initWorkCursorLabel();
  initWorkFilter();
  initParallax();
  initProgress();
  initForm();
  initPhotoUpload();
  initSmoothScroll();
});

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
  let mx=0,my=0,ox=0,oy=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    inner.style.left=mx+'px'; inner.style.top=my+'px';
  });
  (function raf(){
    ox=lerp(ox,mx,.1); oy=lerp(oy,my,.1);
    outer.style.left=ox+'px'; outer.style.top=oy+'px';
    requestAnimationFrame(raf);
  })();
  const hoverEls = 'a,button,.exp-card,.review-card,.tool-tile,.reel-item,.long-item,.srv-tile,.pill,.filt,.ci';
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
  $$('.reel-item,.long-item').forEach(item=>{
    item.addEventListener('mouseenter',()=>{label.textContent='View';label.classList.add('show');});
    item.addEventListener('mousemove',e=>{label.style.left=e.clientX+'px';label.style.top=e.clientY+'px';});
    item.addEventListener('mouseleave',()=>label.classList.remove('show'));
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
      // show/hide sections
      const reelsSection=$('#work-reels');
      const longSection=$('#work-long');
      const threeDSection=$('#work-3d');
      if(f==='all'){
        [reelsSection,longSection,threeDSection].forEach(s=>s&&(s.style.display=''));
      } else if(f==='reels'){
        reelsSection&&(reelsSection.style.display='');
        longSection&&(longSection.style.display='none');
        threeDSection&&(threeDSection.style.display='none');
      } else if(f==='longform'){
        reelsSection&&(reelsSection.style.display='none');
        longSection&&(longSection.style.display='');
        threeDSection&&(threeDSection.style.display='none');
      } else if(f==='3d'){
        reelsSection&&(reelsSection.style.display='none');
        longSection&&(longSection.style.display='none');
        threeDSection&&(threeDSection.style.display='');
      }
    });
  });
}

/* ── PARALLAX ── */
function initParallax() {
  const canvas=$('#hero-canvas');
  window.addEventListener('scroll',()=>{
    if(canvas)canvas.style.transform=`translateY(${scrollY*.12}px)`;
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
  const btn=$('#submitBtn');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    const name=$('#fn').value.trim();
    const email=$('#fe').value.trim();
    if(!name){flash('#fn');return;}
    if(!email){flash('#fe');return;}
    const s=btn.querySelector('span');
    const orig=s.textContent;
    s.textContent='Sending…'; btn.disabled=true;
    setTimeout(()=>{
      s.textContent='Sent ✓'; btn.style.background='#3d9e6e';
      setTimeout(()=>{
        s.textContent=orig; btn.style.background=''; btn.disabled=false;
        $$('.c-form input,.c-form textarea').forEach(el=>el.value='');
      },3000);
    },1500);
  });
  function flash(sel){
    const el=$(sel); if(!el)return;
    el.style.borderBottomColor='#e05555'; el.focus();
    setTimeout(()=>el.style.borderBottomColor='',2000);
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



/* AUTO VIDEO DATA */

const videoLinks = [

"https://www.instagram.com/reel/DRduRXUjBe6/embed",
"https://www.youtube.com/embed/DGs_9L6PwrA",
"https://www.youtube.com/embed/lXhpxEu82gY",
"https://www.instagram.com/reel/DI6fvdkomzh/embed"

];


function initAutoVideoGallery(){

const gallery = document.getElementById("autoVideoGallery");

if(!gallery) return;

videoLinks.forEach(link => {

const card = document.createElement("div");
card.className = "auto-video-card";

const iframe = document.createElement("iframe");

iframe.src = link;
iframe.loading = "lazy";
iframe.allowFullscreen = true;

card.appendChild(iframe);
gallery.appendChild(card);

});

}

document.addEventListener("DOMContentLoaded", initAutoVideoGallery);