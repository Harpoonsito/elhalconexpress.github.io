// ============== Helpers index.html: scrollRestoration, cerrar menú colapsado, ScrollSpy, dropdown robusto ==============
// Evita que el navegador restaure la posición de scroll
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Cerrar el menú colapsado al hacer click en un enlace
document.addEventListener('click', function (e) {
  if (e.target.matches('#mainNav .nav-link, #mainNav .dropdown-item')) {
    const c = bootstrap.Collapse.getInstance(document.getElementById('mainNav'));
    if (c) c.hide();
  }
});

// Re-init ScrollSpy al cargar
window.addEventListener('load', function () {
  new bootstrap.ScrollSpy(document.body, { target: '#mainNav', offset: 100 });
});

// Dropdown Servicios: evitar salto por href="#", sin hover-hide
document.addEventListener('DOMContentLoaded', function () {
  const toggler = document.querySelector('.dropdown-services > .dropdown-toggle');
  if (!toggler) return;
  toggler.addEventListener('click', function (e) {
    // Evita que suba a la parte superior (href="#")
    e.preventDefault();
    bootstrap.Dropdown.getOrCreateInstance(toggler).toggle();
  });
  // Opcional: impedir doble-click extraño
  toggler.addEventListener('dblclick', function (e) {
    e.preventDefault(); e.stopPropagation();
  });
});

// ============== Preloader (desaparece al cargar) ==============
window.addEventListener('load', function () {
  var preStatus = document.getElementById('pre-status');
  var preloader = document.getElementById('preloader');
  if (preStatus) preStatus.style.display = 'none';
  if (preloader) {
    preloader.style.transition = 'opacity .6s';
    preloader.style.opacity = 0;
    setTimeout(function () { preloader.style.display = 'none'; }, 600);
  }
});

// ============== Smooth Scroll y ScrollSpy Bootstrap 5 ==============
(function () {
  // Altura dinámica de la navbar fija
  const headerOffset = () => {
    const nav = document.querySelector('.navbar.fixed-top');
    return nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
  };

  // Scroll con compensación por la navbar
  const scrollToHash = (hash) => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // Click en enlaces de la barra (misma página) -> scroll suave
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.scroll, a.nav-link[href^="#"]');
    if (!a) return;

    const url = new URL(a.getAttribute('href'), location.href);
    // Solo anclas de esta misma página
    const samePage = url.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
    if (!url.hash || !samePage) return;

    e.preventDefault();

    // Cierra el menú colapsado en móvil
    const collapse = document.getElementById('mainNav');
    const toggler  = document.querySelector('.navbar-toggler');
    if (collapse && toggler && getComputedStyle(toggler).display !== 'none') {
      (bootstrap.Collapse.getInstance(collapse) || new bootstrap.Collapse(collapse, {toggle:false})).hide();
    }

    scrollToHash(url.hash);
    history.replaceState(null, '', url.hash); // actualiza la URL sin salto
  });

  // Si entras con #ancla o cambias de tamaño, refresca ScrollSpy y ajusta offset
  const initSpy = () => {
    const spy = bootstrap.ScrollSpy.getInstance(document.body)
            || new bootstrap.ScrollSpy(document.body, { target: '#mainNav', offset: headerOffset() + 6 });
    spy.refresh();
  };

  window.addEventListener('load', () => {
    // IMPORTANTE: no hagas window.scrollTo(0,0) aquí si hay hash
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => scrollToHash(location.hash), 0);
    }
    initSpy();
  });

  window.addEventListener('resize', () => initSpy());
})();

// ============== Navbar fija (agrega .on) ==============
window.addEventListener('scroll', function () {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  var navHeight = window.innerHeight - 100;
  if (window.scrollY > navHeight) nav.classList.add('on');
  else nav.classList.remove('on');
});

// ============== Tooltips (Bootstrap 5) ==============
document.addEventListener('DOMContentLoaded', function () {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// ============== Contadores #fun-facts ==============
document.addEventListener('DOMContentLoaded', function () {
  var funFacts = document.querySelector('#fun-facts');
  if (!funFacts) return;
  if ('IntersectionObserver' in window) {
    var obsCounters = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        funFacts.querySelectorAll('.timer').forEach(function (el) {
          var target = parseInt((el.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;
          var startTime = null, duration = 2000;
          el.textContent = '0';
          function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
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
  var mapa = document.getElementById('mapaColombia');
  if (!mapa || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entries) {
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

// ============== Menú móvil overlay opcional ==============
document.addEventListener('DOMContentLoaded', function () {
  var menuTrigger = document.querySelector('.menu-trigger');
  var mobileNav = document.querySelector('.mobilenav');
  if (menuTrigger && mobileNav) {
    var toggleMenu = function () {
      if (mobileNav.style.display === 'block') {
        mobileNav.style.display = 'none';
      } else {
        mobileNav.style.display = 'block';
      }
      document.querySelectorAll('.top-menu, .mid-menu, .bottom-menu').forEach(function (el) {
        el.classList.toggle(el.classList[0] + '-animate');
      });
    };
    menuTrigger.addEventListener('click', toggleMenu);
    mobileNav.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobilenav li, .back-to-top').forEach(function (el) {
      el.addEventListener('click', function () {
        var target = el.getAttribute('data-rel');
        if (target) {
          var t = document.querySelector(target);
          if (t) window.scrollTo({ top: t.offsetTop, behavior: 'smooth' });
        }
      });
    });
  }
});

// ============== Cerrar menú colapsado tras elegir una opción (navbar Bootstrap 5) ==============
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.navbar-collapse a:not(.dropdown-toggle)').forEach(function (a) {
    a.addEventListener('click', function () {
      var collapse = a.closest('.navbar-collapse');
      if (collapse && collapse.classList.contains('show')) {
        var instance = bootstrap.Collapse.getOrCreateInstance(collapse);
        instance.hide();
      }
    });
  });
});

// ============== Evitar scroll horizontal ==============
document.body.style.overflowX = 'hidden';

// ============== Altura del iframe del mapa (contacto) ==============
function ajustarAlturaMapa() {
  var info = document.getElementById("info-contacto");
  var mapa = document.getElementById("mapa");
  if (!info || !mapa) return;
  var h = info.offsetHeight;
  mapa.style.height = (h > 320 ? h : 320) + "px";
}
window.addEventListener('load', ajustarAlturaMapa);
window.addEventListener('resize', ajustarAlturaMapa);
if ('ResizeObserver' in window) {
  var infoRO = document.getElementById("info-contacto");
  if (infoRO) new ResizeObserver(ajustarAlturaMapa).observe(infoRO);
}

// ============== Rastreo de envíos ==============
document.addEventListener('DOMContentLoaded', function () {
  var form  = document.getElementById('tracking-form');
  var input = document.getElementById('trackingNumber');
  var res   = document.getElementById('trackingResult');
  if (!form || !input || !res) return;
  var btn = form.querySelector('button[type="submit"]');
  var TZ   = 'America/Bogota';

  function formatearFechaLocal(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    if (isNaN(d)) return String(iso);
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(d);
  }

  function msg(html) { res.innerHTML = '<div class="track-msg">' + html + '</div>'; }

  function card(r) {
    var estado = (r.estado || '').toString().trim().toUpperCase();
    var fecha  = formatearFechaLocal(r.fecha);
    var waPhone = '573006965535';
    var waText  = encodeURIComponent('Hola, quiero más información sobre mi envío con número de guía ' + (r.guia || '') + '.');
    var waLink  = 'https://wa.me/' + waPhone + '?text=' + waText;
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
      var url = 'https://script.google.com/macros/s/AKfycbynAcFY19fLjkAhGgBV4B0HdOZMeSlJ51UmV9VlXA3Qdd8gBz_nXGz94gy3LZGBYoEO/exec?guia=' + encodeURIComponent(guia) + '&token=x6Zy2iY_7mQvK4R9bP1tN8UwV3fH5cJ0Lr2Sx9AaE7gMd4Tq';
      var r = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      if (!r.ok) throw new Error('http ' + r.status);
      var data = await r.json();
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
  var nav = document.getElementById('services-nav');
  if (!nav) return;
  function headerOffset() {
    var nb = document.querySelector('.navbar.navbar-fixed-top');
    return (nb ? nb.offsetHeight : 70) || 70;
  }
  function offsetTop(el){ var y=0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
  function goTo(hash){
    var t = document.getElementById(hash.replace('#',''));
    if(!t) return;
    var y = offsetTop(t) - headerOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function setActive(a){
    nav.querySelectorAll('.svc-chip').forEach(function(ch){ ch.classList.remove('active'); });
    a.classList.add('active');
  }
  nav.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    e.preventDefault();
    goTo(a.getAttribute('href'));
    setActive(a);
    history.replaceState(null,'',a.getAttribute('href'));
  });
  var sections = Array.prototype.slice.call(document.querySelectorAll('.svc-block'));
  window.addEventListener('scroll', function(){
    var pos = window.scrollY + headerOffset() + 10;
    var current = sections[0];
    for (var i=0;i<sections.length;i++){
      if (sections[i].offsetTop <= pos) current = sections[i];
    }
    if (current){
      var link = nav.querySelector('a[href="#'+current.id+'"]');
      if (link) setActive(link);
    }
  });
  if (location.hash) setTimeout(function(){ goTo(location.hash); }, 50);
});

// ============== /servicios: SIDEBAR con pestañas (sin scroll) ==============
document.addEventListener('DOMContentLoaded', function () {
  var menu  = document.getElementById('svc-menu');
  var panes = document.querySelectorAll('.svc-content .tab-pane');
  if (!menu || !panes.length) return;
  menu.addEventListener('click', function(e){
    var tab = e.target.closest('[role="tab"][data-target]');
    if (!tab) return;
    e.preventDefault();
    activate(tab.getAttribute('data-target'), { updateUrl: true });
  });
  document.querySelectorAll('a.svc-trigger[data-target]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      activate(a.getAttribute('data-target'), { updateUrl: true });
      var dd = a.closest('.dropdown.open');
      if (dd) {
        var toggle = dd.querySelector('.dropdown-toggle');
        if (toggle) bootstrap.Dropdown.getOrCreateInstance(toggle).toggle();
      }
    });
  });
  function activate(targetSelector, opts){
    opts = opts || {};
    var target = document.querySelector(targetSelector);
    if (!target) return;
    menu.querySelectorAll('[role="tab"][data-target]').forEach(function(btn){
      var on = btn.getAttribute('data-target') === targetSelector;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.closest('li').classList.toggle('active', on);
    });
    panes.forEach(function(p){
      p.classList.remove('in', 'active');
      p.setAttribute('aria-hidden','true');
    });
    target.classList.add('active');
    setTimeout(function(){ target.classList.add('in'); }, 10);
    target.setAttribute('aria-hidden','false');
    var h2 = target.querySelector('h2') || target;
    if (h2 && h2.focus) h2.focus({ preventScroll: true });
    if (opts.updateUrl && history && history.replaceState) {
      history.replaceState(null, '', targetSelector);
    }
  }
  var initial =
    (location.hash && document.querySelector(location.hash) ? location.hash : null) ||
    (menu.querySelector('[role="tab"][data-target]') ? menu.querySelector('[role="tab"][data-target]').getAttribute('data-target') : null) ||
    '#masivos-nacionales';
  panes.forEach(function(p){
    if (!p.hasAttribute('role')) p.setAttribute('role','tabpanel');
    if (!p.hasAttribute('tabindex')) p.setAttribute('tabindex','0');
  });
  activate(initial, { updateUrl: false });
});

// ============== Marcar activo “Servicios” si estamos en servicios.html ==============
document.addEventListener('DOMContentLoaded', function () {
  var isServicios = /(^|\/)servicios\.html(\?|#|$)/i.test(location.href);
  if (isServicios){
    document.querySelectorAll('.navbar-nav > li').forEach(function(li){ li.classList.remove('active'); });
    var ds = document.querySelector('.navbar-nav > li.dropdown-services');
    if (ds) ds.classList.add('active');
  }
});

// ===== CTA “Cotizar ahora”: abre correo con servicio activo =====
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('quote-btn');
  if (!btn) return;
  btn.addEventListener('click', function(e){
    e.preventDefault();
    var activePane = document.querySelector('.svc-content .tab-pane.active');
    var svcFromPane = activePane && activePane.querySelector('h2')
                   ? activePane.querySelector('h2').textContent.trim()
                   : '';
    var svcFromMenu = '';
    var actBtn = document.querySelector('#svc-menu [role="tab"].is-active');
    if (actBtn) svcFromMenu = (actBtn.textContent || '').replace(/\s+/g,' ').trim();
    var svc = svcFromPane || svcFromMenu || 'Servicios';
    var to = 'comercial@elhalconexpress.com';
    var subject = 'Solicitud de cotización — ' + svc;
    var body = [
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
    var mailto = 'mailto:' + to
               + '?subject=' + encodeURIComponent(subject)
               + '&body='    + encodeURIComponent(body);
    window.open(mailto, '_self');
  });
});

// Cerrar el menú colapsado al seleccionar un link (BS5)
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.getElementById('mainNav'); // el id que usamos en index.html
  if (!nav) return;

  var links = nav.querySelectorAll('.nav-link, .dropdown-item');
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      // Solo cerrar si estamos en vista colapsada (hamburguesa visible)
      var toggler = document.querySelector('.navbar-toggler');
      if (toggler && window.getComputedStyle(toggler).display !== 'none') {
        var instance = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav, { toggle: false });
        instance.hide();
      }
    });
  });
});

// --- Activa el link del menú según la sección visible ---
document.addEventListener('DOMContentLoaded', function () {
  // [sección a observar, href del link que debe activarse]
  const map = [
    ['slider',    '#menu'],      // "Inicio"
    ['about',     '#about'],
    ['cobertura', '#cobertura'],
    ['tracking',  '#tracking'],
    ['contact',   '#contact']
  ];

  const links = map
    .map(([_, href]) => document.querySelector(`a.nav-link[href="${href}"]`))
    .filter(Boolean);

  const clear = () => links.forEach(l => l.classList.remove('active'));

  const bySectionId = Object.fromEntries(
    map.map(([id, href]) => [id, document.querySelector(`a.nav-link[href="${href}"]`)])
  );

  const obs = new IntersectionObserver((entries) => {
    // El que tenga más intersección “gana”
    let top = null, ratio = 0;
    entries.forEach(e => {
      if (e.intersectionRatio > ratio) { ratio = e.intersectionRatio; top = e.target.id; }
    });
    if (top && bySectionId[top]) {
      clear();
      bySectionId[top].classList.add('active');
    }
  }, {
    // Compensa la navbar fija y decide “activo” cuando el bloque ocupa la zona central
    root: null,
    rootMargin: '-25% 0px -60% 0px',
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
  });

  map.forEach(([id]) => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
});

// ===== Dropdown Servicios: anti-doble-click + hover en escritorio =====
document.addEventListener('DOMContentLoaded', function () {
  const toggler = document.querySelector('.dropdown-services > .dropdown-toggle');
  if (!toggler) return;

  // Evita que el doble click lo deje en estado raro
  toggler.addEventListener('dblclick', function (e) {
    e.preventDefault(); e.stopPropagation();
  });

  // Evita salto por href="#" y usa la API de Bootstrap
  toggler.addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Dropdown.getOrCreateInstance(toggler).toggle();
  });

  // Hover (solo ≥992px) para una UX más fina en desktop
  const desktop = window.matchMedia('(min-width: 992px)');
  const dd = () => bootstrap.Dropdown.getOrCreateInstance(toggler);
  const item = toggler.parentElement;

  function bindHover() {
    if (!desktop.matches) return;
    item.addEventListener('mouseenter', () => dd().show());
    item.addEventListener('mouseleave', () => dd().hide());
  }
  bindHover();
  // Si cambias el ancho de ventana, reevalúa (opcional)
  desktop.addEventListener?.('change', () => dd().hide());
});
document.addEventListener('DOMContentLoaded', function () {
  const pre = document.getElementById('preloader');
  const box = pre?.querySelector('.lottie-box');
  if (!pre || !box || !window.lottie) return;

  const anim = lottie.loadAnimation({
    container: box,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'animations/truck.json',
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
  });

  // Secuencia de salida con fade:
  // 1) camión se desvanece (is-ending)
  // 2) se desvanece el fondo blanco (is-hidden)
  const fadeOutSequence = () => {
    if (pre.classList.contains('is-hidden')) return;  // evita doble ejecución
    pre.classList.add('is-ending');                   // fade camión
    setTimeout(() => {
      pre.classList.add('is-hidden');                 // fade overlay blanco
      setTimeout(() => { try { anim.destroy(); } catch(e){} pre.remove(); }, 650);
    }, 200); // encadenado suave
  };

  // Espera a que termine el ciclo actual de la animación
  const finishAndFade = () => {
    try { anim.loop = false; } catch(e){}
    const fallback = setTimeout(fadeOutSequence, 1500);   // por si no dispara 'complete'
    anim.addEventListener('complete', () => { clearTimeout(fallback); fadeOutSequence(); }, { once: true });
  };

  // Al terminar de cargar la página, lanzamos la secuencia
  window.addEventListener('load', finishAndFade, { once: true });

  // Si falla el JSON, no bloquees
  anim.addEventListener('data_failed', fadeOutSequence);

  // Failsafe
  setTimeout(() => { if (!pre.classList.contains('is-hidden')) fadeOutSequence(); }, 8000);
  // Siempre volver al tope al cargar
window.addEventListener('load', () => {
  // Si hay #ancla en la URL, lo quitamos para no saltar a secciones
  if (location.hash) {
    history.replaceState(null, document.title, location.pathname + location.search);
  }
  window.scrollTo(0, 0);
}, { once: true });

// Al volver con Back/Forward Cache (iOS/Chrome) fuerza tope
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.scrollTo(0, 0);
});
});


