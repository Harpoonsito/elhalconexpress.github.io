(function () {
  'use strict';

  // ===== CONFIGURACIÓN BACKEND =====
  var BACKEND = 'apps_script'; // 'apps_script' | 'formspree'

  // Google Apps Script (tu Web App /exec)
  var ENDPOINT = 'https://halconexpress-contacto.elhalconexpress.workers.dev/';
  var TOKEN    = ''; // opcional. Si luego proteges con token, ponlo aquí y en Code.gs

  // Formspree (opcional, si lo usas más adelante)
  var FORMSPREE_ACTION = 'https://formspree.io/f/________';

  // ===== UTILIDADES UI =====
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function showStatus(type, html){
    var box = $('#cp-status');
    if (!box) return;
    if (!type) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<div class="cp-alert '+(type==='ok'?'ok':'err')+'">' +
      '<i class="fa '+(type==='ok'?'fa-check-circle':'fa-exclamation-circle')+'"></i>' +
      '<div>'+ html +'</div></div>';
  }

  function setError(field, msg){
    var wrap = field.closest('.cp-field');
    if (!wrap) return;
    var err = $('.cp-error', wrap);
    if (err) err.textContent = msg || '';
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validateField(field){
    setError(field, '');
    if (field.hasAttribute('required') && !String(field.value||'').trim()){
      setError(field, 'Este campo es obligatorio.'); return false;
    }
    if (field.type === 'email' && field.value){
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      if (!ok){ setError(field,'Ingresa un correo válido.'); return false; }
    }
    if (field.id === 'cp-consent' && !field.checked){
      setError(field,'Debes autorizar el tratamiento de datos.'); return false;
    }
    return true;
  }

  function validateForm(form){
    var fields = $all('#cp-form .cp-control, #cp-form textarea, #cp-form #cp-consent');
    var first = null, ok = true;
    fields.forEach(function(f){
      var valid = validateField(f);
      if (!valid && !first) first = f;
      ok = ok && valid;
    });
    if (!ok && first) first.focus();
    return ok;
  }

  // ===== AUTOSAVE (localStorage) =====
  var LS_KEY = 'ehx-contact-draft';
  function saveDraft(){
    try{
      var fd = new FormData($('#cp-form'));
      var obj = Object.fromEntries(fd.entries());
      obj._ts = Date.now();
      localStorage.setItem(LS_KEY, JSON.stringify(obj));
    }catch(e){}
  }
  function loadDraft(){
    try{
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (Date.now() - (data._ts||0) > 30*60*1000){ localStorage.removeItem(LS_KEY); return; }
      Object.keys(data).forEach(function(k){
        if (k === '_ts') return;
        var el = $('[name="'+k+'"]');
        if (!el) return;
        if (el.type === 'checkbox') el.checked = (data[k]==='on'||data[k]===true);
        else el.value = data[k];
      });
    }catch(e){}
  }

  // ===== ENVÍO =====
  function toPayload(form){
    var data = Object.fromEntries(new FormData(form).entries());
    delete data.website; // honeypot
    data._ts = new Date().toISOString();
    data._platform = 'web';
    return data;
  }

  function sendAppsScript(payload){
    var url = new URL(ENDPOINT);
    if (TOKEN) url.searchParams.set('token', TOKEN);
    return fetch(url.toString(), {
      method: 'POST',
      headers: {'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify(payload),
      cache: 'no-store'
    }).then(function(r){
      if (!r.ok) throw new Error('http '+r.status);
      return r.json();
    }).then(function(data){
      if (!data || !data.ok) throw new Error((data&&data.error)||'No se pudo enviar');
      return data;
    });
  }

  function sendFormspree(form){
    form.action = FORMSPREE_ACTION;
    form.method = 'POST';
    if (!form.querySelector('input[name="_subject"]')){
      var subj = document.createElement('input');
      subj.type = 'hidden'; subj.name = '_subject';
      subj.value = 'Nuevo contacto desde elhalconexpress.com';
      form.appendChild(subj);
    }
    form.submit();
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function(){
    loadDraft();

    var qsService = new URLSearchParams(location.search).get('servicio');
    if (qsService){
      var svcField = $('#cp-service');
      if (svcField){
        var targetText = qsService.trim();
        var match = Array.from(svcField.options).find(function(opt){
          return opt.textContent.trim().localeCompare(targetText, undefined, { sensitivity: 'base' }) === 0;
        });
        if (match){
          svcField.value = match.value || match.textContent.trim();
        }
      }
    }

    $all('#cp-form .cp-control, #cp-form textarea, #cp-form #cp-consent').forEach(function(el){
      el.addEventListener('input', function(){ setError(el,''); saveDraft(); });
      el.addEventListener('blur', function(){ validateField(el); });
    });

    var form = $('#cp-form');
    // toma el submit real del formulario (no dependemos de id)
    var sendBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('reset', function(){
      setTimeout(function(){
        $all('.cp-error').forEach(function(e){ e.textContent=''; });
        showStatus('', '');
        localStorage.removeItem(LS_KEY);
      }, 0);
    });

    // Formato ligero de teléfono
    var phone = $('#cp-phone');
    if (phone){
      phone.addEventListener('input', function(){
        var v = phone.value.replace(/[^\d+]/g,'');
        if (v.startsWith('+')) v = '+' + v.slice(1).replace(/[^\d]/g,'');
        phone.value = v;
      });
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      showStatus('', '');
      if (form.website && form.website.value) return; // bot

      if (!validateForm(form)) return;

      if (sendBtn) sendBtn.classList.add('is-loading');

      if (BACKEND === 'apps_script'){
        sendAppsScript(toPayload(form))
          .then(function(){
            form.reset();
            localStorage.removeItem(LS_KEY);
            showStatus('ok','¡Gracias! Hemos recibido tu solicitud.');
          })
          .catch(function(err){
            console.error(err);
            showStatus('err','No pudimos enviar tu mensaje. Intenta de nuevo o contáctanos por WhatsApp.');
          })
          .finally(function(){ if (sendBtn) sendBtn.classList.remove('is-loading'); });
      } else {
        if (sendBtn) sendBtn.classList.remove('is-loading');
        sendFormspree(form);
      }
    });
  });
})();
