import { commonModifiers, modifiers } from "./modifiers/index.js"
/**
 *
 * @param {string} modifier
 * @param {any} value
 * @param {string | number} args
 */
export function applyModifier(value, modifier, args, directive) {
  if (!modifier) return value

  // сначала ищем в специфичных модификаторах
  // @ts-ignore
  if (directive && modifiers[directive] && modifiers[directive][modifier]) {
    // @ts-ignore
    return modifiers[directive][modifier](value, ...args)
  }

  // Затем ищем в общих модификаторах
  // @ts-ignore
  if (commonModifiers[modifier]) {
    // @ts-ignore
    return commonModifiers[modifier](value, ...args)
  }

//   if (modifiers.hasOwnProperty(modifier)) {
//     return modifiers[modifier](...args)
//   } else {
//     console.error("error modifier")
//     return value
//   }
}
