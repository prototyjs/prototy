import { isObject } from "../utils/isObject.js";
import { applyModifier } from "../modifiers/modifiers.js";

// function _class(element, value) {
//   if (!isObject(value)) return console.error("error class");
//   Object.entries(value).forEach(([className, condition]) => {
//     element.classList.toggle(className, !!condition);
//   });
// }

// function _style(element, value) {
//   if (!isObject(value)) return console.error("error style");
//   Object.assign(element.style, value);
// }

// function _show(element, value) {
//   element.style.display = value ? "" : "none";
// }
// function _text(element, value, modifier, args) {
//   element.textContent = applyModifier(value, modifier, args) ?? "";
// }

// function _html(element, value, modifier, args) {
//   element.innerHTML = applyModifier(value, modifier, args) ?? "";
// }

// function _attr(element, value, modifier, args, directive) {
//   const v = applyModifier(value, modifier, args);
//   if (v !== undefined && v !== null && v !== false) {
//     element.setAttribute(directive, v);
//   } else {
//     element.removeAttribute(directive);
//   }
// }

// export function updateValue(element, key, value) {
//   const directives = {
//     class: () => _class(element, value),
//     style: () => _style(element, value),
//     show: () => _show(element, value),
//     text: (modifier, args) => _text(element, value, modifier, args),
//     html: (modifier, args) => _html(element, value, modifier, args),
//   };
//   const [directive, modifier, ...args] = key.split("."); // ['text', 'fixed', '2', ...] // text.fixed.2

//   if (directives.hasOwnProperty(directive)) {
//     directives[directive](modifier, args);
//   } else if (key in element) {
//     element[directive] = value;
//   } else {
//     // for Attributes
//     _attr(element, value, modifier, args);
//   }
// }

class Directives {
  constructor(prototyInstance, option = {}) {
    this.prototy = prototyInstance;

  }

  _class(element, value) {
    if (!isObject(value)) return console.error("error class");
    Object.entries(value).forEach(([className, condition]) => {
      element.classList.toggle(className, !!condition);
    });
  }

  _style(element, value) {
    if (!isObject(value)) return console.error("error style");
    Object.assign(element.style, value);
  }
  _show(element, value) {
    element.style.display = value ? "" : "none";
  }

  _text(element, value, modifier, args) {
    element.textContent = applyModifier(value, modifier, args) ?? "";
  }

  _html(element, value, modifier, args) {
    element.innerHTML = applyModifier(value, modifier, args) ?? "";
  }

  updateValue(element, key, value) {
    const directives = {
      class: () => this._class(element, value),
      style: () => this._style(element, value),
      show: () => this._show(element, value),
      text: (modifier, args) => this._text(element, value, modifier, args),
      html: (modifier, args) => this._html(element, value, modifier, args),
    };
    const [directive, modifier, ...args] = key.split("."); // ['text', 'fixed', '2', ...] // text.fixed.2

    if (directives.hasOwnProperty(directive)) {
      directives[directive](modifier, args);
    } else if (key in element) {
      element[directive] = value;
    } else {
      // for Attributes
      _attr(element, value, modifier, args);
    }
  }
}
export default Directives