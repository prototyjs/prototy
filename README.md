# Документация Prototy Framework

## Обзор

Легковесный реактивный фреймворк для интерфейсов без сборки.

## Быстрый старт

Просто скопируйте код и приступайте к работе!

```js
import { prototy } from './prototy/index.js'

const app = prototy({
  root: document.getElementById('app'),
  state: { count: 0, name: 'Иван' },
  methods: {
    increment() { this.state.count++ }
  },
  components: {
    btn: '<button :onclick="methods.increment()" :text="count"></button>'
  }
})
```
```html
<div id="app">
  <h1 :text="state.name"></h1>
  <div :component="components.btn" :props="{ count: state.count }"></div>
</div>
```
Объект `app` содержит поля: `state`, `methods`, `root`, `params`, `components`, `els`.

## Состояния

Состояние реактивно — любое изменение обновляет UI:
```js
app.state.count = 10        // UI обновится
app.state.name = 'Мария'    // UI обновится
app.state.user = { age: 25 } // глубокие изменения тоже работают
```

## Сеттеры

Перехватывают изменения для валидации:
```js
setters: {
  age(newVal) { return Math.max(0, Math.min(120, newVal)) }
}
```

## Директивы
Все директивы начинаются с `:`

### `:text` — текстовое содержимое
```html
<span :text="state.name"></span>
<span :text="`Привет, ${state.name}`"></span>
```
### `:html` — HTML-содержимое
```html
<div :html="state.rawHtml"></div>
```
### `:show` — видимость (display: none)
```html
<div :show="state.isVisible">Виден</div>
```
### `:class` — условные классы
```html
<div :class="{ active: state.isActive, disabled: !state.isEnabled }"></div>
```
### `:style` — инлайн-стили из объекта
```html
<div :style="{ color: state.textColor, fontSize: state.fontSize + 'px' }"></div>
```
### `:dataset` — data-атрибуты из объекта
```html
<div :dataset="{ userId: 123, role: 'admin' }"></div>
<!-- Результат: data-user-id="123" data-role="admin" -->
 ```

### `:hidden` — скрытие через hidden-атрибут
```html
<div :hidden="state.isHidden"></div>
```

### `:attr` — любой атрибут
```html
<div :data-id="state.userId"></div>
```
Атрибут удаляется при `null` или `false`.

### `:bind` — двусторонняя привязка
Синтаксис: `:bind.свойство.событие="выражение"`
```html
<input :bind.value.input.trim="state.username">
<input type="checkbox" :bind.checked.change="state.isActive">
<textarea :bind.value.input="state.desc"></textarea>
```
Важно: нельзя привязать два `:bind` к одному событию на элементе.

### `:each` — списки
Перебирает массив, для каждого элемента создаёт компонент:
```html
<div :each="state.items" :component="components.item"></div>
```
Внутри компонента доступны:
- `item` — текущий элемент
- `index` — индекс (с 0)

```js
components: {
  item: '<div><span :text="index"></span>: <span :text="item.name"></span></div>'
}
```
Реактивность массива: `push`, `pop`, `shift`, `unshift`, `reverse`, `sort`, `splice`

Важно: при `reverse()` и перестановках внутреннее состояние элементов (введённый текст, чекбоксы) сохраняется за своим элементом, а не за позицией.
Пустой массив — ничего не отображается. При добавлении элементов отрисовка происходит автоматически.

### `:component` — вставка компонента
```html
<div :component="components.header"></div>
```
#### Передача данных через `:props` (только для чтения внутри компонента):
```html
<div :component="components.card" :props="{ title: state.title, count: 5 }"></div>
```
```js
components: {
  card: '<div><h3 :text="title"></h3><span :text="count"></span></div>'
}
```
Важно: изменение `:props` внутри компонента не синхронизируется обратно в родителя. Для двусторонней привязки используйте `state`.

#### Динамический компонент
```html
<div :component="components[state.currentTab]"></div>
```
#### Условный рендеринг
```html
<div :component="state.isVisible && components.modal"></div>
```
#### Хук `created` (вызывается один раз при создании)
```js
components: {
  counter: {
    template: '<div :text="value"></div>',
    created() {
      console.log('Компонент создан')
    }
  }
}
```

### `:el` — ссылка на элемент
```html
<div el="header">Заголовок</div>
```
```js
console.log(app.els.header) // HTMLDivElement
```
Динамически: `:el="params.el = el"` — переменная `el` ссылается на текущий элемент.



## Слоты (`<slot>`)
Передача содержимого в компонент:
```html
<!-- Шаблон компонента -->
<div class="card">
  <slot name="header">Заголовок по умолчанию</slot>
  <slot name="content">Текст по умолчанию</slot>
</div>

<!-- Использование -->
<div :component="components.card">
  <h1 slot="header">Мой заголовок</h1>
  <p slot="content">Мой текст</p>
</div>
```
Правила:

- Слот можно заполнить только один раз

- Непереданный слот показывает содержимое по умолчанию

## Модификаторы
Преобразуют значения перед применением. Работают с любой директивой.
```html
<span :text.upper="state.name"></span>
<input :bind.value.input.trim="state.username">
```
| Модификатор | Описание | Пример |
|-------------|-------------|-------------|
| `fixed.N`    | Форматирует число до N знаков после запятой    | `:text.fixed.2="price"`    |
| `int`    | Преобразует в целое число    | `:text.int="value"`    |
| `abs`    | Абсолютное значение   | `:text.abs="number"`    |
| `round`    | Округляет до ближайшего целого    | `:text.round="number"`    |
| `clamp.min.max`    | Ограничивает значение между min и max    | `:text.clamp.0.100="value"`    |
| `unit`    | Добавляет суффикс единицы измерения (по умолчанию 'px')    | `:text.unit.em="size"`    |
| `trim`    | Удаляет пробелы в начале и конце строки    | `:text.trim="text"`    |
| `upper`    | Преобразует в верхний регистр    | `:text.upper="text"`    |
| `lower`    | Преобразует в нижний регистр    | `:text.lower="text"`    |
| `capitalize`    | Делает первую букву заглавной    | `:text.capitalize="text"`    |
| `default.X`    | Значение по умолчанию    | `:text.default.-="name"`    |
| `json`    | Преобразует значение в JSON-строку    | `:text.json="state.user"`    |

## События
### Директивы `:on*`
```html
<button :onclick="state.count++">Нажать</button>
<input :oninput="state.value = event.target.value">
<form :onsubmit="methods.submit(event)">Отправить</form>
```
В обработчиках доступны: `el` (текущий элемент), `state`, `methods`, `event` (нативный объект события).

### Модификаторы событий
```html
<button :onclick.stop="state.clicked = true">Без всплытия</button>
<a :onclick.prevent="methods.navigate">Без перехода</a>
<div :onclick.self="state.selected = true">Только клик по себе</div>
<input :onkeydown.enter="methods.submit">Только Enter
<button :onclick.stop.prevent="methods.save">Оба модификатора</button>
```
Доступны: `stop`, `prevent`, `self`, `enter`, `once`, `capture`, `passive`

### Жизненный цикл
```html
<div 
  :component="components.widget"
  :oncreate="methods.onCreated"
  :ondestroy="methods.onDestroyed">
</div>
```
Асинхронный `:oncreate.async` — для операций, которые можно отменить:
```html
<div :component="components.widget" :oncreate.async="methods.init"></div>
```
```js
methods: {
  async init({ name, target, signal }) {
    if (signal.aborted) return
    await fetchData()
  }
}
```

## Вспомогательные функции
```js
import { nextTick, isObject, isEqual, kebabToCamel } from './prototy/index.js'
```
- `nextTick()` — дождаться обновления DOM

- `isObject()` — проверка на объект

- `isEqual(a, b)` — глубокое сравнение

- `kebabToCamel()` — `user-name` → `userName`

## Полный пример (Todo-лист) - не работает
```html
<div id="app">
  <h1 :text="state.title"></h1>
  
  <input 
    :bind.value.input="state.newTodo"
    :onkeydown.enter="methods.addTodo"
    placeholder="Новая задача...">
  
  <div :each="state.todos" :component="components.todoItem"></div>
  
  <div>Осталось: <span :text="state.remaining"></span></div>
</div>
```
```js
const app = prototy({
  root: document.getElementById('app'),
  
  state: {
    title: 'Мои задачи',
    newTodo: '',
    todos: []
  },
  
  methods: {
    addTodo() {
      if (this.state.newTodo.trim()) {
        this.state.todos.push({
          text: this.state.newTodo,
          done: false
        })
        this.state.newTodo = ''
        this.updateRemaining()
      }
    },
    toggleTodo(index) {
      this.state.todos[index].done = !this.state.todos[index].done
      this.updateRemaining()
    },
    updateRemaining() {
      this.state.remaining = this.state.todos.filter(t => !t.done).length
    }
  },
  
  components: {
    todoItem: `
      <div :class="{ done: item.done }">
        <input 
          type="checkbox" 
          :bind.checked.change="item.done"
          :onchange="methods.updateRemaining()">
        <span :text="item.text"></span>
      </div>
    `
  }
})
```
```css
.done { text-decoration: line-through; opacity: 0.6; }
```

## Пользовательские директивы (advanced)
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
<div :highlight="state.isActive"></div>
<div :tooltip.top="'Подсказка'"></div>
```
