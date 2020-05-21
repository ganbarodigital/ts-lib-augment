# Augmentations for Typescript

## Introduction

Use this TypeScript library to add additional features to a TypeScript type at runtime.

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [API](#api)
  - [augment()](#augment)
- [NPM Scripts](#npm-scripts)
  - [npm run clean](#npm-run-clean)
  - [npm run build](#npm-run-build)
  - [npm run test](#npm-run-test)
  - [npm run cover](#npm-run-cover)

## Quick Start

```
# run this from your Terminal
npm install @ganbarodigital/ts-lib-augmentations
```

```typescript
// add this import to your Typescript code
import { extend } from "@ganbarodigital/ts-lib-augmentations/lib/v1"
```

__VS Code users:__ once you've added a single import anywhere in your project, you'll then be able to auto-import anything else that this library exports.

## API

### augment()

```typescript
/**
 * Turns `target` into an instance of the intersection type, by
 * adding `source`'s attributes and methods to the `target`.
 *
 * Pass in `<Source>.prototype` if you only want to add methods to
 * `target`.
 * Pass in a 3rd parameter - an instance of `<Source>` - if you also
 * need to copy attributes over to `target`.
 *
 * NOTE: returns the (modified) original `target` object.
 */
export function augment<Target, Source>(target: Target, ...sources: Source[]): Target & Source;
```

`augment()` is a _transform function_. It copes any visible properties from each `source` onto the `target`, and then returns the modified `target` object as an instance of the intersection type.

#### Q & A:

* why doesn't `augment()` treat `target` as immutable?

  In a word: _performance_. In real-world uses, `target` is going to be the largest object to start with, and each `source` will typically only have one or two methods to be copied across.

  If we had to copy everything from `target` too, that would make `augment()` much more expensive, because we'd have to do a deep clone of `target` to make this work without surprises.

### hasAllMethodsCalled()

```typescript
// how to import it into your own code
import { hasAllMethodsCalled } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

/**
 * data guard. Returns `true` if `input` has all the methods named in `names`.
 * Returns false otherwise.
 *
 * Supports methods inherited from parent classes.
 */
export function hasAllMethodsCalled(input: IndexedObject, names: string[]): boolean {
    return names.every((name) => input[name] && typeof input[name] === "function");
}
```

`hasAllMethodsCalled()` is a _data guard_. Use it to check if an object defines all the methods that you're looking to call.

**NOTE that we don't check the type signature of the methods, only their names.** This can still blow up in your face at runtime. Until JavaScript supports more comprehensive reflection, this risk can't be helped.

## NPM Scripts

### npm run clean

Use `npm run clean` to delete all of the compiled code.

### npm run build

Use `npm run build` to compile the Typescript into plain Javascript. The compiled code is placed into the `lib/` folder.

`npm run build` does not compile the unit test code.

### npm run test

Use `npm run test` to compile and run the unit tests. The compiled code is placed into the `lib/` folder.

### npm run cover

Use `npm run cover` to compile the unit tests, run them, and see code coverage metrics.

Metrics are written to the terminal, and are also published as HTML into the `coverage/` folder.