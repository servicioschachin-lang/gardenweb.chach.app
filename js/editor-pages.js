/* Páginas / Secciones multipage: cambiar entre páginas del iframe */
import { $ } from './utils.js';

export function applyPageEditing(editor) {
  editor.detectPages = function(doc) {
    if (!doc || !doc.body) return [];
    const pages = new Set();
    doc.querySelectorAll('[data-p]').forEach(el => {
      if (el.dataset.p) pages.add(el.dataset.p);
    });
    return [...pages];
  };

  editor.goToPage = function(doc, page) {
    if (!doc || !page) return;
    // Intentar usar la función r() de la plantilla si existe
    try {
      const fn = doc.defaultView.r;
      if (typeof fn === 'function') {
        doc.defaultView.location.hash = '#' + page;
        return;
      }
    } catch (e) {}
    // Fallback: cambiar hash y disparar hashchange
    doc.defaultView.location.hash = '#' + page;
  };

  editor.setupPageButton = function() {
    let btn = $('#btnPagina');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'btnPagina';
      btn.type = 'button';
      btn.className = 'neu-btn';
      btn.style.padding = '.4rem .8rem';
      btn.style.fontSize = '.85rem';
      btn.textContent = 'Página';
      btn.title = 'Cambiar de página (plantillas multipage)';
      const btnIcono = $('#btnIconoImg');
      if (btnIcono && btnIcono.parentNode) {
        btnIcono.parentNode.insertBefore(btn, btnIcono.nextSibling);
      } else {
        const cont = $('#editor')?.querySelector('.d-flex.gap-2.mt-3, .editor-actions');
        if (cont) cont.appendChild(btn);
      }
    }

    btn.onclick = () => {
      const doc = $('#frame').contentDocument;
      if (!doc) return;
      const pages = this.detectPages(doc);
      if (!pages.length) {
        alert('Esta plantilla no tiene páginas separadas (es de una sola página).');
        return;
      }

      const select = document.createElement('select');
      select.className = 'neu-input';
      select.style.padding = '.4rem .6rem';
      select.style.fontSize = '.85rem';
      pages.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
        select.appendChild(opt);
      });

      // Seleccionar la página actual
      const current = (doc.defaultView.location.hash || '#inicio').slice(1) || 'inicio';
      if (pages.includes(current)) {
        select.value = current;
      }

      const ir = () => {
        const page = select.value;
        if (page) this.goToPage(doc, page);
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
      dlg.style.maxWidth = '300px';

      const t = document.createElement('div');
      t.textContent = 'Selecciona la página a editar';
      t.style.fontWeight = '600';
      t.style.fontSize = '.9rem';

      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.gap = '.5rem';
      c.style.justifyContent = 'center';

      const ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = 'Ir a página';
      ok.className = 'neu-btn primary';
      ok.style.padding = '.4rem .8rem';
      ok.onclick = () => { ir(); document.body.removeChild(dlg); };

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
