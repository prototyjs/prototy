var V = Object.defineProperty;
var O = (e) => {
  throw TypeError(e);
};
var q = (e, t, i) => t in e ? V(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var _ = (e, t, i) => q(e, typeof t != "symbol" ? t + "" : t, i), T = (e, t, i) => t.has(e) || O("Cannot " + i);
var g = (e, t, i) => (T(e, t, "read from private field"), i ? i.call(e) : t.get(e)), w = (e, t, i) => t.has(e) ? O("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), M = (e, t, i, n) => (T(e, t, "write to private field"), n ? n.call(e, i) : t.set(e, i), i);
function E(e) {
  return typeof e == "object" && e !== null;
}
function W(e) {
  if (e._bound) {
    for (const t in e._bound)
      delete e[t];
    delete e._bound;
  }
}
const P = process.env.NODE_ENV !== "production", p = {
  /**
   * @param { string } text
   * @param { Array } [args=[]]
   */
  error(e, ...t) {
    P && console.error(`[PROTOTY] ${A(e, t)}`, ...t);
  },
  warn(e, ...t) {
    P && console.warn(`[PROTOTY] ${A(e, t)}`, ...t);
  }
};
function A(e, t) {
  return t.reduce((i, n, o) => {
    let r = n;
    if (E(n) && !(n instanceof HTMLElement))
      try {
        r = JSON.stringify(n), r = r.length > 100 ? r.slice(0, 100) + "..." : r;
      } catch {
        r = String(n);
      }
    return i.split(`{${o}}`).join(String(r));
  }, e);
}
function N(e, t, i = "") {
  const n = i ? `const ${i} = local` : "", o = new Function("el", "scope", "local", `
        ${n}
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
    return o(r, a, c);
  };
}
function z(e = {}) {
  return Object.fromEntries(
    Object.keys(e).map((t) => [t, { name: t, template: e[t] }])
  );
}
function F(e, t) {
  if (!E(t))
    return console.error("error class");
  Object.entries(t).forEach(([i, n]) => {
    e.classList.toggle(i, !!n);
  });
}
function H(e, t, i, n, o) {
  e.textContent = o(t, i, n) ?? "";
}
function $(e, t, i) {
  const n = e._nodeMap || (e._nodeMap = /* @__PURE__ */ new WeakMap()), o = e.children, r = (t == null ? void 0 : t.length) || 0;
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
    let a = n.get(c);
    if (!a)
      a = e._template.cloneNode(!0), n.set(c, a), e.insertBefore(a, o[s] || null), a._item = c, a._index = s, i.context(a, { item: c, index: s }), e.dispatchEvent(new CustomEvent("create", {
        detail: {
          node: a,
          item: c,
          index: s,
          type: "each-item"
        }
      })), i.setup(a);
    else {
      o[s] !== a && e.insertBefore(a, o[s] || null);
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
function D(e, t, i, n, o, r) {
  const s = o(t, i, n);
  s != null && s !== !1 ? e.setAttribute(r, s) : e.removeAttribute(r);
}
function K(e, t, i, n, o) {
  e.innerHTML = o(t, i, n) ?? "";
}
function U(e, t) {
  e.style.display = t ? "" : "none";
}
const I = {
  class: F,
  text: H,
  each: $,
  html: K,
  show: U,
  attr: D
};
function J(e, t, i) {
  const n = t.split("."), o = n.pop(), r = n.reduce((s, c) => s && s[c] ? s[c] : s, e);
  r && r[o] !== i && (r[o] = i);
}
function B(e, t, i, n, o, r, s) {
  const c = [...n], a = c.shift() || "input", d = "on" + a, f = c.shift(), h = c;
  if (e[i] !== t && t !== void 0 && (e[i] = t ?? ""), e._bound || (e._bound = {}), e._bound[d] && e._bound[d] !== i) {
    p.error('Conflict "{0}" already taken by "{1}".', d, e._bound[d], e);
    return;
  }
  if (!e._bound[d]) {
    const y = () => {
      const u = o(
        e[i],
        f,
        h
      );
      J(s.state, r, u);
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
function Y(e) {
  const t = document.createElement("template");
  return t.innerHTML = e, t.content;
}
function j(e, t, i) {
  e._slots && t.querySelectorAll("slot").forEach((n) => {
    const o = n.getAttribute("name") || "default", r = e._slots[o];
    if (r) {
      const s = r.cloneNode(!0);
      n.replaceWith(s), n._currentClone = s, s._mounted || (i.setup(s), s._mounted = !0);
    } else
      n.childNodes.length === 0 ? n.remove() : n.replaceWith(...n.childNodes);
  });
}
function x(e, t, i, n) {
  const o = new CustomEvent(t, { detail: i });
  o.done = n, e.dispatchEvent(o);
}
function X(e, t = {}, i) {
  e._abortController && e._abortController.abort();
  const n = new AbortController();
  if (e._abortController = n, e._component)
    for (x(e, "destroy", { name: e._component }); e.firstChild; )
      i.unprocess && i.unprocess(e.firstChild), e.firstChild.remove();
  if (!t || !t.template) {
    e.innerHTML = "";
    return;
  }
  const o = e.hasAttribute(":each"), r = Y(t.template);
  if (e._component = t.name, o) {
    j(e, r, i.setup);
    const c = r.firstElementChild;
    c && (e._template = c, e.innerHTML = "");
    return;
  }
  const s = () => {
    if (!n.signal.aborted) {
      for (j(e, r, i); e.firstChild; )
        i.unprocess(e.firstChild), e.firstChild.remove();
      e.appendChild(r), Array.from(e.children).forEach((c) => {
        i.setup(c);
      });
    }
  };
  e._async ? x(e, "create", { name: t.name, signal: n.signal }, s) : (s(), x(e, "create", { name: t.name }));
}
function G(e, t, i, n, o, r) {
  if (E(t)) {
    Object.assign(e[r], t);
    return;
  }
  const s = o(t, i, n);
  typeof e[r] == "boolean" ? e[r] = !!s : e[r] = s ?? "";
}
class Q {
  /**
   * @constructor
   * @param { object } clientDirectives
   * @param { object } bus
   * @param { object } methods
   */
  constructor(t = {}, i, n) {
    this.methods = n, this.directives = {
      ...t,
      ...I,
      each: (o, r) => $(o, r, n),
      component: (o, r) => X(o, r, n),
      bind: (o, r, s, c, a, d, f) => B(o, r, s, c, a, f, i)
    };
  }
  /**
   *
   * @param { HTMLElement } element
   * @param { string } key
   * @param { any } value
   * @param { string } code
   */
  apply(t, i, n, o) {
    const [r, s, ...c] = i.split(".");
    if (i !== "el") {
      if (Object.hasOwn(this.directives, r)) {
        this.directives[r](t, n, s, c, this.methods.transform, r, o);
        return;
      }
      if (r in t) {
        G(t, n, s, c, this.methods.transform, r);
        return;
      }
      D(t, n, s, c, this.methods.transform, r);
    }
  }
}
const Z = {
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
class k {
  /**
   * @param { object } clientModifiers
   */
  constructor(t = {}) {
    /** @type { Record<string, Function> } */
    _(this, "modifiers");
    this.modifiers = { ...Z, ...t };
  }
  /**
   * @param { any } value
   * @param { string } name
   * @param  { Array<string> } args
   * @returns { any }
   */
  transform(t, i, n) {
    return i ? Object.hasOwn(this.modifiers, i) ? this.modifiers[i](t, ...n) : (p.error(`Unknown modifier '${i}'`), t) : t;
  }
}
var b;
class tt {
  constructor() {
    _(this, "activeEffect", null);
    w(this, b, /* @__PURE__ */ new WeakMap());
  }
  /**
   * @param { object } target
   * @param { string } key
   * @param { Function } effect
   */
  add(t, i, n) {
    g(this, b).has(t) || g(this, b).set(t, /* @__PURE__ */ new Map());
    const o = g(this, b).get(t);
    o.has(i) || o.set(i, /* @__PURE__ */ new Set()), o.get(i).add(n);
  }
  /**
   * @param { object } target
   * @param { string } key
   * @returns { Array<{el: HTMLElement, attr: string, update: Function}> }
   */
  find(t, i) {
    const n = g(this, b).get(t), o = n == null ? void 0 : n.get(i);
    return o ? Array.from(o) : [];
  }
  /**
   * @param {Function} effect
   * @param {object} deps
   */
  removeEffect(t, i) {
    if (i) {
      for (const n of i) {
        const { target: o, property: r } = n, s = g(this, b).get(o);
        if (s) {
          const c = s.get(r);
          c && (c.delete(t), c.size === 0 && s.delete(r)), s.size === 0 && g(this, b).delete(o);
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
class et {
  /**
   *
   */
  constructor() {
    w(this, v);
    M(this, v, /* @__PURE__ */ new Map());
  }
  /**
   * @param { HTMLElement } element
   * @param { string } attr
   * @param { Function } handle
   */
  add(t, i, n) {
    g(this, v).has(t) || g(this, v).set(t, []);
    const [o, ...r] = i.split("."), s = {
      once: r.includes("once"),
      capture: r.includes("capture"),
      passive: r.includes("passive")
    };
    let c = (d) => {
      r.includes("stop") && d.stopPropagation(), r.includes("prevent") && d.preventDefault(), !(r.includes("self") && d.target !== t) && (r.includes("enter") && d.key !== "Enter" || n(d));
    };
    o === "create" ? (r.includes("async") && (t._async = !0), c = async (d) => {
      var l;
      const { detail: f, timestamp: h, done: y } = d, u = n({ name: f.name, target: t, timestamp: h, signal: f.signal });
      try {
        t._async && await u;
      } catch (m) {
        if ((l = f.signal) != null && l.aborted)
          return;
        throw p.error('Failed to execute "{0}" listener in component <{1}>.', ":oncreate", f.name), m;
      } finally {
        y();
      }
    }) : o === "destroy" && (c = (d) => {
      const { detail: f } = d;
      n({ name: f.name, target: t });
    });
    const a = { name: o, handler: c, options: s };
    g(this, v).get(t).push(a), t.addEventListener(o, c, s);
  }
  /**
   * @param { HTMLElement } element
   */
  remove(t) {
    const i = g(this, v).get(t);
    i && (i.forEach(({ name: n, handler: o, options: r }) => {
      t.removeEventListener(n, o, r);
    }), g(this, v).delete(t));
  }
}
v = new WeakMap();
function it(e) {
  return e.replace(/-([a-z])/g, (t, i) => i.toUpperCase());
}
class st {
  /**
   * @param { object } options
   * @param { Function } options.listeners
   * @param { Function } options.destroy
   */
  constructor({ listeners: t, destroy: i, attribute: n }) {
    this.listeners = t, this.destroy = i, this.attribute = n, this.nodes = /* @__PURE__ */ new WeakSet(), this.priority = { ":props": 1, ":component": 2, ":each": 3 };
  }
  /**
   * @param { HTMLElement } node
   * @param { Function } handler
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  process(t, i) {
    const n = [t];
    for (; n.length; ) {
      const o = n.pop();
      if (o.nodeType === 1 || o.nodeType === 11) {
        let r = !1;
        if (o.nodeType === 1) {
          const c = Array.from(o.attributes);
          c.sort((d, f) => (this.priority[d.name] || 99) - (this.priority[f.name] || 99));
          const a = [];
          for (let d = 0; d < c.length; d++) {
            const f = c[d];
            this.attribute(o, f.name, f.value), f.name.charCodeAt(0) === 58 ? (r = !0, this.directive(f, o, i, a)) : f.name === "el" && (r = !0);
          }
          for (const d of a)
            o.removeAttribute(d);
          r && this.nodes.add(o);
        }
        let s = o.lastElementChild;
        for (; s; )
          n.push(s), s = s.previousElementSibling;
      }
    }
  }
  /**
   * @param { string } attr
   * @param { HTMLElement } node
   * @param { Function } handler
   * @param { Array } toRemove
   */
  directive(t, i, n, o) {
    const r = t.name.slice(1), s = it(r);
    s.charCodeAt(0) === 111 && s.charCodeAt(1) === 110 ? this.listeners(i, s.slice(2).toLowerCase(), t.value) : n(i, s, t.value), o.push(t.name);
  }
  /**
   * @param { HTMLElement } node
   */
  unprocess(t) {
    const i = [t];
    for (; i.length; ) {
      const n = i.pop();
      if (n._keep)
        continue;
      this.nodes.has(n) && (this.destroy(n), this.nodes.delete(n));
      let o = n.firstElementChild;
      for (; o; )
        i.push(o), o = o.nextElementSibling;
    }
  }
}
function L(e, t, i) {
  if (t)
    for (const [n, o] of Object.entries(t))
      typeof o == "function" && (e[n] = o.bind(i));
}
const C = Symbol("is_proxy");
class rt {
  /**
   * @param { PrototyOptions } options
   */
  constructor({
    state: t = {},
    root: i = document.body,
    params: n = {},
    methods: o = {},
    computed: r = {},
    directives: s = {},
    modifiers: c = {},
    components: a = {},
    setters: d = {}
  }) {
    this.reactivity = new tt(), this.listeners = new et(), this.contextStorage = /* @__PURE__ */ new WeakMap(), this.pendingTargets = /* @__PURE__ */ new Map(), this.initComputed(t, r), this.state = this.createProxy(t), this.methods = {}, this.setters = {}, this.activeSetters = /* @__PURE__ */ new Set(), this.bus = {
      root: i,
      state: this.state,
      methods: this.methods,
      params: n,
      components: z(a),
      els: {}
    }, L(this.methods, o, this.bus), L(this.setters, d, this.bus), this.nodes = new st({
      listeners: (f, h, y) => {
        const u = N(y, this.bus, "event");
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
    }), this.modifiers = new k(c), this.directive = new Q(s, this.bus, {
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
    this.nodes.process(t, (i, n, o) => {
      const r = N(o, this.bus), s = () => {
        this.reactivity.removeEffect(s, s.deps), this.reactivity.activeEffect = s;
        try {
          const c = this.getContext(i), a = r(i, c);
          n === "props" ? this.updateContext(i, a) : this.directive.apply(i, n, a, o);
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
    !i || Object.keys(i).length === 0 || Object.keys(i).forEach((n) => {
      n in t && p.warn('Computed property "{0}" overrides existing property', n);
      const o = i[n];
      let r, s = !0;
      const c = () => {
        s || (s = !0, this.schedule(t, n));
      };
      c.deps = /* @__PURE__ */ new Set(), Object.defineProperty(t, n, {
        get: () => {
          if (this.reactivity.activeEffect === c)
            return p.error('Circular dependency detected in computed property "{0}"', n), r;
          const a = this.reactivity.activeEffect;
          if (a && a !== c && (this.reactivity.add(t, n, a), a.deps.add({ target: t, property: n })), s) {
            const d = this.reactivity.activeEffect;
            c.deps.size > 0 && (this.reactivity.removeEffect(c, c.deps), c.deps.clear()), this.reactivity.activeEffect = c;
            try {
              r = o.bind(this.bus)();
            } catch (f) {
              p.error('Error in computed property "{0}": {1}', n, f.message), r = void 0;
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
  createProxy(t, i = "", n = null) {
    const o = this;
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
      value: n,
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
        const a = Reflect.get(r, s, c), d = typeof s != "symbol" && s in r && typeof a != "function", f = o.reactivity.activeEffect;
        return d && f && (o.reactivity.add(r, s, f), f.deps.add({ target: r, property: s })), a;
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
        if (E(c) && !c[C] && (l = o.createProxy(c, u)), typeof ((S = o.setters) == null ? void 0 : S[u]) == "function" && !o.activeSetters.has(u)) {
          o.activeSetters.add(u);
          try {
            if (l = o.setters[u](l, h), Object.is(h, l))
              return !0;
          } catch (R) {
            p.error('Error in setter for "{0}": {1}', u, R.message), l = h;
          } finally {
            o.activeSetters.delete(u);
          }
        }
        const m = Reflect.set(r, s, l, a);
        return m && (o.schedule(r, s), f && !y && o.schedule(r, "length")), m;
      }
    });
  }
  /**
   * @param { object } target
   * @param { string } property
   */
  schedule(t, i) {
    const n = (r, s) => {
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
    n(t, i);
    let o = t;
    for (; o && o._parent; ) {
      const r = o._path ? o._path.split(".").pop() : null;
      r && n(o._parent, r), o = o._parent;
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
    const n = t.split("."), o = n.pop(), r = n.reduce((a, d) => a == null ? void 0 : a[d], this.state);
    if (!r || typeof r != "object") {
      p.error('Update error: path "{0}" is unreachable', t);
      return;
    }
    const s = this.setters[t], c = r[o];
    if (typeof s == "function") {
      this.activeSetters.add(t);
      try {
        r[o] = s(i, c, "external");
      } finally {
        this.activeSetters.delete(t);
      }
    } else
      c !== i && (r[o] = i);
  }
  /**
   * @param { HTMLElement } element
   * @param { boolean } reactive
   * @returns { any }
   */
  getContext(t, i = !0) {
    const n = this, o = i ? this.reactivity.activeEffect : null;
    return new Proxy({}, {
      get(r, s) {
        let c = t;
        for (; c; ) {
          const a = n.contextStorage.get(c);
          if (a != null && a.data && s in a.data) {
            if (o) {
              const d = `ctx:${String(s)}`;
              n.reactivity.add(c, d, o), o.deps.add({ target: c, property: d });
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
    let n = this.contextStorage.get(t);
    n || (n = { data: {}, isScope: !1 }, this.contextStorage.set(t, n));
    for (const o in i) {
      const r = i[o];
      if (n.data[o] !== r) {
        n.data[o] = r;
        const c = `ctx:${o}`;
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
    }), this.listeners.remove(t), this.reactivity.removeEffects(t), W(t), t._el && this.bus.els[t._el] === t && delete this.bus.els[t._el]);
  }
}
function ot(e) {
  const t = () => new Promise((i) => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        i();
      });
    });
  });
  return e ? t().then(e) : t();
}
function ct(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function ft(e) {
  const t = new rt(e);
  let i = !1;
  return {
    ...t.bus,
    update: t.update.bind(t),
    destroy: () => {
      var n, o;
      i || (t.destroy(t.bus.root), (n = t.pendingTargets) == null || n.clear(), (o = t.activeSetters) == null || o.clear(), t.bus = null, i = !0);
    }
  };
}
export {
  ct as isEqual,
  E as isObject,
  it as kebabToCamel,
  ot as nextTick,
  ft as prototy
};
//# sourceMappingURL=prototy.js.map
