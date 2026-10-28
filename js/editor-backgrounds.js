/* Fondos de sección: detectar y reemplazar cualquier background-image */
import { $ } from './utils.js';

export function applyBackgroundEditing(editor) {
  editor._bgSections = [];

  editor.detectBackgroundSections = function(doc) {
    if (!doc || !doc.body) return [];
    const result = [];
    const seen = new Set();

    const addIfBg = (el) => {
      if (!el || seen.has(el)) return;
      if (el.closest('svg,script,style,noscript')) return;
      const bgImage =
        el.style.backgroundImage ||
        (doc.defaultView.getComputedStyle(el).backgroundImage || '');
      const bgShorthand = el.style.background || '';
      const hasBg = (bgImage && bgImage !== 'none' && bgImage.includes('url(')) ||
                    (bgShorthand && bgShorthand !== 'none' && bgShorthand.includes('url('));
      if (hasBg) {
        seen.add(el);
        result.push(el);
      }
    };

    doc.body.querySelectorAll('*').forEach(addIfBg);

    // Fallback: si getComputedStyle no devuelve nada (CSS externo no cargado),
    // buscar por estilos inline con background y por clases/id relacionados
    if (result.length === 0) {
      const selectors = [
        '[style*="background"]', '[style*="BACKGROUND"]',
        '[class*="bg"]', '[class*="background"]', '[class*="hero"]',
        '[class*="section"]', '[class*="banner"]', '[id*="hero"]',
        '[id*="banner"]', '[id*="bg"]', '[id*="background"]'
      ];
      selectors.forEach(sel => {
        doc.querySelectorAll(sel).forEach(addIfBg);
      });
    }

    // También el body si tiene fondo
    addIfBg(doc.body);
    return result;
  };

  editor.markAllBackgrounds = function(doc) {
    if (!doc || !doc.body) return;
    const sections = this.detectBackgroundSections(doc);
    sections.forEach(el => el.setAttribute('data-cw-bg-img', '1'));
    this._bgSections = sections;
  };

  editor.forceReplaceBackground = function(el) {
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
          const M = 1600;
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data =
            f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
          el.style.setProperty('background-image', `url(${data})`, 'important');
          el.style.setProperty('background-size', 'cover', 'important');
          el.style.setProperty('background-position', 'center', 'important');
          el.style.setProperty('background-repeat', 'no-repeat', 'important');
          el.setAttribute('data-cw-bg-img', '1');
          $('#edEstado').textContent = 'Cambios sin guardar';
          this.schedulePush();
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  };

  editor.replaceSectionBackground = function(el) {
    this.forceReplaceBackground(el);
  };

  editor.setupGeneralBackgroundButton = function() {
    let btn = $('#btnFondoGeneral');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btnFondoGeneral';
      btn.type = 'button';
      btn.className = 'neu-btn';
      btn.style.padding = '.4rem .8rem';
      btn.style.fontSize = '.85rem';
      btn.textContent = 'Fondo General';
      btn.title = 'Reemplazar fondo general de la página (aparte del hero)';
      const btnHero = $('#btnHeroFondo');
      if (btnHero && btnHero.parentNode) {
        btnHero.parentNode.insertBefore(btn, btnHero.nextSibling);
      } else {
        const cont = $('#editor')?.querySelector('.d-flex.gap-2.mt-3, .editor-actions');
        if (cont) cont.appendChild(btn);
      }
    }

    btn.onclick = () => {
      const doc = $('#frame').contentDocument;
      if (!doc) return;
      let layers = this.detectBackgroundSections(doc);
      // Excluir el hero (tiene su propio editor)
      layers = layers.filter(el => !el.matches('.hero, #hero, [id*="hero"], [class*="hero"], [id*="banner"], [class*="banner"]'));
      if (!layers.length) {
        // Fallback: usar el body
        layers = [doc.body];
      }
      if (layers.length === 1) {
        this.forceReplaceBackground(layers[0]);
        layers[0].setAttribute('data-cw-bg-img', '1');
        return;
      }

      const select = document.createElement('select');
      select.className = 'neu-input';
      select.style.padding = '.4rem .6rem';
      select.style.fontSize = '.85rem';
      layers.forEach((el, i) => {
        const name = el.id || el.className || el.tagName.toLowerCase() + ' #' + (i + 1);
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name + '  →  ' + el.tagName;
        select.appendChild(opt);
      });

      const preview = document.createElement('img');
      preview.style.width = '100%';
      preview.style.height = '120px';
      preview.style.objectFit = 'cover';
      preview.style.borderRadius = '8px';
      preview.style.background = '#eee';
      const updatePreview = () => {
        const idx = parseInt(select.value, 10);
        const el = layers[idx];
        if (!el) return;
        const bg = el.style.backgroundImage || (doc.defaultView.getComputedStyle(el).backgroundImage || '');
        const m = bg.match(/url\(["']?(.*?)["']?\)/);
        preview.src = m ? m[1] : '';
      };
      select.addEventListener('change', updatePreview);
      updatePreview();

      const reemplazar = () => {
        const idx = parseInt(select.value, 10);
        if (!isNaN(idx) && layers[idx]) {
          this.forceReplaceBackground(layers[idx]);
          layers[idx].setAttribute('data-cw-bg-img', '1');
        }
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
      t.textContent = 'Selecciona la capa de fondo a reemplazar';
      t.style.fontWeight = '600';
      t.style.fontSize = '.9rem';

      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.gap = '.5rem';
      c.style.justifyContent = 'center';

      const ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = 'Reemplazar fondo';
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
      dlg.appendChild(preview);
      c.appendChild(ok);
      c.appendChild(cancel);
      dlg.appendChild(c);
      document.body.appendChild(dlg);
      select.focus();
    };
  };

  editor.replacePageBackground = function(doc) {
    const target = doc && doc.body;
    if (!target) return;
    this.forceReplaceBackground(target);
    target.setAttribute('data-cw-bg-img', '1');
  };

  editor.markPageBackground = function(doc) {
    if (!doc || !doc.body) return;
    doc.body.setAttribute('data-cw-bg-img', '1');
  };
}
