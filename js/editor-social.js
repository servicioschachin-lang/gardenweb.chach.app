/* Redes sociales de la plantilla */
import { $ } from './utils.js';

import { SOCIAL_LABEL } from './editor-social-icons.js';

export function applySocial(editor) {
  editor._socialSetupDone = false;

  editor.setupAddSocial = function() {
    if (editor._socialSetupDone) return;
    editor._socialSetupDone = true;

    const btn = $('#btnAgregarSocial');
    const modal = new bootstrap.Modal($('#modalSocial'));
    editor.modalSocial = modal;

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
        editor.addSocialLink(social, url);
        modal.hide();
        $('#inputSocialUrl').value = '';
        err.style.display = 'none';
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (editor.onChange) editor.onChange();
      } catch (e) {
        err.textContent = 'Error: ' + e.message;
        err.style.display = 'block';
      }
    });
  };

  editor.addSocialLink = function(social, url) {
    const doc = $('#frame').contentDocument;
    if (!doc || !doc.body) throw new Error('No hay documento cargado');

    const nombreCanonico = SOCIAL_LABEL[social] || social;

    // 1. Reutilizar un elemento existente con el nombre de esta red social si lo hay
    // Busca en <a> ya marcados, luego en <a> por texto exacto, luego en otros elementos
    let existente = doc.querySelector(`a[data-cw-social-name="${nombreCanonico}"]`);

    if (!existente) {
      existente = Array.from(doc.querySelectorAll('a[href]')).find(a => {
        const texto = (a.textContent || '').trim();
        const lower = texto.toLowerCase().replace(/[^a-z0-9]/g, '');
        return lower === social;
      });
    }

    if (!existente) {
      existente = Array.from(doc.querySelectorAll('button, div, span, p, li')).find(el => editor.detectSocialName(el) === nombreCanonico);
    }

    if (existente) {
      const a = editor.prepareSocialElement(existente, nombreCanonico);
      a.href = url;
      editor.renderSocialLinks(doc);
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (editor.onChange) editor.onChange();
      return;
    }

    // 2. Crear uno nuevo con icono al pie de pagina
    const footer = doc.querySelector('footer') || doc.body.lastElementChild;
    if (!footer) throw new Error('No se encontro footer en la plantilla');

    const a = doc.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('data-cw-social', '1');

    const svg = editor.getSocialIcon(social);
    a.innerHTML = svg;

    const socialContainer = footer.querySelector('[data-social-container]') || footer;
    socialContainer.appendChild(a);

    editor.renderSocialLinks(doc);
  };
}
