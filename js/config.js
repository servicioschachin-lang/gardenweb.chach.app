/* Configuración de la aplicación */
export const CONFIG = {
  CREAWEB_URL: 'https://creaweb.chach.app',
  FORMSPREE: 'https://formspree.io/f/xrengvqb',
  DOMINIO: 'empresagt.com',
  LIMITE_HTML: 900000,
  STORE_KEY: 'creaweb_estado_v1',
  RESERVADOS: ['www', 'admin', 'mail', 'correo', 'ftp', 'api', 'app', 'panel', 'creaweb', 'soporte', 'ayuda', 'test'],
  TEMPLATES: [
    { nombre: 'Plantilla 01', url: 'plantillas/01-glasmorfismo-landing.html' },
    { nombre: 'Plantilla 02', url: 'plantillas/02-neumorfismo-multipage.html' },
    { nombre: 'Plantilla 03', url: 'plantillas/05-minimalismo-landing.html' },
    { nombre: 'Plantilla 06', url: 'plantillas/04-brutalismo-multipage.html' },
    { nombre: 'Plantilla 07', url: 'plantillas/03-claymorfismo-landing.html' },
    { nombre: 'Plantilla 08', url: 'plantillas/01-glasmorfismo-multipage.html' },
    { nombre: 'Plantilla 09', url: 'plantillas/02-neumorfismo-landing.html' },
    { nombre: 'Plantilla 10', url: 'plantillas/05-minimalismo-multipage.html' },
    { nombre: 'Plantilla 11', url: 'plantillas/04-brutalismo-landing.html' },
    { nombre: 'Plantilla 12', url: 'plantillas/03-claymorfismo-multipage.html' },
  ]
};

export const SOCIAL_PATTERNS = /(facebook\.com|fb\.com|instagram\.com|tiktok\.com|wa\.me|whatsapp\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|linkedin\.com|t\.me|telegram)/i;

export const SOCIAL_NAMES = [
  [/facebook|fb\.com/i, 'Facebook'],
  [/instagram/i, 'Instagram'],
  [/tiktok/i, 'TikTok'],
  [/wa\.me|whatsapp/i, 'WhatsApp'],
  [/twitter|x\.com/i, 'X / Twitter'],
  [/youtube|youtu\.be/i, 'YouTube'],
  [/linkedin/i, 'LinkedIn'],
  [/t\.me|telegram/i, 'Telegram']
];
