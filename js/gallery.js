/* Gestión de la galería de plantillas */
import { CONFIG } from './config.js';
import { $, escapeHtml } from './utils.js';

export class Gallery {
  constructor(onUseTemplate, onViewTemplate) {
    this.onUseTemplate = onUseTemplate;
    this.onViewTemplate = onViewTemplate;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    const lista = CONFIG.TEMPLATES.slice(0, 20);
    while (lista.length < 10) {
      lista.push({
        nombre: 'Plantilla ' + String(lista.length + 1).padStart(2, '0'),
        url: ''
      });
    }

    $('#grid').innerHTML = lista.map((t, i) => {
      const ok = !!t.url;
      return `<div class="col-12 col-sm-6 col-lg-4">
        <article class="neu h-100 d-flex flex-column pb-3">
          <div class="preview neu-in">
            ${ok
              ? `<iframe src="${escapeHtml(t.url)}" loading="lazy" tabindex="-1" title="Vista previa de ${escapeHtml(t.nombre)}"></iframe>`
              : `<div class="empty">Agrega el link del HTML en <code>TEMPLATES</code></div>`
            }
          </div>
          <h3 class="h6 fw-bold text-center mt-3 mb-3">${escapeHtml(t.nombre)}</h3>
          <div class="d-flex gap-2 justify-content-center px-3 mt-auto">
            <button class="neu-btn ${ok ? '' : 'disabled'}" data-ver="${i}" ${ok ? '' : 'disabled'}>Ver</button>
            <button class="neu-btn primary" data-usar="${i}" ${ok ? '' : 'disabled'}>Usar</button>
          </div>
        </article>
      </div>`;
    }).join('');
  }

  attachEvents() {
    $('#grid').addEventListener('click', (e) => {
      const useBtn = e.target.closest('[data-usar]');
      if (useBtn) {
        this.onUseTemplate(CONFIG.TEMPLATES[+useBtn.dataset.usar]);
      }

      const viewBtn = e.target.closest('[data-ver]');
      if (viewBtn) {
        this.onViewTemplate(CONFIG.TEMPLATES[+viewBtn.dataset.ver]);
      }
    });
  }

  showContinueBox(templateName) {
    $('#continuarNombre').textContent = templateName;
    $('#continuarBox').style.display = 'block';
  }

  hideContinueBox() {
    $('#continuarBox').style.display = 'none';
  }

  show() {
    $('#galeria').style.display = 'block';
  }

  hide() {
    $('#galeria').style.display = 'none';
  }
}
