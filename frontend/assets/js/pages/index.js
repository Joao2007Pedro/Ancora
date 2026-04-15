/* =========================================================
   ÂNCORA — main.js
   ========================================================= */

(function () {
  'use strict';

  /* ── 1. Navbar: shadow ao rolar ───────────────────────── */
  const navbar = document.getElementById('navbar');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial


  /* ── 2. Burger menu (mobile) ──────────────────────────── */
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks  = document.getElementById('navLinks');

  burgerBtn.addEventListener('click', () => {
    const isOpen = burgerBtn.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });

  // Fechar menu ao clicar em um link
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('open');
      navLinks.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', false);
    });
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      burgerBtn.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });


  /* ── 3. Highlight do link ativo na navbar ─────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.navbar__link[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            const isActive = a.getAttribute('href') === `#${id}`;
            a.classList.toggle('navbar__link--active', isActive);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(s => sectionObserver.observe(s));


  /* ── 4. Reveal on scroll (Intersection Observer) ──────── */
  const revealEls = document.querySelectorAll(
    '.step-card, .feature-row, .testimonial-card, .stat, .monitor-card'
  );

  // Estilos iniciais inline para a animação de entrada
  revealEls.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = `opacity .55s ease ${i * 0.07}s, transform .55s ease ${i * 0.07}s`;
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  /* ── 5. Counter animado nas stats ─────────────────────── */
  const statValues = document.querySelectorAll('.stat__value');

  function animateCounter(el) {
    const raw    = el.textContent.trim();          // ex: "150+", "48h", "5"
    const num    = parseFloat(raw.replace(/[^\d.]/g, ''));
    const suffix = raw.replace(/[\d.]/g, '');      // "+", "h", ""
    const duration = 1400;
    const steps    = 60;
    const stepTime = duration / steps;
    let current    = 0;
    let frame      = 0;

    const timer = setInterval(() => {
      frame++;
      current = Math.round((num * frame) / steps);
      el.textContent = current + suffix;
      if (frame >= steps) {
        clearInterval(timer);
        el.textContent = raw; // garante valor final exato
      }
    }, stepTime);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach(el => statsObserver.observe(el));


  /* ── 6. Botões CTA — feedback tátil ──────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      btn.style.transition = 'transform .08s';
      btn.style.transform  = 'scale(.95)';
    });

    ['pointerup', 'pointerleave'].forEach(evt => {
      btn.addEventListener(evt, () => {
        btn.style.transform = '';
        btn.style.transition = '';
      });
    });
  });

})();