import innerDirectives from "./index.js";

class Directives {
  /**
   * 
   * @param {Object} clientDirectives 
   */
  constructor(clientDirectives = {}) {
    this.directives = {
      ...innerDirectives,
      ...clientDirectives,
    };
  }
/**
 * 
 * @param {HTMLElement} element 
 * @param {string} key 
 * @param {string} value 
 */
  apply(element, key, value) {
    const [directive, modifier, ...args] = key.split("."); // ['text', 'fixed', '2', ...] // text.fixed.2

    if (this.directives.hasOwnProperty(directive)) {
      // @ts-ignore
      this.directives[directive](element, value, modifier, args);
    } else if (key in element) {
      // @ts-ignore
      element[directive] = value;
    } else {
      // for Attributes
      // @ts-ignore
      _attr(element, value, modifier, args);
    }
  }
}
export default Directives;
