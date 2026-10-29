/* Editor Hero: reemplazo de imagen de fondo de la sección principal */
import { $ } from './utils.js';

export function applyHeroEditing(editor) {
  editor.detectHeroContainer = function(doc) {
    if (!doc || !doc.body) return null;

    // 1. Por clase o id relacionado con hero
    const bySelector = doc.querySelector(
      '.hero, #hero, [id*="hero"], [class*="hero"], [id*="banner"], [class*="banner"]'
    );
    if (bySelector) return bySelector;

    // 2. Primer contenedor grande con background-image real (no gradiente)
    const tags = ['section', 'main', 'header', 'div'];
    for (const tag of tags) {
      const els = doc.querySelectorAll(tag);
      for (const el of els) {
        if (el === doc.body) continue;
        const bg =
          el.style.backgroundImage ||
          (doc.defaultView.getComputedStyle(el).backgroundImage || '');
        if (bg && bg !== 'none' && bg.includes('url(')) {
          return el;
        }
      }
    }
    return null;
  };

  editor.replaceHeroBackground = function(doc) {
    const hero = this.detectHeroContainer(doc);
    if (!hero) {
      alert('No se encontró una sección hero.');
      return;
    }

    // Preferir un elemento con background-image dentro del hero (ej. .hero-bg)
    let bgTarget = hero.querySelector('[data-cw-bg-img]');
    if (!bgTarget) {
      for (const el of hero.querySelectorAll('*')) {
        const bg = el.style.backgroundImage || (doc.defaultView.getComputedStyle(el).backgroundImage || '');
        if (bg && bg !== 'none' && bg.includes('url(')) { bgTarget = el; break; }
      }
    }

    const img = hero.querySelector('img.himg, img');

    if (bgTarget) {
      this.replaceBackgroundImage(bgTarget);
      return;
    }

    if (img) {
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
            const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
            img.src = data;
            img.removeAttribute('srcset');
            img.removeAttribute('sizes');
            $('#edEstado').textContent = 'Cambios sin guardar';
            this.schedulePush();
            if (this.onChange) this.onChange();
          };
          im.src = rd.result;
        };
        rd.readAsDataURL(f);
      };
      inp.click();
      return;
    }

    this.replaceBackgroundImage(hero);
  };

  editor.setupHeroButton = function() {
    let btn = $('#btnHeroFondo');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btnHeroFondo';
      btn.type = 'button';
      btn.className = 'neu-btn';
      btn.style.padding = '.4rem .8rem';
      btn.style.fontSize = '.85rem';
      btn.textContent = 'Fondo Hero';
      btn.title = 'Reemplazar imagen de fondo de la sección hero';
      const btnRedo = $('#btnRedo');
      if (btnRedo && btnRedo.parentNode) {
        btnRedo.parentNode.insertBefore(btn, btnRedo.nextSibling);
      } else {
        const cont = $('#editor')?.querySelector('.d-flex.gap-2.mt-3, .editor-actions');
        if (cont) cont.appendChild(btn);
      }
    }
    btn.onclick = () => {
      const doc = $('#frame').contentDocument;
      if (doc) this.replaceHeroBackground(doc);
    };
  };
}
