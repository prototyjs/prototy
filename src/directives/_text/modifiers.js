export const textModifiers = {
  // @ts-ignore
  truncate: (value, length = 100) => String(value).slice(0, length) + "...",
  // @ts-ignore
  reverse: (value) => String(value).split("").reverse().join(""),
  // @ts-ignore
  words: (value, count) => String(value).split(" ").slice(0, count).join(" "),
  // @ts-ignore
  fixed: (value, n = 2) => `$${Number(value).toFixed(n)}`,
}
