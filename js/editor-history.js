/* Historial: deshacer / rehacer */
import { $, addBaseTag } from './utils.js';

export function applyHistory(editor) {
  editor.initHistory = function() {
    if (!this.estado) return;
    this.history = [this.estado.html];
    this.historyIndex = 0;
  };

  editor.schedulePush = function() {
    clearTimeout(this.historyTimer);
    this.historyTimer = setTimeout(() => this.pushHistory(), 600);
  };

  editor.pushHistory = function() {
    if (!this.estado) return;
    const html = this.getHTML();
    if (this.historyIndex >= 0 && this.history[this.historyIndex] === html) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(html);
    this.historyIndex = this.history.length - 1;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex = Math.max(0, this.historyIndex - 1);
    }
  };

  editor.undo = function() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreHistory();
  };

  editor.redo = function() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreHistory();
  };

  editor.restoreHistory = function() {
    if (!this.estado) return;
    this.estado.html = this.history[this.historyIndex];
    $('#frame').srcdoc = addBaseTag(this.estado.html, this.estado.base);
    $('#edEstado').textContent = 'Cambios restaurados';
    $('#frame').addEventListener('load', () => this.prepareEditing(), { once: true });
  };
}
