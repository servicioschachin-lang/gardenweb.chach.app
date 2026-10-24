/* Aplicación principal - Orquestador */
import { CONFIG } from './config.js';
import { $ } from './utils.js';
import { Gallery } from './gallery.js';
import { Editor } from './editor.js';
import { FormHandler } from './form-handler.js';

class App {
  constructor() {
    this.gallery = null;
    this.editor = null;
    this.formHandler = null;
    this.toast = null;
    this.modalPublish = null;
    this.modalPreview = null;
  }

  init() {
    this.setupUI();
    this.setupComponents();
    this.setupEventListeners();
    this.loadSavedState();
  }

  setupUI() {
    document.getElementById('btnRegresar').href = CONFIG.CREAWEB_URL;
  }

  setupComponents() {
    this.toast = new bootstrap.Toast($('#toast'), { delay: 3500 });
    this.modalPublish = new bootstrap.Modal($('#modalPublicar'));
    this.modalPreview = new bootstrap.Modal($('#modalVista'));

    this.editor = new Editor();
    this.formHandler = new FormHandler(this.editor);
    this.formHandler.setModal(this.modalPublish);

    this.gallery = new Gallery(
      (template) => this.useTemplate(template),
      (template) => this.previewTemplate(template)
    );
  }

  setupEventListeners() {
    $('#frame').addEventListener('load', () => this.editor.onFrameLoad());

    $('#btnGuardar').addEventListener('click', () => {
      if (!this.editor.getEstado()) return;
      const saved = this.editor.saveToStorage();
      if (saved) {
        this.showNotification('Cambios guardados');
      } else {
        this.showNotification('No se pudo guardar: las imágenes son muy pesadas');
      }
    });

    $('#btnCambiar').addEventListener('click', () => {
      if (!this.editor.getEstado()) return;
      if (!confirm('Al cambiar de plantilla se pierden los cambios de la actual. ¿Continuar?')) return;
      try {
        localStorage.removeItem(CONFIG.STORE_KEY);
      } catch (e) {}
      this.editor.clear();
      this.gallery.hideContinueBox();
    });

    $('#btnRegresarGaleria').addEventListener('click', () => {
      if (!this.editor.getEstado()) return;
      this.editor.close();
      this.gallery.show();
      this.updateContinueBox();
    });

    $('#btnContinuar').addEventListener('click', () => {
      this.continueEditing();
    });

    $('#btnEmpezarNuevo').addEventListener('click', () => {
      if (confirm('¿Estás seguro? Se perderán todos los cambios guardados.')) {
        try {
          localStorage.removeItem(CONFIG.STORE_KEY);
        } catch (e) {}
        this.gallery.hideContinueBox();
        this.showNotification('Progreso eliminado');
      }
    });
  }

  async useTemplate(template) {
    const success = await this.editor.loadTemplate(template);
    if (!success) {
      this.showNotification('No se pudo cargar la plantilla. Revisa tu conexión.');
    }
  }

  async previewTemplate(template) {
    try {
      const r = await fetch(template.url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const html = await r.text();
      const base = new URL(template.url, location.href).href;
      $('#vistaTitulo').textContent = template.nombre;
      $('#vistaFrame').srcdoc = this.addBaseToHtml(html, base);
      $('#btnVistaUsar').onclick = () => {
        this.modalPreview.hide();
        this.useTemplate(template);
      };
      this.modalPreview.show();
    } catch (err) {
      this.showNotification('No se pudo cargar la plantilla. Revisa tu conexión.');
      console.error(err);
    }
  }

  addBaseToHtml(html, base) {
    const tag = `<base href="${base}" data-cw="1">`;
    return /<head[^>]*>/i.test(html)
      ? html.replace(/<head[^>]*>/i, m => m + tag)
      : tag + html;
  }

  loadSavedState() {
    try {
      const g = JSON.parse(localStorage.getItem(CONFIG.STORE_KEY) || 'null');
      if (g && g.html) {
        this.gallery.showContinueBox(g.nombre);
      }
    } catch (e) {}
  }

  continueEditing() {
    try {
      const g = JSON.parse(localStorage.getItem(CONFIG.STORE_KEY) || 'null');
      if (g && g.html) {
        this.editor.loadFromStorage(g);
        $('#edEstado').textContent = 'Cambios restaurados';
        this.gallery.hideContinueBox();
      }
    } catch (e) {}
  }

  updateContinueBox() {
    try {
      const g = JSON.parse(localStorage.getItem(CONFIG.STORE_KEY) || 'null');
      if (g && g.html) {
        this.gallery.showContinueBox(g.nombre);
      }
    } catch (e) {}
  }

  showNotification(message) {
    $('#toastMsg').textContent = message;
    this.toast.show();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
