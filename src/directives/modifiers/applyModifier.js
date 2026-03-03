import { modifiers } from "./base.js"
/**
 *
 * @param {string} modifier
 * @param {any} value
 * @param {string | number} args
 */
export function applyModifier(value, modifier, args) {
  if (!modifier) return value

  if (modifiers.hasOwnProperty(modifier)) {
    return modifiers[modifier](...args)
  } else {
    console.error("error modifier")
    return value
  }
}
