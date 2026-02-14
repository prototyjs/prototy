import innerDirectives from './index.js'

class Directives {
  
  constructor(clientDirectives = {}) {

	  this.directives = {
		  ...innerDirectives,
		  ...clientDirectives
	  };
  }

  // _class(element, value) {
  //   if (!isObject(value)) return console.error("error class");
  //   Object.entries(value).forEach(([className, condition]) => {
  //     element.classList.toggle(className, !!condition);
  //   });
  // }
  //
  // _style(element, value) {
  //   if (!isObject(value)) return console.error("error style");
  //   Object.assign(element.style, value);
  // }
  // _show(element, value) {
  //   element.style.display = value ? "" : "none";
  // }
  //
  // _text(element, value, modifier, args) {
  //   element.textContent = applyModifier(value, modifier, args) ?? "";
  // }
  //
  // _html(element, value, modifier, args) {
  //   element.innerHTML = applyModifier(value, modifier, args) ?? "";
  // }

  apply(element, key, value) {

    const [directive, modifier, ...args] = key.split("."); // ['text', 'fixed', '2', ...] // text.fixed.2

    if (this.directives.hasOwnProperty(directive)) {
	    this.directives[directive](element, value, modifier, args);
    } else if (key in element) {
      element[directive] = value;
    } else {
      // for Attributes
      _attr(element, value, modifier, args);
    }
  }
}
export default Directives
