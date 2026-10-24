/* Gestión del formulario de publicación */
import { CONFIG } from './config.js';
import { $, cleanSubdomain, downloadFile } from './utils.js';

export class FormHandler {
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    this.attachEvents();
    this.setupFormspree();
  }

  attachEvents() {
    $('#fSub').addEventListener('input', (e) => {
      const v = cleanSubdomain(e.target.value);
      e.target.value = v;
      $('#subVista').textContent = (v || 'ejemplo') + '.' + CONFIG.DOMINIO;
    });

    $('#btnPublicar').addEventListener('click', () => {
      const estado = this.editor.getEstado();
      if (!estado) return;
      $('#fPlantilla').value = estado.nombre;
      $('#pubErr').style.display = 'none';
      $('#pubOk').style.display = 'none';
      $('#pubCampos').style.display = 'block';
      $('#btnEnviar').style.display = '';
      this.modal.show();
    });

    $('#formPublicar').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });
  }

  async handleSubmit(e) {
    const btn = $('#btnEnviar');
    const err = $('#pubErr');
    const sub = cleanSubdomain($('#fSub').value).replace(/-+$/, '');
    const mostrarErr = (m) => {
      err.textContent = m;
      err.style.display = 'block';
    };

    err.style.display = 'none';
    if (sub.length < 3) return mostrarErr('El subdominio debe tener al menos 3 caracteres.');
    if (CONFIG.RESERVADOS.includes(sub)) return mostrarErr('Ese subdominio está reservado, elige otro.');

    btn.disabled = true;
    btn.textContent = 'Preparando…';

    try {
      let html = this.editor.getHTML();
      if (html.length > CONFIG.LIMITE_HTML) {
        html = await this.compressImages(html);
      }
      const muyPesado = html.length > CONFIG.LIMITE_HTML;

      $('#fSubCompleto').value = sub + '.' + CONFIG.DOMINIO;
      $('#fPlantillaOrigen').value = this.editor.getEstado().url;
      $('#fFecha').value = new Date().toLocaleString('es-GT');
      $('#fTamano').value = String(Math.round(html.length / 1024));
      $('#fSubject').value = 'Nueva web: ' + sub + '.' + CONFIG.DOMINIO + ' · CreaWeb';

      if (muyPesado) {
        $('#fHtmlFinal').value = '(HTML demasiado pesado - archivo descargado)';
        downloadFile(html, sub + '.html');
      } else {
        $('#fHtmlFinal').value = html;
      }

      btn.textContent = 'Enviando…';
    } catch (x) {
      mostrarErr('Error: ' + x.message);
      btn.disabled = false;
      btn.textContent = 'Enviar';
    }
  }

  async compressImages(html) {
    const re = /data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+\/=]+/g;
    const lista = [...new Set(html.match(re) || [])];
    for (const src of lista) {
      const nuevo = await new Promise(res => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, 900 / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL('image/webp', .6));
        };
        im.onerror = () => res(src);
        im.src = src;
      });
      if (nuevo.length < src.length) {
        html = html.split(src).join(nuevo);
      }
    }
    return html;
  }

  setupFormspree() {
    if (typeof formspree !== 'undefined') {
      formspree('initForm', { formElement: '#formPublicar', formId: 'xrengvqb' });
      formspree('onSubmit', () => {
        const sub = $('#fSub').value.replace(/-+$/, '');
        const muyPesado = $('#fHtmlFinal').value.includes('demasiado pesado');
        if (muyPesado) {
          $('#pubOkTxt').textContent = 'Recibimos tus datos. Tu HTML es muy pesado: se descargó el archivo. Envíanoslo por WhatsApp o correo.';
        } else {
          $('#pubOkTxt').textContent = 'Recibimos tus datos y tu HTML final. Tu web será ' + sub + '.' + CONFIG.DOMINIO + '. Te contactaremos pronto.';
        }
        $('#pubCampos').style.display = 'none';
        $('#pubOk').style.display = 'block';
        $('#btnEnviar').style.display = 'none';
        $('#formPublicar').reset();
        $('#subVista').textContent = 'ejemplo.' + CONFIG.DOMINIO;
      });

      formspree('onError', (event) => {
        const err = $('#pubErr');
        const messages = event.errors ? event.errors.map(e => e.message).join(', ') : 'No se pudo enviar. Intenta de nuevo.';
        err.textContent = messages;
        err.style.display = 'block';
        $('#btnEnviar').disabled = false;
        $('#btnEnviar').textContent = 'Enviar';
      });
    }
  }

  setModal(modal) {
    this.modal = modal;
  }
}
