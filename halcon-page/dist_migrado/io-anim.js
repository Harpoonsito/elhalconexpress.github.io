// IntersectionObserver to replace wow.js + waypoints/inview
(function(){
  if (!('IntersectionObserver' in window)) {
    // fallback: run immediately
    document.querySelectorAll('.wow').forEach(function(el){
      el.classList.add('animated');
    });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        e.target.classList.add('animated');
        obs.unobserve(e.target);
      }
    });
  }, {root: null, threshold: 0.1});
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.wow').forEach(function(el){
      obs.observe(el);
    });
  });
})();