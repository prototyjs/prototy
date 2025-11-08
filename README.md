<p align="center">
<img src="https://github.com/user-attachments/assets/f65cf3b0-c0a2-4184-9d93-89a5c0de6419" width="280px" alt="prototy">

A simple JS framework for rapid UI prototyping on the web. 💚
</p>

## Installation

Add this script to your HTML:
```html
<script src="https://cdn.jsdelivr.net/gh/your-repo/prototy@latest/prototy.js"></script>
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

Add `bind` attribute to any element that needs reactive updates from state changes.

Events don't need `bind` - they work automatically with `:on` directives.

All `:`-prefixed attributes are supported and evaluated as JavaScript expressions.

Components automatically handle reactivity - no need for `bind` on component elements.

Use `bind` for: text, html, show, class, style, value, and any custom attribute binding.


### Text Binding
```html
<h1 :text="state.user.name" bind></h1>
<span :text="'Hello, ' + state.user.name" bind></span>
```
### HTML Binding
```html
<div :html="state.formattedContent" bind></div>
```
### Conditional Display
```html
<div :show="state.isVisible" bind>Visible content</div>
<div :show="state.user.isAdmin" bind>Admin panel</div>
```
### Class Binding
```html
<div :class="state.cssClass" bind></div>
<div :class="{ active: state.isActive, disabled: !state.isEnabled }" bind></div>
```
### Style Binding
```html
<div :style="{ color: state.textColor, fontSize: state.fontSize + 'px' }" bind></div>
```
### Event Handling
```html
<button :onclick="state.count++" bind>Increment</button>
<input :oninput="state.searchTerm = event.target.value" bind>
<button :onclick="handles.submitForm" bind>Submit</button>
```
### Form Inputs
```html
<input :value="state.username" bind>
```
### Any Attribute Binding
All attributes starting with `:` are supported:
```html
<img :src="state.imageUrl" :alt="state.altText" bind>
<a :href="state.linkUrl" :target="state.targetWindow" bind></a>
<div :data-testid="state.testId" :aria-hidden="state.isHidden" bind></div>
```

## Components

Use the `component` attribute on `<template>` elements to define components.

Prototy supports native-like slot functionality with both default and named slots.

```html
<template component="user-card">
  <div class="user-card">
    <h3 :text="props.user.name" bind></h3>
    <p :text="props.user.email" bind></p>
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
  <button slot="actions" :onclick="handles.editUser" bind>Edit</button>
</user-card>
```
### List Rendering
In components with `eachItems`, the following variables are available in props:

`item` - current array element

`index` - current element index (0, 1, 2...)

```html
<template component="list-item">
    <span :text="props.index + ': ' + props.item.name" bind></span>
</template>

<list-item 
  eachItems="state.items" 
  props="{ item: item, index: index }">
</list-item>
```
