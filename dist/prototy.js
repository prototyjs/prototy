var D = Object.defineProperty;
var O = (e) => {
  throw TypeError(e);
};
var R = (e, t, i) => t in e ? D(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var _ = (e, t, i) => R(e, typeof t != "symbol" ? t + "" : t, i), M = (e, t, i) => t.has(e) || O("Cannot " + i);
var g = (e, t, i) => (M(e, t, "read from private field"), i ? i.call(e) : t.get(e)), w = (e, t, i) => t.has(e) ? O("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), A = (e, t, i, o) => (M(e, t, "write to private field"), o ? o.call(e, i) : t.set(e, i), i);
function E(e) {
  return typeof e == "object" && e !== null;
}
function q(e) {
  if (e._bound) {
    for (const t in e._bound)
      delete e[t];
    delete e._bound;
  }
}
const p = {
  /**
   * @param { string } text
   * @param { Array } [args=[]]
   */
  error(e, ...t) {
  },
  warn(e, ...t) {
  }
};
function P(e, t, i = "") {
  const o = i ? `const ${i} = local` : "", n = new Function("el", "scope", "local", `
        ${o}
        with(scope) {
            try {
                return ${e}
            } catch (err) {
                console.warn('Runtime error in expression:', err)
                return undefined
            }
        }
    `);
  return (r, s, c) => {
    const a = new Proxy({}, {
      get(d, f) {
        if (f === "el")
          return r;
        const h = s[f];
        if (h !== void 0)
          return h;
        if (f in t.state)
          return t.state[f];
        if (f in t.methods)
          return t.methods[f];
        if (f in t.params)
          return t.params[f];
        if (f === "root")
          return t.root;
        if (f === "components")
          return t.components;
        if (f === "els")
          return t.els;
        if (f !== Symbol.unscopables) {
          if (f in window)
            return window[f];
          p.error('ReferenceError: "{0}" is not defined', f, r);
        }
      },
      set(d, f, h) {
        return f in t.state ? (t.state[f] = h, !0) : s && typeof s == "object" && f in s ? (s[f] = h, !0) : (p.error(`Cannot set "${f}" - property does not exist in state or context`, r), !1);
      },
      has(d, f) {
        return f !== i;
      }
    });
    return n(r, a, c);
  };
}
function V(e = {}) {
  return Object.fromEntries(
    Object.keys(e).map((t) => [t, { name: t, template: e[t] }])
  );
}
function W(e, t) {
  if (!E(t))
    return console.error("error class");
  Object.entries(t).forEach(([i, o]) => {
    e.classList.toggle(i, !!o);
  });
}
function z(e, t, i, o, n) {
  e.textContent = n(t, i, o) ?? "";
}
function N(e, t, i) {
  const o = e._nodeMap || (e._nodeMap = /* @__PURE__ */ new WeakMap()), n = e.children, r = (t == null ? void 0 : t.length) || 0;
  if (!r) {
    for (; e.firstChild; ) {
      const s = e.firstChild;
      e.dispatchEvent(new CustomEvent("destroy", {
        detail: {
          node: s,
          item: s._item,
          index: s._index,
          type: "each-item"
        }
      })), i.unprocess(s), s.remove();
    }
    return;
  }
  for (let s = 0; s < r; s++) {
    const c = t[s];
    let a = o.get(c);
    if (!a)
      a = e._template.cloneNode(!0), o.set(c, a), e.insertBefore(a, n[s] || null), a._item = c, a._index = s, i.context(a, { item: c, index: s }), e.dispatchEvent(new CustomEvent("create", {
        detail: {
          node: a,
          item: c,
          index: s,
          type: "each-item"
        }
      })), i.setup(a);
    else {
      n[s] !== a && e.insertBefore(a, n[s] || null);
      const d = a._index;
      a._item = c, a._index = s, i.context(a, { item: c, index: s }), d !== s && e.dispatchEvent(new CustomEvent("update", {
        detail: {
          node: a,
          item: c,
          oldIndex: d,
          newIndex: s,
          type: "each-item"
        }
      }));
    }
  }
  for (; e.children.length > r; ) {
    const s = e.lastElementChild;
    e.dispatchEvent(new CustomEvent("destroy", {
      detail: {
        node: s,
        item: s._item,
        index: s._index,
        type: "each-item"
      }
    })), i.unprocess(s), s.remove();
  }
}
function L(e, t, i, o, n, r) {
  const s = n(t, i, o);
  s != null && s !== !1 ? e.setAttribute(r, s) : e.removeAttribute(r);
}
function F(e, t, i, o, n) {
  e.innerHTML = n(t, i, o) ?? "";
}
function K(e, t) {
  e.style.display = t ? "" : "none";
}
const U = {
  class: W,
  text: z,
  each: N,
  html: F,
  show: K,
  attr: L
};
function H(e, t, i) {
  const o = t.split("."), n = o.pop(), r = o.reduce((s, c) => s && s[c] ? s[c] : s, e);
  r && r[n] !== i && (r[n] = i);
}
function I(e, t, i, o, n, r, s) {
  const c = [...o], a = c.shift() || "input", d = "on" + a, f = c.shift(), h = c;
  if (e[i] !== t && t !== void 0 && (e[i] = t ?? ""), e._bound || (e._bound = {}), e._bound[d] && e._bound[d] !== i) {
    p.error('Conflict "{0}" already taken by "{1}".', d, e._bound[d], e);
    return;
  }
  if (!e._bound[d]) {
    const y = () => {
      const u = n(
        e[i],
        f,
        h
      );
      H(s.state, r, u);
    };
    e.addEventListener(a, y), Object.defineProperty(e, d, {
      get: () => y,
      set: () => {
        p.error('Channel "{0}" is occupied by bind "{1}".', d, r, e);
      },
      configurable: !0,
      enumerable: !0
    }), e._bound[d] = i;
  }
}
function B(e) {
  const t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function T(e, t, i) {
  e._slots && t.querySelectorAll("slot").forEach((o) => {
    const n = o.getAttribute("name") || "default", r = e._slots[n];
    if (r) {
      const s = r.cloneNode(!0);
      o.replaceWith(s), o._currentClone = s, s._mounted || (i.setup(s), s._mounted = !0);
    } else
      o.childNodes.length === 0 ? o.remove() : o.replaceWith(...o.childNodes);
  });
}
function x(e, t, i, o) {
  const n = new CustomEvent(t, { detail: i });
  n.done = o, e.dispatchEvent(n);
}
function J(e, t = {}, i) {
  e._abortController && e._abortController.abort();
  const o = new AbortController();
  if (e._abortController = o, e._component)
    for (x(e, "destroy", { name: e._component }); e.firstChild; )
      i.unprocess && i.unprocess(e.firstChild), e.firstChild.remove();
  if (!t || !t.template) {
    e.innerHTML = "";
    return;
  }
  const n = e.hasAttribute(":each"), r = B(t.template);
  if (e._component = t.name, n) {
    T(e, r, i.setup);
    const c = r.firstElementChild;
    c && (e._template = c, e.innerHTML = "");
    return;
  }
  const s = () => {
    if (!o.signal.aborted) {
      for (T(e, r, i); e.firstChild; )
        i.unprocess(e.firstChild), e.firstChild.remove();
      e.appendChild(r), Array.from(e.children).forEach((c) => {
        i.setup(c);
      });
    }
  };
  e._async ? x(e, "create", { name: t.name, signal: o.signal }, s) : (s(), x(e, "create", { name: t.name }));
}
function X(e, t, i, o, n, r) {
  if (E(t)) {
    Object.assign(e[r], t);
    return;
  }
  const s = n(t, i, o);
  typeof e[r] == "boolean" ? e[r] = !!s : e[r] = s ?? "";
}
class Y {
  /**
   * @constructor
   * @param { object } clientDirectives
   * @param { object } bus
   * @param { object } methods
   */
  constructor(t = {}, i, o) {
    this.methods = o, this.directives = {
      ...t,
      ...U,
      each: (n, r) => N(n, r, o),
      component: (n, r) => J(n, r, o),
      bind: (n, r, s, c, a, d, f) => I(n, r, s, c, a, f, i)
    };
  }
  /**
   *
   * @param { HTMLElement } element
   * @param { string } key
   * @param { any } value
   * @param { string } code
   */
  apply(t, i, o, n) {
    const [r, s, ...c] = i.split(".");
    if (i !== "el") {
      if (Object.hasOwn(this.directives, r)) {
        this.directives[r](t, o, s, c, this.methods.transform, r, n);
        return;
      }
      if (r in t) {
        X(t, o, s, c, this.methods.transform, r);
        return;
      }
      L(t, o, s, c, this.methods.transform, r);
    }
  }
}
const G = {
  /**
   * @param { any } value
   * @param { number } [n=2]
   * @returns { string }
   */
  fixed: (e, t = 2) => Number(e).toFixed(t),
  /**
   * @param { any } value
   * @param { number } [n=10]
   * @returns { number }
   */
  int: (e, t = 10) => parseInt(e, t),
  /**
   * @param { any } value
   * @returns { number }
   */
  abs: (e) => Math.abs(Number(e)),
  /**
   * @param { any } value
   * @returns { number }
   */
  round: (e) => Math.round(Number(e)),
  /**
   * @param { any } value
   * @param { number } [min=0]
   * @param { number } [max=1]
   * @returns { number }
   */
  clamp: (e, t = 0, i = 1) => Math.min(Math.max(Number(e), t), i),
  /**
   * @param { any } value
   * @param { string } [u='px']
   * @returns { string }
   */
  unit: (e, t = "px") => e + t,
  /**
   * @param { any } value
   * @returns { string }
   */
  trim: (e) => String(e).trim(),
  /**
   * @param { any } value
   * @returns { string }
   */
  upper: (e) => String(e).toUpperCase(),
  /**
   * @param { any } value
   * @returns { string }
   */
  lower: (e) => String(e).toLowerCase(),
  /**
   * @param { any } value
   * @returns { string }
   */
  capitalize: (e) => String(e).charAt(0).toUpperCase() + String(e).slice(1),
  /**
   * @param { any } value
   * @param { string } [def='-']
   * @returns { any }
   */
  default: (e, t = "-") => e || e === 0 ? e : t,
  /**
   * @param { any } value
   * @returns { string }
   */
  json: (e) => JSON.stringify(e)
};
class Q {
  /**
   * @param { object } clientModifiers
   */
  constructor(t = {}) {
    /** @type { Record<string, Function> } */
    _(this, "modifiers");
    this.modifiers = { ...G, ...t };
  }
  /**
   * @param { any } value
   * @param { string } name
   * @param  { Array<string> } args
   * @returns { any }
   */
  transform(t, i, o) {
    return i ? Object.hasOwn(this.modifiers, i) ? this.modifiers[i](t, ...o) : (p.error(`Unknown modifier '${i}'`), t) : t;
  }
}
var b;
class Z {
  constructor() {
    _(this, "activeEffect", null);
    w(this, b, /* @__PURE__ */ new WeakMap());
  }
  /**
   * @param { object } target
   * @param { string } key
   * @param { Function } effect
   */
  add(t, i, o) {
    g(this, b).has(t) || g(this, b).set(t, /* @__PURE__ */ new Map());
    const n = g(this, b).get(t);
    n.has(i) || n.set(i, /* @__PURE__ */ new Set()), n.get(i).add(o);
  }
  /**
   * @param { object } target
   * @param { string } key
   * @returns { Array<{el: HTMLElement, attr: string, update: Function}> }
   */
  find(t, i) {
    const o = g(this, b).get(t), n = o == null ? void 0 : o.get(i);
    return n ? Array.from(n) : [];
  }
  /**
   * @param {Function} effect
   * @param {object} deps
   */
  removeEffect(t, i) {
    if (i) {
      for (const o of i) {
        const { target: n, property: r } = o, s = g(this, b).get(n);
        if (s) {
          const c = s.get(r);
          c && (c.delete(t), c.size === 0 && s.delete(r)), s.size === 0 && g(this, b).delete(n);
        }
      }
      i.clear();
    }
  }
  /**
   * @param {HTMLElement} element
   */
  removeEffects(t) {
    if (t._effects) {
      for (const i of t._effects)
        this.removeEffect(i, i.deps);
      t._effects.clear();
    }
  }
}
b = new WeakMap();
var v;
class k {
  /**
   *
   */
  constructor() {
    w(this, v);
    A(this, v, /* @__PURE__ */ new Map());
  }
  /**
   * @param { HTMLElement } element
   * @param { string } attr
   * @param { Function } handle
   */
  add(t, i, o) {
    g(this, v).has(t) || g(this, v).set(t, []);
    const [n, ...r] = i.split("."), s = {
      once: r.includes("once"),
      capture: r.includes("capture"),
      passive: r.includes("passive")
    };
    let c = (d) => {
      r.includes("stop") && d.stopPropagation(), r.includes("prevent") && d.preventDefault(), !(r.includes("self") && d.target !== t) && (r.includes("enter") && d.key !== "Enter" || o(d));
    };
    n === "create" ? (r.includes("async") && (t._async = !0), c = async (d) => {
      var l;
      const { detail: f, timestamp: h, done: y } = d, u = o({ name: f.name, target: t, timestamp: h, signal: f.signal });
      try {
        t._async && await u;
      } catch (m) {
        if ((l = f.signal) != null && l.aborted)
          return;
        throw p.error('Failed to execute "{0}" listener in component <{1}>.', ":oncreate", f.name), m;
      } finally {
        y();
      }
    }) : n === "destroy" && (c = (d) => {
      const { detail: f } = d;
      o({ name: f.name, target: t });
    });
    const a = { name: n, handler: c, options: s };
    g(this, v).get(t).push(a), t.addEventListener(n, c, s);
  }
  /**
   * @param { HTMLElement } element
   */
  remove(t) {
    const i = g(this, v).get(t);
    i && (i.forEach(({ name: o, handler: n, options: r }) => {
      t.removeEventListener(o, n, r);
    }), g(this, v).delete(t));
  }
}
v = new WeakMap();
function tt(e) {
  return e.replace(/-([a-z])/g, (t, i) => i.toUpperCase());
}
class et {
  /**
   * @param { object } options
   * @param { Function } options.listeners
   * @param { Function } options.destroy
   */
  constructor({ listeners: t, destroy: i, attribute: o }) {
    this.listeners = t, this.destroy = i, this.attribute = o, this.nodes = /* @__PURE__ */ new WeakSet(), this.priority = { ":props": 1, ":component": 2, ":each": 3 };
  }
  /**
   * @param { HTMLElement } node
   * @param { Function } handler
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  process(t, i) {
    const o = [t];
    for (; o.length; ) {
      const n = o.pop();
      if (n.nodeType === 1 || n.nodeType === 11) {
        let r = !1;
        if (n.nodeType === 1) {
          const c = Array.from(n.attributes);
          c.sort((d, f) => (this.priority[d.name] || 99) - (this.priority[f.name] || 99));
          const a = [];
          for (let d = 0; d < c.length; d++) {
            const f = c[d];
            this.attribute(n, f.name, f.value), f.name.charCodeAt(0) === 58 ? (r = !0, this.directive(f, n, i, a)) : f.name === "el" && (r = !0);
          }
          for (const d of a)
            n.removeAttribute(d);
          r && this.nodes.add(n);
        }
        let s = n.lastElementChild;
        for (; s; )
          o.push(s), s = s.previousElementSibling;
      }
    }
  }
  /**
   * @param { string } attr
   * @param { HTMLElement } node
   * @param { Function } handler
   * @param { Array } toRemove
   */
  directive(t, i, o, n) {
    const r = t.name.slice(1), s = tt(r);
    s.charCodeAt(0) === 111 && s.charCodeAt(1) === 110 ? this.listeners(i, s.slice(2).toLowerCase(), t.value) : o(i, s, t.value), n.push(t.name);
  }
  /**
   * @param { HTMLElement } node
   */
  unprocess(t) {
    const i = [t];
    for (; i.length; ) {
      const o = i.pop();
      if (o._keep)
        continue;
      this.nodes.has(o) && (this.destroy(o), this.nodes.delete(o));
      let n = o.firstElementChild;
      for (; n; )
        i.push(n), n = n.nextElementSibling;
    }
  }
}
function j(e, t, i) {
  if (t)
    for (const [o, n] of Object.entries(t))
      typeof n == "function" && (e[o] = n.bind(i));
}
const C = Symbol("is_proxy");
class it {
  /**
   * @param { PrototyOptions } options
   */
  constructor({
    state: t = {},
    root: i = document.body,
    params: o = {},
    methods: n = {},
    computed: r = {},
    directives: s = {},
    modifiers: c = {},
    components: a = {},
    setters: d = {}
  }) {
    this.reactivity = new Z(), this.listeners = new k(), this.contextStorage = /* @__PURE__ */ new WeakMap(), this.pendingTargets = /* @__PURE__ */ new Map(), this.initComputed(t, r), this.state = this.createProxy(t), this.methods = {}, this.setters = {}, this.activeSetters = /* @__PURE__ */ new Set(), this.bus = {
      root: i,
      state: this.state,
      methods: this.methods,
      params: o,
      components: V(a),
      els: {}
    }, j(this.methods, n, this.bus), j(this.setters, d, this.bus), this.nodes = new et({
      listeners: (f, h, y) => {
        const u = P(y, this.bus, "event");
        this.listeners.add(f, h, (l) => {
          const m = this.getContext(f);
          return u(f, m, l);
        });
      },
      destroy: this.destroy.bind(this),
      attribute: (f, h, y) => {
        if (h === "el") {
          const u = y;
          f._el = u, this.bus.els[u] = f;
        }
        if (h === ":each" && (f.firstElementChild || f.textContent.trim() !== "") && p.error("Content (slots) is not allowed inside the :each directive.", f), h === ":component") {
          if (f._slots)
            return;
          f._slots = {}, Array.from(f.childNodes).forEach((u) => {
            if (u.nodeType === 3 && !u.textContent.trim()) {
              u.remove();
              return;
            }
            const l = u.nodeType === 1 && u.getAttribute("slot") || "default";
            if (f._slots[l]) {
              p.error('Slot "{0}" is already occupied in component', l, f);
              return;
            }
            u._keep = !0, f._slots[l] = u, u.remove();
          });
        }
      }
    }), this.modifiers = new Q(c), this.directive = new Y(s, this.bus, {
      setup: this.setup.bind(this),
      unprocess: this.nodes.unprocess.bind(this.nodes),
      context: this.updateContext.bind(this),
      transform: this.modifiers.transform.bind(this.modifiers)
    }), this.setup(i);
  }
  /**
   * @param { HTMLElement } node
   */
  setup(t) {
    this.nodes.process(t, (i, o, n) => {
      const r = P(n, this.bus), s = () => {
        this.reactivity.removeEffect(s, s.deps), this.reactivity.activeEffect = s;
        try {
          const c = this.getContext(i), a = r(i, c);
          o === "props" ? this.updateContext(i, a) : this.directive.apply(i, o, a, n);
        } finally {
          this.reactivity.activeEffect = null;
        }
      };
      i._effects || (i._effects = /* @__PURE__ */ new Set()), i._effects.add(s), s.deps = /* @__PURE__ */ new Set(), s();
    });
  }
  /**
   * @param { object } rawState
   * @param { Record<string, Function> } computed
   */
  initComputed(t, i) {
    !i || Object.keys(i).length === 0 || Object.keys(i).forEach((o) => {
      o in t && p.warn('Computed property "{0}" overrides existing property', o);
      const n = i[o];
      let r, s = !0;
      const c = () => {
        s || (s = !0, this.schedule(t, o));
      };
      c.deps = /* @__PURE__ */ new Set(), Object.defineProperty(t, o, {
        get: () => {
          if (this.reactivity.activeEffect === c)
            return p.error('Circular dependency detected in computed property "{0}"', o), r;
          const a = this.reactivity.activeEffect;
          if (a && a !== c && (this.reactivity.add(t, o, a), a.deps.add({ target: t, property: o })), s) {
            const d = this.reactivity.activeEffect;
            c.deps.size > 0 && (this.reactivity.removeEffect(c, c.deps), c.deps.clear()), this.reactivity.activeEffect = c;
            try {
              r = n.bind(this.bus)();
            } catch (f) {
              p.error('Error in computed property "{0}": {1}', o, f.message), r = void 0;
            } finally {
              this.reactivity.activeEffect = d;
            }
            s = !1;
          }
          return r;
        },
        enumerable: !0,
        configurable: !0
      });
    });
  }
  /**
   * @param { any } state
   * @param { string } path
   * @param { string } parent
   * @returns { object }
   */
  createProxy(t, i = "", o = null) {
    const n = this;
    return E(t) && Object.keys(t).forEach((r) => {
      const s = Object.getOwnPropertyDescriptor(t, r);
      s && typeof s.get == "function" || E(t[r]) && (t[r] = this.createProxy(
        t[r],
        i ? `${i}.${r}` : r,
        t
      ));
    }), i && (Object.defineProperty(t, "_path", {
      value: i,
      enumerable: !1,
      writable: !0,
      configurable: !0
    }), Object.defineProperty(t, "_parent", {
      value: o,
      enumerable: !1,
      writable: !0,
      configurable: !0
    })), Object.defineProperty(t, C, {
      value: !0,
      enumerable: !1,
      writable: !1,
      configurable: !1
    }), new Proxy(t, {
      get(r, s, c) {
        if (s === C)
          return !0;
        const a = Reflect.get(r, s, c), d = typeof s != "symbol" && s in r && typeof a != "function", f = n.reactivity.activeEffect;
        return d && f && (n.reactivity.add(r, s, f), f.deps.add({ target: r, property: s })), a;
      },
      // eslint-disable-next-line sonarjs/cognitive-complexity
      set(r, s, c, a) {
        var S;
        if (typeof s == "symbol")
          return Reflect.set(r, s, c, a);
        const d = Object.getOwnPropertyDescriptor(r, s);
        if (d && typeof d.get == "function" && typeof d.set != "function")
          return p.error('Computed property "{0}" is readonly.', s.toString()), !1;
        const f = Array.isArray(r), h = Reflect.get(r, s), y = f && s === "length";
        if (!y && Object.is(h, c))
          return !0;
        const u = i ? `${i}.${s.toString()}` : s.toString();
        let l = c;
        if (E(c) && !c[C] && (l = n.createProxy(c, u)), typeof ((S = n.setters) == null ? void 0 : S[u]) == "function" && !n.activeSetters.has(u)) {
          n.activeSetters.add(u);
          try {
            if (l = n.setters[u](l, h), Object.is(h, l))
              return !0;
          } catch ($) {
            p.error('Error in setter for "{0}": {1}', u, $.message), l = h;
          } finally {
            n.activeSetters.delete(u);
          }
        }
        const m = Reflect.set(r, s, l, a);
        return m && (n.schedule(r, s), f && !y && n.schedule(r, "length")), m;
      }
    });
  }
  /**
   * @param { object } target
   * @param { string } property
   */
  schedule(t, i) {
    const o = (r, s) => {
      this.pendingTargets.has(r) || (this.pendingTargets.set(r, /* @__PURE__ */ new Set()), queueMicrotask(() => {
        const c = this.pendingTargets.get(r);
        this.pendingTargets.delete(r);
        const a = /* @__PURE__ */ new Set();
        c.forEach((d) => {
          this.reactivity.find(r, d).forEach((y) => a.add(y));
          const h = r[d];
          h && h._path && this.reactivity.find(r, h._path).forEach((u) => a.add(u));
        }), a.forEach((d) => {
          d !== this.reactivity.activeEffect && d();
        });
      })), this.pendingTargets.get(r).add(s);
    };
    o(t, i);
    let n = t;
    for (; n && n._parent; ) {
      const r = n._path ? n._path.split(".").pop() : null;
      r && o(n._parent, r), n = n._parent;
    }
  }
  /**
   * @param { string } path
   * @param { any } value
   */
  update(t, i) {
    if (typeof t != "string") {
      p.error("update() expects path to be a string, but received {0}", typeof t);
      return;
    }
    const o = t.split("."), n = o.pop(), r = o.reduce((a, d) => a == null ? void 0 : a[d], this.state);
    if (!r || typeof r != "object") {
      p.error('Update error: path "{0}" is unreachable', t);
      return;
    }
    const s = this.setters[t], c = r[n];
    if (typeof s == "function") {
      this.activeSetters.add(t);
      try {
        r[n] = s(i, c, "external");
      } finally {
        this.activeSetters.delete(t);
      }
    } else
      c !== i && (r[n] = i);
  }
  /**
   * @param { HTMLElement } element
   * @param { boolean } reactive
   * @returns { any }
   */
  getContext(t, i = !0) {
    const o = this, n = i ? this.reactivity.activeEffect : null;
    return new Proxy({}, {
      get(r, s) {
        let c = t;
        for (; c; ) {
          const a = o.contextStorage.get(c);
          if (a != null && a.data && s in a.data) {
            if (n) {
              const d = `ctx:${String(s)}`;
              o.reactivity.add(c, d, n), n.deps.add({ target: c, property: d });
            }
            return a.data[s];
          }
          c = c.parentElement;
        }
      },
      has: () => !0
    });
  }
  /**
   * @param { HTMLElement } element
   * @param { any } newValue
   */
  updateContext(t, i) {
    let o = this.contextStorage.get(t);
    o || (o = { data: {}, isScope: !1 }, this.contextStorage.set(t, o));
    for (const n in i) {
      const r = i[n];
      if (o.data[n] !== r) {
        o.data[n] = r;
        const c = `ctx:${n}`;
        this.reactivity.find(t, c).forEach((d) => {
          d !== this.reactivity.activeEffect && d();
        });
      }
    }
  }
  /**
   * @param { HTMLElement } element
   */
  destroy(t) {
    t && (Array.from(t.children).forEach((i) => {
      this.destroy(i);
    }), this.listeners.remove(t), this.reactivity.removeEffects(t), q(t), t._el && this.bus.els[t._el] === t && delete this.bus.els[t._el]);
  }
}
function rt(e) {
  const t = () => new Promise((i) => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        i();
      });
    });
  });
  return e ? t().then(e) : t();
}
function nt(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function ot(e) {
  const t = new it(e);
  let i = !1;
  return {
    ...t.bus,
    update: t.update.bind(t),
    destroy: () => {
      var o, n;
      i || (t.destroy(t.bus.root), (o = t.pendingTargets) == null || o.clear(), (n = t.activeSetters) == null || n.clear(), t.bus = null, i = !0);
    }
  };
}
export {
  nt as isEqual,
  E as isObject,
  tt as kebabToCamel,
  rt as nextTick,
  ot as prototy
};
//# sourceMappingURL=prototy.js.map
