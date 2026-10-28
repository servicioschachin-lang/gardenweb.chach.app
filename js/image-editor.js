export class ImageEditor {
  constructor(onChange, onHistoryPush) {
    this.onChange = onChange;
    this.onHistoryPush = onHistoryPush;
  }
  replace(img) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const im = new Image();
        im.onload = () => {
          // Usar el document correcto del iframe para obtener estilos computados
          const doc = img.ownerDocument;
          const computed = doc.defaultView.getComputedStyle(img);

          // Guardar solo estilos que afectan al ajuste y no vienen de clases CSS externas
          const originalObjectFit = img.style.objectFit || computed.objectFit;
          const originalObjectPosition = img.style.objectPosition || computed.objectPosition;
          const originalDisplay = img.style.display || computed.display;
          const originalMaxWidth = img.style.maxWidth || computed.maxWidth;

          const M = 1600;
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .85);
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.src = data;

          // Restaurar estilos de ajuste para que la nueva imagen se comporte igual
          img.style.objectFit = originalObjectFit;
          img.style.objectPosition = originalObjectPosition;
          img.style.display = originalDisplay;
          img.style.maxWidth = originalMaxWidth;
          // No forzar width/height inline: dejar que las clases CSS (w-100, h-100, etc.) las controlen

          if (this.onHistoryPush) this.onHistoryPush();
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }
}
