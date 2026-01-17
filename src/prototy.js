import { findElements } from './utils/findElements'
/**
 * @typedef {object} PrototyOptions
 * @property {object} state - Реактивное состояние приложения
 * @property {object} static - Статические данные
 * @property {Object.<string, Function>} handles - Обработчики событий
 */
class Prototy {
	/**
   * @param {PrototyOptions} options - Опции приложения
   */
	constructor(options) {
	 /** @type {object} Исходное реактивное состояние */
		this._state = options.state

		/** @type {object} Статические данные */
		this.static = options.static

		/** @type {Object.<string, Function>} Методы обработчики */
		this.handles = {}

	 // Привязка методов из handles к текущему контексту
		Object.keys(options.handles).forEach(key => {
			if (typeof options.handles[key] === 'function') {
				this.handles[key] = options.handles[key].bind(this)
			}
		})
    
		// Инициализация после загрузки DOM
		document.addEventListener('DOMContentLoaded', () => {
			// Находим все элементы с директивами
			this.elements = findElements(document)
      
		})

	}
}
new Prototy()