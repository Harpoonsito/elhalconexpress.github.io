/* =========================================================
   EL HALCÓN EXPRESS — script.js
   (home + /servicios/ con URL limpia)
   ========================================================= */
(() => {
  'use strict';

  // -------- Helpers de ruta --------
  const path = location.pathname;
  const inServicios = /(^|\/)servicios(\/|\/index\.html|\.html)?(\?|#|$)/i
    .test(path + location.search + location.hash);

  const fromRoot = (p) => (/^https?:\/\//i.test(p) ? p : (p.startsWith('/') ? p : '/' + p));

  // Normaliza cualquier */index.html (incluye /servicios/index.html)
  if (/index\.html$/i.test(path)) {
    history.replaceState(null, '', path.replace(/index\.html$/i, '') + location.search + location.hash);
  }

  // Evita restauración automática de scroll
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // -------- Utils navbar activo --------
  const clearActive = () => {
    document.querySelectorAll('#mainNav .nav-link').forEach(a => a.classList.remove('active'));
  };
  const setActiveByHref = (href) => {
    clearActive();
    const a = document.querySelector('#mainNav .nav-link[href="' + href + '"]');
    if (a) a.classList.add('active');
  };

  // Bloquea y marca “Servicios” en /servicios/ (evita que IO cambie el activo)
  (function lockServiciosIfNeeded() {
    if (!inServicios) return;
    window.__NAV_LOCKED__ = true;
    const ds = document.querySelector('.dropdown-services');
    if (ds) {
      const toggleDesktop = ds.querySelector('.dropdown-toggle');
      const linkMobile = ds.querySelector('.d-lg-none.nav-link');
      if (toggleDesktop) toggleDesktop.classList.add('active');
      if (linkMobile) linkMobile.classList.add('active');
    }
  })();

  // -------- Cerrar menú colapsado (BS5) al click en un link del navbar --------
  document.addEventListener('click', function (e) {
    const link = e.target.closest('#mainNav .nav-link, #mainNav .dropdown-item');
    if (!link) return;
    const collapse = document.getElementById('mainNav');
    const toggler  = document.querySelector('.navbar-toggler');
    if (collapse && toggler && getComputedStyle(toggler).display !== 'none') {
      (bootstrap.Collapse.getInstance(collapse) || new bootstrap.Collapse(collapse, { toggle: false })).hide();
    }
  });

  // -------- Dropdown Servicios: hover desktop / click móvil --------
  document.addEventListener('DOMContentLoaded', function () {
    const toggler = document.querySelector('.dropdown-services > .dropdown-toggle');
    if (!toggler) return;
    toggler.addEventListener('dblclick', (e) => { e.preventDefault(); e.stopPropagation(); });
    toggler.addEventListener('click', function (e) {
      e.preventDefault();
      bootstrap.Dropdown.getOrCreateInstance(toggler).toggle();
    });
    const desktop = window.matchMedia('(min-width: 992px)');
    const dd = () => bootstrap.Dropdown.getOrCreateInstance(toggler);
    const item = toggler.parentElement;
    const bindHover = () => {
      if (!desktop.matches) return;
      item.addEventListener('mouseenter', () => dd().show());
      item.addEventListener('mouseleave', () => dd().hide());
    };
    bindHover();
    desktop.addEventListener?.('change', () => dd().hide());
  });

  // -------- Smooth Scroll con compensación de navbar --------
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
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a.scroll, a.nav-link[href^="#"]');
      if (!a) return;
      const url = new URL(a.getAttribute('href'), location.href);
      const samePage = url.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
      if (!url.hash || !samePage) return;
      e.preventDefault();
      scrollToHash(url.hash);
      history.replaceState(null, '', url.hash);
      if (!window.__NAV_LOCKED__) setActiveByHref(url.hash);
    });
    window.addEventListener('load', () => {
      if (location.hash && document.querySelector(location.hash)) {
        setTimeout(() => scrollToHash(location.hash), 0);
      } else if (!window.__NAV_LOCKED__) {
        setActiveByHref('#menu');
      }
    });
  })();

  // -------- Activo por sección (solo home) --------
          document.addEventListener('DOMContentLoaded', function () {
    if (window.__NAV_LOCKED__) return;
    const sections = [
      ['slider',   '#menu'],
      ['about',    '#about'],
      ['coverage', '#coverage'],
      ['tracking', '#tracking'],
      ['contact',  '#contact']
    ].map(([id, href]) => {
      const section = document.getElementById(id);
      return section ? { href, section } : null;
    }).filter(Boolean);
    if (!sections.length) return;
    sections.sort((a, b) => a.section.offsetTop - b.section.offsetTop);
    const headerOffset = () => {
      const nav = document.querySelector('.navbar.fixed-top') || document.querySelector('.navbar');
      return nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    };
    let currentHref = null;
    const updateActive = () => {
      const scrollPos = window.scrollY + headerOffset() + 8;
      let active = sections[0];
      for (const item of sections) {
        if (item.section.offsetTop <= scrollPos) active = item;
      }
      if (active && active.href !== currentHref) {
        currentHref = active.href;
        setActiveByHref(active.href);
      }
    };
    let ticking = false;
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateActive();
      });
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    requestUpdate();
    window.addEventListener('hashchange', () => {
      if (window.__NAV_LOCKED__) return;
      setActiveByHref(location.hash || '#menu');
    }, { passive: true });
  });
// -------- Navbar .on tras scroll --------
  window.addEventListener('scroll', function () {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const navHeight = window.innerHeight - 100;
    if (window.scrollY > navHeight) nav.classList.add('on');
    else nav.classList.remove('on');
  });

  // -------- Tooltips --------
  document.addEventListener('DOMContentLoaded', function () {
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      .forEach(el => new bootstrap.Tooltip(el));
  });

  // -------- Preloader con Lottie (ruta desde raíz) --------
  document.addEventListener('DOMContentLoaded', function () {
    const pre = document.getElementById('preloader');
    const box = pre?.querySelector('.lottie-box');
    if (!pre) return;
    const fadeOutSequence = () => {
      if (pre.classList.contains('is-hidden')) return;
      pre.classList.add('is-ending');
      setTimeout(() => { pre.classList.add('is-hidden'); setTimeout(() => { try { pre.remove(); } catch(e){} }, 650); }, 200);
    };
    if (box && window.lottie) {
      const anim = lottie.loadAnimation({
        container: box,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: fromRoot('animations/truck.json'), // <- ¡desde raíz!
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
      window.addEventListener('load', fadeOutSequence, { once: true });
      setTimeout(fadeOutSequence, 5000);
    }
  });

  // -------- Cookies banner --------
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

  // -------- Contadores fun-facts --------
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
      funFacts.querySelectorAll('.timer').forEach(el => { el.textContent = (el.textContent || '0').replace(/[^\d]/g, ''); });
    }
  });

  // -------- Animación del mapa --------
  document.addEventListener('DOMContentLoaded', function () {
    const mapa = document.getElementById('mapaColombia');
    if (!mapa || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { mapa.classList.remove('animar'); void mapa.offsetWidth; mapa.classList.add('animar'); }
        else { mapa.classList.remove('animar'); }
      });
    }, { threshold: 0.5 });
    obs.observe(mapa);
  });

  // -------- Menú móvil overlay opcional --------
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

  // -------- Evitar scroll horizontal --------
  document.addEventListener('DOMContentLoaded', () => { document.body.style.overflowX = 'hidden'; });

  // -------- Altura del iframe del mapa (contacto) --------
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

  // -------- Rastreo de envíos --------
  document.addEventListener('DOMContentLoaded', function () {
    const form  = document.getElementById('tracking-form');
    const input = document.getElementById('trackingNumber');
    const res   = document.getElementById('trackingResult');
    if (!form || !input || !res) return;

    const btn = form.querySelector('button[type="submit"]');
    const TZ  = 'America/Bogota';

    const formatearFechaLocal = (f) => {
      if (!f && f !== 0) return '-';
      let d;
      if (typeof f === 'number') {
        // Convierte serial de Google Sheets a fecha
        d = new Date(Math.round((f - 25569) * 86400 * 1000));
      } else {
        d = new Date(f);
      }
      if (isNaN(d)) return String(f);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(d);
    };

    const msg = (html) => { res.innerHTML = '<div class="track-msg">' + html + '</div>'; };

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
        const r = await fetch('/rastreo/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guia })
        });

        const data = await r.json();

        if (!data.ok) {
          msg(
            data.error === 'invalid_guia'   ? 'La guía no tiene el formato correcto.' :
            data.error === 'not_found'      ? 'No encontramos ese número de guía.' :
            data.error === 'rate_limited'   ? 'Demasiadas consultas. Intenta en un minuto.' :
            data.error === 'forbidden'      ? 'Origen no autorizado.' :
            data.error === 'upstream_error' ? 'No se pudo consultar el servidor.' :
                                              'No se pudo consultar. Intenta de nuevo.'
          );
          return;
        }

        // pintar tarjeta
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

  // -------- /servicios: chips (layout anterior, opcional) --------
  document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('services-nav');
    if (!nav) return;
    const headerOffset = () => (document.querySelector('.navbar')?.offsetHeight || 70);
    const offsetTop = (el) => { let y=0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; };
    const goTo = (hash) => {
      const t = document.getElementById((hash || '').replace('#','')); if(!t) return;
      const y = offsetTop(t) - headerOffset(); window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const setActive = (a) => { nav.querySelectorAll('.svc-chip').forEach(ch => ch.classList.remove('active')); a.classList.add('active'); };
    nav.addEventListener('click', function(e){
      const a = e.target.closest('a[href^="#"]'); if(!a) return;
      e.preventDefault(); goTo(a.getAttribute('href')); setActive(a); history.replaceState(null,'',a.getAttribute('href'));
    });
    const sections = Array.prototype.slice.call(document.querySelectorAll('.svc-block'));
    window.addEventListener('scroll', function(){
      const pos = window.scrollY + headerOffset() + 10; let current = sections[0];
      for (let i=0;i<sections.length;i++) if (sections[i].offsetTop <= pos) current = sections[i];
      if (current){ const link = nav.querySelector('a[href="#'+current.id+'"]'); if (link) setActive(link); }
    });
    if (location.hash) setTimeout(() => { goTo(location.hash); }, 50);
  });

  // -------- /servicios: sidebar con pestañas (Bootstrap pills) --------
  document.addEventListener('DOMContentLoaded', function () {
    const menu  = document.getElementById('svc-menu');
    const panes = document.querySelectorAll('.svc-content .tab-pane');
    if (!menu || !panes.length) return;

    function activate(targetSelector, { updateUrl = true } = {}) {
      const btn = menu.querySelector(`[role="tab"][data-bs-target="${targetSelector}"], [role="tab"][data-target="${targetSelector}"]`);
      if (btn) bootstrap.Tab.getOrCreateInstance(btn).show();
      if (updateUrl && history && history.replaceState) history.replaceState(null, '', targetSelector);
    }

    menu.addEventListener('click', function(e){
      const tab = e.target.closest('[role="tab"][data-bs-target], [role="tab"][data-target]');
      if (!tab) return;
      e.preventDefault();
      const target = tab.getAttribute('data-bs-target') || tab.getAttribute('data-target');
      activate(target, { updateUrl: true });
    });

    // Inicial: hash o primera pestaña
    const initial =
      (location.hash && document.querySelector(location.hash) ? location.hash : null) ||
      (menu.querySelector('[role="tab"][data-bs-target]')?.getAttribute('data-bs-target')) ||
      '#masivos-nacionales';
    activate(initial, { updateUrl: false });
  });

  // -------- CTA “Cotizar ahora” (lee pestaña activa real) --------
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('quote-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e){
      e.preventDefault();
      const activePane = document.querySelector('.svc-content .tab-pane.active');
      const svcFromPane = activePane?.querySelector('h2')?.textContent.trim() || '';
      const actBtn = document.querySelector('#svc-menu .nav-link.active'); // Bootstrap marca .active
      const svcFromMenu = actBtn ? (actBtn.textContent || '').replace(/\s+/g,' ').trim() : '';
      const svc = svcFromPane || svcFromMenu || 'Servicios';
      const to = 'comercial@elhalconexpress.com';
      const subject = 'Solicitud de cotización — ' + svc;
      const body = [
        'Hola equipo de El Halcón Express,','',
        'Quisiera una cotización para: ' + svc,'',
        'Datos del envío:',
        '• Origen:','• Destino:','• Peso / Volumen:','• Dimensiones:','• Valor declarado:','• Fecha estimada de despacho:','',
        'Comentarios:','',
        'Nombre:','Teléfono:'
      ].join('\n');
      const mailto = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      window.open(mailto, '_self');
    });
  });

})();
