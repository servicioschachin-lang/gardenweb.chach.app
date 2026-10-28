# CreaWeb - Editor de Plantillas Web

CreaWeb es una aplicación web que permite a los usuarios personalizar plantillas web predefinidas y publicarlas en subdominios gratuitos. Los usuarios pueden editar textos, imágenes, colores y más, sin necesidad de conocimientos de programación.

## 🚀 Características

- **Galería de Plantillas**: Selección entre 10 plantillas predefinidas con diferentes estilos (glassmorphism, neumorfismo, minimalismo, brutalismo, claymorfismo)
- **Editor Visual**:
  - Edición de textos directa
  - Cambio de imágenes (incluyendo fondos CSS de hero/secciones)
  - Personalización de colores de fondo y texto
  - Borrar elementos no deseados
  - Vista previa en modo escritorio y móvil
- **Gestión de Redes Sociales**: Agregar y editar enlaces a redes sociales (Facebook, Instagram, TikTok, WhatsApp, X/Twitter, YouTube, LinkedIn, Telegram)
- **Guardado de Progreso**: Persistencia local de cambios para continuar editando después
- **Publicación**: Envío de la web personalizada mediante formulario Formspree
- **Múltiples Dominios**: Soporte para elegir entre varios dominios disponibles

## 📁 Estructura del Proyecto

```
Inmoweb Chach App/
├── index.html              # Página principal de la aplicación
├── styles.css              # Estilos generales (neumorfismo)
├── js/
│   ├── config.js           # Configuración general (dominios, plantillas)
│   ├── app.js              # Orquestador principal de la aplicación
│   ├── utils.js            # Utilidades compartidas
│   ├── gallery.js          # Gestión de la galería de plantillas
│   ├── editor.js           # Lógica del editor visual
│   ├── image-editor.js     # Editor de imágenes
│   ├── element-toolbar.js  # Barra de herramientas de elementos
│   ├── form-handler.js     # Gestión del formulario de publicación
│   └── elije tu subdominio gratis.js  # (Sin usar - puede eliminarse)
├── plantillas/             # Archivos HTML de las plantillas
└── .vscode/
    └── settings.json       # Configuración de VS Code (puerto Live Server)
```

## ⚙️ Configuración

### Dominios Disponibles

Edita `js/config.js` para configurar los dominios disponibles:

```javascript
export const CONFIG = {
  DOMINIOS: ['empresagt.com', 'chach.app', 'chachin.dev'],
  DOMINIO_DEFAULT: 'empresagt.com',
  // ... otras configuraciones
};
```

### Plantillas

Las plantillas se configuran en `js/config.js`:

```javascript
TEMPLATES: [
  { nombre: 'Plantilla 01', url: 'plantillas/01_glass_landing.html' },
  { nombre: 'Plantilla 02', url: 'plantillas/04_neumorfismo_multipage.html' },
  // ... más plantillas
]
```

### Live Server

El proyecto está configurado para usar el puerto 5501 en lugar del 5500 predeterminado (ver `.vscode/settings.json`).

## 🛠️ Instalación y Uso

### Requisitos Previos

- Un servidor web local (Live Server, http-server, etc.)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

### Pasos para Ejecutar

1. **Clonar o descargar el proyecto**
2. **Abrir en VS Code** (o tu editor preferido)
3. **Iniciar Live Server**:
   - Si usas VS Code con extensión Live Server, simplemente abre `index.html` y presiona "Go Live"
   - O manualmente: `npx http-server -p 5501`
4. **Abrir en el navegador**: `http://127.0.0.1:5501`

### Uso Básico

1. **Seleccionar una plantilla** de la galería
2. **Presionar "Usar"** para abrir el editor
3. **Editar elementos**:
   - Clic en textos para editar
   - Clic en imágenes para cambiarlas
   - Clic en fondos de secciones para cambiarlos
   - Shift + clic en cualquier elemento para cambiar su color
4. **Cambiar vista** entre escritorio y móvil
5. **Guardar cambios** (se guardan localmente)
6. **Publicar** rellenando el formulario con tus datos

## 🎨 Personalización

### Colores del Editor

Los colores de la interfaz del editor se configuran en `styles.css`:

```css
:root {
  --bg: #255b7ada;      /* Fondo principal */
  --sh1: #1e4f7d;       /* Sombra 1 */
  --sh2: #e7e7ed;       /* Sombra 2 */
  --tx: #ffffff;        /* Texto */
  --ac: #ffffff;        /* Acento */
}
```

### Formspree

El formulario de publicación usa Formspree. Configura tu endpoint en `js/config.js`:

```javascript
FORMSPREE: 'https://formspree.io/f/tu-form-id',
```

## 📝 Notas Técnicas

### Soporte de Fondos CSS

El editor ahora detecta automáticamente elementos con `background-image` CSS (no solo gradientes) y permite cambiarlos. Esto incluye:
- Hero sections con fondos de imagen
- Secciones con backgrounds
- Cualquier elemento con imagen de fondo

### Persistencia Local

El progreso se guarda en `localStorage` bajo la clave `creaweb_estado_v1`. Los datos incluyen:
- HTML modificado
- Nombre de la plantilla
- URL de la plantilla original

### Límites

- Tamaño máximo del HTML: 900 KB (configurable en `CONFIG.LIMITE_HTML`)
- Subdominio: 3-30 caracteres, solo letras minúsculas, números y guiones
- Imágenes se redimensionan automáticamente a máximo 1600px de ancho/alto

## 🔧 Solución de Problemas

### Live Server se queda atascado en puerto 5500

El proyecto está configurado para usar el puerto 5501. Si tienes problemas:
1. Cierra cualquier proceso en el puerto 5500: `netstat -ano | findstr :5500`
2. Usa el puerto 5501 configurado en `.vscode/settings.json`

### Los cambios no se aplican

1. Recarga el navegador con `Ctrl + F5` (limpia caché)
2. Verifica que no haya errores en la consola del navegador
3. Asegúrate de que los archivos JS se estén cargando correctamente

### Las imágenes no se pueden cambiar

Verifica que:
- La imagen tenga el atributo `data-cw-img` (agregado automáticamente)
- Para fondos CSS, el elemento debe tener `data-cw-bg-img` (agregado automáticamente si tiene `background-image`)

## 📄 Licencia

Este proyecto es propiedad de Chach App.

## 🤝 Contribuciones

Para agregar nuevas plantillas:
1. Agrega el archivo HTML en la carpeta `plantillas/`
2. Regístralo en `js/config.js` en el array `TEMPLATES`
3. La plantilla será visible automáticamente en la galería

## 📞 Soporte

Para soporte, visita: https://web.chach.app
