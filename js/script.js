/* =========================================================
   EL HALCÓN EXPRESS — script.js (integrado)
   - Sin conflictos con ScrollSpy (NO lo usamos)
   - Activo correcto en menú con IntersectionObserver
   - Soporte #coverage (antes usabas "cobertura" por error)
   - Dropdown Servicios robusto (desktop hover, móvil click)
   - Preloader Lottie con fallbacks
   - Smooth scroll con compensación de navbar
   - Cierre de navbar colapsada en móvil
   - Cookies banner
   - Fun facts, mapa, rastreo, servicios (chips/tabs), etc.
   ========================================================= */

(() => {
  'use strict';

  // ============== Normaliza /index.html en la URL ==============
  if (/\/index\.html$/i.test(location.pathname)) {
    history.replaceState(null, '', location.origin + '/' + location.search + location.hash);
  }

  // ============== Evita restauración automática de scroll ==============
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // ============== Utils navbar activo ==============
  const clearActive = () => {
    document.querySelectorAll('#mainNav .nav-link').forEach(a => a.classList.remove('active'));
  };
  const setActiveByHref = (href) => {
    clearActive();
    const a = document.querySelector('#mainNav .nav-link[href="' + href + '"]');
    if (a) a.classList.add('active');
  };

  // ============== Marca “Servicios” si estamos en servicios.html ==============
  (function lockServiciosIfNeeded() {
    const path = (location.pathname || '').toLowerCase();
    const inServicios = path.endsWith('/servicios.html') || path.endsWith('/servicios');
    if (!inServicios) return;

    window.__NAV_LOCKED__ = true; // Evita que otros módulos cambien el activo

    // Marca activo en ambos enlaces de Servicios (móvil/escritorio) sin depender de IDs
    const dd = document.querySelector('.dropdown-services');
    if (dd) {
      const toggleDesktop = dd.querySelector('.dropdown-toggle');
      const linkMobile = dd.querySelector('.d-lg-none.nav-link');
      if (toggleDesktop) toggleDesktop.classList.add('active');
      if (linkMobile) linkMobile.classList.add('active');
    }
  })();

  // ============== Cerrar el menú colapsado al click (BS5) ==============
  document.addEventListener('click', function (e) {
    // Cierra solo si el click es en un link del navbar o dropdown
    const link = e.target.closest('#mainNav .nav-link, #mainNav .dropdown-item');
    if (!link) return;
    const collapse = document.getElementById('mainNav');
    const toggler  = document.querySelector('.navbar-toggler');
    if (collapse && toggler && getComputedStyle(toggler).display !== 'none') {
      (bootstrap.Collapse.getInstance(collapse) || new bootstrap.Collapse(collapse, { toggle: false })).hide();
    }
  });

  // ============== Dropdown Servicios robusto (hover desktop / click móvil) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const toggler = document.querySelector('.dropdown-services > .dropdown-toggle');
    if (!toggler) return;

    // Evita doble click errático
    toggler.addEventListener('dblclick', (e) => { e.preventDefault(); e.stopPropagation(); });

    // Evita salto por href="#" y usa API Bootstrap
    toggler.addEventListener('click', function (e) {
      e.preventDefault();
      bootstrap.Dropdown.getOrCreateInstance(toggler).toggle();
    });

    // Hover solo en desktop (≥992px)
    const desktop = window.matchMedia('(min-width: 992px)');
    const dd = () => bootstrap.Dropdown.getOrCreateInstance(toggler);
    const item = toggler.parentElement;

    function bindHover() {
      if (!desktop.matches) return;
      item.addEventListener('mouseenter', () => dd().show(), { once: false });
      item.addEventListener('mouseleave', () => dd().hide(), { once: false });
    }
    bindHover();
    desktop.addEventListener?.('change', () => dd().hide());
  });

  // ============== Smooth Scroll con compensación de navbar ==============
  (function smoothScroll() {
    const headerOffset = () => {
      const nav = document.querySelector('.navbar.fixed-top') || document.querySelector('.navbar');
      return nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    };

    const scrollToHash = (hash) => {
      if (!hash) return;
      const el = document.querySelector(hash);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    // Click en anclas internas
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a.scroll, a.nav-link[href^="#"]');
      if (!a) return;

      const url = new URL(a.getAttribute('href'), location.href);
      // Solo si es la misma página y hay hash
      const samePage = url.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
      if (!url.hash || !samePage) return;

      e.preventDefault();
      scrollToHash(url.hash);
      history.replaceState(null, '', url.hash);

      // Feedback inmediato en el menú (si no está bloqueado por servicios.html)
      if (!window.__NAV_LOCKED__) setActiveByHref(url.hash);
    });

    // Si se entra con hash, compensa offset
    window.addEventListener('load', () => {
      if (location.hash && document.querySelector(location.hash)) {
        setTimeout(() => scrollToHash(location.hash), 0);
      } else if (!window.__NAV_LOCKED__) {
        // Por defecto “Inicio”
        setActiveByHref('#menu');
      }
    });
  })();

  // ============== Activa link del menú según sección visible (IntersectionObserver) ==============
  document.addEventListener('DOMContentLoaded', function () {
    if (window.__NAV_LOCKED__) return; // No tocar en servicios.html

    // IMPORTANTE: el id correcto de la sección es "coverage" (no "cobertura")
    const map = [
      ['slider',   '#menu'],     // Mantiene "Inicio" activo cuando el slider domina
      ['about',    '#about'],
      ['coverage', '#coverage'], // <- CORRECTO
      ['tracking', '#tracking'],
      ['contact',  '#contact']
    ];

    const bySectionId = Object.fromEntries(
      map.map(([id, href]) => [id, document.querySelector(`#mainNav .nav-link[href="${href}"]`)])
    );
    const observed = map.map(([id]) => document.getElementById(id)).filter(Boolean);
    if (!observed.length) return;

    const io = new IntersectionObserver((entries) => {
      let best = null, ratio = 0;
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > ratio) { ratio = e.intersectionRatio; best = e; }
      }
      if (best && bySectionId[best.target.id]) {
        clearActive();
        bySectionId[best.target.id].classList.add('active');
      }
    }, {
      // Define una “zona central” para decidir el activo y compensa navbar
      root: null,
      rootMargin: '-25% 0px -60% 0px',
      threshold: [0.25, 0.5, 0.75, 1]
    });

    observed.forEach(sec => io.observe(sec));

    // Cambios de hash manuales
    window.addEventListener('hashchange', () => {
      if (window.__NAV_LOCKED__) return;
      setActiveByHref(location.hash || '#menu');
    }, { passive: true });
  });

  // ============== Navbar .on (estilo tras scroll) ==============
  window.addEventListener('scroll', function () {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const navHeight = window.innerHeight - 100;
    if (window.scrollY > navHeight) nav.classList.add('on');
    else nav.classList.remove('on');
  });

  // ============== Tooltips (Bootstrap 5) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const list = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    list.forEach(el => new bootstrap.Tooltip(el));
  });

  // ============== Preloader con Lottie (con fallbacks) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const pre = document.getElementById('preloader');
    const box = pre?.querySelector('.lottie-box');
    // Si no hay preloader, nada que hacer
    if (!pre) return;

    const fadeOutSequence = () => {
      if (pre.classList.contains('is-hidden')) return;  // evita doble ejecución
      pre.classList.add('is-ending');                   // fade camión (si aplica)
      setTimeout(() => {
        pre.classList.add('is-hidden');                 // fade overlay
        setTimeout(() => { try { pre.remove(); } catch(e){} }, 650);
      }, 200);
    };

    // Si hay Lottie, anímalo; si no, usa fallback simple al load
    if (box && window.lottie) {
      const anim = lottie.loadAnimation({
        container: box,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'animations/truck.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });

      const finishAndFade = () => {
        try { anim.loop = false; } catch(e){}
        const fallback = setTimeout(fadeOutSequence, 1500);
        anim.addEventListener('complete', () => { clearTimeout(fallback); fadeOutSequence(); }, { once: true });
      };

      window.addEventListener('load', finishAndFade, { once: true });
      anim.addEventListener('data_failed', fadeOutSequence);
      setTimeout(() => { if (!pre.classList.contains('is-hidden')) fadeOutSequence(); }, 8000);
    } else {
      // Fallback: quita el preloader al terminar de cargar
      window.addEventListener('load', fadeOutSequence, { once: true });
      setTimeout(fadeOutSequence, 5000);
    }

    // NOTA: No borramos el hash ni forzamos scrollTop(0) para no romper anclas (#coverage, etc.)
  });

  // ============== Cookies banner ==============
  document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookies');
    if (banner && btn) {
      if (localStorage.getItem('cookiesAccepted')) banner.style.display = 'none';
      btn.addEventListener('click', function () {
        localStorage.setItem('cookiesAccepted', 'yes');
        banner.style.display = 'none';
      });
    }
  });

  // ============== Contadores #fun-facts ==============
  document.addEventListener('DOMContentLoaded', function () {
    const funFacts = document.querySelector('#fun-facts');
    if (!funFacts) return;
    if ('IntersectionObserver' in window) {
      const obsCounters = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          funFacts.querySelectorAll('.timer').forEach(function (el) {
            const target = parseInt((el.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;
            let startTime = null; const duration = 2000;
            el.textContent = '0';
            function step(ts) {
              if (!startTime) startTime = ts;
              const p = Math.min((ts - startTime) / duration, 1);
              el.textContent = String(Math.ceil(p * target));
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          });
          observer.disconnect();
        });
      }, { threshold: 0.3 });
      obsCounters.observe(funFacts);
    } else {
      funFacts.querySelectorAll('.timer').forEach(function (el) {
        el.textContent = (el.textContent || '0').replace(/[^\d]/g, '');
      });
    }
  });

  // ============== Animación del mapa por IO ==============
  document.addEventListener('DOMContentLoaded', function () {
    const mapa = document.getElementById('mapaColombia');
    if (!mapa || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          mapa.classList.remove('animar'); void mapa.offsetWidth; mapa.classList.add('animar');
        } else {
          mapa.classList.remove('animar');
        }
      });
    }, { threshold: 0.5 });
    obs.observe(mapa);
  });

  // ============== Menú móvil overlay opcional (si existe estructura) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const menuTrigger = document.querySelector('.menu-trigger');
    const mobileNav = document.querySelector('.mobilenav');
    if (menuTrigger && mobileNav) {
      const toggleMenu = function () {
        mobileNav.style.display = (mobileNav.style.display === 'block') ? 'none' : 'block';
        document.querySelectorAll('.top-menu, .mid-menu, .bottom-menu').forEach(function (el) {
          el.classList.toggle(el.classList[0] + '-animate');
        });
      };
      menuTrigger.addEventListener('click', toggleMenu);
      mobileNav.addEventListener('click', toggleMenu);
      document.querySelectorAll('.mobilenav li, .back-to-top').forEach(function (el) {
        el.addEventListener('click', function () {
          const target = el.getAttribute('data-rel');
          if (!target) return;
          const t = document.querySelector(target);
          if (t) window.scrollTo({ top: t.offsetTop, behavior: 'smooth' });
        });
      });
    }
  });

  // ============== Evitar scroll horizontal ==============
  document.addEventListener('DOMContentLoaded', () => { document.body.style.overflowX = 'hidden'; });

  // ============== Altura del iframe del mapa (contacto) ==============
  function ajustarAlturaMapa() {
    const info = document.getElementById('info-contacto');
    const mapa = document.getElementById('mapa');
    if (!info || !mapa) return;
    const h = info.offsetHeight;
    mapa.style.height = (h > 320 ? h : 320) + 'px';
  }
  window.addEventListener('load', ajustarAlturaMapa);
  window.addEventListener('resize', ajustarAlturaMapa);
  if ('ResizeObserver' in window) {
    const infoRO = document.getElementById('info-contacto');
    if (infoRO) new ResizeObserver(ajustarAlturaMapa).observe(infoRO);
  }

  // ============== Rastreo de envíos ==============
  document.addEventListener('DOMContentLoaded', function () {
    const form  = document.getElementById('tracking-form');
    const input = document.getElementById('trackingNumber');
    const res   = document.getElementById('trackingResult');
    if (!form || !input || !res) return;

    const btn = form.querySelector('button[type="submit"]');
    const TZ  = 'America/Bogota';

    function formatearFechaLocal(iso) {
      if (!iso) return '-';
      const d = new Date(iso);
      if (isNaN(d)) return String(iso);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(d);
    }

    function msg(html) { res.innerHTML = '<div class="track-msg">' + html + '</div>'; }

    function card(r) {
      const estado = (r.estado || '').toString().trim().toUpperCase();
      const fecha  = formatearFechaLocal(r.fecha);
      const waPhone = '573006965535';
      const waText  = encodeURIComponent('Hola, quiero más información sobre mi envío con número de guía ' + (r.guia || '') + '.');
      const waLink  = 'https://wa.me/' + waPhone + '?text=' + waText;
      res.innerHTML =
        '<div class="track-card">' +
          '<h3>Estado de tu envío</h3>' +
          '<p><strong>Guía:</strong> ' + (r.guia || '-') + '</p>' +
          '<p><strong>Cliente:</strong> ' + (r.nombre || '-') + '</p>' +
          '<p><strong>Estado:</strong> <span class="estado">' + (estado || '-') + '</span></p>' +
          '<p><strong>Actualizado:</strong> ' + fecha + '</p>' +
          '<p style="margin-top:12px">' +
            '<a class="btn-whatsapp" href="' + waLink + '" target="_blank" rel="noopener">Más información por WhatsApp</a>' +
          '</p>' +
        '</div>';
    }

    async function rastrear(guia) {
      if (!guia) { msg('<span style="color:#a00">Ingresa un número de guía.</span>'); input.focus(); return; }
      msg('Buscando…');
      if (btn) btn.disabled = true;
      input.readOnly = true;
      try {
        const url = 'https://script.google.com/macros/s/AKfycbynAcFY19fLjkAhGgBV4B0HdOZMeSlJ51UmV9VlXA3Qdd8gBz_nXGz94gy3LZGBYoEO/exec?guia='
                    + encodeURIComponent(guia)
                    + '&token=x6Zy2iY_7mQvK4R9bP1tN8UwV3fH5cJ0Lr2Sx9AaE7gMd4Tq';
        const r = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const data = await r.json();
        if (!data.ok) {
          msg(
            data.error === 'not_found'    ? 'No encontramos ese número de guía.' :
            data.error === 'unauthorized' ? 'Acceso no autorizado (token inválido).' :
                                            'No se pudo consultar. Intenta de nuevo.'
          );
          return;
        }
        card(data.resultado || {});
      } catch (e) {
        console.error(e);
        msg('Error de red. Intenta de nuevo.');
      } finally {
        if (btn) btn.disabled = false;
        input.readOnly = false;
      }
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      rastrear((input.value || '').trim());
    });
  });

  // ============== /servicios: CHIPS sticky (layout anterior) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('services-nav');
    if (!nav) return;

    function headerOffset() {
      const nb = document.querySelector('.navbar') || { offsetHeight: 70 };
      return nb.offsetHeight || 70;
    }
    function offsetTop(el){ let y=0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
    function goTo(hash){
      const t = document.getElementById((hash || '').replace('#',''));
      if(!t) return;
      const y = offsetTop(t) - headerOffset();
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    function setActive(a){
      nav.querySelectorAll('.svc-chip').forEach(ch => ch.classList.remove('active'));
      a.classList.add('active');
    }

    nav.addEventListener('click', function(e){
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      e.preventDefault();
      goTo(a.getAttribute('href'));
      setActive(a);
      history.replaceState(null,'',a.getAttribute('href'));
    });

    const sections = Array.prototype.slice.call(document.querySelectorAll('.svc-block'));
    window.addEventListener('scroll', function(){
      const pos = window.scrollY + headerOffset() + 10;
      let current = sections[0];
      for (let i=0;i<sections.length;i++){
        if (sections[i].offsetTop <= pos) current = sections[i];
      }
      if (current){
        const link = nav.querySelector('a[href="#'+current.id+'"]');
        if (link) setActive(link);
      }
    });

    if (location.hash) setTimeout(() => { goTo(location.hash); }, 50);
  });

  // ============== /servicios: SIDEBAR con pestañas (sin scroll) ==============
  document.addEventListener('DOMContentLoaded', function () {
    const menu  = document.getElementById('svc-menu');
    const panes = document.querySelectorAll('.svc-content .tab-pane');
    if (!menu || !panes.length) return;

    function activate(targetSelector, opts){
      opts = opts || {};
      const target = document.querySelector(targetSelector);
      if (!target) return;

      menu.querySelectorAll('[role="tab"][data-target]').forEach(function(btn){
        const on = btn.getAttribute('data-target') === targetSelector;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        const li = btn.closest('li'); if (li) li.classList.toggle('active', on);
      });
      panes.forEach(function(p){
        p.classList.remove('in', 'active');
        p.setAttribute('aria-hidden','true');
      });
      target.classList.add('active');
      setTimeout(function(){ target.classList.add('in'); }, 10);
      target.setAttribute('aria-hidden','false');

      const h2 = target.querySelector('h2') || target;
      if (h2 && h2.focus) h2.focus({ preventScroll: true });

      if (opts.updateUrl && history && history.replaceState) {
        history.replaceState(null, '', targetSelector);
      }
    }

    menu.addEventListener('click', function(e){
      const tab = e.target.closest('[role="tab"][data-target]');
      if (!tab) return;
      e.preventDefault();
      activate(tab.getAttribute('data-target'), { updateUrl: true });
    });
    document.querySelectorAll('a.svc-trigger[data-target]').forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        activate(a.getAttribute('data-target'), { updateUrl: true });
        // Cierra dropdown antiguo si existiera
        const dd = a.closest('.dropdown.open');
        if (dd) {
          const toggle = dd.querySelector('.dropdown-toggle');
          if (toggle) bootstrap.Dropdown.getOrCreateInstance(toggle).toggle();
        }
      });
    });

    panes.forEach(function(p){
      if (!p.hasAttribute('role')) p.setAttribute('role','tabpanel');
      if (!p.hasAttribute('tabindex')) p.setAttribute('tabindex','0');
    });

    const initial =
      (location.hash && document.querySelector(location.hash) ? location.hash : null) ||
      (menu.querySelector('[role="tab"][data-target]') ? menu.querySelector('[role="tab"][data-target]').getAttribute('data-target') : null) ||
      '#masivos-nacionales';

    activate(initial, { updateUrl: false });
  });

  // ============== CTA “Cotizar ahora”: abre correo con servicio activo ==============
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('quote-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e){
      e.preventDefault();
      const activePane = document.querySelector('.svc-content .tab-pane.active');
      const svcFromPane = activePane && activePane.querySelector('h2')
                       ? activePane.querySelector('h2').textContent.trim()
                       : '';
      let svcFromMenu = '';
      const actBtn = document.querySelector('#svc-menu [role="tab"].is-active');
      if (actBtn) svcFromMenu = (actBtn.textContent || '').replace(/\s+/g,' ').trim();
      const svc = svcFromPane || svcFromMenu || 'Servicios';
      const to = 'comercial@elhalconexpress.com';
      const subject = 'Solicitud de cotización — ' + svc;
      const body = [
        'Hola equipo de El Halcón Express,',
        '',
        'Quisiera una cotización para: ' + svc,
        '',
        'Datos del envío:',
        '• Origen:',
        '• Destino:',
        '• Peso / Volumen:',
        '• Dimensiones:',
        '• Valor declarado:',
        '• Fecha estimada de despacho:',
        '',
        'Comentarios:',
        '',
        'Nombre:',
        'Teléfono:'
      ].join('\n');
      const mailto = 'mailto:' + to
                   + '?subject=' + encodeURIComponent(subject)
                   + '&body='    + encodeURIComponent(body);
      window.open(mailto, '_self');
    });
  });

})();
