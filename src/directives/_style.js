import { isObject } from "../utils/isObject";
/**
 *
 * @param {HTMLElement} element
 * @param {Object} value
 * @returns
 */
export function _style(element, value) {
  if (!isObject(value)) return console.error("error style");
  Object.assign(element.style, value);
}
