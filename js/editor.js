/* Gestión del editor de plantillas (orquestador) */
import { CONFIG } from './config.js';
import { $, addBaseTag } from './utils.js';
import { ElementToolbar } from './element-toolbar.js';
import { ImageEditor } from './image-editor.js';

import { applyDOMEditing } from './editor-dom.js';
import { applyImageEditing } from './editor-images.js';
import { applyElementSelection } from './editor-selection.js';
import { applyColorPickers } from './editor-colors.js';
import { applySocial } from './editor-social.js';
import { applySocialIcons } from './editor-social-icons.js';
import { applyHistory } from './editor-history.js';
import { applyViewToggle } from './editor-view.js';
import { applyHeroEditing } from './editor-hero.js';
import { applyBackgroundEditing } from './editor-backgrounds.js';
import { applyNavbarEditing } from './editor-navbar.js';
import { applyIconEditing } from './editor-icon.js';
import { applyPageEditing } from './editor-pages.js';

export class Editor {
  constructor() {
    this.estado = null;
    this.elementoSeleccionado = null;
    this.onSave = null;
    this.onChange = null;
    this.modalSocial = null;
    this.toolbar = null;
    this.imageEditor = new ImageEditor(
      () => {
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      },
      () => this.schedulePush()
    );
    this.history = [];
    this.historyIndex = -1;
    this.historyTimer = null;

    applyDOMEditing(this);
    applyImageEditing(this);
    applyElementSelection(this);
    applyColorPickers(this);
    applySocial(this);
    applySocialIcons(this);
    applyHistory(this);
    applyViewToggle(this);
    applyHeroEditing(this);
    applyBackgroundEditing(this);
    applyNavbarEditing(this);
    applyIconEditing(this);
    applyPageEditing(this);
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
    $('#editor').classList.add('editor-full');
    $('#edTitulo').textContent = this.estado.nombre;
    $('#edEstado').textContent = '';
    $('#frame').srcdoc = addBaseTag(this.estado.html, this.estado.base);
    ['btnCambiar', 'btnGuardar', 'btnPublicar'].forEach(id => $('#' + id).disabled = false);
    this.initHistory();
    this.setupHeroButton();
    this.setupGeneralBackgroundButton();
    this.setupNavbarButton();
    this.setupIconButton();
    this.setupPageButton();
    this.setupAddSocial();
    window.scrollTo({ top: 0 });
  }

  close() {
    $('#editor').style.display = 'none';
    $('#editor').classList.remove('editor-full');
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
    this.markPageBackground(doc);
    this.attachEditorEvents(doc);
    this.renderSocialLinks(doc);
    this.setupColorPicker(doc);
    this.setupButtonColorPicker(doc);
    this.setupButtonTextColorPicker(doc);
    this.setupButtonGradientPicker(doc);
    this.setupViewToggle();
    const btnUndo = $('#btnUndo');
    const btnRedo = $('#btnRedo');
    if (btnUndo) btnUndo.onclick = () => this.undo();
    if (btnRedo) btnRedo.onclick = () => this.redo();
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
    const fuenteBody = $('#fuenteBody') ? $('#fuenteBody').value : '';
    if (fondo !== '#ffffff' || texto !== '#000000' || (fuenteBody && fuenteBody !== 'system-ui')) {
      const st = clon.querySelector('style[data-cw-body]') || clon.querySelector('style') || clon.head.appendChild(clon.createElement('style'));
      st.setAttribute('data-cw-body', '1');
      let css = `body{background-color:${fondo}!important;color:${texto}!important`;
      if (fuenteBody && fuenteBody !== 'system-ui') {
        css += `;font-family:${fuenteBody}!important`;
      }
      css += '}';
      st.textContent = (st.textContent || '') + css;
    }
    clon.querySelectorAll('[data-cw-bg]').forEach(el => {
      const bg = el.getAttribute('data-cw-bg');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('background-color', bg, 'important');
      el.removeAttribute('data-cw-bg');
    });
    clon.querySelectorAll('[data-cw-color]').forEach(el => {
      const col = el.getAttribute('data-cw-color');
      el.style.color = col;
      el.removeAttribute('data-cw-color');
    });
    clon.querySelectorAll('[data-cw-btn-bg]').forEach(el => {
      const bg = el.getAttribute('data-cw-btn-bg');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('background-color', bg, 'important');
      el.removeAttribute('data-cw-btn-bg');
    });
    clon.querySelectorAll('[data-cw-btn-text]').forEach(el => {
      const col = el.getAttribute('data-cw-btn-text');
      el.style.setProperty('color', col, 'important');
      el.removeAttribute('data-cw-btn-text');
    });
    clon.querySelectorAll('[data-cw-font]').forEach(el => {
      const fm = el.getAttribute('data-cw-font');
      el.style.fontFamily = fm;
      el.removeAttribute('data-cw-font');
    });
    clon.querySelectorAll('[data-cw-btn-grad]').forEach(el => {
      const dir = el.getAttribute('data-cw-btn-grad-dir') || 'to right';
      const inicio = el.getAttribute('data-cw-btn-grad-inicio');
      const fin = el.getAttribute('data-cw-btn-grad-fin');
      if (inicio && fin) {
        el.style.setProperty('background-image', `linear-gradient(${dir}, ${inicio}, ${fin})`, 'important');
        el.style.setProperty('background-color', inicio, 'important');
      }
      el.removeAttribute('data-cw-btn-grad');
      el.removeAttribute('data-cw-btn-grad-dir');
      el.removeAttribute('data-cw-btn-grad-inicio');
      el.removeAttribute('data-cw-btn-grad-fin');
    });
    clon.querySelectorAll('[data-cw-social-name]').forEach(n => n.removeAttribute('data-cw-social-name'));
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
    $('#editor').classList.remove('editor-full');
    $('#galeria').style.display = 'block';
    ['btnCambiar', 'btnGuardar', 'btnPublicar'].forEach(id => $('#' + id).disabled = true);
    window.scrollTo({ top: 0 });
  }

  getEstado() {
    return this.estado;
  }
}
