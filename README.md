<h1 align="center">Prototy</h1>
<p align="center">
A Seamless JavaScript Framework 🧶
</p>
<p align="center">
<img src="./logo-prototy.svg" width="80px" height="80px" alt="logo-prototy">
</p>
<p align="center">
  <a href="https://prototy.dev/">prototy.dev</a>
  ·
  <a href="https://youtube.com/@prototyjs">youtube.com/@prototyjs</a>
  ·
  <a href="https://youtube.com/@prototyjs">t.me/prototyjs</a>
</p>

<hr>

## Installation

Add this script to your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/prototyjs/prototy@main/dist/prototy.global.js"></script>
```
```js
const { prototy } = window.Prototy
```
Or import it in your JS code:

```js
import { prototy } from 'https://cdn.jsdelivr.net/gh/prototyjs/prototy@main/dist/prototy.es.js'
// or
import { prototy } from 'prototy'
```

## Let's start!
- Mount the framework on a root element — the directive syntax will work inside it.
- Prototy is a directive-oriented framework with declarative syntax and built-in reactivity.

**Expressions Directives:**
```html
<div id="app">
  <button :onclick="count++" :text="count"></button>
</div>
```
```js
prototy({
  root: document.getElementById('app'),
  state: { count: 0 }
})
```

**Or Functions Directives:**
```html
<div id="app">
  <button el="myBtn"></button>
</div>
```
```js
prototy({
  // ...
  elements: {
    myBtn: {
      text() { return this.state.count },
      onclick() { this.state.count++ }
    }
  }
})
```

## Directives

You declare what the UI should look like based on your state, and the framework automatically updates the DOM when the state changes.

### text
Sets the text content of an element.

```html
<span :text="name"></span>
<span :text="`Hello, ${name}`"></span>
<span :text.json="{ arr: [0,1] }"></span>
```

| Modifier | Description | Example                     |
|-------------|-------------|-----------------------------|
| `fixed.N`    |Formats a number to N decimal places    | `:text.fixed.2="price"`     |
| `int`    | Converts to an integer    | `:text.int="value"`         |
| `abs`    | Absolute value   | `:text.abs="number"`        |
| `round`    | Rounds to the nearest integer    | `:text.round="number"`      |
| `clamp.min.max`    | Clamps the value between min and max    | `:text.clamp.0.100="value"` |
| `unit`    | Appends a unit suffix (default 'px')    | `:text.unit.em="size"`      |
| `trim`    | Removes whitespace from the beginning and end of a string    | `:text.trim="text"`         |
| `upper`    | Converts to uppercase    | `:text.upper="text"`        |
| `lower`    | Converts to lowercase    | `:text.lower="text"`        |
| `capitalize`    | Capitalizes the first letter    | `:text.capitalize="text"`   |
| `default.X`    | Default value    | `:text.default.-="name"`    |
| `json`    | Converts the value to a JSON string    | `:text.json="{user: Nick}"` |

> Value modifiers for the following directives: `text`, `html`, `property`, `attribute`, `bind`.

### el
The `el` attribute establishes a link between the HTML markup and your JavaScript configuration.

* The variable `el` is always exposed inside inline expressions as a native reference to the current DOM element itself.
* Using `:el="expression"` runs code dynamically during rendering with direct access to the element reference.
* Using plain `el="..."` names the element, registering it for centralized JS tracking inside the `elements` block and caching it in `<element>.els`.
* Names declared in **kebab-case** within the HTML template are automatically converted to **camelCase** in JavaScript.

```html
<div :text.lower="el.tagName"></div>
<!-- <div>div</div> -->
<div :el="console.log(el)"></div>
```
Or Functions Directives:
```html
<div el="my-custom-element"></div>
<!-- <div>div</div> -->
```
```js
const app = prototy({
  // ...
  elements: {
    myCustomElement: {
      'text.lower'({ el, els }) { return el.tagName }
    }
  }
})
console.log(app.root.els.myCustomElement) // HTMLElement
```

### property
Set values for HTMLElement properties.

- Objects will undergo mergers.
- Booleans will be converted.
- Any data type.

```html

<div :style="{ fontSize: fontSize + 'px' }" style="color: red" el="myEl"></div>
<div :dataset="{ userId: 123, role: 'admin' }"></div>
<!-- Result: data-user-id="123" data-role="admin" -->
```
```html
<div :hidden="isHidden"></div>
<button :disabled="isDisabled"></button>
```

Or in elements:
```js
myEl: {
  style() {
    return { fontSize: this.state.fontSize + 'px' }
  }
}
```

### attribute
If it is not a property, it will create an attribute.

> The attribute is dynamically removed when value is `undefined`, `null` or `false`.

```html
<label :for="username" el="myEl">Name</label>
<!-- <label for="Nick">Name</label> -->
```
Or in elements:
```js
myEl: {
  for() { return this.state.username }
}
```

### class
Dynamically applies CSS classes based on conditions in `state`.

```html
<div :class="{ active: isActive, disabled: !isEnabled }" el="myEl"></div>
```
Or in elements:
```js
myEl: {
  class() {
    return { active: this.state.isActive, disabled: !this.state.isEnabled }
  }
}
```
### show
Conditionally shows or hides an element (sets display: none).

```html
<div :show="isVisible" el="myEl">Visible</div>
```
Or in elements:
```js
myEl: {
  show() { return this.state.isVisible }
}
```

### html
Sets the inner HTML of an element.

```html
<div :html="getSafeHtml()"></div>
```
```js
myEl: {
  html() { return this.methods.getSafeHtml() }
}
```

### on*
Set handle DOM events

> Inside event handlers you have access native `event` object

```html
<button :onclick.stop="count++" el="btn">Click</button>
<input :oninput="value = event.target.value" el="input">
<form :onsubmit.prevent.once="submit(event)" el="form">Submit</form>
```
Or in elements:
```js
btn: {
  'onclick.stop'() { this.state.count++ }
},
input: {
  oninput({ event }) { this.state.value = event.target.value }
},
form: {
  'onsubmit.prevent.once'({ event }) { this.methods.submit(event) }
}
```

| Modifier | Effect | Example |
|--------|------|-------------|
| `stop` | Stops event propagation | `:onclick.stop` |
| `prevent` | Prevents default behavior | `:onclick.prevent` |
| `self` | Triggers only if target is the element itself | `:onclick.self` |
| `enter` | Triggers only on Enter key | `:onkeydown.enter` |
| `once` | Triggers only once | `:onclick.once` |
| `capture` | Uses capture phase | `:onclick.capture` |
| `passive` | Improves scroll performance | `:onscroll.passive` |


### bind (Two-way Data Binding)
Binds an element's property to a state path. UI inputs automatically update the data, and data mutations instantly refresh the UI.

**Syntax:** `:bind.property.eventType.modifier="statePath"`

```html
<textarea :bind.value.input.trim="product.desc" el="desc"></textarea>
<input type="checkbox" :bind.checked.change="isActive">
```
Or in elements:
```js
desc: {
  'bind.value.input.trim'() {
    return 'product.desc'
  }
}
```
> Multiple `bind` directives cannot occupy the same event channel on a single element.

## component
Inserts reusable UI blocks into the DOM. Components support dynamic rendering, isolated properties, lifecycle events, and declarative markup.

### Registering Components
Components can be registered globally in JavaScript during the application initialization inside the `components` object, or declared directly in HTML.

```js
const app = prototy({
  root: document.body,
  components: {
    // Shorthand HTML string definition
    header: '<header><h1>My App</h1></header>',
    // Detailed component placeholder used below
    card: '<div><h3 :text="title"></h3><span :text="count"></span></div>'
  }
})
```

```html
<!-- Basic rendering -->
<div :component="components.header"></div>
<!-- Dynamic component switching -->
<div :component="components[currentTab]"></div>
<!-- Falsy fallback (renders nothing if 'show' is false) -->
<div :component="show && components.card"></div>
```


### Declaring Components in HTML
You can define templates directly in your markup using the `<template component="...">` tag. Prototy automatically parses and exposes them inside the `components` scope.

```html
<template component="myButton">
  <button class="btn">Click Me</button>
</template>
<!-- Instantiation -->
<div :component="components.myButton"></div>
```

### props
Data passed to a component via `props` is read-only inside that component. Parent updates flow down automatically, but mutations inside the component do not sync back to the parent.

* **Templates:** Passed via the `:props` directive.
* **Elements (JS):** Returned as an object inside the component directive key.

```html
<!-- Template Approach -->
<div :component="components.card" :props="{ title: pageTitle, count: 5 }"></div>
<!-- Elements Approach -->
<div el="cardPlaceholder"></div>
```
Or in elements:
```js
cardPlaceholder: {
  component() { return this.components.card },
  props() {
    return { title: this.state.pageTitle, count: 5 }
  }
}
```

### oncreate & ondestroy
Handle component state changes directly via event directives or centralize them inside `elements`.

* **`:oncreate`** — Fires after the component is created and mounted to the DOM. Receives `{ name, target }`.
* **`:ondestroy`** — Fires when the component is removed from the DOM. Receives `{ name, target }`.
* **`:oncreate.async`** — Pauses rendering until the returned Promise resolves. Receives `{ name, target, signal }`.

```html
<!-- Template Approach -->
<div :component="components.card" :oncreate.async="initCard"></div>
<!-- Elements Approach -->
<div el="asyncCard"></div>
```
Or in elements:
```js
asyncCard: {
  component() { return this.components.card },
  'oncreate.async'({ name, target, signal }) {
    // signal.aborted is true if the component was destroyed mid-fetch
    await fetch(`/api/card/${name}`)
  },
  ondestroy({ name }) {
    console.log(`${name} was safely removed`)
  }
}
```

## slots
Slots allow content projection from parent templates into components using named placeholders.

* **Named Slots:** Linked using the `slot="name"` attribute in the template and `<slot name="name"></slot>` inside the component.
* **Reactivity:** Projected content retains full reactivity, even if the parent component switches dynamically.
* **Fallback Content:** Elements inside `<slot>` tags render automatically if no slot content is provided by the parent.
* **Nesting:** Slots support deep nesting, maintaining state synchronization across all levels.

```html
<div :component="components.card">
  <!-- Dynamic content projected into the slot -->
  <h1 slot="header" :text="title"></h1>
</div>
```
```js
components: {
	card: `
    <div class="card">
      <slot name="header">Default Header</slot>
      <div class="card-body">Content</div>
    </div>
  `
}
```

## each (List Rendering)
Renders a list of items based on an array. It patches the DOM dynamically and injects local scope variables into the loop context.

* **Syntax:** Paired directly with a component: `:each="array" :component="components.name"`.
* **Arrays of Primitives** (strings, numbers) are **always static** by default.
* **Arrays of Objects** are **dynamic** and react to mutations. To force an array of objects to be static, use the `.once` modifier (`:each.once`).
* **Scope Injections:** Injects `item` (current data) and `index` (current position) into the loop context.

```html
<!-- Always static by default (array of strings) -->
<div :each="primitiveItems" :component="components.todoItem"></div>
<!-- Dynamic by default (array of objects) -->
<div :each="dynamicItems" :component="components.todoItem"></div>
<!-- Static forced (array of objects) -->
<div :each.once="forcedStaticItems" :component="components.todoItem" el="todoItems"></div>
```

```js
const app = prototy({
  root: document.body,
  state: {
    primitiveItems: ['Apple', 'Banana'], // Static
    dynamicItems: [{ id: 1, name: 'Nick' }, { id: 2, name: 'John' }], // Dynamic
    forcedStaticItems: [{ name: 'A' }, { name: 'B' }] // Static via .once
  },
  components: {
    todoItem: '<div><span :text="index"></span>: <span :text="item"></span></div>',
  }
})
```
Or in elements:
```js
todoItems: {
  'each.once'() {
    return this.state.forcedStaticItems
  }
}
```

## Configuration Options

Prototy core configurations are defined inside a single schema object. It unifies your global state, static variables, methods, and component definitions into a predictable, centralized ecosystem.

```js
const app = prototy({
  root: HTMLElement,
  state: { ... },
  params: { ... },
  methods: { ... },
  computed: { ... },
  setters: { ... },
  elements: { ... },
  components: {
    myComponent: {
      template: '',
      elements: { ... }
    }
  },
  created() { ... },
  ready() { ... },
  directives: {},
  modifiers: {},
})
```
### root
The root DOM element where the application mounts.

```js
root: document.getElementById('app')
```

### state
The single, reactive source of truth for the entire application. Modifying these values triggers automatic UI updates.

* **JS:** Access via `this.state` (both in global scope and components).
* **Templates:** Bind directly by key name.

```js
state: {
  user: { username: 'Nick', age: 20 },
  rgb: ['red', 'green', 'blue']
}
```
```html
<div :text="user.username"></div>
<div :text.json="rgb"></div>
```

### params
Static configuration or constants. Changing these values will not trigger UI updates.

* **JS:** Access via `this.params` (both in global scope and components).
* **Templates:** Bind directly by key name (no prefix required).

```js
params: {
  apiUrl: 'https://example.com',
  maxUploadSize: 5120
}
```
```html
<a :href="apiUrl">API Link</a>
```

### methods
Functions for business logic, events, and mutations. Executed within the instance context.

* **JS:** Access via `this.methods` (both in global scope and components).
* **Templates:** Bind directly by method name.

```js
methods: {
  increment() {
    this.state.count++
  },
  fetchData() {
    console.log(`Connecting to ${this.params.apiUrl}`)
  }
}
```
```html
<button :onclick="increment()">Increment</button>
```

### computed
Read-only reactive values derived from the state. They cache results and re-evaluate only when their state dependencies change.
- Available via `this.state.computedName` in JS and directly as `:text="computedName"` in templates.
- Can depend on other computed properties.
- Read-only. Modifications throw an error.

```js
computed: {
  fullName() {
    return `${this.state.firstName} ${this.state.lastName}`
  },
  totalCount() {
    return this.state.items.length // Re-calculates on push/pop operations
  }
}
console.log(app.state.fullName)
```

### setters
Interceptors that validate, sanitize, or transform state mutations before they are saved.
They can target nested properties using dot notation and function as observers (watchers) for side effects.

```js
setters: {
  'product.count'(newVal) { // Deep path tracking
    return Math.max(0, Math.min(100, newVal))
  },
  currentTheme(newVal) {
    localStorage.setItem('theme', newVal)  // Save to storage
    return newVal
  }
}
```

### elements
An alternative, centralized way to manage directives from JavaScript instead of cluttering the HTML template.

* **Syntax:** Every directive must be a standard method to preserve `this`.
* **Kebab-to-Camel:** HTML `el="main-title"` automatically maps to `mainTitle` in JS.
* **Arguments:** Every directive method receives a `{ el, index, item, props, event }` context object as its first parameter.

```html
<div el="main-title"></div>
<button el="submit-btn">submit</button>
```
```js
elements: {
  mainTitle: {
    text() {
      return this.state.username
    }
  },
  submitBtn: {
    'onclick.stop.prevent'({ el, event }) {
      console.log('Clicked element:', el)
    }
  }
}
```

### components
Reusable UI blocks that define their own markup, parameters, methods, and element behaviors while sharing the single global reactive state.

* **Full Syntax:** An object with a `template` string, along with optional `elements`, `params`, and `methods`.
* **Shorthand Syntax:** A direct string definition for simple, logic-free templates.
* **Context Merging (`this`):** Component-specific `params` and `methods` are merged into the instance context.
* **DOM Access:** Rendered DOM elements are cached and exposed via the `els` property.

```js
components: {
  userCard: {
    template: `
      <div class="card">
        <h3 class="user-name"></h3>
        <button class="btn-reset" el="reset-btn">Reset</button>
      </div>`,
    elements: {
      resetBtn: {
        onclick() {
          this.methods.reset()
		}
      }
    },
    params: { ... },
    methods: {
      reset() { ... }
    }
  },
  head: `<h1 :text="head"></h1>`
}
console.log(app.components.userCard.els.resetBtn)
// Returns the <div> DOM element
```

### created & ready
Functions that execute automatically at specific stages of the application lifecycle.

* **created()**: Fires immediately after the application instance is initialized, before the DOM is processed. Ideal for fetching initial data.
* **ready()**: Fires after the DOM has been parsed, elements are bound, and the application is fully interactive.

```js
created() {
  console.log('Instance created, loading config...')
},
ready() {
  console.log('DOM is bound and ready!')
}
```

### directives & modifiers
Custom directives extend HTML with low-level DOM manipulations, while modifiers post-process directive values.

```js
state: { price: 120 },
directives: {
  // Arguments: element, value, modifier, args, transform, directive, code
  format(element, value, modifier, args, transform) {
    // transform() applies the modifier (e.g. 'currency') and passes extra args (e.g. ['$'])
    const formatted = transform(value, modifier, args)
    element.textContent = formatted
  }
},
modifiers: {
  currency: (value, symbol = '€') => `${symbol}${Number(value).toFixed(2)}`
}
```
```html
<!-- Renders: "$120.00" -->
<div :format.currency.$="price"></div>
```

**Directive Arguments:**
* **`element`** — The target DOM element.
* **`value`** — The evaluated expression value.
* **`modifier`** — The first modifier string (e.g., `'currency'`).
* **`args`** — Array of additional modifiers/arguments (e.g., `['$']`).
* **`transform`** — Internal helper function to apply the modifiers.
* **`directive`** — The directive name as a string (e.g., `'format'`).
* **`code`** — The raw expression source code (e.g., `'price'`).


## Public API
The `prototy()` constructor returns an `app` instance with the following interface:

* **`app.state`** — Reactive data layer. Mutations trigger UI re-renders.
* **`app.methods`** — Action handlers bound to the instance context.
* **`app.params`** — Static, non-reactive configuration constants.
* **`app.root`** — Target DOM element where the app is mounted.
* **`app.els`** — Cached DOM elements marked with the `el` attribute.
* **`app.components`** — Registered templates and their individual cached `els`.
* **`app.destroy()`** — Method to clean up event listeners and completely remove reactivity.

```js
const app = prototy({ root: '#app', state: { count: 0 } })

app.state.count++            // Mutates state and schedules UI update
console.log(app.els.counter) // Directly accesses a cached DOM element
app.destroy()                // Cleans up the instance
```

## Utility functions
Helper utilities exported from the library core:

```js
import { nextTick, isObject, isEqual, kebabToCamel } from 'prototy'
```

* **`nextTick()`** — Returns a Promise. Waits for the next asynchronous DOM update cycle to finish.
* **`isObject(val)`** — Returns a boolean. Checks if the provided value is a plain object.
* **`isEqual(a, b)`** — Returns a boolean. Performs a deep structural comparison between two values.
* **`kebabToCamel(str)`** — Returns a string. Converts dash-case strings to camelCase (e.g., `'user-name'` → `'userName'`).

```js
app.state.count = 10
await nextTick() // Ensures the DOM now reflects the value 10
```