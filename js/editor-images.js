/* Imágenes: cambio de etiqueta <img> y fondo CSS */
import { $ } from './utils.js';

export function applyImageEditing(editor) {
  editor.changeImage = function(img) {
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
          $('#edEstado').textContent = 'Cambios sin guardar';
          this.schedulePush();
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  };

  editor.replaceBackgroundImage = function(el) {
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
          const M = 1600;
          const k = Math.min(1, M / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const data = f.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .85);
          el.style.setProperty('background-image', `url(${data})`, 'important');
          el.style.setProperty('background-size', 'cover', 'important');
          el.style.setProperty('background-position', 'center', 'important');
          el.style.setProperty('background-repeat', 'no-repeat', 'important');
          el.setAttribute('data-cw-bg-img', '1');
          $('#edEstado').textContent = 'Cambios sin guardar';
          this.schedulePush();
          if (this.onChange) this.onChange();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  };
}
