import { findElements } from "./utils/findElements.js";
import { isObject } from "./utils/isObject.js";
import { isEqual } from "./utils/isEqual.js";

/**
 * @typedef {object} PrototyOptions
 * @property {object} state
 * @property {object} static
 * @property {Record<string, Function>} handles
 */

class Prototy {
  /**
   * @param {PrototyOptions} options
   */
  constructor(options) {
    /** @type {object & { _handles?: Record<string, Function> }} */
    /** @type {object & { _handles?: Record<string, Function> }} */
    const initialState = {
      ...options.state,
      _handles: {},
    };
    /** @type {object} */
    this._state = options.state;

    /** @type {object} */
    this.static = options.static;

    /** @type {WeakMap<object, any>} */
    this._proxyCache = new WeakMap();

    if (options.handles) {
      Object.keys(options.handles).forEach((key) => {
        if (typeof options.handles[key] === "function") {
          if (initialState._handles) {
            initialState._handles[key] = options.handles[key].bind(this);
          }
        }
      });
    }

    this.state = this.createProxy(initialState);

    /** @type {Record<string, Function>} */
    this.handles = options.handles || {};

    /** @type {Array<{element: HTMLElement, _reactivity: Record<string, any>}>} */
    this.reactiveElements = [];

    /** @type {Function | null} */
    this.activeEffect = null;

    /** @type {{element: HTMLElement, _reactivity: Record<string, any>, key: string} | null} */
    this.activeReactiveElement = null;

    /** @type {WeakMap<HTMLElement, Map<string, EventListener>>} */
    this._eventHandlers = new WeakMap();

    if (options.handles) {
      Object.keys(options.handles).forEach((key) => {
        if (typeof options.handles[key] === "function") {
          this.handles[key] = options.handles[key].bind(this);
        }
      });
    }

    document.addEventListener("DOMContentLoaded", () => {
      this.reactiveElements = findElements(
        document,
        (
          /** @type {{element: HTMLElement, _reactivity: Record<string, any>}} */ reactiveElement,
          /** @type {string} */ key,
          /** @type {string} */ code
        ) => {
          const { element, _reactivity } = reactiveElement;

          // Создаем функцию для вычисления значения
          const computeValue = new Function("state", `return ${code}`);

          // Функция для обновления элемента
          const updateElement = () => {
            try {
              const value = computeValue(this.state);
              this.updateDOM(element, key, value);
            } catch (error) {
              console.error(`Error computing value for ${key}:`, error);
            }
          };

          // Сохраняем функцию обновления
          _reactivity[key].update = updateElement;

          // Запускаем отслеживание зависимостей
          this.autorun(updateElement, reactiveElement, key);
        }
      );
      console.log(
        "Found reactive elements:",
        this.reactiveElements.map((re) => re.element)
      );
    });
  }

  /**
   * Обновляет DOM элемент в зависимости от типа атрибута
   * @param {HTMLElement} element
   * @param {string} key
   * @param {any} value
   */
  updateDOM(element, key, value) {
    // Безопасные проверки для свойств
    switch (key) {
      case "text":
      case "textContent":
        element.textContent = value != null ? String(value) : "";
        break;
      case "html":
      case "innerHTML":
        element.innerHTML = value != null ? String(value) : "";
        break;
      case "class":
      case "className":
        if (typeof value === "string") {
          element.className = value;
        } else if (value && typeof value === "object") {
          Object.keys(value).forEach((className) => {
            element.classList.toggle(className, !!value[className]);
          });
        }
        break;
      case "style":
        if (typeof value === "string") {
          element.style.cssText = value;
        } else if (value && typeof value === "object") {
          Object.assign(element.style, value);
        }
        break;
      case "value":
        // Проверяем, поддерживает ли элемент свойство value
        if ("value" in element) {
          element.value = value != null ? String(value) : "";
        }
        break;
      case "disabled":
        // Проверяем, поддерживает ли элемент свойство disabled
        if ("disabled" in element) {
          element.disabled = !!value;
        }
        break;
      case "checked":
        // Проверяем, поддерживает ли элемент свойство checked
        if ("checked" in element) {
          element.checked = !!value;
        }
        break;
      case "hidden":
        element.hidden = !!value;
        break;
      case "show":
        element.style.display = value ? "" : "none";
        break;
      case "if":
        if (value) {
          if (element.style.display === "none") {
            element.style.display = "";
          }
        } else {
          element.style.display = "none";
        }
        break;
      case "onclick":
      case "onchange":
      case "oninput":
      case "onsubmit":
        if (typeof value === "function") {
          const eventName = key.slice(2); // удаляем 'on'

          // Получаем текущий обработчик
          const oldHandler = this._getEventHandler(element, eventName);
          if (oldHandler) {
            // Явно указываем тип для removeEventListener
            element.removeEventListener(eventName, oldHandler);
          }

          // Создаем новый обработчик с правильным контекстом
          const newHandler = /** @type {EventListener} */ (
            (event) => {
              try {
                // Вызываем функцию с контекстом state
                value.call(this.state, event);
              } catch (error) {
                console.error(
                  `Error in event handler for ${eventName}:`,
                  error
                );
              }
            }
          );

          // Сохраняем и добавляем новый обработчик
          this._setEventHandler(element, eventName, newHandler);
          element.addEventListener(eventName, newHandler);
        } else if (value === false || value === null || value === undefined) {
          // Удаляем обработчик если значение ложно
          const eventName = key.slice(2);
          const oldHandler = this._getEventHandler(element, eventName);
          if (oldHandler) {
            element.removeEventListener(eventName, oldHandler);
            this._removeEventHandler(element, eventName);
          }
        }
        break;
      default:
        if (key.startsWith("data-")) {
          element.setAttribute(key, value != null ? String(value) : "");
        } else {
          // Для всех остальных атрибутов
          if (value === false || value === null || value === undefined) {
            element.removeAttribute(key);
          } else {
            element.setAttribute(key, value != null ? String(value) : "");
          }
        }
    }
  }

  /**
   * Получает обработчик события для элемента
   * @param {HTMLElement} element
   * @param {string} eventName
   * @returns {EventListener | null}
   */
  _getEventHandler(element, eventName) {
    const elementHandlers = this._eventHandlers.get(element);
    if (!elementHandlers) return null;
    return elementHandlers.get(eventName) || null;
  }

  /**
   * Сохраняет обработчик события для элемента
   * @param {HTMLElement} element
   * @param {string} eventName
   * @param {EventListener} handler
   */
  _setEventHandler(element, eventName, handler) {
    let elementHandlers = this._eventHandlers.get(element);
    if (!elementHandlers) {
      elementHandlers = new Map();
      this._eventHandlers.set(element, elementHandlers);
    }

    elementHandlers.set(eventName, handler);
  }

  /**
   * Удаляет обработчик события для элемента
   * @param {HTMLElement} element
   * @param {string} eventName
   */
  _removeEventHandler(element, eventName) {
    const elementHandlers = this._eventHandlers.get(element);
    if (elementHandlers) {
      elementHandlers.delete(eventName);
    }
  }

  /**
   * @param {any} state
   * @param {string} path
   * @returns {object}
   */
  createProxy(state, path = "") {
    const self = this;

    // Если уже есть прокси для этого объекта, возвращаем его
    if (this._proxyCache.has(state)) {
      return this._proxyCache.get(state);
    }

    // Рекурсивно создаем прокси для вложенных объектов
    if (isObject(state)) {
      Object.keys(state).forEach((key) => {
        if (isObject(state[key])) {
          state[key] = this.createProxy(
            state[key],
            path ? `${path}.${key}` : key
          );
        }
      });
    }

    const proxy = new Proxy(state, {
      get(target, property, receiver) {
        /** @type {Record<string | symbol, any>} */
        const t = target;

        const fullPath = path
          ? `${path}.${property.toString()}`
          : property.toString();

        // Если есть активный эффект, запоминаем зависимость
        if (self.activeEffect && self.activeReactiveElement) {
          const { _reactivity, key } = self.activeReactiveElement;
          if (_reactivity && _reactivity[key]) {
            _reactivity[key].dependencies.set(fullPath, true);
          }
        }

        const value = Reflect.get(t, property, receiver);

        if (isObject(value)) {
          // Возвращаем проксированный объект
          return self.createProxy(value, fullPath);
        }
        return value;
      },
      set(target, property, value) {
        /** @type {Record<string | symbol, any>} */
        const t = target;
        const oldValue = Reflect.get(t, property);
        const fullPath = path
          ? `${path}.${property.toString()}`
          : property.toString();

        let newValue = value;
        if (isObject(value) && !self._proxyCache.has(value)) {
          newValue = self.createProxy(value, fullPath);
        }
        const success = Reflect.set(t, property, newValue);

        if (success && !isEqual(oldValue, newValue)) {
          self.trigger(fullPath);
        }
        return success;
      },
    });

    // Кешируем прокси
    this._proxyCache.set(state, proxy);
    return proxy;
  }

  /**
   * @param {Function} fn
   * @param {{element: HTMLElement, _reactivity: Record<string, any>}} reactiveElement
   * @param {string} key
   */
  autorun(fn, reactiveElement, key) {
    this.activeEffect = fn;
    this.activeReactiveElement = { ...reactiveElement, key };

    fn();

    // Очищаем после выполнения
    this.activeEffect = null;
    this.activeReactiveElement = null;
  }

  /**
   * Вызывает все эффекты, зависящие от пути
   * @param {string} path
   */
  trigger(path) {
    console.log("Triggered:", path);

    // Проходим по всем элементам
    this.reactiveElements.forEach((reactiveElement) => {
      const { _reactivity } = reactiveElement;
      if (!_reactivity) return;

      // Проходим по всем реактивным атрибутами элемента
      Object.keys(_reactivity).forEach((key) => {
        const reactivity = _reactivity[key];

        // Проверяем, зависит ли этот атрибут от измененного пути
        if (reactivity.dependencies.has(path)) {
          try {
            // Вызываем сохраненную функцию обновления
            if (reactivity.update) {
              reactivity.update();
            }
          } catch (error) {
            console.error(`Error updating ${key}:`, error);
          }
        }
      });
    });
  }
}

export default Prototy;
