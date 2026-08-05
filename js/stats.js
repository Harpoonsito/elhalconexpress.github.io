/* =========================================================
   EL HALCÓN EXPRESS — stats.js
   Sección de estadísticas: configuración centralizada +
   contadores animados que crecen automáticamente con el tiempo.
   ========================================================= */
(() => {
  'use strict';

  // -------- Configuración centralizada --------
  // startDate:      fecha (UTC) desde la que se calcula el crecimiento, "YYYY-MM-DD".
  // initialValue:   valor del contador exactamente en startDate.
  // dailyIncrement: cuánto crece el contador por cada día transcurrido desde startDate.
  // Para actualizar las estadísticas en el futuro, solo se debe editar este objeto.
  const STATS_CONFIG = {
    transportes: {
      startDate: '2025-01-01',
      initialValue: 20000,
      dailyIncrement: 8
    },
    envios: {
      startDate: '2025-01-01',
      initialValue: 35000,
      dailyIncrement: 14
    },
    toneladas: {
      startDate: '2025-01-01',
      initialValue: 18000,
      dailyIncrement: 6
    },
    clientes: {
      startDate: '2025-01-01',
      initialValue: 1200,
      dailyIncrement: 1.5
    }
  };

  const MS_PER_DAY = 86400000;

  const computeCurrentValue = ({ startDate, initialValue, dailyIncrement }) => {
    const start = Date.parse(startDate + 'T00:00:00Z');
    const daysElapsed = Math.max(0, Math.floor((Date.now() - start) / MS_PER_DAY));
    return Math.floor(initialValue + daysElapsed * dailyIncrement);
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

  document.addEventListener('DOMContentLoaded', function () {
    const section = document.getElementById('stats');
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
  });
})();
