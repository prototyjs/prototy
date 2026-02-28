import { textModifiers } from "../_text/modifiers"
import { htmlModifiers } from "../_html/modifiers"

export const commonModifiers = {
  // @ts-ignore
  fixed: (value, n = 2) => Number(value).toFixed(n),
  // @ts-ignore
  int: (value, n = 10) => parseInt(value, n),
  // @ts-ignore
  abs: (value) => Math.abs(Number(value)),
  // @ts-ignore
  round: (value) => Math.round(Number(value)),
  // @ts-ignore
  clamp: (value, min = 0, max = 1) =>
    Math.min(Math.max(Number(value), min), max),
  // @ts-ignore
  unit: (value, u = "px") => Number(value) + u,
  // @ts-ignore
  trim: (value) => String(value).trim(),
  // @ts-ignore
  upper: (value) => String(value).toUpperCase(),
  // @ts-ignore
  lower: (value) => String(value).toLowerCase(),
  // @ts-ignore
  capitalize: (value) =>
    String(value).charAt(0).toUpperCase() + String(value).slice(1),
  // @ts-ignore
  default: (value, def = "-") => (value || value === 0 ? value : def),
  // @ts-ignore
  json: (value) => JSON.stringify(value),
}

export const modifiers = {
  text: textModifiers,
  html: htmlModifiers,
}
