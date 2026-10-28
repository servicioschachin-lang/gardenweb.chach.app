/* Iconos y renderizado de enlaces sociales */
import { $ } from './utils.js';
import { SOCIAL_PATTERNS, SOCIAL_NAMES } from './config.js';

export const SOCIAL_LABEL = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  twitter: 'Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  telegram: 'Telegram'
};

const NOMBRES_EXACTOS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  twitter: 'Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  telegram: 'Telegram'
};

export function applySocialIcons(editor) {
  editor.getSocialIcon = function(social) {
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
  };

  // Detecta si un elemento lleva el nombre exacto de una red social (coincidencia de palabra completa)
  editor.detectSocialName = function(el) {
    if (!el) return null;
    const ya = el.getAttribute('data-cw-social-name');
    if (ya) return ya;

    const tag = el.tagName.toLowerCase();
    if (['input', 'textarea', 'select', 'script', 'style', 'a'].includes(tag)) return null;

    const texto = (el.textContent || '').trim();
    if (!texto) return null;

    const lower = texto.toLowerCase();
    const limpio = lower.replace(/[^a-z0-9]/g, '');
    if (NOMBRES_EXACTOS[limpio]) return NOMBRES_EXACTOS[limpio];

    return null;
  };

  // Convierte un elemento (boton/div/etc.) con nombre de red en un <a> editable,
  // o marca un <a> existente como enlace social.
  editor.prepareSocialElement = function(el, nombre) {
    const doc = el.ownerDocument;
    const tag = el.tagName.toLowerCase();
    if (tag === 'a') {
      el.setAttribute('data-cw-social-name', nombre);
      if (!el.getAttribute('href')) el.setAttribute('href', '');
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
      return el;
    }
    const a = doc.createElement('a');
    a.setAttribute('href', '');
    a.setAttribute('data-cw-social-name', nombre);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
    if (el.className) a.className = el.className;
    if (el.style.cssText) a.style.cssText = el.style.cssText;
    a.textContent = el.textContent;
    ['id', 'title', 'aria-label'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v) a.setAttribute(attr, v);
    });
    el.replaceWith(a);
    return a;
  };

  editor.renderSocialLinks = function(doc) {
    // 1. Detectar y convertir elementos con nombre de red social (botones, cuadros, etc.)
    const candidatos = doc.querySelectorAll('button, div, span, p, li');
    candidatos.forEach(el => {
      const nombre = editor.detectSocialName(el);
      if (nombre) editor.prepareSocialElement(el, nombre);
    });

    // 2. Buscar enlaces sociales (incluye los recien convertidos y los <a href="#"> con nombre)
    const links = [...doc.querySelectorAll('a[href]')].filter(a => {
      const href = a.getAttribute('href');
      if (SOCIAL_PATTERNS.test(href)) return true;
      if (a.getAttribute('data-cw-social-name')) return true;
      // Detectar <a href="#">Facebook</a> por texto exacto
      const texto = (a.textContent || '').trim();
      if (texto) {
        const lower = texto.toLowerCase();
        const limpio = lower.replace(/[^a-z0-9]/g, '');
        if (NOMBRES_EXACTOS[limpio]) return true;
      }
      const aria = a.getAttribute('aria-label');
      if (aria) {
        const nombre = (SOCIAL_NAMES.find(([r]) => r.test(aria)) || [0, ''])[1];
        if (nombre) return true;
      }
      const icon = a.querySelector('i');
      if (icon) {
        const classList = icon.classList;
        if (classList.contains('bi')) {
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
      box.style.display = 'block';
      return;
    }

    box.style.display = 'block';

    const socialMap = new Map();
    links.forEach(a => {
      const href = a.getAttribute('href');
      let nombre = a.getAttribute('data-cw-social-name');
      if (!nombre) {
        const texto = (a.textContent || '').trim();
        if (texto) {
          const lower = texto.toLowerCase();
          const limpio = lower.replace(/[^a-z0-9]/g, '');
          if (NOMBRES_EXACTOS[limpio]) nombre = NOMBRES_EXACTOS[limpio];
        }
      }
      if (!nombre) {
        const aria = a.getAttribute('aria-label');
        if (aria) {
          nombre = (SOCIAL_NAMES.find(([r]) => r.test(aria)) || [0, ''])[1];
        }
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

    socialMap.forEach((items, nombre) => {
      const row = document.createElement('div');
      row.className = 'social-row';
      row.innerHTML = `<span>${nombre}</span>`;
      const inp = document.createElement('input');
      inp.className = 'neu-input';
      inp.type = 'url';
      inp.placeholder = 'https://...';
      inp.value = items[0].href;
      inp.addEventListener('input', () => {
        items.forEach(item => {
          item.a.setAttribute('href', inp.value.trim());
        });
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (editor.onChange) editor.onChange();
      });
      row.appendChild(inp);
      list.appendChild(row);
    });
  };
}
