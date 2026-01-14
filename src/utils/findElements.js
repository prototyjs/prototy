/**
 * Находит все DOM элементы с атрибутами, начинающимися с ':'
 * и возвращает элементы вместе с этими атрибутами
 * @param {Document|Element|ShadowRoot} [root=document] - Корневой элемент для поиска
 * @returns {Array<{element: HTMLElement, attributes: Object<string, string>}>}
 *          Массив объектов с элементом и его атрибутами
 */
export function findElements(root = document) {
  /** @type {Array<{element: HTMLElement, attributes: Object<string, string>}>} */
  const results = [];
  
  // XPath для поиска всех элементов, у которых есть хотя бы один атрибут,
  // начинающийся с двоеточия
  // `.` означает поиск относительно переданного корневого элемента
  const xpath = `.//*[@*[starts-with(name(), ':')]]`;
  
  // Выполняем XPath запрос
  const nodes = document.evaluate(
    xpath,
    root,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  
  // Обрабатываем найденные элементы
  for (let i = 0; i < nodes.snapshotLength; i++) {
    const element = nodes.snapshotItem(i);
    
    // Проверяем, что это HTMLElement (а не текстовый узел и т.д.)
    if (!(element instanceof HTMLElement)) {
      continue;
    }
    
    // Собираем атрибуты, начинающиеся с ':'
    /** @type {Object<string, string>} */
    const colonAttrs = {};
    
    // XPath гарантирует, что у элемента есть хотя бы один атрибут с ':'
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith(':')) {
        colonAttrs[attr.name] = attr.value;
      }
    });
    
    // XPath гарантирует, что у элемента есть хотя бы один атрибут с ':'
    // Но для безопасности проверяем на всякий случай
    
     if (Object.keys(colonAttrs).length > 0) {
      results.push({
        element: element,
        attributes: colonAttrs
      });
     }
  }
  
  return results;
}