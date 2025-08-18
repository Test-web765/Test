/* ===== Mobile Navigation ===== */
const navToggle = document.getElementById('nav-toggle');
const menu = document.querySelector('[data-mobile-menu]');
if (navToggle && menu) {
  navToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

/* ===== Active Link ===== */
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.menu a').forEach(a => {
  const href = a.getAttribute('href');
  if (!href) return;
  // Für Anker-Links nur auf index ignorieren
  if (href === path || (path === 'index.html' && href.startsWith('#'))) {
    a.setAttribute('aria-current', 'page');
  }
});

/* ===== Header Shadow on Scroll ===== */
const header = document.querySelector('[data-header]');
const onScroll = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll);

/* ===== Year in Footer ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Konfigurator (nur auf Startseite vorhanden) ===== */
function euro(n){ return new Intl.NumberFormat('de-DE',{style:'currency', currency:'EUR'}).format(n); }

const PRICES = {
  base: 300,          // Projekt-Setup
  page: 150,          // pro Seite
  bild: 10,           // pro Bild (Optimierung, Zuschnitt)
  animation: 50,      // pro Animation/Effect
  cms: 400,           // CMS-Integration
  seo: 250,           // OnPage/Tech SEO-Paket
  hosting: { none: 0, basic: 15, pro: 35 } // €/Monat
};

function calc(){
  const pages = +document.getElementById('pages')?.value || 0;
  const bilder = +document.getElementById('bilder')?.value || 0;
  const animationen = +document.getElementById('animationen')?.value || 0;
  const cms = document.getElementById('cms')?.checked || false;
  const seo = document.getElementById('seo')?.checked || false;
  const hosting = document.querySelector('input[name="hosting"]:checked')?.value || 'none';

  let einmalig = PRICES.base
               + pages * PRICES.page
               + bilder * PRICES.bild
               + animationen * PRICES.animation
               + (cms ? PRICES.cms : 0)
               + (seo ? PRICES.seo : 0);

  const monatlich = PRICES.hosting[hosting] || 0;

  const pe = document.getElementById('price-einmalig');
  const pm = document.getElementById('price-monatlich');
  if (pe) pe.textContent = euro(einmalig);
  if (pm) pm.textContent = monatlich ? euro(monatlich) : '–';
}

['pages','bilder','animationen','cms','seo'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', calc);
});
document.querySelectorAll('input[name="hosting"]').forEach(r=>r.addEventListener('change', calc));
calc();

/* ===== Kontaktformular – Mailto Fallback ===== */
const contactForm = document.getElementById('contact-form');
if (contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name = fd.get('name') || '';
    const email = fd.get('email') || '';
    const budget = fd.get('budget') || '';
    const message = fd.get('message') || '';
    const subject = encodeURIComponent('Neue Projektanfrage');
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\nBudget: ${budget}\n\nNachricht:\n${message}`
    );
    // TODO: E-Mail-Adresse ersetzen
    window.location.href = `mailto:info@deinefirma.de?subject=${subject}&body=${body}`;
  });
}

/* ================== WIZARD (Bedarfsanalyse) ================== */
(function(){
  const form = document.getElementById('bedarf-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.step'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const stepEl = document.getElementById('wiz-step');
  const totalEl = document.getElementById('wiz-total');
  const priceEl = document.getElementById('wiz-price');

  let i = 0;
  totalEl.textContent = String(steps.length);

  // Preislogik – bitte auf eure Raten anpassen
  const PRICING_WIZ = {
    base: 500,                                     // Grundsetup
    ziel: { 'Praesenz/Branding': 0, 'Leadgewinnung': 300, 'Online-Verkauf': 1200, 'Sonstiges': 0 },
    aufgaben: { 'Kaufen': 1000, 'Kontaktformular': 150, 'Newsletter': 250, 'Informationen': 0, 'Andere': 0 },
    branding: { 'Ja': 0, 'Teilweise': 150, 'Nein': 250 },
    funktionen: { 'Kontaktformular': 150, 'Buchungssystem': 600, 'Shop': 1500, 'Blog': 400, 'Mehrsprachigkeit': 400, 'Login': 900, 'Andere': 200 },
    sprachen: { 'Nur Deutsch': 0, 'Deutsch + Englisch': 300, 'Weitere': 400 },
    hosting: { 'Ja': 0, 'Teilweise': 60, 'Nein': 120 }
  };

  function euro(n){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n); }

  function collectState(){
    const fd = new FormData(form);
    const v = x => fd.get(x);

    const state = {
      hauptziel: v('hauptziel') || '',
      aufgaben: fd.getAll('aufgaben'),
      branding: v('branding') || '',
      funktionen: fd.getAll('funktionen'),
      sprachen: v('sprachen') || '',
      hosting: v('hosting') || ''
    };
    return state;
  }

  function calcPrice(){
    const s = collectState();
    let total = PRICING_WIZ.base;

    if (s.hauptziel) total += PRICING_WIZ.ziel[s.hauptziel] ?? 0;
    s.aufgaben.forEach(a => total += PRICING_WIZ.aufgaben[a] ?? 0);
    if (s.branding) total += PRICING_WIZ.branding[s.branding] ?? 0;
    s.funktionen.forEach(f => total += PRICING_WIZ.funktionen[f] ?? 0);
    if (s.sprachen) total += PRICING_WIZ.sprachen[s.sprachen] ?? 0;
    if (s.hosting) total += PRICING_WIZ.hosting[s.hosting] ?? 0;

    priceEl.textContent = euro(total);
  }

  function showStep(idx){
    steps.forEach((s, n)=> s.hidden = n !== idx);
    stepEl.textContent = String(idx + 1);
    prevBtn.disabled = idx === 0;
    nextBtn.hidden = idx === steps.length - 1;
    submitBtn.hidden = idx !== steps.length - 1;
    validateStep();   // set Next enabled/disabled
    calcPrice();      // update price
    window.scrollTo({top: document.querySelector('.wizard').offsetTop - 20, behavior: 'smooth'});
  }

  function validateStep(){
    const step = steps[i];
    const required = step.hasAttribute('data-required');
    if (!required){ nextBtn.disabled = false; return; }

    // A step counts as valid if all required inputs/textarea in it are non-empty/checked
    const inputs = Array.from(step.querySelectorAll('input, textarea, select'));
    let ok = true;
    inputs.forEach(el=>{
      if (el.type === 'radio'){
        const name = el.name;
        const group = step.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const any = Array.from(group).some(r=>r.checked);
        if (!any) ok = false;
      } else if (el.type === 'checkbox'){
        // checkboxes rarely "required" here; ignore
      } else if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'email' || el.type === 'date'){
        if (el.hasAttribute('required') && !el.value.trim()) ok = false;
      }
    });
    nextBtn.disabled = !ok;
  }

  // Events
  form.addEventListener('input', ()=>{ validateStep(); calcPrice(); });

  nextBtn.addEventListener('click', ()=>{
    if (nextBtn.disabled) return;
    if (i < steps.length - 1) i++;
    showStep(i);
  });
  prevBtn.addEventListener('click', ()=>{
    if (i > 0) i--;
    showStep(i);
  });

  // Submit -> mailto mit Zusammenfassung
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const lines = [];
    function line(k,v){ if(v && String(v).trim()) lines.push(`${k}: ${v}`); }
    function list(k, arr){ if (arr && arr.length) lines.push(`${k}: ${arr.join(', ')}`); }

    line('Kunde', fd.get('kunde_name'));
    line('Projekt', fd.get('projekt_name'));
    line('Telefon', fd.get('telefon'));
    line('Mobile', fd.get('mobile'));
    line('E-Mail', fd.get('email'));
    line('Adresse', fd.get('adresse'));
    lines.push('');
    line('Zielgruppe', fd.get('zielgruppe'));
    lines.push('');
    line('Hauptziel', fd.get('hauptziel') === 'Sonstiges' ? fd.get('hauptziel_sonst') : fd.get('hauptziel'));
    list('Aufgaben', fd.getAll('aufgaben')); line('Aufgaben (andere)', fd.get('aufgaben_sonst'));
    lines.push('');
    line('Branding', fd.get('branding'));
    line('Branding-Details', fd.get('branding_beschr'));
    line('Branding-Upload', fd.get('branding_upload') && fd.get('branding_upload').name);
    list('Stil', fd.getAll('stil')); line('Stil (anders)', fd.get('stil_sonst'));
    lines.push('');
    list('Funktionen', fd.getAll('funktionen')); line('Funktionen (andere)', fd.get('funktionen_sonst'));
    line('Sprachen', fd.get('sprachen') === 'Weitere' ? fd.get('sprachen_sonst') : fd.get('sprachen'));
    lines.push('');
    line('Betreuung', fd.get('betreuung') === 'Andere' ? fd.get('betreuung_sonst') : fd.get('betreuung'));
    line('Hosting/Domain', fd.get('hosting'));
    line('Hosting-Details', fd.get('hosting_anbieter') || fd.get('hosting_teilweise'));
    lines.push('');
    line('Go-Live', fd.get('golive'));
    line('Budget', fd.get('budget') === 'Anders' ? fd.get('budget_sonst') : fd.get('budget'));
    lines.push('');
    line('Richtpreis (heute)', priceEl.textContent);

    const subject = encodeURIComponent('Bedarfsanalyse – Neue Anfrage');
    const body = encodeURIComponent(lines.join('\n'));
    // TODO: Zieladresse anpassen
    window.location.href = `mailto:info@creative4design.de?subject=${subject}&body=${body}`;
  });

  // Start
  showStep(i);
})();
