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

      /* ============== /servicios: SIDEBAR con pestañas (layout nuevo) ============== */
      (function(){
        var $menu = $('#svc-menu');
        if (!$menu.length) return; // sólo corre si existe el sidebar

        function showFromHash(){
          var hash = window.location.hash || '#transporte-urbano';
          var $link = $menu.find('a[href="'+hash+'"][data-toggle="tab"]');
          if ($link.length) $link.tab('show');
          else $menu.find('li:first-child a[data-toggle="tab"]').tab('show');
        }

        // init
        showFromHash();

        // click en pestañas del sidebar
        $menu.on('click','a[data-toggle="tab"]',function(e){
          e.preventDefault();
          $(this).tab('show');
        });

        // actualizar hash + scroll al inicio del contenido
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
          var target = $(e.target).attr('href');
          history.replaceState(null,'',target);
          var $anchor = $('#svc-tabs-top');
          if ($anchor.length){
            var offset = ($('.navbar.navbar-fixed-top').outerHeight() || 70);
            $('html,body').animate({scrollTop: $anchor.offset().top - offset}, 300);
          }
        });

        // responder a cambios del hash (atrás/adelante)
        $(window).on('hashchange', showFromHash);
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
  if (!btn) return; // si no está el botón, no hace nada

  btn.addEventListener('click', function(e){
    // si quieres forzar dinámico siempre, deja preventDefault;
    // si prefieres que el fallback funcione si algo falla, puedes quitarlo.
    e.preventDefault();

    // 1) Intenta leer el <h2> de la pestaña visible
    var activePane = document.querySelector('.svc-content .tab-pane.active');
    var svcFromPane = activePane && activePane.querySelector('h2')
                       ? activePane.querySelector('h2').textContent.trim()
                       : '';

    // 2) Fallback: toma el texto del item activo del menú lateral
    var svcFromMenu = '';
    var act = document.querySelector('#svc-menu li.active > a');
    if (act) {
      svcFromMenu = (act.textContent || '').replace(/\s+/g,' ').trim();
    }

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

    // Usar _self mejora compatibilidad en algunos navegadores
    window.open(mailto, '_self');
  });
})();


    }); // DOM Read

  })(jQuery, window, document);
