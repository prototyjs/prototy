<p align="center">
<img src="https://github.com/user-attachments/assets/f65cf3b0-c0a2-4184-9d93-89a5c0de6419" width="300px" alt="prototy">
</p>
<p align="center">
A simple JS framework for rapid UI prototyping and hypothesis testing on the web. 💚
</p>
<p align="center">
<i>Single-file prototyping for instant UI validation.</i>
</p>

## Installation

Add this script to your HTML:
```html
<script src="https://cdn.jsdelivr.net/gh/prototyjs/prototy@latest/prototy.js"></script>
```

Or download and include locally:
```html
<script src="prototy.js"></script>
```

```js
const app = prototy({
  state: {
    user: { name: "John", age: 30 },
    items: []
  },
  handles: {
    // Event handlers
  }
})
```
## State Management
```js
state: {
  user: { name: "John Doe", email: "john@example.com" },
  todos: [],
  isVisible: true
}
```
### Reactive Updates
State changes automatically trigger UI updates:
```js
app.state.user.name = "Jane Doe"; // Triggers re-render
app.state.todos.push({ text: "New task" }); // Triggers re-render
```
## Directives

All attributes starting with `:` are reactive and automatically update when state changes.

Use built-in directives `:text`, `:html`, `:show`, `:class`, `:style`, `:value` for common UI bindings.

Any custom attribute starting with `:` also works reactively, including `:src`, `:href`, `:data-*`, and `:aria-*`.

Handle events with `:on*` attributes like `:onclick`, `:oninput`, `:onchange` and etc.

### Text Binding
```html
<h1 :text="state.user.name"></h1>
<span :text="'Hello, ' + state.user.name"></span>
```
### HTML Binding
```html
<div :html="state.formattedContent"></div>
```
### Conditional Display
```html
<div :show="state.isVisible">Visible content</div>
<div :show="state.user.isAdmin">Admin panel</div>
```
### Class Binding
```html
<div :class="state.cssClass"></div>
<div :class="{ active: state.isActive, disabled: !state.isEnabled }"></div>
```
### Style Binding
```html
<div :style="{ color: state.textColor, fontSize: state.fontSize + 'px' }"></div>
```
### Event Handling
```html
<button :onclick="state.count++">Increment</button>
<input :oninput="state.searchTerm = event.target.value">
<button :onclick="handles.submitForm">Submit</button>
```
### Form Inputs
```html
<input :value="state.username">
```
### Any Attribute Binding
```html
<img :src="state.imageUrl" :alt="state.altText">
<a :href="state.linkUrl" :target="state.targetWindow"></a>
<div :data-testid="state.testId" :aria-hidden="state.isHidden"></div>
```

## Components

Use the `component` attribute on `<template>` elements to define components.

Prototy supports native-like slot functionality with both default and named slots.

```html
<template component="user-card">
  <div class="user-card">
    <h3 :text="props.user.name"></h3>
    <p :text="props.user.email"></p>
    <!-- Default slot -->
    <slot>Default content if no slot provided</slot>
    <!-- Named slot -->
    <slot name="actions"></slot>
  </div>
</template>
```
### Using Components
```html
<user-card props="{ user: state.currentUser }">
  <!-- Default slot content -->
  <p>This goes into the default slot</p>
  
  <!-- Named slot content -->
  <button slot="actions" :onclick="handles.editUser">Edit</button>
</user-card>
```
### List Rendering
In components with `eachItems`, the following variables are available in props:

`item` - current array element

`index` - current element index (0, 1, 2...)

```html
<template component="list-item">
    <span :text="props.index + ': ' + props.item.name"></span>
</template>

<list-item 
  eachItems="state.items" 
  props="{ item: item, index: index }">
</list-item>
```

## Screen Management

Prototy includes a built-in screen system for emulating routing and managing different views:

### Basic Screen Setup
```html
<!-- Define screens with [screen] attribute -->
<div screen="home">
  <h1>Home Screen</h1>
  <button :onclick="screen.push('settings')">Go to Settings</button>
</div>

<div screen="settings">
  <h1>Settings Screen</h1>
  <button :onclick="screen.back()">Go Back</button>
</div>
```

### Screen Methods
```js
// Navigate to a screen
screen.push('screen-name')

// Go back to previous screen
screen.back()

// Access current screen info
console.log(screen.current.name) // Current screen name
console.log(screen.prev) // Previous screen name
```

## loaded Hook
The `loaded` hook executes after DOM is fully initialized:
```js
const app = prototy({
  state: {
    user: { name: "John" },
    items: []
  },
  handles: {
    // Event handlers
  },
  loaded: function() {
    // 'this' refers to the Prototy instance
    console.log('App loaded!')
    this.screen.push('home') // Navigate to home screen
    this.state.isReady = true // Update state
  }
})
```

