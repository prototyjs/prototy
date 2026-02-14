import { applyModifier } from '../modifiers/modifiers'

export function _text(element, value, modifier, args) {
	element.textContent = applyModifier(value, modifier, args) ?? ''
}