# Contributing

Thank you for your interest in contributing to **Prototy**!  
This document outlines the guidelines that help us keep the codebase consistent, maintainable, and easy to review.

We value clear intent, predictable changes, and respectful collaboration.

---

## Quick Start

```bash
npm install
npm run lint
npm run typecheck
```

---

## Requirements

- Node.js **>= 18**
- **ES Modules**
- JavaScript (**no TypeScript source files**)
- Type annotations via **JSDoc**
- Code quality enforced by **ESLint**
- Type correctness enforced by **TypeScript (checkJs mode)**
- **Conventional Commits** (enforced via commitlint)

---

## Workflow

1. Fork the repository.
2. Create a branch from `develop`:
   ```bash
   git checkout -b feat/short-topic
   ```
3. Make your changes.
4. Verify code quality and type correctness:
   ```bash
   npm run lint
   npm run typecheck
   ```
5. Commit your changes following the rules below.
6. Open a Pull Request.

---

## Code Style (ESLint)

The project uses ESLint to enforce a consistent code style and catch common issues.

Key rules:

- Indentation: **tabs**
- Quotes: **single**
- Semicolons: **not used**
- Line endings: **LF (\n)**
- Unused variables are not allowed  
  Variables prefixed with `_` are allowed (e.g. `_unused`)

Run manually:

```bash
npm run lint
```

---

## JSDoc (Source of Types)

JSDoc is the **single source of truth** for type information in this project.

Rules:

- JSDoc is required for **public APIs** (functions, methods, classes)
- `@param` and `@returns` are mandatory (except for `void`)
- All types must be valid and intentional
- Use `@typedef` for complex or reusable object shapes

Example:

```js
/**
 * Updates the state.
 * @param {string} key
 * @param {unknown} value
 * @returns {void}
 */
update(key, value) {
	this.state[key] = value
}
```

```js
/**
 * Adds two numbers together.
 *
 * @template T extends number
 * @param {T} a
 * @param {T} b
 * @returns {T}
 */
function add(a, b) {
	return a + b
}
```

```js
/**
 * Adds two numbers together.
 *
 * @param {number | string} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
	return Number(a) + b
}
```

---

## Type Checking (TypeScript — checkJs)

Although the project does **not** use TypeScript source files, it uses **TypeScript's type checker** to validate JavaScript code based on JSDoc annotations.

What this provides:

- Validation that function calls match their JSDoc-defined types
- Detection of invalid argument types (e.g. passing `string` where `number` is expected)
- Errors reported without emitting or compiling any code

Run manually:

```bash
npm run typecheck
```

> Note: This runs `tsc --noEmit` with `checkJs` enabled.

---

## Code Comments

Comments should be written **only when they add value**, such as:

- Explaining non-obvious logic
- Documenting constraints or edge cases
- Clarifying intentional design decisions

Avoid comments that simply restate the code.

---

## Commits

This project follows **Conventional Commits**.

Format:

```
<type>(scope): short description
```

### Types

- `add` — new functionality
- `fix` — bug fix
- `refactor` — refactoring without behavior changes
- `docs` — documentation changes
- `style` — formatting only, no logic changes
- `test` — tests
- `chore` — tooling, infrastructure, dependencies

### Scope

The scope describes the affected area, for example:
`state`, `screen`, `component`, `docs`, `build`.

### Examples

- `add: add reactive proxy`
- `fix: prevent duplicate event binding`
- `docs: update README examples`
- `refactor: simplify navigation logic`

---

## Pull Requests

Before opening a Pull Request, please ensure:

- [ ] `npm run lint` passes without errors
- [ ] `npm run typecheck` passes without errors
- [ ] Public APIs are documented with JSDoc
- [ ] Commits follow Conventional Commits
- [ ] The PR clearly explains **what** was changed and **why**

Recommended PR description template:

```md
## What was changed
- ...

## Why
- ...

## How to test
1. ...
```

---

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Avoid toxic behavior or personal attacks
