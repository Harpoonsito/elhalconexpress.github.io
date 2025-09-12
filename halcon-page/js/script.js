(function ($, window, document) {
  'use strict';

  /* ============== Preloader ============== */
  $(window).on('load', function () {
    if ($('#pre-status').length)  $('#pre-status').fadeOut();
    if ($('#preloader').length)   $('#preloader').delay(350).fadeOut('slow');
  });

  /* ============== DOM Ready ============== */
  $(function () {

    /* ============== Smooth Scroll (solo .scroll) ============== */
    $('a.scroll').on('click', function (e) {
      var samePath = location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '');
      var sameHost = location.hostname === this.hostname;
      if (!(samePath && sameHost)) return;
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        e.preventDefault();
        $('html,body').animate({ scrollTop: target.offset().top - 50 }, 1000);
      }
    });

    /* ============== Navbar fija (agrega .on) ============== */
    $(window).on('scroll', function () {
      var navHeight = $(window).height() - 100;
      if ($(window).scrollTop() > navHeight) $('.navbar').addClass('on');
      else $('.navbar').removeClass('on');
    });

    /* ============== Tooltips (Bootstrap) ============== */
    if ($.fn.tooltip) $('[data-toggle="tooltip"]').tooltip();

    /* ============== Owl — SOLO logos de clientes ============== */
    if ($.fn.owlCarousel && $('#client-slider').length) {
      $('#client-slider').owlCarousel({
        itemsCustom: [[0,2],[450,3],[600,3],[700,4],[1000,5],[1200,5],[1400,5],[1600,5]],
        autoPlay: 3000,
        pagination: false,
        navigation: false
      });
    }

    /* ============== Contadores #fun-facts ============== */
    (function () {
      var funFacts = document.querySelector('#fun-facts');
      if (!funFacts) return;

      if ('IntersectionObserver' in window) {
        var obsCounters = new IntersectionObserver(function (entries) {
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
            obsCounters.disconnect();
          });
        }, { threshold: 0.3 });
        obsCounters.observe(funFacts);
      } else {
        funFacts.querySelectorAll('.timer').forEach(function (el) {
          el.textContent = (el.textContent || '0').replace(/[^\d]/g, '');
        });
      }
    })();

    /* ============== Animación del mapa por IO ============== */
    (function () {
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
    })();

    /* ============== Menú móvil overlay opcional ============== */
    if ($('.menu-trigger').length && $('.mobilenav').length) {
      $('.menu-trigger, .mobilenav').on('click', function () {
        $('.mobilenav').fadeToggle(500);
        $('.top-menu').toggleClass('top-animate');
        $('.mid-menu').toggleClass('mid-animate');
        $('.bottom-menu').toggleClass('bottom-animate');
      });
      $('.mobilenav li, .back-to-top').on('click', function () {
        var target = $(this).data('rel'); var $t = $(target);
        if ($t.length) $('html, body').stop().animate({ scrollTop: $t.offset().top }, 900, 'swing');
      });
    }

    /* Cerrar menú colapsado tras elegir una opción (navbar Bootstrap) */
    $('.navbar-collapse').on('click', 'a:not(.dropdown-toggle)', function(){
      var $collapse = $(this).closest('.navbar-collapse');
      if ($collapse.hasClass('in')) $collapse.collapse('hide');
    });

    /* ============== Evitar scroll horizontal ============== */
    $('body').css('overflow-x', 'hidden');

    /* ============== Altura del iframe del mapa (contacto) ============== */
    function ajustarAlturaMapa() {
      var info = document.getElementById("info-contacto");
      var mapa = document.getElementById("mapa");
      if (!info || !mapa) return;
      var h = info.offsetHeight;
      mapa.style.height = (h > 320 ? h : 320) + "px";
    }
    $(window).on('load resize', ajustarAlturaMapa);
    if ('ResizeObserver' in window) {
      var infoRO = document.getElementById("info-contacto");
      if (infoRO) new ResizeObserver(ajustarAlturaMapa).observe(infoRO);
    }

    /* ============== Rastreo de envíos ============== */
    (function(){
      var ENDPOINT = 'https://script.google.com/macros/s/AKfycbynAcFY19fLjkAhGgBV4B0HdOZMeSlJ51UmV9VlXA3Qdd8gBz_nXGz94gy3LZGBYoEO/exec';
      var TOKEN    = 'x6Zy2iY_7mQvK4R9bP1tN8UwV3fH5cJ0Lr2Sx9AaE7gMd4Tq';

      var $form  = $('#tracking-form');
      var $input = $('#trackingNumber');
      var $res   = $('#trackingResult');
      if (!$form.length || !$input.length || !$res.length) return;

      var $btn = $form.find('button[type="submit"]');
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

      function msg(html) { $res.html('<div class="track-msg">' + html + '</div>'); }

      function card(r) {
        var estado = (r.estado || '').toString().trim().toUpperCase();
        var fecha  = formatearFechaLocal(r.fecha);
        var waPhone = '573006965535';
        var waText  = encodeURIComponent('Hola, quiero más información sobre mi envío con número de guía ' + (r.guia || '') + '.');
        var waLink  = 'https://wa.me/' + waPhone + '?text=' + waText;

        $res.html(
          '<div class="track-card">' +
            '<h3>Estado de tu envío</h3>' +
            '<p><strong>Guía:</strong> ' + (r.guia || '-') + '</p>' +
            '<p><strong>Cliente:</strong> ' + (r.nombre || '-') + '</p>' +
            '<p><strong>Estado:</strong> <span class="estado">' + (estado || '-') + '</span></p>' +
            '<p><strong>Actualizado:</strong> ' + fecha + '</p>' +
            '<p style="margin-top:12px">' +
              '<a class="btn-whatsapp" href="' + waLink + '" target="_blank" rel="noopener">Más información por WhatsApp</a>' +
            '</p>' +
          '</div>'
        );
      }

      async function rastrear(guia) {
        if (!guia) { msg('<span style="color:#a00">Ingresa un número de guía.</span>'); $input.focus(); return; }
        msg('Buscando…');
        if ($btn.length) $btn.prop('disabled', true);
        $input.prop('readOnly', true);

        try {
          var url = ENDPOINT + '?guia=' + encodeURIComponent(guia) + '&token=' + TOKEN;
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
          if ($btn.length) $btn.prop('disabled', false);
          $input.prop('readOnly', false);
        }
      }

      $form.on('submit', function(e){
        e.preventDefault();
        rastrear(($input.val() || '').trim());
      });
    })();

    /* ============== /servicios: CHIPS sticky (layout anterior) ============== */
    (function(){
      var nav = document.getElementById('services-nav');
      if (!nav) return;

      function headerOffset() {
        var $nb = $('.navbar.navbar-fixed-top');
        return ($nb.length ? $nb.outerHeight() : 70) || 70;
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
    })();

    /* ============== /servicios: SIDEBAR con pestañas (sin scroll) ============== */
    (function(){
      var $menu  = $('#svc-menu');
      var $panes = $('.svc-content .tab-pane');
      if (!$menu.length || !$panes.length) return;

      // DELEGACIÓN de eventos: captura cualquier botón futuro con data-target
      $menu.on('click', '[role="tab"][data-target]', function(e){
        e.preventDefault();             // no navegar
        var targetSelector = $(this).data('target');
        activate(targetSelector, { updateUrl: true });
      });

      // Triggers del dropdown (navbar)
      $(document).on('click', 'a.svc-trigger[data-target]', function(e){
        e.preventDefault();
        activate($(this).data('target'), { updateUrl: true });
        $('.dropdown.open .dropdown-toggle').dropdown('toggle');
      });

      // Core: activar panel SIN scroll
      function activate(targetSelector, opts){
        opts = opts || {};
        var $target = $(targetSelector);
        if (!$target.length) return;

        // Estado en menú
        $menu.find('[role="tab"][data-target]').each(function(){
          var $btn = $(this);
          var on = $btn.data('target') === targetSelector;
          $btn.toggleClass('is-active', on)
              .attr('aria-selected', on ? 'true' : 'false')
              .closest('li').toggleClass('active', on);
        });

        // Paneles
        $panes.removeClass('in active').attr('aria-hidden','true');
        $target.addClass('active');
        setTimeout(function(){ $target.addClass('in'); }, 10);
        $target.attr('aria-hidden','false');

        // Foco accesible sin mover página
        var h2 = $target.find('h2')[0] || $target[0];
        if (h2 && h2.focus) h2.focus({ preventScroll: true });

        // No navegamos a hash para evitar scroll (opcional: comentar si quieres URL con hash)
        if (opts.updateUrl && history && history.replaceState) {
          history.replaceState(null, '', targetSelector);
        }
      }

      // Estado inicial robusto
      var initial =
        (location.hash && $(location.hash).length ? location.hash : null) ||
        ($menu.find('[role="tab"][data-target]').first().data('target')) ||
        '#masivos-nacionales';

      // ARIA mínimo en paneles
      $panes.each(function(){
        var $p = $(this);
        if (!$p.attr('role')) $p.attr('role','tabpanel');
        if (!$p.attr('tabindex')) $p.attr('tabindex','0');
      });

      activate(initial, { updateUrl: false });
    })();

    /* ============== Marcar activo “Servicios” si estamos en servicios.html ============== */
    (function(){
      var isServicios = /(^|\/)servicios\.html(\?|#|$)/i.test(location.href);
      if (isServicios){
        $('.navbar-nav > li').removeClass('active');
        $('.navbar-nav > li.dropdown-services').addClass('active');
      }
    })();

    /* ===== CTA “Cotizar ahora”: abre correo con servicio activo ===== */
    (function(){
      var btn = document.getElementById('quote-btn');
      if (!btn) return;

      btn.addEventListener('click', function(e){
        e.preventDefault();

        // 1) Preferimos el H2 del panel activo
        var activePane = document.querySelector('.svc-content .tab-pane.active');
        var svcFromPane = activePane && activePane.querySelector('h2')
                       ? activePane.querySelector('h2').textContent.trim()
                       : '';

        // 2) Fallback: texto del item activo del menú (botón)
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
    })();
    

  }); // DOM Ready

})(jQuery, window, document);

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


