/* DOM: estilos inyectados, elementos editables y eventos del editor */
import { $ } from './utils.js';

export function applyDOMEditing(editor) {
  editor.injectStyles = function(doc) {
    const st = doc.createElement('style');
    st.id = 'cw-style';
    st.setAttribute('data-cw', '1');
    st.textContent = `
      [data-cw-edit]{outline:1px dashed rgba(79,109,245,.0);cursor:text;transition:outline .15s}
      [data-cw-edit]:hover{outline:2px dashed rgba(79,109,245,.8);outline-offset:2px}
      [data-cw-edit]:focus{outline:2px solid #4f6df5;outline-offset:2px}
      img[data-cw-img]{cursor:pointer}
      img[data-cw-img]:hover{outline:3px solid #4f6df5;outline-offset:-3px}
      [data-cw-bg-img]{cursor:pointer}
      [data-cw-bg-img]:hover{outline:3px solid #4f6df5;outline-offset:2px}
      .cw-toolbar{position:absolute;z-index:9999;display:flex;gap:6px;padding:8px;background:rgba(20,20,20,.92);border:1px solid #000;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.35);align-items:center}
      .cw-toolbar-btn{border:1px solid #000;background:rgba(255,255,255,.9);cursor:pointer;font-size:1.1rem;padding:4px 6px;border-radius:8px;color:#000}
      .cw-toolbar-btn svg{stroke:#000}
      .cw-toolbar-btn:hover{background:#fff}
      .cw-color-pop{display:none;gap:8px;align-items:center;margin-left:6px;color:#000;background:rgba(255,255,255,.95);padding:4px;border-radius:8px;border:1px solid #000}
      .cw-color-pop label{font-size:.75rem;font-weight:600;color:#000}
      .cw-color-pop input[type="color"]{width:36px;height:28px;border:1px solid #000;padding:0;cursor:pointer;background:#fff}
      .cw-font-pop{display:none;gap:6px;align-items:center;margin-left:6px;color:#000;background:rgba(255,255,255,.95);padding:4px;border-radius:8px;border:1px solid #000}
      .cw-font-pop label{font-size:.75rem;font-weight:600;color:#000}
      .cw-font-pop input,.cw-font-pop select{font-size:.75rem;padding:2px 4px;border:1px solid #000;border-radius:4px;background:#fff;color:#000}
    `;
    doc.head.appendChild(st);
  };

  editor.makeEditable = function(doc) {
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SELECT|OPTION|TEXTAREA|INPUT|SVG|IFRAME|CODE|PRE|HTML|HEAD|TITLE)$/;
    const images = doc.body.querySelectorAll('img');
    console.log('Imágenes encontradas:', images.length);
    doc.body.querySelectorAll('*').forEach(el => {
      if (SKIP.test(el.tagName.toUpperCase()) || el.closest('svg,script,style,noscript')) return;
      if (el.tagName === 'IMG') {
        el.setAttribute('data-cw-img', '1');
        console.log('Imagen marcada:', el);
        return;
      }
      const computed = doc.defaultView.getComputedStyle(el);
      const bgImage = computed.backgroundImage;
      const inlineBg = el.style.backgroundImage;
      const hasBgImage = (bgImage && bgImage !== 'none' && bgImage.includes('url(')) ||
                        (inlineBg && inlineBg !== 'none' && inlineBg.includes('url('));
      if (hasBgImage) {
        el.setAttribute('data-cw-bg-img', '1');
        console.log('Fondo CSS marcado:', el, bgImage);
        return;
      }
      const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (propio) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-cw-edit', '1');
        el.spellcheck = false;
      }
    });
  };

  editor.attachEditorEvents = function(doc) {
    doc.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img && img.hasAttribute('data-cw-img')) {
        e.preventDefault();
        e.stopPropagation();
        this.imageEditor.replace(img);
        return;
      }
      const bgImg = e.target.closest('[data-cw-bg-img]');
      if (bgImg && e.target === bgImg) {
        // solo abre el selector si se hace clic directamente en el fondo, no en su texto
      }
      if (e.target.closest('.cw-toolbar')) return;
      // Permitir navegación por anchors internos (#servicios, #inicio, etc.)
      // en plantillas multipage; prevenir solo enlaces externos y botones
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#') || href === '#') {
          e.preventDefault();
        }
      }
      if (e.target.closest('button,[role=button]')) e.preventDefault();
      const el = e.target.closest('*');
      if (el && el.hasAttribute('data-cw-bg-img')) {
        this.selectElement(el);
      } else if (el && el.tagName === 'IMG' && el.hasAttribute('data-cw-img')) {
        this.selectElement(el);
      } else if (el && !el.closest('img') && !el.closest('input,textarea,select')) {
        if (!el.hasAttribute('data-cw-edit') && el.closest('[data-cw-edit]') !== el) {
          this.selectElement(el);
        }
      }
      if (e.shiftKey) {
        e.preventDefault();
      }
    }, true);

    doc.addEventListener('submit', e => e.preventDefault(), true);
    doc.addEventListener('keydown', e => {
      if (e.key === 'Enter') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y' || e.key === 'Z' || e.key === 'Y')) {
        e.preventDefault();
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) this.undo();
        else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) this.redo();
      }
    }, true);
    doc.addEventListener('paste', e => {
      if (!e.target.closest('[data-cw-edit]')) return;
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' ');
      doc.execCommand('insertText', false, t);
    }, true);
    doc.addEventListener('drop', e => e.preventDefault(), true);
    doc.addEventListener('input', () => {
      $('#edEstado').textContent = 'Cambios sin guardar';
      this.schedulePush();
      if (this.onChange) this.onChange();
    });
  };
}
