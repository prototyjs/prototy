import innerDirectives from "./index.js"
import { _attr } from "./_attr.js"

class Directives {
  /**
   *
   * @param {Object} clientDirectives
   */
  constructor(clientDirectives = {}, setup) {
    this.setup = setup
    console.log("innerDirectives:", innerDirectives)
    console.log("clientDirectives:", clientDirectives)
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

    if (this.directives.hasOwnProperty(directive) || directive==='text') {
      // @ts-ignore
      console.log(directive)
      this.directives['_' + directive](element, value, modifier, args)
    } else {
      // for Attributes
      // @ts-ignore
      _attr(element, value, modifier, args, directive)
    }
  }
}
export default Directives
