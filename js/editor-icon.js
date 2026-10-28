/* Iconos / Emojis: reemplazar por imagen que ocupe su espacio */
import { $ } from './utils.js';

export function applyIconEditing(editor) {
  editor.detectIconElements = function(doc) {
    if (!doc || !doc.body) return [];
    const result = [];
    const ICON_CLASSES = ['bi','fas','far','fal','fad','fab','icon','ico','emoji'];
    doc.body.querySelectorAll('*').forEach(el => {
      if (['IMG','INPUT','BUTTON'].includes(el.tagName)) return;
      if (el.closest('svg,script,style,noscript')) return;
      const cls = el.className || '';
      const isIcon = cls.split(' ').some(c => ICON_CLASSES.includes(c)) ||
                     cls.includes('bi-') || cls.includes('fa-') || cls.includes('icon-');
      const isEmoji = el.childElementCount === 0 &&
                      el.textContent.trim().length > 0 &&
                      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/u.test(el.textContent.trim());
      if (isIcon || isEmoji) result.push(el);
    });
    return result;
  };

  editor.replaceIconWithImage = function(el) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const im = new Image();
        im.onload = () => {
          const M = 400;
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
          const rect = el.getBoundingClientRect();
          const w = rect.width || 40;
          const h = rect.height || 40;
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.width = w + 'px';
          wrapper.style.height = h + 'px';
          wrapper.style.overflow = 'hidden';
          wrapper.style.verticalAlign = 'middle';
          const img = document.createElement('img');
          img.src = data;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.display = 'block';
          img.setAttribute('data-cw-img', '1');
          img.alt = el.getAttribute('aria-label') || '';
          wrapper.appendChild(img);
          el.parentNode.replaceChild(wrapper, el);
          $('#edEstado').textContent = 'Cambios sin guardar';
          editor.schedulePush();
          if (editor.onChange) editor.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  };

  editor.setupIconButton = function() {
    let btn = $('#btnIconoImg');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btnIconoImg';
      btn.type = 'button';
      btn.className = 'neu-btn';
      btn.style.padding = '.4rem .8rem';
      btn.style.fontSize = '.85rem';
      btn.textContent = 'Icono';
      btn.title = 'Reemplazar icono o emoji por imagen';
      const btnNavbar = $('#btnNavbarImg');
      if (btnNavbar && btnNavbar.parentNode) {
        btnNavbar.parentNode.insertBefore(btn, btnNavbar.nextSibling);
      } else {
        const cont = $('#editor')?.querySelector('.d-flex.gap-2.mt-3, .editor-actions');
        if (cont) cont.appendChild(btn);
      }
    }
    btn.onclick = () => {
      const doc = $('#frame').contentDocument;
      if (!doc) return;
      const icons = this.detectIconElements(doc);
      if (!icons.length) {
        alert('No se encontraron iconos o emojis reemplazables.');
        return;
      }
      const select = document.createElement('select');
      select.className = 'neu-input';
      select.style.padding = '.4rem .6rem';
      select.style.fontSize = '.85rem';
      icons.forEach((el, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        const cls = el.className || '';
        const txt = el.textContent.trim().substring(0, 20);
        const label = txt ? txt : (cls || el.tagName.toLowerCase());
        opt.textContent = label + (cls && txt ? '  [' + cls + ']' : '') + '  →  ' + el.tagName;
        select.appendChild(opt);
      });
      const reemplazar = () => {
        const idx = parseInt(select.value, 10);
        if (!isNaN(idx) && icons[idx]) this.replaceIconWithImage(icons[idx]);
      };
      const dlg = document.createElement('div');
      dlg.style.position = 'fixed';
      dlg.style.top = '50%';
      dlg.style.left = '50%';
      dlg.style.transform = 'translate(-50%, -50%)';
      dlg.style.background = '#fff';
      dlg.style.padding = '1rem';
      dlg.style.borderRadius = '12px';
      dlg.style.boxShadow = '0 6px 18px rgba(0,0,0,.25)';
      dlg.style.zIndex = '10000';
      dlg.style.display = 'flex';
      dlg.style.flexDirection = 'column';
      dlg.style.gap = '.6rem';
      dlg.style.fontFamily = 'inherit';
      dlg.style.maxWidth = '340px';
      const t = document.createElement('div');
      t.textContent = 'Selecciona el icono o emoji a reemplazar';
      t.style.fontWeight = '600';
      t.style.fontSize = '.9rem';
      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.gap = '.5rem';
      c.style.justifyContent = 'center';
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = 'Reemplazar por imagen';
      ok.className = 'neu-btn primary';
      ok.style.padding = '.4rem .8rem';
      ok.onclick = () => { reemplazar(); document.body.removeChild(dlg); };
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = 'Cancelar';
      cancel.className = 'neu-btn';
      cancel.style.padding = '.4rem .8rem';
      cancel.onclick = () => document.body.removeChild(dlg);
      dlg.appendChild(t);
      dlg.appendChild(select);
      c.appendChild(ok);
      c.appendChild(cancel);
      dlg.appendChild(c);
      document.body.appendChild(dlg);
      select.focus();
    };
  };
}