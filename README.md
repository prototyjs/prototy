<p align="center">
<img src="https://github.com/user-attachments/assets/0f424573-860f-4b46-8ca5-903579593028" width="220px" alt="prototy">
</p>
<p align="center">
A simple directive-oriented JS framework for rapid UI prototyping and hypothesis testing on the web. 💙
</p>
<p align="center">
<i>Single-file prototyping for instant UI validation.</i>
</p>

## Installation

Add this script to your HTML:

```html
<script src="path/to/prototy/index.js" type="module"></script>
```
Or import it in your JS code:

```js
import { prototy } from './path/to/prototy/index.js'
```

## Let's start!

Prototy is a directive-oriented framework with declarative syntax and built-in reactivity.
All directives start with `:`. You declare what the UI should look like based on your state, and the framework automatically updates the DOM when the state changes.

Mount the framework on a root element — the directive syntax will work inside it.

Just copy the code and start working!

```js
import { prototy } from './prototy/index.js'

const app = prototy({
  root: document.getElementById('app'),
  state: { count: 0 }
})
```
```html
<div id="app">
  <button :onclick="count++" :text="count"></button>
</div>
```
The `app` object contains: `state`, `methods`, `root`, `params`, `components`, `els`.

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `state` | `object` | Initial reactive state |
| `root` | `HTMLElement` | Root element of the application (default: `document.body`) |
| `params` | `object` | Static parameters passed to the application |
| `methods` | `object` | Object with methods to bind to the bus |
| `directives` | `object` | Custom directive implementations |
| `components` | `object` | Component template definitions |
| `setters` | `object` | Custom setter functions for state properties |


## Directives

All directives start with `:`

### `:text` — sets the text content of an element

```html
<span :text="name"></span>
<span :text="`Hello, ${name}`"></span>
```

### `:bind` — binds an element's property to the state. State changes update the element, and user actions update the state

Syntax: `:bind.property.event="expression"`
```html
<input :bind.value.input.trim="username">
<input type="checkbox" :bind.checked.change="isActive">
<textarea :bind.value.input="desc"></textarea>
```
> You cannot bind two `:bind` directives to the same event on one element.

### `:each` —  lists

Iterates over an array, creates a component for each element:
```html
<div :each="items" :component="components.item"></div>
```
Inside the component, you have access to:
- `item` — current element
- `index` — index (starting from 0)
```js
components: {
  item: '<div><span :text="index"></span>: <span :text="item.name"></span></div>'
}
```
Array reactivity: `push`, `pop`, `shift`, `unshift`, `reverse`, `sort`, `splice`

> When using `reverse()` or reordering, the internal state of elements (entered text, checkboxes) stays with their data item, not with the position.
> An empty array renders nothing. When elements are added, rendering happens automatically.

### `:component` — component insertion

```html
<div :component="components.header"></div>
```
#### Passing data via `:props` (readonly inside component):

```html
<div :component="components.card" :props="{ title: title, count: 5 }"></div>
```
```js
components: {
  card: '<div><h3 :text="title"></h3><span :text="count"></span></div>'
}
```
> Changing `:props` inside a component does NOT sync back to the parent. Use `state` for two-way binding.

#### Dynamic component

```html
<div :component="components[currentTab]"></div>
```
#### Conditional rendering

```html
<div :component="isVisible && modal"></div>
```

### `:class` — dynamically applies CSS classes based on conditions in `state`

```html
<div :class="{ active: isActive, disabled: !isEnabled }"></div>
```
### `:show` — conditionally shows or hides an element (sets display: none)

```html
<div :show="isVisible">Visible</div>
```
### `:attr` — binds the value of any HTML attribute to the state

```html
<div :data-id="userId"></div>
```
The attribute is removed when value is `null` or `false`.

### `:style` — dynamically applies inline styles

```html
<div :style="{ color: textColor, fontSize: fontSize + 'px' }"></div>
```
### `:html` — sets the inner HTML of an element

```html
<div :html="rawHtml"></div>
```
### `:el` — element reference

```html
<div el="header">Header</div>
```
```js
console.log(app.els.header) // HTMLDivElement
```
Dynamic: `:el="params.el = el"` — the `el` variable references the current element.

### `:dataset` — data attributes from object

```html
<div :dataset="{ userId: 123, role: 'admin' }"></div>
<!-- Result: data-user-id="123" data-role="admin" -->
 ```
### `:hidden` —  hide via hidden attribute

```html
<div :hidden="isHidden"></div>
```
## Events

### Directives `:on*` handle DOM events.

```html
<button :onclick="count++">Click</button>
<input :oninput="value = event.target.value">
<form :onsubmit="submit(event)">Submit</form>
```
Inside event handlers you have access to:

- `el` — the current DOM element

- `state` — reactive state

- `methods` — bound methods

- `event` — native event object


### Event Modifiers

Modifiers change how the event is handled.
| Modifier | Effect | Example |
|--------|------|-------------|
| `stop` | Stops event propagation | `:onclick.stop` |
| `prevent` | Prevents default behavior | `:onclick.prevent` |
| `self` | Triggers only if target is the element itself | `:onclick.self` |
| `enter` | Triggers only on Enter key | `:onkeydown.enter` |
| `once` | Triggers only once | `:onclick.once` |
| `capture` | Uses capture phase | `:onclick.capture` |
| `passive` | Improves scroll performance | `:onscroll.passive` |


```html
<a :onclick.prevent="navigate">No page reload</a>
```

### Lifecycle Events

#### `:oncreate`
Fires when a component is created and mounted to the DOM.

```html
<div 
  :component="components.card"
  :oncreate="onCardCreated">
</div>
```
The handler receives an object with:

- `name` — component name

- `target` — the DOM element


#### `:oncreate.async`
For async initialization. The component waits for the promise to resolve.

```html
<div 
  :component="components.card"
  :oncreate.async="initCard">
</div>
```
```js
methods: {
  async initCard({ name, target, signal }) {
    // signal.aborted — true if component was destroyed before completion
    await fetch(`/api/card/${name}`)
  }
}
```
#### `:ondestroy`
Fires when a component is removed from the DOM.
```html
<div 
  :component="components.card"
  :ondestroy="onCardDestroyed">
</div>
```
The handler receives `{ name, target }` — component name and the DOM element being removed.

## Public API

The `prototy()` function returns an `app` object with the following properties and methods:

| Property/Method | Type | Description |
|----------------|------|-------------|
| `app.state` | `object` | Reactive state. Changes trigger UI updates. |
| `app.methods` | `object` | Bound methods from configuration. |
| `app.root` | `HTMLElement` | Root element of the application. |
| `app.params` | `object` | Static parameters from configuration. |
| `app.components` | `object` | Registered component templates. |
| `app.els` | `object` | Elements marked with `el` attribute. |
| `app.update(path, value)` | `function` | Manually update nested state by dot-notation path. |
| `app.destroy()` | `function` | Clean up and remove all reactivity from the application. |

### `app.destroy()`

Completely removes the application: cleans up all reactive effects, event listeners, and component references.

```js
const app = prototy({ state: { count: 0 } })

// Later, when you no longer need the app:
app.destroy()
```

### `app.update(path, value)`

Manually update a nested state property.
```js
app.update('user.profile.name', 'Alice') // Success
app.update('user.z.x', 100)              // Error: path "user.z.x" is unreachable
app.update(null, 10)                     // Error: update() expects path to be a string
```

### Accessing the internal bus

Inside methods and event handlers, `this.bus` gives access to the same object:

```js
methods: {
  logBus() {
    console.log(this.bus)
    // {
    //   root: HTMLElement,
    //   state: { ... },
    //   methods: { ... },
    //   params: { ... },
    //   components: { ... },
    //   els: { ... }
    // }
  }
}
```
> Use `bus` to access the root element, registered components, or elements marked with `el` attribute.


### Slots (`<slot>`)

Slots allow you to pass HTML content into a component. You define a placeholder in the component template, and when using the component, you fill it with your own content.
#### Named slots

In the component template, declare `<slot name="name">`. When using the component, specify `slot="name"` on any element — it will be placed in the slot's position:
```js
// Component definition
const app = prototy({
  components: {
    card: `<div class="card"><slot name="header"></slot></div>`
  }
})
```
```html
<!-- Using the component -->
<div :component="components.card">
  <h1 slot="header">Card header</h1>
</div>
```
## Utility functions

```js
import { nextTick, isObject, isEqual, kebabToCamel } from './prototy/index.js'
```
- `nextTick()` — wait for DOM update

- `isObject()` — check if value is an object

- `isEqual(a, b)` — deep comparison

- `kebabToCamel()` — `user-name` → `userName`

## Modifiers

Transform values before they are applied. Work with any directive.
```html
<span :text.upper="name"></span>
<input :bind.value.input.trim="username">
```
| Modifier | Description | Example |
|-------------|-------------|-------------|
| `fixed.N`    |Formats a number to N decimal places    | `:text.fixed.2="price"`    |
| `int`    | Converts to an integer    | `:text.int="value"`    |
| `abs`    | Absolute value   | `:text.abs="number"`    |
| `round`    | Rounds to the nearest integer    | `:text.round="number"`    |
| `clamp.min.max`    | Clamps the value between min and max    | `:text.clamp.0.100="value"`    |
| `unit`    | Appends a unit suffix (default 'px')    | `:text.unit.em="size"`    |
| `trim`    | Removes whitespace from the beginning and end of a string    | `:text.trim="text"`    |
| `upper`    | Converts to uppercase    | `:text.upper="text"`    |
| `lower`    | Converts to lowercase    | `:text.lower="text"`    |
| `capitalize`    | Capitalizes the first letter    | `:text.capitalize="text"`    |
| `default.X`    | Default value    | `:text.default.-="name"`    |
| `json`    | Converts the value to a JSON string    | `:text.json="user"`    |

## Setters

Intercept changes for validation:
```js
setters: {
  age(newVal) { return Math.max(0, Math.min(120, newVal)) }
}
```


## Custom directives (advanced)

Create your own directives by adding them to the `directives` option.


```js
directives: {
  highlight(element, value) {
    element.style.backgroundColor = value ? 'yellow' : ''
  },
  tooltip(element, value, modifier) {
    element.title = value
    if (modifier === 'top') element.setAttribute('data-position', 'top')
  }
}
```
```html
<div :highlight="isActive"></div>
<div :tooltip.top="'Tooltip'"></div>
```

### Parameters passed to a custom directive (directive function signature)

When you create a custom directive, your function receives these parameters in order:

```js
function myDirective(element, value, modifier, args, transform, directive, code)
```
| Parameter | Description |
|-------------|-------------|
| `element`    |The DOM element    |
| `value`    | The evaluated expression value   |
| `modifier`    | The first modifier (e.g., `'top'` from `:my.top`)   | 
| `args`    | Array of additional arguments (e.g., `['arg1', 'arg2']` from `:my.top.arg1.arg2`)    | 
| `transform`    | Function to apply built-in modifiers    | 
| `directive`    | Directive name (`'myDirective'`)   | 
| `code`    | Original expression source code    | 

### Using built-in modifiers in custom directives

You can apply built-in modifiers to values inside your custom directive:
```js
directives: {
  displayValue(element, value, modifier, args, transform) {
    const transformed = transform(value, modifier, args)
    element.textContent = transformed
  }
}
```
```html
<div :displayValue.upper.trim="name"></div>
<!-- Applies 'upper' and 'trim' before passing to the directive -->
 ```
