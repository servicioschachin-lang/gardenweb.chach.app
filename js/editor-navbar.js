/* Navbar / Logo: reemplazar imágenes normales ocupando el espacio del contenedor */
import { $ } from './utils.js';

export function applyNavbarEditing(editor) {
  editor.detectNavbarImages = function(doc) {
    if (!doc || !doc.body) return [];
    const result = [];
    const nav = doc.querySelector('nav, header, [class*="navbar"], [id*="navbar"], [class*="logo"], [id*="logo"]');
    const scope = nav || doc.body;
    scope.querySelectorAll('img[data-cw-img]').forEach(img => {
      result.push(img);
    });
    return result;
  };

  editor.replaceNavbarImage = function(img) {
    // Usar el changeImage existente pero con límite menor para iconos/logo
    const M = 600;
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
          // Limitar tamaño para iconos/logo: no agrandar más de 600px
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data =
            f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.src = data;
          // Asegurar que ocupe el espacio del contenedor sin distorsionarse
          img.style.objectFit = 'cover';
          img.style.width = '100%';
          img.style.height = '100%';
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

  editor.setupNavbarButton = function() {
    let btn = $('#btnNavbarImg');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btnNavbarImg';
      btn.type = 'button';
      btn.className = 'neu-btn';
      btn.style.padding = '.4rem .8rem';
      btn.style.fontSize = '.85rem';
      btn.textContent = 'Navbar';
      btn.title = 'Reemplazar imagen del navbar / logo';
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
      if (!doc) return;
      const imgs = this.detectNavbarImages(doc);
      if (!imgs.length) {
        alert('No se encontraron imágenes en el navbar.');
        return;
      }

      const select = document.createElement('select');
      select.className = 'neu-input';
      select.style.padding = '.4rem .6rem';
      select.style.fontSize = '.85rem';
      imgs.forEach((img, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        const src = img.src || img.getAttribute('src') || '';
        const name = img.alt || 'imagen';
        const short = src.length > 40 ? src.substring(0, 40) + '…' : src;
        opt.textContent = `${name}  →  ${short}`;
        select.appendChild(opt);
      });

      const reemplazar = () => {
        const idx = parseInt(select.value, 10);
        if (!isNaN(idx) && imgs[idx]) {
          this.replaceNavbarImage(imgs[idx]);
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
      t.textContent = 'Selecciona la imagen del navbar a reemplazar';
      t.style.fontWeight = '600';
      t.style.fontSize = '.9rem';

      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.gap = '.5rem';
      c.style.justifyContent = 'center';

      const ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = 'Reemplazar imagen';
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
