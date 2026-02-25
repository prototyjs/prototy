import { isObject } from "../utils/isObject"
/**
 *
 * @param {HTMLElement} element
 * @param {Object} value
 * @returns {void}
 */
export function _class(element, value) {
  if (!isObject(value)) return console.error("error class")
  Object.entries(value).forEach(([className, condition]) => {
    element.classList.toggle(className, !!condition)
  })
}
