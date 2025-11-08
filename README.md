# prototy
A simple JS framework for rapid UI prototyping on the web. 💚

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

Add bind attribute to any element that needs reactive updates from state changes

Events don't need bind - they work automatically with :on directives

All :-prefixed attributes are supported and evaluated as JavaScript expressions

Components automatically handle reactivity - no need for bind on component elements

Use bind for: text, html, show, class, style, value, and any custom attribute binding


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
<div :html="state.formattedContent"></div>
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
All attributes starting with `:` are supported:
```html
<img bind :src="state.imageUrl" :alt="state.altText">
<a bind :href="state.linkUrl" :target="state.targetWindow"></a>
<div bind :data-testid="state.testId" :aria-hidden="state.isHidden"></div>
```

## Components
### Defining Components
```html
<template component="user-card">
  <div class="user-card">
    <h3 bind :text="props.user.name"></h3>
    <p bind :text="props.user.email"></p>
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
```html
<user-card eachItems="state.users" props="{ user: item }"></user-card>
```
