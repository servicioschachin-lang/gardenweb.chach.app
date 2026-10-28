/* Gestión del formulario de publicación */
import { CONFIG } from './config.js';
import { $, cleanSubdomain, downloadFile } from './utils.js';

export class FormHandler {
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    this.loadDominios();
    this.attachEvents();
    this.attachModalEvents();
    this.setupFormspree();
  }

  loadDominios() {
    const select = $('#fDominio');
    if (!select) return;
    select.innerHTML = '';
    CONFIG.DOMINIOS.forEach(dominio => {
      const option = document.createElement('option');
      option.value = dominio;
      option.textContent = dominio;
      if (dominio === CONFIG.DOMINIO_DEFAULT) option.selected = true;
      select.appendChild(option);
    });
  }

  attachEvents() {
    $('#fSub').addEventListener('input', (e) => {
      const v = cleanSubdomain(e.target.value);
      e.target.value = v;
      this.updateSubVista();
    });

    $('#fDominio').addEventListener('change', () => {
      this.updateSubVista();
    });

    this.updateSubVista();
  }

  updateSubVista() {
    const sub = cleanSubdomain($('#fSub').value) || 'ejemplo';
    const dominio = $('#fDominio').value || CONFIG.DOMINIO_DEFAULT;
    $('#subVista').textContent = sub + '.' + dominio;
  }

  attachModalEvents() {
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

    $('#btnEnviar').addEventListener('click', async () => {
      await this.handleSubmit();
    });
  }

  async handleSubmit() {
    const btn = $('#btnEnviar');
    const err = $('#pubErr');
    const sub = cleanSubdomain($('#fSub').value).replace(/-+$/, '');
    const dominio = $('#fDominio').value || CONFIG.DOMINIO_DEFAULT;
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
      // Sincronizar cambios actuales del iframe al estado antes de publicar,
      // para que no se pierdan ediciones que aún no se guardaron con "Guardar cambios"
      const htmlDelIframe = this.editor.getHTML();
      if (htmlDelIframe && this.editor.getEstado()) {
        this.editor.estado.html = htmlDelIframe;
      }
      let html = this.editor.getHTML();
      if (html.length > CONFIG.LIMITE_HTML) {
        html = await this.compressImages(html);
      }
      const muyPesado = html.length > CONFIG.LIMITE_HTML;

      $('#fSubCompleto').value = sub + '.' + dominio;
      $('#fPlantillaOrigen').value = this.editor.getEstado().url;
      $('#fFecha').value = new Date().toLocaleString('es-GT');
      $('#fTamano').value = String(Math.round(html.length / 1024));
      $('#fSubject').value = 'Nueva web: ' + sub + '.' + dominio + ' · CreaWeb';

      if (muyPesado) {
        $('#fHtmlFinal').value = '(HTML demasiado pesado - archivo descargado)';
        downloadFile(html, sub + '.html');
        btn.disabled = false;
        btn.textContent = 'Enviar';
        return;
      }

      $('#fHtmlFinal').value = html;

      btn.textContent = 'Enviando…';

      // Enviar el formulario directamente a Formspree (envío tradicional, evita CORS)
      const form = $('#formPublicar');
      form.submit();
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
    // El envío se hace con fetch() directamente en handleSubmit(),
    // no es necesario inicializar formspree aquí.
  }

  setModal(modal) {
    this.modal = modal;
  }
}
