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
    if (!doc || !doc.body) return this.estado?.html || '';

    // Clonamos solo el body editado (textos, imágenes, colores inline)
    const bodyClone = doc.body.cloneNode(true);
    bodyClone.querySelectorAll('[data-cw]').forEach(n => n.remove());
    bodyClone.querySelectorAll('[data-cw-edit]').forEach(n => {
      n.removeAttribute('contenteditable');
      n.removeAttribute('data-cw-edit');
      n.removeAttribute('spellcheck');
    });
    bodyClone.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(attr => {
        if (attr.name.startsWith('data-cw')) n.removeAttribute(attr.name);
      });
    });

    const original = this.estado?.html || '';
    const doctype = (original.match(/<!DOCTYPE[^>]*>/i) || ['<!DOCTYPE html>'])[0];
    const htmlOpen = (original.match(/<html[^>]*>/i) || ['<html lang="es">'])[0];
    let head = '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>';
    const headMatch = original.match(/<head[^>]*>[\s\S]*?<\/head>/i);
    if (headMatch) {
      head = headMatch[0].replace(/<base[^>]*>/gi, '');
    }

    return doctype + '\n' + htmlOpen + '\n' + head + '\n' + bodyClone.outerHTML + '\n</html>';
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
