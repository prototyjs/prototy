/**
 * @param {Document|Element|ShadowRoot} root
 * @param {Function} fn
 * @returns {Array<{element: HTMLElement, _reactivity: Record<string, any>}>}
 */
export function findElements(root, fn) {
  /** @type {Array<{element: HTMLElement, _reactivity: Record<string, any>}>} */
  const results = [];
  const xpath = ".//*[@*[starts-with(name(), ':')]]";

  const nodes = document.evaluate(
    xpath,
    root,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  for (let i = 0; i < nodes.snapshotLength; i++) {
    const rawNode = nodes.snapshotItem(i);

    if (!(rawNode instanceof HTMLElement)) {
      continue;
    }

    /** @type {HTMLElement} */
    const element = rawNode;

    /** @type {Record<string, any>} */
    const _reactivity = {};

    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith(":")) {
        const key = attr.name.slice(1);
        _reactivity[key] = {
          expression: attr.value,
          dependencies: new Map(),
        };
        // Передаем объект с элементом и реактивностью
        fn({ element, _reactivity }, key, attr.value);
      }
    });

    // Добавляем только если есть реактивные атрибуты
    if (Object.keys(_reactivity).length > 0) {
      results.push({ element, _reactivity });
    }
  }
  return results;
}
