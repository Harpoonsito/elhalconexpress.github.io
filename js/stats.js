/* =========================================================
   EL HALCÓN EXPRESS — stats.js
   Motor único de contadores dinámicos, reutilizable por cualquier
   sección de cifras del sitio (hoy: #fun-facts): configuración
   centralizada + animación al entrar en viewport.
   ========================================================= */
(() => {
  'use strict';

  // -------- Configuración centralizada --------
  // Tipo "growth" (por defecto): valor = initialValue + días_transcurridos × dailyIncrement.
  //   startDate:      fecha (UTC) desde la que se calcula el crecimiento, "YYYY-MM-DD".
  //   initialValue:   valor del contador exactamente en startDate.
  //   dailyIncrement: cuánto crece el contador por cada día transcurrido desde startDate.
  // Tipo "years-since": años completos transcurridos desde foundingDate (sin editar cada año).
  //   foundingDate:   fecha de fundación, "YYYY-MM-DD".
  //
  // Si la misma métrica se muestra en más de una sección, basta con usar la misma
  // clave en su `data-stat-key` para que el número mostrado sea siempre igual.
  // Para actualizar cualquier estadística a futuro, solo se debe editar este objeto.
  const STATS_CONFIG = {
    transportes: {
      startDate: '2025-01-01',
      initialValue: 20000,
      dailyIncrement: 8
    },
    toneladas: {
      startDate: '2025-01-01',
      initialValue: 250000,
      dailyIncrement: 150
    },
    kilometros: {
      startDate: '2025-01-01',
      initialValue: 6000000,
      dailyIncrement: 5000
    },
    aniosExperiencia: {
      type: 'years-since',
      foundingDate: '2021-01-01'
    }
  };

  const MS_PER_DAY = 86400000;

  const computeCurrentValue = (config) => {
    if (config.type === 'years-since') {
      const founding = new Date(config.foundingDate + 'T00:00:00Z');
      const now = new Date();
      let years = now.getUTCFullYear() - founding.getUTCFullYear();
      const anniversaryPassed =
        now.getUTCMonth() > founding.getUTCMonth() ||
        (now.getUTCMonth() === founding.getUTCMonth() && now.getUTCDate() >= founding.getUTCDate());
      if (!anniversaryPassed) years -= 1;
      return Math.max(0, years);
    }
    const start = Date.parse(config.startDate + 'T00:00:00Z');
    const daysElapsed = Math.max(0, Math.floor((Date.now() - start) / MS_PER_DAY));
    return Math.floor(config.initialValue + daysElapsed * config.dailyIncrement);
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el, target, duration = 1800) => {
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const value = Math.floor(easeOutCubic(progress) * target);
      el.textContent = value.toLocaleString('es-CO');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('es-CO');
    };
    requestAnimationFrame(step);
  };

  // Activa los contadores `.js-counter[data-stat-key]` de una sección la primera
  // vez que entra en el viewport. Reutilizable por cualquier sección de cifras.
  const initCounterSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const counters = section.querySelectorAll('.js-counter[data-stat-key]');
    if (!counters.length) return;

    let hasRun = false;
    const runAnimations = () => {
      if (hasRun) return;
      hasRun = true;
      counters.forEach((el) => {
        const config = STATS_CONFIG[el.getAttribute('data-stat-key')];
        if (!config) return;
        animateCounter(el, computeCurrentValue(config));
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runAnimations();
          obs.disconnect();
        });
      }, { threshold: 0.3 });
      observer.observe(section);
    } else {
      runAnimations();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initCounterSection('fun-facts');
  });
})();
