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
  }

  loadDominios() {
    const select = $('#fDominio');
    if (!select) return;
    select.innerHTML = '';
    CONFIG.DOMINIO.forEach(dominio => {
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
      $('#pubInforme').style.display = 'none';
      $('#pubCampos').style.display = 'block';
      $('#btnEnviar').style.display = '';
      $('#btnDescargarHtml').style.display = '';
      this.modal.show();
    });

    $('#formPublicar').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });

    $('#btnDescargarHtml').addEventListener('click', () => {
      const estado = this.editor.getEstado();
      if (!estado) return;
      const html = this.editor.getHTML();
      const sub = cleanSubdomain($('#fSub').value) || 'miweb';
      downloadFile(html, sub + '.html');
    });

    $('#btnNuevaPublicacion').addEventListener('click', () => this.reiniciarPublicacion());
  }

  async handleSubmit(e) {
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
      let html = this.editor.getHTML();
      if (html.length > CONFIG.LIMITE_HTML) {
        html = await this.compressImages(html);
      }

      const negocio = $('#fNegocio').value || 'No especificado';
      const nombre = $('#fNombre').value || 'No especificado';
      const email = $('#fEmail').value || 'No especificado';
      const whatsapp = $('#fWhats').value || 'No especificado';
      const mensaje = $('#fMsg').value || 'Sin mensaje adicional';
      const resumen = $('#fResumen').value || 'Sin resumen';
      const nombrePlantilla = this.editor.getEstado().nombre;
      const fecha = new Date().toLocaleString('es-GT');
      const tamano = String(Math.round(html.length / 1024));
      const subCompleto = `${sub}.${dominio}`;

      // 1. Descargar automáticamente el HTML final
      downloadFile(html, sub + '.html');

      // 2. Mensaje de WhatsApp: solo resumen limpio (sin HTML largo que se truncara)
      const mensajeWhatsApp = `
🌐 *SOLICITUD DE PUBLICACIÓN WEB*

━━━━━━━━━━━━━━━━━━━━━━━━

📋 *DATOS DEL NEGOCIO*
• Negocio: ${negocio}
• Subdominio: ${subCompleto}
• Plantilla: ${nombrePlantilla}

👤 *DATOS DE CONTACTO*
• Nombre: ${nombre}
• Email: ${email}
• WhatsApp: ${whatsapp}

📝 *RESUMEN*
${resumen}

💬 *MENSAJE ADICIONAL*
${mensaje}

📊 *TÉCNICO*
• Fecha: ${fecha}
• Tamaño HTML: ${tamano} KB

━━━━━━━━━━━━━━━━━━━━━━━━

⬇️ El archivo HTML completo se descarga automáticamente al enviar.
      `.trim();

      // Codificar mensaje para URL
      const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_SUPPORT}?text=${mensajeCodificado}`;
      window.open(whatsappUrl, '_blank');

      // 3. Mostrar informe de pasos a tomar
      this.mostrarInforme(subCompleto, negocio, fecha);

      btn.disabled = false;
      btn.textContent = 'Enviar';
    } catch (x) {
      mostrarErr('Error: ' + x.message);
      btn.disabled = false;
      btn.textContent = 'Enviar';
    }
  }

  mostrarInforme(subCompleto, negocio, fecha) {
    $('#pubCampos').style.display = 'none';
    $('#pubOk').style.display = 'none';
    $('#btnEnviar').style.display = 'none';
    $('#btnDescargarHtml').style.display = 'none';
    $('#formPublicar').reset();

    $('#informeSubdominio').textContent = subCompleto;
    $('#informeNegocio').textContent = negocio ? `Negocio: ${negocio}` : '';
    $('#informeUrl').textContent = `https://${subCompleto}`;
    $('#informeFecha').textContent = `Fecha: ${fecha}`;

    $('#pubInforme').style.display = 'block';
  }

  reiniciarPublicacion() {
    $('#pubInforme').style.display = 'none';
    $('#pubCampos').style.display = 'block';
    $('#pubErr').style.display = 'none';
    $('#btnEnviar').style.display = '';
    $('#btnDescargarHtml').style.display = '';
    $('#formPublicar').reset();
    this.loadDominios();
    this.updateSubVista();
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

  setModal(modal) {
    this.modal = modal;
  }
}
