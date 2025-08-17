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
