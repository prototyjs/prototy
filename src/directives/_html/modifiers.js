export const htmlModifiers = {
  // @ts-ignore
  sanitize: (value) => {
    const div = document.createElement("div")
    div.textContent = value
    return div.innerHTML
  },
  // @ts-ignore
  strip: (value) => {
    // Удалить HTML теги
    return String(value).replace(/<[^>]*>/g, "")
  },
  // Переопределяем fixed для HTML
  // @ts-ignore
  fixed: (value, n = 2) => `<b>${Number(value).toFixed(n)}</b>`,
}
