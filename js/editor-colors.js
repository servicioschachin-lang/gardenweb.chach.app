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

  const BTN_SELECTORES = 'button, [role="button"], .btn, .cta, a.btn, a.cta, a.neu-btn';

  function esBotonLike(el) {
    return el && el.matches && el.matches(BTN_SELECTORES);
  }

  // Sincroniza los inputs de color de boton con el elemento seleccionado (aislado)
  editor.syncButtonInputs = function(el) {
    const cb = $('#colorBotones');
    const ct = $('#colorTextoBotones');
    const ci = $('#colorBotonesGradInicio');
    const cf = $('#colorBotonesGradFin');
    const cd = $('#dirBotonesGrad');

    if (el && esBotonLike(el)) {
      if (cb) cb.value = el.style.backgroundColor || '#3b3409';
      if (ct) ct.value = el.style.color || '#000000';
      // Gradiente: si tiene atributo, restaurar; si no, valores por defecto
      const grad = el.getAttribute('data-cw-btn-grad');
      if (ci && cf && cd) {
        if (grad === '1') {
          ci.value = el.getAttribute('data-cw-btn-grad-inicio') || '#3b3409';
          cf.value = el.getAttribute('data-cw-btn-grad-fin') || '#3b3409';
          cd.value = el.getAttribute('data-cw-btn-grad-dir') || 'to right';
        } else {
          ci.value = '#3b3409';
          cf.value = '#3b3409';
          cd.value = 'to right';
        }
      }
    } else {
      // Sin seleccion o no es boton: valores por defecto sin aplicar a nada
      if (cb) cb.value = '#3b3409';
      if (ct) ct.value = '#000000';
      if (ci && cf && cd) {
        ci.value = '#3b3409';
        cf.value = '#3b3409';
        cd.value = 'to right';
      }
    }
  };

  /* Selector de color de fondo del boton seleccionado (aislado, no global) */
  editor.setupButtonColorPicker = function(doc) {
    const cb = $('#colorBotones');
    if (!cb || !doc) return;

    const aplicar = () => {
      const el = this.elementoSeleccionado;
      if (!el || !esBotonLike(el)) return;
      const color = cb.value;
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('background-color', color, 'important');
      el.setAttribute('data-cw-btn-bg', color);
      el.removeAttribute('data-cw-btn-grad');
      el.removeAttribute('data-cw-btn-grad-dir');
      el.removeAttribute('data-cw-btn-grad-inicio');
      el.removeAttribute('data-cw-btn-grad-fin');
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };

    cb.addEventListener('input', aplicar);
  };

  /* Selector de color de texto del boton seleccionado (aislado, no global) */
  editor.setupButtonTextColorPicker = function(doc) {
    const ct = $('#colorTextoBotones');
    if (!ct || !doc) return;

    const aplicar = () => {
      const el = this.elementoSeleccionado;
      if (!el || !esBotonLike(el)) return;
      const color = ct.value;
      el.style.setProperty('color', color, 'important');
      el.setAttribute('data-cw-btn-text', color);
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };

    ct.addEventListener('input', aplicar);
  };

  /* Selector de degradado del boton seleccionado (aislado, no global) */
  editor.setupButtonGradientPicker = function(doc) {
    const ci = $('#colorBotonesGradInicio');
    const cf = $('#colorBotonesGradFin');
    const cd = $('#dirBotonesGrad');
    if (!ci || !cf || !cd || !doc) return;

    const aplicar = () => {
      const el = this.elementoSeleccionado;
      if (!el || !esBotonLike(el)) return;
      const inicio = ci.value;
      const fin = cf.value;
      const dir = cd.value;
      if (inicio !== fin) {
        el.style.setProperty('background-image', `linear-gradient(${dir}, ${inicio}, ${fin})`, 'important');
        el.style.setProperty('background-color', inicio, 'important');
        el.setAttribute('data-cw-btn-grad', '1');
        el.setAttribute('data-cw-btn-grad-dir', dir);
        el.setAttribute('data-cw-btn-grad-inicio', inicio);
        el.setAttribute('data-cw-btn-grad-fin', fin);
        el.removeAttribute('data-cw-btn-bg');
      } else {
        el.style.setProperty('background-image', 'none', 'important');
        el.removeAttribute('data-cw-btn-grad');
        el.removeAttribute('data-cw-btn-grad-dir');
        el.removeAttribute('data-cw-btn-grad-inicio');
        el.removeAttribute('data-cw-btn-grad-fin');
      }
      $('#edEstado').textContent = 'Cambios sin guardar';
      if (this.onChange) this.onChange();
    };

    ci.addEventListener('input', aplicar);
    cf.addEventListener('input', aplicar);
    cd.addEventListener('change', aplicar);
  };
}
