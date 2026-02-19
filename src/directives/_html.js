import { applyModifier } from "./modifiers";

/**
 *
 * @param {HTMLElement} element
 * @param {any} value
 * @param {string} modifier
 * @param {string | number} args
 */
export function _html(element, value, modifier, args) {
  element.innerHTML = applyModifier(value, modifier, args) ?? "";
}
