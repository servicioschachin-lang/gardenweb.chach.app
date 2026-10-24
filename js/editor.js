/* Gestión del editor de plantillas */
import { CONFIG, SOCIAL_PATTERNS, SOCIAL_NAMES } from './config.js';
import { $, addBaseTag, rgbToHex } from './utils.js';

export class Editor {
  constructor() {
    this.estado = null;
    this.elementoSeleccionado = null;
    this.onSave = null;
    this.onChange = null;
    this.modalSocial = null;
  }

  async loadTemplate(template) {
    try {
      const r = await fetch(template.url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const html = await r.text();
      this.estado = {
        nombre: template.nombre,
        url: template.url,
        base: new URL(template.url, location.href).href,
        html
      };
      this.open();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  loadFromStorage(estadoGuardado) {
    this.estado = estadoGuardado;
    this.open();
  }

  open() {
    $('#galeria').style.display = 'none';
    $('#editor').style.display = 'block';
    $('#edTitulo').textContent = this.estado.nombre;
    $('#edEstado').textContent = '';
    $('#frame').srcdoc = addBaseTag(this.estado.html, this.estado.base);
    ['btnCambiar', 'btnGuardar', 'btnPublicar'].forEach(id => $('#' + id).disabled = false);
    window.scrollTo({ top: 0 });
  }

  close() {
    $('#editor').style.display = 'none';
    $('#galeria').style.display = 'block';
    window.scrollTo({ top: 0 });
  }

  onFrameLoad() {
    if (this.estado) {
      this.prepareEditing();
    }
  }

  prepareEditing() {
    const doc = $('#frame').contentDocument;
    if (!doc || !doc.body) return;

    this.injectStyles(doc);
    this.makeEditable(doc);
    this.attachEditorEvents(doc);
    this.renderSocialLinks(doc);
    this.setupColorPicker(doc);
    this.setupViewToggle();
  }

  injectStyles(doc) {
    const st = doc.createElement('style');
    st.id = 'cw-style';
    st.setAttribute('data-cw', '1');
    st.textContent = `
      [data-cw-edit]{outline:1px dashed rgba(79,109,245,.0);cursor:text;transition:outline .15s}
      [data-cw-edit]:hover{outline:2px dashed rgba(79,109,245,.8);outline-offset:2px}
      [data-cw-edit]:focus{outline:2px solid #4f6df5;outline-offset:2px}
      img[data-cw-img]{cursor:pointer}
      img[data-cw-img]:hover{outline:3px solid #4f6df5;outline-offset:-3px}
    `;
    doc.head.appendChild(st);
  }

  makeEditable(doc) {
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SELECT|OPTION|TEXTAREA|INPUT|SVG|IFRAME|CODE|PRE|HTML|HEAD|TITLE)$/;
    doc.body.querySelectorAll('*').forEach(el => {
      if (SKIP.test(el.tagName.toUpperCase()) || el.closest('svg,script,style,noscript')) return;
      if (el.tagName === 'IMG') {
        el.setAttribute('data-cw-img', '1');
        return;
      }
      const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (propio) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-cw-edit', '1');
        el.spellcheck = false;
      }
    });
  }

  attachEditorEvents(doc) {
    doc.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-cw-img]');
      if (img) {
        e.preventDefault();
        this.changeImage(img);
        return;
      }
      if (e.target.closest('a,button,[role=button]')) e.preventDefault();
      // Seleccionar elemento con clic normal (para poder borrar, cambiar color, etc.)
      const el = e.target.closest('*');
      if (el && !el.closest('img') && !el.closest('input,textarea,select')) {
        this.selectElement(el);
      }
      // Si se mantiene Shift, también procesar selección (mismo comportamiento)
      if (e.shiftKey) {
        e.preventDefault();
      }
    }, true);

    doc.addEventListener('submit', e => e.preventDefault(), true);
    doc.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }, true);
    doc.addEventListener('paste', e => {
      if (!e.target.closest('[data-cw-edit]')) return;
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' ');
      doc.execCommand('insertText', false, t);
    }, true);
    doc.addEventListener('drop', e => e.preventDefault(), true);
    doc.addEventListener('input', () => {
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    });
  }

  changeImage(img) {
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
          const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .85);
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.src = data;
          $('#edEstado').textContent = 'Cambios sin guardar';
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }

  selectElement(el) {
    const doc = $('#frame').contentDocument;
    if (this.elementoSeleccionado) this.elementoSeleccionado.style.outline = '';
    this.elementoSeleccionado = el;
    el.style.outline = '3px solid #4f6df5';
    $('#selectorColor').style.display = 'block';
    const cf = $('#colorElementoFondo');
    const ct = $('#colorElementoTexto');
    const estilo = window.getComputedStyle(el);
    cf.value = rgbToHex(estilo.backgroundColor) || '#ffffff';
    ct.value = rgbToHex(estilo.color) || '#000000';
  }

  setupColorPicker(doc) {
    const cf = $('#colorFondo');
    const ct = $('#colorTexto');

    cf.addEventListener('input', () => {
      doc.body.style.backgroundColor = cf.value;
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    });

    ct.addEventListener('input', () => {
      doc.body.style.color = ct.value;
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    });

    this.setupElementColorPicker(doc);
  }

  setupElementColorPicker(doc) {
    const cf = $('#colorElementoFondo');
    const ct = $('#colorElementoTexto');
    const btn = $('#btnBorrarColor');

    cf.addEventListener('input', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.style.backgroundColor = cf.value;
        this.elementoSeleccionado.setAttribute('data-cw-bg', cf.value);
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });

    ct.addEventListener('input', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.style.color = ct.value;
        this.elementoSeleccionado.setAttribute('data-cw-color', ct.value);
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });

    btn.addEventListener('click', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.parentNode.removeChild(this.elementoSeleccionado);
        this.elementoSeleccionado = null;
        $('#selectorColor').style.display = 'none';
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });
  }

  setupViewToggle() {
    const btnD = $('#btnDesktop');
    const btnM = $('#btnMobile');
    const frame = $('#frame');

    btnD.addEventListener('click', () => {
      frame.classList.remove('mobile');
      frame.classList.add('desktop');
      btnD.classList.add('primary');
      btnM.classList.remove('primary');
    });

    btnM.addEventListener('click', () => {
      frame.classList.remove('desktop');
      frame.classList.add('mobile');
      btnM.classList.add('primary');
      btnD.classList.remove('primary');
    });

    this.setupAddSocial();
  }

  setupAddSocial() {
    const btn = $('#btnAgregarSocial');
    const modal = new bootstrap.Modal($('#modalSocial'));
    this.modalSocial = modal;

    const socialUrls = {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
      whatsapp: 'https://wa.me/',
      twitter: 'https://twitter.com/',
      youtube: 'https://youtube.com/',
      linkedin: 'https://linkedin.com/',
      telegram: 'https://t.me/'
    };

    $('#selSocial').addEventListener('change', (e) => {
      $('#inputSocialUrl').value = socialUrls[e.target.value] || '';
    });

    $('#btnGuardarSocial').addEventListener('click', () => {
      const social = $('#selSocial').value;
      const url = $('#inputSocialUrl').value.trim();
      const err = $('#socialErr');

      if (!url) {
        err.textContent = 'Por favor ingresa una URL';
        err.style.display = 'block';
        return;
      }

      try {
        this.addSocialLink(social, url);
        modal.hide();
        $('#inputSocialUrl').value = '';
        err.style.display = 'none';
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      } catch (e) {
        err.textContent = 'Error: ' + e.message;
        err.style.display = 'block';
      }
    });
  }

  addSocialLink(social, url) {
    const doc = $('#frame').contentDocument;
    if (!doc || !doc.body) throw new Error('No hay documento cargado');

    // Buscar el footer o la sección de redes sociales
    const footer = doc.querySelector('footer') || doc.body.lastElementChild;
    if (!footer) throw new Error('No se encontró footer en la plantilla');

    // Crear el enlace de red social
    const a = doc.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('data-cw-social', '1');

    // Crear icono (usando SVG simple)
    const svg = this.getSocialIcon(social);
    a.innerHTML = svg;

    // Agregar al footer
    const socialContainer = footer.querySelector('[data-social-container]') || footer;
    socialContainer.appendChild(a);

    // Re-renderizar la lista de redes
    this.renderSocialLinks(doc);
  }

  getSocialIcon(social) {
    const icons = {
      facebook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
      instagram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
      tiktok: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
      whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
      twitter: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`,
      youtube: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
      linkedin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
      telegram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
    };
    return icons[social] || `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  renderSocialLinks(doc) {
    const links = [...doc.querySelectorAll('a[href]')].filter(a => {
      const href = a.getAttribute('href');
      // First, check normal pattern (domains like facebook.com, instagram.com, etc.)
      if (SOCIAL_PATTERNS.test(href)) return true;
      // Check aria-label (e.g., aria-label="Instagram", aria-label="Facebook")
      const aria = a.getAttribute('aria-label');
      if (aria) {
        const nombre = (SOCIAL_NAMES.find(([r]) => r.test(aria)) || [0, ''])[1];
        if (nombre) return true;
      }
      // Check for Bootstrap icon inside <i> (e.g., <i class="bi bi-instagram">
      const icon = a.querySelector('i');
      if (icon) {
        const classList = icon.classList;
        if (classList.contains('bi')) {
          // Get the second class which is typically "bi-<nombre>"
          const iconClass = Array.from(classList).find(c => c.startsWith('bi-'));
          if (iconClass) {
            const iconName = iconClass.replace('bi-', '').toLowerCase();
            const nombre = (SOCIAL_NAMES.find(([r]) => r.test(iconName)) || [0, ''])[1];
            if (nombre) return true;
          }
        }
      }
      return false;
    });
    const box = $('#socialBox');
    const list = $('#socialList');
    list.innerHTML = '';

    if (!links.length) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';

    // Agrupar enlaces por tipo de red social
    const socialMap = new Map();
    links.forEach(a => {
      const href = a.getAttribute('href');
      // Determinar el nombre usando el mismo orden de prioridad que el filtro
      let nombre = '';
      const aria = a.getAttribute('aria-label');
      if (aria) {
        nombre = (SOCIAL_NAMES.find(([r]) => r.test(aria)) || [0, ''])[1];
      }
      if (!nombre) {
        const icon = a.querySelector('i');
        if (icon && icon.classList.contains('bi')) {
          const iconClass = Array.from(icon.classList).find(c => c.startsWith('bi-'));
          if (iconClass) {
            const iconName = iconClass.replace('bi-', '').toLowerCase();
            nombre = (SOCIAL_NAMES.find(([r]) => r.test(iconName)) || [0, ''])[1];
          }
        }
      }
      if (!nombre) {
        nombre = (SOCIAL_NAMES.find(([r]) => r.test(href)) || [0, 'Enlace'])[1];
      }
      if (nombre === '') nombre = 'Enlace';
      if (!socialMap.has(nombre)) {
        socialMap.set(nombre, []);
      }
      socialMap.get(nombre).push({ a, href });
    });

    // Renderizar cada red social
    socialMap.forEach((items, nombre) => {
      const row = document.createElement('div');
      row.className = 'social-row';
      row.innerHTML = `<span>${nombre}</span>`;
      const inp = document.createElement('input');
      inp.className = 'neu-input';
      inp.type = 'url';
      inp.placeholder = 'https://…';
      inp.value = items[0].href;
      inp.addEventListener('input', () => {
        items.forEach(item => {
          item.a.setAttribute('href', inp.value.trim());
        });
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      });
      row.appendChild(inp);
      list.appendChild(row);
    });
  }

  getHTML() {
    const doc = $('#frame').contentDocument;
    if (!doc) return this.estado.html;
    const clon = doc.documentElement.cloneNode(true);
    clon.querySelectorAll('[data-cw]').forEach(n => n.remove());
    clon.querySelectorAll('[data-cw-edit]').forEach(n => {
      n.removeAttribute('contenteditable');
      n.removeAttribute('data-cw-edit');
      n.removeAttribute('spellcheck');
    });
    clon.querySelectorAll('[data-cw-img]').forEach(n => n.removeAttribute('data-cw-img'));
    clon.querySelectorAll('[data-cw-social]').forEach(n => n.removeAttribute('data-cw-social'));
    const fondo = $('#colorFondo').value;
    const texto = $('#colorTexto').value;
    if (fondo !== '#ffffff' || texto !== '#000000') {
      const st = clon.querySelector('style[data-cw-body]') || clon.querySelector('style') || clon.head.appendChild(clon.createElement('style'));
      st.setAttribute('data-cw-body', '1');
      st.textContent = (st.textContent || '') + `body{background-color:${fondo}!important;color:${texto}!important}`;
    }
    clon.querySelectorAll('[data-cw-bg]').forEach(el => {
      const bg = el.getAttribute('data-cw-bg');
      el.style.backgroundColor = bg;
      el.removeAttribute('data-cw-bg');
    });
    clon.querySelectorAll('[data-cw-color]').forEach(el => {
      const col = el.getAttribute('data-cw-color');
      el.style.color = col;
      el.removeAttribute('data-cw-color');
    });
    return '<!DOCTYPE html>\n' + clon.outerHTML;
  }

  saveToStorage() {
    if (!this.estado) return;
    this.estado.html = this.getHTML();
    try {
      localStorage.setItem(CONFIG.STORE_KEY, JSON.stringify(this.estado));
      $('#edEstado').textContent = 'Guardado ✓';
      return true;
    } catch (e) {
      return false;
    }
  }

  clear() {
    this.estado = null;
    $('#frame').srcdoc = '';
    $('#editor').style.display = 'none';
    $('#galeria').style.display = 'block';
    ['btnCambiar', 'btnGuardar', 'btnPublicar'].forEach(id => $('#' + id).disabled = true);
    window.scrollTo({ top: 0 });
  }

  getEstado() {
    return this.estado;
  }
}
