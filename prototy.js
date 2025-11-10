class Screen {
	constructor(pushed) {
		this.current = ''
		this.prev = ''
		this.sections = []
		this.pushed = pushed
		this.sheet()
	}
	sheet() {
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(`
			[screen] {
				position: absolute;
				inset: 0;
				background-color: white;
				z-index: 0;
				opacity: 0;
				max-height: 100vh;
				overflow: auto;
			}
			[screen]:not([hidden]) {
				z-index: 2;
				opacity: 1;
			}
		`);
		document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
	}
	screens() {
		const screens = document.querySelectorAll('[screen]') || []
		Array.from(screens).forEach(s => {
			const section = { name: s.getAttribute('screen'), target: s }
			this.sections.push(section)
			section.target.tabIndex = -1
			section.target.inert = true
			section.target.hidden = true
		})
	}
	push(name) {
		if (!name) return
		this.sections.forEach(section => {
			section.target.inert = section.name !== name
			section.target.hidden = section.name !== name
			if (section.name === name) {
				this.prev = this.current
				this.current = section
				section.target.focus()
			}
		})
		this.pushed?.(name)
	}
	back() {
		this.push(this.prev)
	}
}


class Prototy {
  constructor(options) {
    this._state = options.state
		this.static = options.static
		this.handles = {}
		this.components = options.components
		Object.keys(options.handles).forEach(key => {
			if (typeof options.handles[key] === 'function') {
				this.handles[key] = options.handles[key].bind(this)
			}
		})
		
		this.screen = new Screen(options.pushed)
    this.state = this._createStateProxy(this._state);
    this._components = new Map();
    this._componentInstances = new Set();
		options.created.bind(this)()
    document.addEventListener("DOMContentLoaded", () => {
			// this.elements = document.querySelectorAll('[bind]');
			this.elements = this.queryBindAttribute(document)
			this.screen.screens()
      this._initComponents();
      this._bindAll();
			options.loaded.bind(this)()
    });
  }
  queryBindAttribute(target) {
		return Array.from(target.querySelectorAll('*')).filter(element => {
			return Array.from(element.attributes).some(attr => attr.name.startsWith(':'));
		})
	}
  _createStateProxy(state, path = '') {
    const self = this;
    
    if (this._isObject(state)) {
      Object.keys(state).forEach(key => {
        if (this._isObject(state[key])) {
          state[key] = this._createStateProxy(state[key], path ? `${path}.${key}` : key);
        }
      });
    }
    
    return new Proxy(state, {
      set(target, property, value) {
        const oldValue = target[property];
        const fullPath = path ? `${path}.${property}` : property;
        
        if (self._isObject(value)) {
          value = self._createStateProxy(value, fullPath);
        }
        
        target[property] = value;
        
        if (!self._isEqual(oldValue, value)) {
          self._updateAll();
        }
        
        return true;
      }
    });
  }

  _initComponents() {
    document.querySelectorAll('template[component]').forEach(template => {
      const componentName = template.getAttribute('component');
      this._components.set(componentName, template);
      
      if (!customElements.get(componentName)) {
        this._defineComponent(componentName, template);
      }
    });
  }

  _defineComponent(componentName, template) {
    const self = this;
    
    class ComponentElement extends HTMLElement {
      constructor() {
        super();
        this._boundElements = new Map();
        this._index = 0
        this._props = {};
        this._items = []
        this._eventHandlers = new Map();
      }
      
      connectedCallback() {
        this._updateProps();
        this._initialRender();
        self._componentInstances.add(this);
        if (this.getAttribute('eachItems') && !this.getAttribute('index')) this.cloneSelf()
      }
      cloneSelf() {
        let referenceElement = this;
        this.setAttribute('index', '0');
        for (let i = 1; i < this._items.length; i++) {
          const clone = this.cloneNode(true);
          clone.setAttribute('index', i);
          referenceElement.insertAdjacentElement('afterend', clone);
          referenceElement = clone;
        }
      }
      
      _updateProps() {
        const itemsAttr = this.getAttribute('eachItems');
        if (!itemsAttr) {
          this._items = [];
        } else {
          this._index = this.getAttribute('index') || 0;
          try {
            const func = new Function('state', 'static', 'handles', `return ${itemsAttr}`);
            this._items = func(self.state, self.static, self.handles);
          } catch (error) {
            console.error('Error parsing items:', error);
            this._items = [];
          }
        }
        
        const propsAttr = this.getAttribute('props');
        if (!propsAttr) {
          this._props = {};
          return;
        }
  
        try {
          const func = new Function('state', 'static', 'item', 'index', `return ${propsAttr}`);
          this._props = func(self.state, self.static, this._items[this._index], this._index);
					self.components[self._kebabToCamel(componentName)]?.created.bind(self)(this._props)
        } catch (error) {
          console.error('Error parsing props:', error);
          this._props = {};
        }
      }
  
      _initialRender() {
        const originalContent = this.innerHTML;
        
        const content = template.content.cloneNode(true);
        this._processBindings(content);
        
        this.innerHTML = '';
        this.appendChild(content);
        
        if (originalContent) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = originalContent;
      
          this.querySelectorAll('slot').forEach(slot => {
            const slotName = slot.getAttribute('name');
            let contentToInsert;
        
            if (slotName) {
              contentToInsert = tempDiv.querySelector(`[slot="${slotName}"]`)?.outerHTML || '';
            } else {
              contentToInsert = tempDiv.innerHTML;
            }
        
            slot.outerHTML = contentToInsert;
          });
        }
      }
      
      _processBindings(root) {
				self.queryBindAttribute(root).forEach(element => {
          const bindings = this._collectBindings(element);
          this._boundElements.set(element, bindings);
          this._applyBindings(element, bindings, true);
        });
      }
      
      _collectBindings(element) {
        return Array.from(element.getAttributeNames())
          .filter(attrName => attrName.startsWith(':'))
          .map(attrName => ({
            attrName,
            expression: element.getAttribute(attrName)
          }));
      }
      
      _applyBindings(element, bindings, initial = false) {
        bindings.forEach(({ attrName, expression }) => {
          if (attrName.startsWith(':on')) {
            if (initial) this._bindEvent(element, attrName, expression);
          } else {
            this._updateElementBinding(element, attrName, expression);
          }
        });
      }
      
      _bindEvent(element, attrName, expression) {
        const eventName = attrName.substring(3).toLowerCase();
        
        try {
          const oldHandler = this._eventHandlers.get(element);
          if (oldHandler) {
            element.removeEventListener(eventName, oldHandler);
          }
          
          const handler = (event) => {
            this._updateProps();
            const func = new Function('event', 'props', 'state', 'static', 'screen', 'handles', expression);
            func(event, this._props, self.state, self.static, self.screen, self.handles);
            this._update();
          };
          
          element.addEventListener(eventName, handler);
          this._eventHandlers.set(element, handler);
        } catch (error) {
          console.error(`Error binding event ${attrName}:`, error);
        }
      }
      
      _updateElementBinding(element, attrName, expression) {
        try {
          const directive = attrName.substring(1);
          
          if (attrName.startsWith(':on')) return;
          
          this._updateProps();
          const func = new Function('props', 'state', 'static', `return (${expression})`);
          const value = func(this._props, self.state, self.static);
          
          self.applyDirective(element, directive, value);
        } catch (error) {
          // console.error(`Error updating ${attrName}:`, error);
        }
      }
      
      _update() {
        this._updateProps();
        this._updateAllBindings();
      }
      
      _updateAllBindings() {
        for (const [element, bindings] of this._boundElements) {
          bindings.forEach(({ attrName, expression }) => {
            if (!attrName.startsWith(':on')) {
              this._updateElementBinding(element, attrName, expression);
            }
          });
        }
      }
      
      disconnectedCallback() {
        self._componentInstances.delete(this);
        this._cleanupEventHandlers();
        this._boundElements.clear();
      }
      
      _cleanupEventHandlers() {
        for (const [element, handler] of this._eventHandlers) {
          const eventType = this._getEventTypeForElement(element);
          if (eventType) {
            element.removeEventListener(eventType, handler);
          }
        }
        this._eventHandlers.clear();
      }
      
      _getEventTypeForElement(element) {
        for (const [el, bindings] of this._boundElements) {
          if (el === element) {
            const eventBinding = bindings.find(b => b.attrName.startsWith(':on'));
            if (eventBinding) {
              return eventBinding.attrName.substring(3).toLowerCase();
            }
          }
        }
        return null;
      }
    }
    
    customElements.define(componentName, ComponentElement);
  }

  _bindAll() {
    this.elements.forEach(element => this._bindElement(element));
  }
  
  _bindElement(element) {
    Array.from(element.getAttributeNames())
      .filter(attrName => attrName.startsWith(':'))
      .forEach(attrName => this._processAttribute(element, attrName));
  }
  
  _processAttribute(element, attrName) {
    try {
      const expression = element.getAttribute(attrName);
      
      if (attrName.startsWith(':on')) {
        this._bindGlobalEvent(element, attrName, expression);
      } else {
        this._updateGlobalBinding(element, attrName, expression);
      }
    } catch (error) {
      console.error(`Error in ${attrName}:`, error);
    }
  }
  
  _bindGlobalEvent(element, attrName, expression) {
    const eventName = attrName.substring(3).toLowerCase();
    const func = new Function('event', 'state', 'static', 'screen', 'handles', expression);
    
    element.addEventListener(eventName, (event) => {
      func(event, this.state, this.static, this.screen, this.handles);
    });
  }
  
  _updateGlobalBinding(element, attrName, expression) {
    const directive = attrName.substring(1);
    const func = new Function('state', 'static', `return (${expression})`);
    const value = func(this.state, this.static);
    
    this.applyDirective(element, directive, value);
  }
  
  applyDirective(element, directive, value) {
    this._applyDirectiveValue(element, directive, value);
  }
  
  _applyDirectiveValue(element, directive, value) {
    const handlers = {
      text: () => element.textContent = value ?? '',
      html: () => element.innerHTML = value ?? '',
      show: () => element.style.display = value ? '' : 'none',
      class: () => this._handleClassDirective(element, value),
      style: () => this._handleStyleDirective(element, value),
      value: () => this._handleValueDirective(element, value)
    };
    
    if (handlers[directive]) {
      handlers[directive]();
    } else {
      this._handleAttributeDirective(element, directive, value);
    }
  }
  
  _handleClassDirective(element, value) {
    if (this._isObject(value)) {
      Object.entries(value).forEach(([className, condition]) => {
        element.classList.toggle(className, !!condition);
      });
    } else {
      element.className = value ?? '';
    }
  }
  
  _handleStyleDirective(element, value) {
    if (this._isObject(value)) {
      Object.assign(element.style, value);
    }
  }
  
  _handleValueDirective(element, value) {
    if (this._isFormElement(element)) {
      element.value = value ?? '';
    } else {
      element.setAttribute('value', value);
    }
  }
  
  _handleAttributeDirective(element, directive, value) {
    if (value !== undefined && value !== null && value !== false) {
      element.setAttribute(directive, value);
    } else {
      element.removeAttribute(directive);
    }
  }
  
  _isFormElement(element) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
  }
  
  _isObject(value) {
    return typeof value === 'object' && value !== null;
  }
  
  _updateAll() {
    this.elements.forEach(element => {
      Array.from(element.getAttributeNames())
        .filter(attrName => attrName.startsWith(':') && !attrName.startsWith(':on'))
        .forEach(attrName => this._updateGlobalBinding(element, attrName, element.getAttribute(attrName)));
    });
    
    this._componentInstances.forEach(instance => {
      if (instance._update) instance._update();
    });
  }
  
  _isEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
	_kebabToCamel(str) {
		return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
	}
}

window.prototy = (options) => new Prototy(options)
