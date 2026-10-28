/* SelecciÃ³n de elemento y barra de herramientas flotante */
import { $ } from './utils.js';
import { ElementToolbar } from './element-toolbar.js';

export function applyElementSelection(editor) {
  editor.selectElement = function(el) {
    const doc = $('#frame').contentDocument;
    if (this.elementoSeleccionado) this.elementoSeleccionado.style.outline = '';
    if (this.toolbar) this.toolbar.hide();
    this.elementoSeleccionado = el;
    el.style.outline = '3px solid #4f6df5';

    // Sincronizar inputs de color de boton con el elemento seleccionado (aislado)
    if (editor.syncButtonInputs) editor.syncButtonInputs(el);

    this.toolbar = new ElementToolbar(doc, {
      onEdit: (target) => {
        try { target.setAttribute('contenteditable', 'true'); target.focus(); } catch (e) {}
      },
      onColor: (target, type, value) => {
        if (type === 'bg') {
          target.style.backgroundColor = value;
          target.setAttribute('data-cw-bg', value);
        } else {
          target.style.color = value;
          target.setAttribute('data-cw-color', value);
        }
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      },
      onDelete: (target) => {
        if (!target || !target.parentNode) return;
        const tieneTextoEditable = target.querySelector('[data-cw-edit]') !== null;
        const esContenedorHero = target.classList && target.classList.contains('hero');
        if (tieneTextoEditable || esContenedorHero) {
          if (!confirm('Este elemento contiene texto u otros contenidos. Â¿EstÃ¡s seguro de que quieres borrarlo todo?')) {
            return;
          }
        }
        target.parentNode.removeChild(target);
        this.elementoSeleccionado = null;
        if (this.toolbar) this.toolbar.hide();
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      },
      onChangeImage: (target) => {
        if (target.tagName === 'IMG') {
          this.imageEditor.replace(target);
        } else if (target.hasAttribute('data-cw-bg-img')) {
          this.replaceBackgroundImage(target);
        }
      },
      onFont: (target, type, value) => {
        if (type === 'size') target.style.fontSize = value + 'px';
        else if (type === 'weight') target.style.fontWeight = value;
        else if (type === 'style') target.style.fontStyle = value;
        else if (type === 'family') {
          target.style.fontFamily = value;
          target.setAttribute('data-cw-font', value);
        }
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
        this.schedulePush();
      },
      onReplaceImage: (target) => {
        const doc = $('#frame').contentDocument;
        const img = doc.createElement('img');
        img.alt = '';
        img.style.maxWidth = '100%';
        img.setAttribute('data-cw-img', '1');
        target.insertBefore(img, target.firstChild);
        this.elementoSeleccionado = null;
        if (this.toolbar) this.toolbar.hide();
        this.selectElement(img);
        this.imageEditor.replace(img);
        $('#edEstado').textContent = 'Cambios sin guardar';
        this.schedulePush();
        if (this.onChange) this.onChange();
      },
    });
    this.toolbar.show(el);
  };
}
