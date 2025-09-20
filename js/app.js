/* ===== Reveal (rein/raus) ===== */
(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches){
    els.forEach(e=>e.classList.add('reveal-in'));
    return;
  }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=> e.isIntersecting ? e.target.classList.add('reveal-in')
                                         : e.target.classList.remove('reveal-in'));
  },{threshold:.12});
  els.forEach(e=>io.observe(e));
})();

/* ===== Detail-Opener (langsam auf, schneller zu) ===== */
(() => {
  const table = document.querySelector('.pricing');
  function toggle(detail){
    const open = detail.classList.contains('open');
    detail.classList.toggle('close-fast', open);
    detail.classList.toggle('open');
  }
  function onFeature(cell){
    const row = cell.parentElement;
    const detail = row.nextElementSibling;
    if(detail?.classList.contains('detail')) toggle(detail);
  }
  // Clicks auf Stepper/Checkbox dürfen NICHT aufklappen und NICHT scrollen
  table.addEventListener('click',(e)=>{
    if(e.target.closest('.stepper') || e.target.closest('.addon') || e.target.closest('.addon-check')){
      e.stopPropagation();
      return;
    }
    const feat = e.target.closest('.feat');
    if(feat) onFeature(feat);
  }, true);

  table.addEventListener('keydown',(e)=>{
    if((e.key===' '||e.key==='Enter') && e.target.classList.contains('feat')){
      e.preventDefault(); onFeature(e.target);
    }
  });
})();

/* ===== Service-Akkordeon ===== */
document.querySelectorAll('.acc-btn').forEach(btn=>{
  btn.addEventListener('click',()=> btn.nextElementSibling.classList.toggle('open'));
});

/* ===== Mailto Kontakt ===== */
document.getElementById('contact')?.addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const subject = encodeURIComponent('Anfrage über Website');
  const body = encodeURIComponent(
    `Name: ${f.get('name')}\nE-Mail: ${f.get('email')}\nTelefon: ${f.get('phone')||'-'}\nFirma: ${f.get('company')||'-'}\n\nNachricht:\n${f.get('message')}`
  );
  location.href = `mailto:info@creative4design.de?subject=${subject}&body=${body}`;
});

/* ===== Stepper (nur eigene Pfeile) ===== */
function initStepper(el){
  const step = +el.dataset.step || 1;
  const min  = +el.dataset.min  || 0;
  let value  = +el.dataset.value|| 0;

  el.innerHTML = `
    <button class="down" type="button" aria-label="Verringern"></button>
    <span class="v"></span>
    <button class="up" type="button" aria-label="Erhöhen"></button>`;

  const v = el.querySelector('.v');
  const set = (n)=>{ value = Math.max(min, n); v.textContent = value; el.dataset.value = value; renderTotals(); };

  el.querySelector('.up').addEventListener('click', e=>{ e.stopPropagation(); set(value + step); });
  el.querySelector('.down').addEventListener('click', e=>{ e.stopPropagation(); set(value - step); });

  el.addEventListener('keydown', e=>{
    if(e.key===' '){ e.preventDefault(); }
    if(e.key==='ArrowUp'){ e.preventDefault(); set(value + step); }
    if(e.key==='ArrowDown'){ e.preventDefault(); set(value - step); }
  });

  set(value);
}
document.querySelectorAll('.stepper').forEach(initStepper);

/* Checkboxen – eigenes Toggle, damit nichts springt/aufklappt */
document.querySelectorAll('label.addon').forEach(lbl=>{
  lbl.addEventListener('click', e=>{
    e.preventDefault(); e.stopPropagation();
    const input = lbl.querySelector('input');
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
});
document.querySelectorAll('.addon-check').forEach(i=> i.addEventListener('change', renderTotals));

/* ===== Preisberechnung ===== */
const BASE = { starter:999, business:1799, pro:4999 };
const OUT  = {
  starter: document.getElementById('total-starter'),
  business: document.getElementById('total-business'),
  pro: document.getElementById('total-pro'),
};
const € = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n).replace(',00','');
const val = id => { const el = document.getElementById(id); return el ? (+el.dataset.value || 0) : 0; };

function addons(pkg){
  let s=0;
  s += Math.floor(val(`icons-${pkg}`)/5) * 100; // 100 €/5 Icons
  s += val(`lang-${pkg}`) * 200;               // 200 €/Sprache
  s += Math.floor(val(`text-${pkg}`)/300) * 100; // 100 €/300 Wörter
  s += val(`api-${pkg}`);                        // 150 €/Schnittstelle (Wert = Aufpreis)
  ['fonts','a11y','kb'].forEach(k=>{
    const el = document.getElementById(`${k}-${pkg}`);
    if(el?.checked) s += +(el.dataset.price || 0);
  });
  return s;
}
function renderTotals(){
  ['starter','business','pro'].forEach(p=>{
    OUT[p].textContent = €(BASE[p] + addons(p));
  });
}
renderTotals();

/* ===== Hintergrund: Partikelnetz ===== */
(function(){
  const c = document.getElementById('fx');
  const x = c.getContext('2d');
  let w,h,P=[];
  const N=90, S1=.2, S2=1.4, L=140;

  function size(){
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    if(!P.length){
      for(let i=0;i<N;i++){
        P.push({ x:Math.random()*w, y:Math.random()*h,
          vx:-(S1+Math.random()*(S2-S1)),
          vy:(Math.random()-.5)*.2 });
      }
    }
  }
  addEventListener('resize', size); size();

  (function loop(){
    x.clearRect(0,0,w,h);
    x.fillStyle='rgba(126,210,255,.9)';
    P.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<-10) p.x=w+10;
      if(p.y<-10) p.y=h+10;
      if(p.y>h+10) p.y=-10;
      x.beginPath(); x.arc(p.x,p.y,2,0,Math.PI*2); x.fill();
    });
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j], d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<L){
          const o=1-(d/L);
          x.strokeStyle=`rgba(126,210,255,${o*.25})`;
          x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(b.x,b.y); x.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
})();

/* Footer-Jahr */
document.getElementById('year').textContent = new Date().getFullYear();
