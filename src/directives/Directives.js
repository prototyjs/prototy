import innerDirectives from "./methods/index.js"
import { _attr } from "./methods/_attr.js"

class Directives {
  /**
   *
   * @param {Object} clientDirectives
   */
  constructor(clientDirectives = {}, setup) {
    this.setup = setup
    this.directives = {
      ...innerDirectives,
      ...clientDirectives,
    }
  }
  /**
   *
   * @param {HTMLElement} element
   * @param {string} key
   * @param {string} value
   */
  apply(element, key, value) {
    const [directive, modifier, ...args] = key.split(".") // ['text', 'fixed', '2', ...] // text.fixed.2

    if (this.directives.hasOwnProperty(directive) || directive === "text") {
      // @ts-ignore
      //console.log(directive)
      console.log(modifier)
      this.directives["_" + directive](element, value, modifier, args)
    } else {
      // for Attributes
      // @ts-ignore
      _attr(element, value, modifier, args, directive)
    }
  }
}
export default Directives
