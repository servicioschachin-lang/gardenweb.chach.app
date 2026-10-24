/* Utilidades generales */

export const $ = (selector) => document.querySelector(selector);

export const escapeHtml = (text) => {
  return String(text).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
};

export const cleanSubdomain = (value) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+/, '')
    .slice(0, 30);
};

export const rgbToHex = (rgb) => {
  if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return '#' + [match[1], match[2], match[3]]
    .map(x => parseInt(x).toString(16).padStart(2, '0'))
    .join('');
};

export const addBaseTag = (html, base) => {
  const tag = `<base href="${base}" data-cw="1">`;
  return /<head[^>]*>/i.test(html)
    ? html.replace(/<head[^>]*>/i, m => m + tag)
    : tag + html;
};

export const downloadFile = (content, filename) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/html' }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
