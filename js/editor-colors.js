/* Selectores de color (body y elemento seleccionado) */
import { $ } from './utils.js';

export function applyColorPickers(editor) {
  editor.setupColorPicker = function(doc) {
    const cf = $('#colorFondo');
    const ct = $('#colorTexto');
    const fb = $('#fuenteBody');

    cf.addEventListener('input', () => {
      doc.body.style.backgroundColor = cf.value;
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    });

    ct.addEventListener('input', () => {
      doc.body.style.color = ct.value;
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    });

    if (fb) {
      fb.addEventListener('change', () => {
        doc.body.style.fontFamily = fb.value;
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      });
    }
  };

  editor.setupElementColorPicker = function(doc) {
    const cf = $('#colorElementoFondo');
    const ct = $('#colorElementoTexto');
    const btn = $('#btnBorrarColor');

    cf.addEventListener('input', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.style.backgroundColor = cf.value;
        this.elementoSeleccionado.setAttribute('data-cw-bg', cf.value);
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });

    ct.addEventListener('input', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.style.color = ct.value;
        this.elementoSeleccionado.setAttribute('data-cw-color', ct.value);
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });

    btn.addEventListener('click', () => {
      if (this.elementoSeleccionado) {
        this.elementoSeleccionado.parentNode.removeChild(this.elementoSeleccionado);
        this.elementoSeleccionado = null;
        $('#selectorColor').style.display = 'none';
        $('#edEstado').textContent = 'Cambios sin guardar';
        if (this.onChange) this.onChange();
      }
    });
  };

  /* Selector de color de fondo para TODOS los botones de la plantilla */
  editor.setupButtonColorPicker = function(doc) {
    const cb = $('#colorBotones');
    if (!cb || !doc) return;
    const SELECTORES = 'button, [role="button"], .btn, .cta, a.btn, a.cta, a.neu-btn';
    const aplicar = () => {
      const color = cb.value;
      doc.querySelectorAll(SELECTORES).forEach(el => {
        // Quitar gradiente/fondo existente y forzar el color nuevo
        el.style.setProperty('background-image', 'none', 'important');
        el.style.setProperty('background-color', color, 'important');
        el.setAttribute('data-cw-btn-bg', color);
      });
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };
    cb.addEventListener('input', aplicar);
    aplicar();
  };

  /* Selector de color de texto para TODOS los botones de la plantilla */
  editor.setupButtonTextColorPicker = function(doc) {
    const ct = $('#colorTextoBotones');
    if (!ct || !doc) return;
    const SELECTORES = 'button, [role="button"], .btn, .cta, a.btn, a.cta, a.neu-btn';
    const aplicar = () => {
      const color = ct.value;
      doc.querySelectorAll(SELECTORES).forEach(el => {
        el.style.setProperty('color', color, 'important');
        el.setAttribute('data-cw-btn-text', color);
      });
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };
    ct.addEventListener('input', aplicar);
    aplicar();
  };

  /* Selector de degradado para TODOS los botones de la plantilla */
  editor.setupButtonGradientPicker = function(doc) {
    const ci = $('#colorBotonesGradInicio');
    const cf = $('#colorBotonesGradFin');
    const cd = $('#dirBotonesGrad');
    if (!ci || !cf || !cd || !doc) return;
    const SELECTORES = 'button, [role="button"], .btn, .cta, a.btn, a.cta, a.neu-btn';
    const aplicar = () => {
      const inicio = ci.value;
      const fin = cf.value;
      const dir = cd.value;
      doc.querySelectorAll(SELECTORES).forEach(el => {
        if (inicio !== fin) {
          el.style.setProperty('background-image', `linear-gradient(${dir}, ${inicio}, ${fin})`, 'important');
          el.style.setProperty('background-color', inicio, 'important');
          el.setAttribute('data-cw-btn-grad', '1');
          el.setAttribute('data-cw-btn-grad-dir', dir);
          el.setAttribute('data-cw-btn-grad-inicio', inicio);
          el.setAttribute('data-cw-btn-grad-fin', fin);
        } else {
          el.style.setProperty('background-image', 'none', 'important');
          el.removeAttribute('data-cw-btn-grad');
          el.removeAttribute('data-cw-btn-grad-dir');
          el.removeAttribute('data-cw-btn-grad-inicio');
          el.removeAttribute('data-cw-btn-grad-fin');
        }
      });
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };
    ci.addEventListener('input', aplicar);
    cf.addEventListener('input', aplicar);
    cd.addEventListener('change', aplicar);
    aplicar();
  };
}
