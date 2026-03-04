/**
 * @typedef {Object} ListenerInfo
 * @property {string} type
 * @property {EventListener} handler
 * @property {AddEventListenerOptions} options
 * @property {string} key
 */

/**
 * @typedef {HTMLElement & {
 *   _listeners?: ListenerInfo[]
 * }} ReactiveElement
 */



/**
 * @param {HTMLElement} element
 * @param {string} key
 * @param {Function} handler
 */
export function addEvent(element, key, handler) {
  // @ts-ignore
  if (!element._listeners || !Array.isArray(element._listeners)) {
    // @ts-ignore
    element._listeners = [];
  }
	const [name, ...mods] = key.split('.')
	const options = {
		once: mods.includes('once'),
		capture: mods.includes('capture'),
		passive: mods.includes('passive')
	}


	const wrapper = (/** @type {any} */ event) => {

		if (mods.includes('stop')) event.stopPropagation()
		if (mods.includes('prevent')) event.preventDefault()
		if (mods.includes('self') && event.target !== element) return
		if (mods.includes('enter') && event.key !== 'Enter') return

		handler(event)
	}
  addListener(element, {
    type: name,
    handler: wrapper,
    options,
    key
  });
	element.addEventListener(name, wrapper, options)
}



/**
 * @param {HTMLElement} element
 */
export function removeListeners(element) {
  // @ts-ignore
  const listeners = element._listeners;
  
  if (listeners && Array.isArray(listeners)) {
    
   
    const listenersCopy = [...listeners];
    
    listenersCopy.forEach(({ type, handler, options }) => {
      try {
        element.removeEventListener(type, handler, options);
      } catch (e) {
        console.warn('Error', e);
      }
    });
    
    listeners.length = 0;
    // @ts-ignore
    delete element._listeners;
  }
}

/**
 * @param {HTMLElement} node
 */
export function cleanupNodeListeners(node) {
  if (!node) return;
  
  removeListeners(node);
  
  if (node.children && node.children.length) {
    Array.from(node.children).forEach(child => {
      cleanupNodeListeners(child);
    });
  }
}


/**
 * @param {HTMLElement} element
 * @returns {Array<any>} 
 */
export function getListenersArray(element) {
  // @ts-ignore
  if (!element._listeners || !Array.isArray(element._listeners)) {
    // @ts-ignore
    element._listeners = [];
  }
  // @ts-ignore
  return element._listeners;
}

/**
 * @param {HTMLElement} element
 * @param {Object} listener
 */
export function addListener(element, listener) {
  const listeners = getListenersArray(element);
  listeners.push(listener);
}
