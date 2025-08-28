(function ($) {
  'use strict';

  /* ===================== Preloader ===================== */
  $(window).on('load', function () {
    if ($('#pre-status').length)  $('#pre-status').fadeOut();
    if ($('#preloader').length)   $('#preloader').delay(350).fadeOut('slow');
  });

  $(function () {

    /* ===================== Smooth Scroll ===================== */
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

    /* ===================== Navbar fija ===================== */
    $(window).on('scroll', function () {
      var navHeight = $(window).height() - 100;
      if ($(window).scrollTop() > navHeight) $('.navbar').addClass('on');
      else $('.navbar').removeClass('on');
    });

    /* ===================== Tooltips (Bootstrap) ===================== */
    if ($.fn.tooltip) $('[data-toggle="tooltip"]').tooltip();

    /* ===================== Owl — SOLO logos de clientes ===================== */
    if ($.fn.owlCarousel && $('#client-slider').length) {
      $('#client-slider').owlCarousel({
        itemsCustom: [
          [0, 2], [450, 3], [600, 3], [700, 4],
          [1000, 5], [1200, 5], [1400, 5], [1600, 5]
        ],
        autoPlay: 3000,
        pagination: false,   // sin dots (no hace falta owl.theme.css)
        navigation: false    // sin flechas del theme
      });
    }

    /* ===== Contadores de #fun-facts (sin inview/waypoints) ===== */
    if ('IntersectionObserver' in window) {
      var funFacts = document.querySelector('#fun-facts');
      if (funFacts) {
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
      }
    } else {
      // Fallback simple
      document.querySelectorAll('#fun-facts .timer').forEach(function (el) {
        el.textContent = (el.textContent || '0').replace(/[^\d]/g, '');
      });
    }

    /* ===================== Animación del mapa por IO ===================== */
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

    /* ===================== Menú móvil ===================== */
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

    /* ===================== Evitar scroll horizontal ===================== */
    $('body').css('overflow-x', 'hidden');
  });

})(jQuery);

/* ===================== Altura del iframe del mapa ===================== */
(function () {
  function ajustarAlturaMapa() {
    var info = document.getElementById("info-contacto");
    var mapa = document.getElementById("mapa");
    if (!info || !mapa) return;
    var h = info.offsetHeight;
    mapa.style.height = (h > 320 ? h : 320) + "px";
  }
  window.addEventListener("load", ajustarAlturaMapa);
  window.addEventListener("resize", ajustarAlturaMapa);
  if ("ResizeObserver" in window) {
    var info = document.getElementById("info-contacto");
    var ro = new ResizeObserver(ajustarAlturaMapa);
    if (info) ro.observe(info);
  }
})();

// === Rastreo de envíos ===
document.addEventListener('DOMContentLoaded', () => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbynAcFY19fLjkAhGgBV4B0HdOZMeSlJ51UmV9VlXA3Qdd8gBz_nXGz94gy3LZGBYoEO/exec';
  const TOKEN    = 'x6Zy2iY_7mQvK4R9bP1tN8UwV3fH5cJ0Lr2Sx9AaE7gMd4Tq';

  const form   = document.getElementById('tracking-form');
  const input  = document.getElementById('trackingNumber');
  const result = document.getElementById('trackingResult');
  if (!form || !input || !result) return;

  const btn = form.querySelector('button[type="submit"]');

  // Formatea ISO 8601 -> "dd/mm/aaaa HH:mm:ss" en America/Bogota
  const TZ = 'America/Bogota';
  function formatearFechaLocal(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return String(iso); // por si ya viene como texto
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(d);
  }

  function msg(html) {
    result.innerHTML = `<div class="track-msg">${html}</div>`;
  }

  function card(r) {
    const estado = (r.estado || '').toString().trim().toUpperCase();
    const fecha  = formatearFechaLocal(r.fecha);

    // WhatsApp dinámico con la guía
    const waPhone = '573006965535'; // sin + ni espacios
    const waText  = encodeURIComponent(
      `Hola, quiero más información sobre mi envío con número de guía ${r.guia || ''}.`
    );
    const waLink  = `https://wa.me/${waPhone}?text=${waText}`;

    result.innerHTML = `
      <div class="track-card">
        <h3>Estado de tu envío</h3>
        <p><strong>Guía:</strong> ${r.guia || '-'}</p>
        <p><strong>Cliente:</strong> ${r.nombre || '-'}</p>
        <p><strong>Estado:</strong> <span class="estado">${estado || '-'}</span></p>
        <p><strong>Actualizado:</strong> ${fecha}</p>
        <p style="margin-top:12px">
          <a class="btn-whatsapp" href="${waLink}" target="_blank" rel="noopener">
            Más información por WhatsApp
          </a>
        </p>
      </div>`;
  }

  async function rastrear(guia) {
    if (!guia) {
      msg('<span style="color:#a00">Ingresa un número de guía.</span>');
      input.focus();
      return;
    }
    msg('Buscando…');
    if (btn) btn.disabled = true;
    input.readOnly = true;

    try {
      const url = `${ENDPOINT}?guia=${encodeURIComponent(guia)}&token=${TOKEN}`;
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

  // Envío del formulario (incluye Enter)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    rastrear((input.value || '').trim());
  });
});

