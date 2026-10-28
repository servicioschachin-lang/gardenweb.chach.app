/* Vista: escritorio / móvil */
import { $ } from './utils.js';

export function applyViewToggle(editor) {
  editor.setupViewToggle = function() {
    const btnD = $('#btnDesktop');
    const btnM = $('#btnMobile');
    const frame = $('#frame');

    btnD.addEventListener('click', () => {
      frame.classList.remove('mobile');
      frame.classList.add('desktop');
      btnD.classList.add('primary');
      btnM.classList.remove('primary');
    });

    btnM.addEventListener('click', () => {
      frame.classList.remove('desktop');
      frame.classList.add('mobile');
      btnM.classList.add('primary');
      btnD.classList.remove('primary');
    });

    this.setupAddSocial();
  };
}
