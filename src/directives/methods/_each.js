import { cleanupNodeListeners } from "../../utils/addEvent.js"

/**
 * @param {Array<Object>} array
 * @param {HTMLElement} container
 * @param {Function} setup
 */
export function _each(array, container, setup) {
  if (!container) return

  // @ts-ignore
  const nodeMap = container._nodeMap || (container._nodeMap = new WeakMap())
  const children = container.children
  const arrLength = array?.length || 0

  if (!arrLength) {
    console.log(`📭 [EACH] Массив пуст, очистка ${container.tagName}`)
    // Очищаем слушатели у всех детей перед удалением
    Array.from(children).forEach((child) => {
      cleanupNodeListeners(child)
    })
    container.innerHTML = ""
    return
  }

  for (let i = 0; i < arrLength; i++) {
    const item = array[i]
    let node = nodeMap.get(item)

    if (!node) {
      console.log(`🆕 [EACH] Создаем элемент для`, item.color || item.id || i)
      // @ts-ignore
      node = container._template.cloneNode(true)
      node.removeAttribute("template")

      nodeMap.set(item, node)
      setup(node, item)
    }

    if (children[i] !== node) {
      container.insertBefore(node, children[i] || null)
    }
  }

  const diff = children.length - arrLength
  if (diff > 0) {
    console.log(`🗑️ [EACH] Удаляем ${diff} элементов из ${container.tagName}`)
    for (let i = children.length - 1; i >= arrLength; i--) {
      const node = children[i]
      cleanupNodeListeners(node) // Очищаем слушатели!
      node.remove()
    }
  }
}
