import { applyModifier } from "../modifiers";
/**
 *
 * @param {HTMLElement} element
 * @param {any} value
 * @param {string} modifier
 * @param {string | number} args
 */
export function _text(element, value, modifier, args) {
  element.textContent = applyModifier(value, modifier, args) ?? ""
}
