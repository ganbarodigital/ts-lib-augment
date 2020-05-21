# Augmentations for Typescript

## Introduction

Use this TypeScript library to add additional features to a TypeScript type at runtime.

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Concepts](#concepts)
  - [What Are Protocols and Extensions?](#what-are-protocols-and-extensions)
  - [How Do We Define A Protocol?](#how-do-we-define-a-protocol)
  - [How Do We Use A Protocol Definition?](#how-do-we-use-a-protocol-definition)
  - [How Do We Write The Code For An Extension?](#how-do-we-write-the-code-for-an-extension)
  - [How Do We Use An Extension?](#how-do-we-use-an-extension)
  - [That Seems Like A Faff](#that-seems-like-a-faff)
  - [Programming By Feature aka The Golang Thing](#programming-by-feature-aka-the-golang-thing)
- [API](#api)
  - [ProtocolDefinition](#protocoldefinition)
  - [addExtensions()](#addextensions)
  - [buildProtocolDefinition()](#buildprotocoldefinition)
  - [buildDeepProtocolDefinition()](#builddeepprotocoldefinition)
  - [hasAllMethodsCalled()](#hasallmethodscalled)
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

## Concepts

### What Are Protocols and Extensions?

An _extension_ is functionality that has been added to a pre-existing type definition. A _protocol_ is a description of an _extension_. We use _protocols_ at compile-time to make sure a function or method parameter has the functionality we need, and we use _protocols_ at runtime to detect and access optional functionality.

Here's a concrete example:

```typescript
import path from "path";

/**
 * an example of a very basic type
 */
class Filepath {
    private path: string;

    public constructor(path: string) {
        this.path = path;
    }

    public getExtension() {
        return path.extname(this.path);
    }

    public valueOf(): string {
        return this.path;
    }
}
```

Imagine we are working with something like the `Filepath` type from the [@ganbarodigital/ts-lib-data-locations](https://github.com/ganbarodigital/ts-lib-data-locations) library.

Let's say you want to add a new feature to `Filepath`. Maybe you want to use the file extension to work out what type of file it is pointing at, for example.

In the old days, you'd normally:

* fork the repo on Github
* add your own `Filepath.getMediaType()` to your fork
* send a pull-request over to the original repo
* wait to see if the pull-request ever gets accepted

Until all the steps are completed, it can block you from using your new feature in your own code. You might not be able to wait that long. And what do you do if your pull request is rejected or otherwise never gets merged? You end up maintaining your own fork, which is a whole new can of worms and pain.

To keep `Filepath` as tiny / reusable / maintainable as possible, we want the core type definition to have as little functionality as possible. We want extra functionality to permanently live somewhere else - in other modules that can be maintained separately and at their own pace.

This is where _protocols_ and _extensions_ come in.

### How Do We Define A Protocol?

First of all, we need to describe the _extension_. We call this description a _protocol_. There's two parts to it:

* interface(s) for compile-time checking
* a constant containing information needed for runtime checking

```typescript
/**
 * Protocol. An object that can tell us what media type it refers to.
 */
interface GetMediaType {
    getMediaType(): string;
}

/**
 * Optional Protocol. An object that might be able to tell us what
 * media type it refers to.
 */
type MaybeGetMediaType = {} | GetMediaType;

/**
 * this protocol definition tells us what is in GetMediaType
 *
 * we need something that exists at runtime, because the GetMediaType
 * interface only exists at compile-time.
 */
const GetMediaTypeProtocol = [ "getMediaType" ];
```

### How Do We Use A Protocol Definition?

The first thing we can do with these definitions is to catch problems at compile-time. In this example, `input` must be an object:

* that is both a `Filepath`, and
* it must support the `GetMediaType` extension.

If it does not, the code will not compile.

```typescript
// we use an intersection type to tell the compiler
// that we need our input to support multiple things
function isJson(input: Filepath & GetMediaType) {
    return input.getMediaType() === "text/json";
}
```

Design your code to catch as many problems as possible at compile-time. It can _greatly_ simplify your code in the long-run.

Sometimes, that just isn't possible. Sometimes, we need to use a runtime check. Here's an example of that:

```typescript
import { implementsProtocol } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

// the `MaybeGetMediaType` type isn't for the compiler
//
// it's for fellow developers, as a form of documentation
function isJson(input: Filepath & MaybeGetMediaType) {
    // implementsProtocol() is a (very basic) type guard.
    //
    // it checks the `input` object, to see if it contains the functions
    // listed in the `GetMediaTypeProtocol`.
    if (!implementsProtocol(input, GetMediaTypeProtocol)) {
       return false;
    }

    // if we get here, we've convinced the TypeScript compiler that this
    // code will *probably* work
    return input.getMediaType() === "text/json";
}
```

### How Do We Write The Code For An Extension?

To write an extension, you need:

* an interface that `extends`:
  - the type you're extending, and
  - your protocol's interface
* a class:
  - with the same name as the interface,
  - that contains the new method(s)

We need the interface so that `this` can use all the public methods and attributes of the type that you're extending. It uses TypeScript's _declaration merging_ feature. That's why both the interface and the class need to have the same name.

Here's what our example `GetMediaType` extension would look like:

```typescript
import mime from "mime-types";

interface FilepathGetMediaType extends Filepath, GetMediaType { }
class FilepathGetMediaType implements GetMediaType {
    public getMediaType() {
        return mime.contentType(this.valueOf());
    }
}
```

Now that we have an implementation, we can go back and rewrite our protocol definition:

```typescript
// how to import into your own code
import { buildProtocolDefinition } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

const GetMediaTypeProtocol = buildProtocolDefinition(FilepathGetMediaType.prototype);
```

There are pros and cons to using `buildProtocolDefinition()`:

* there's now a one-off runtime cost
* it doesn't support any methods in base classes (use the slower `buildDeepProtocolDefinition()` for that)
* but we no longer have to worry about our protocol definition getting out-of-step with our actual protocol design
* and you don't have to worry about future changes to the `ProtocolDefinition` type

### How Do We Use An Extension?

An extension needs to be added to your objects at runtime. It has to be added to every object after that object has been created.

```typescript
import { addExtensions } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

function doSomething() {
    // we create a new Filepath type,
    // and then add in the `getMediaType()` function from the class
    const path = addExtensions(
        new Filepath("/tmp/some-file"),
        FilepathGetMediaType.protocol,
    );

    // we can now do this, and it will safely compile
    return path.getMediaType();
}
```

### That Seems Like A Faff

aka "Why can't we just patch the class's prototype and be done with it?"

What we're talking about here is doing something like this:

```typescript
declare module "@ganbarodigital/ts-lib-data-locations/lib/v1/Filepath/Filepath" {
    interface Filepath {
        getMediaType(): string;
    }
}

Filepath.prototype.getMediaType = function() {
    return mime.contentType(this.valueOf());
};
```

That code changes the definition of the `Filepath` class, so that every new `Filepath` object automatically comes with the `getMediaType()` method. It's typically done as one include file, and there's no need to patch objects every time they are created.

On the face of it, it's a lot less effort than the _protocols_ and _extensions_ approach.

Unfortunately, it brings some significant long-term problems.

* We _can_ use the compiler to catch the times when we forget to patch the type itself. TypeScript's very good at handling that.
* But the `Filepath` type itself now means different things, depending on whether or not it has been patched, and what patches have been applied.
* And when you call a function or method that takes `Filepath` as a parameter, you've absolutely no way of knowing whether or not you need to provide a patched `Filepath`.

As folks like RxJS have found out, the end result is code that's fragile and confusing to work with. That's why they've been moving away from type patching in their recent work.

Compare that with _protocols_ and _extensions_:

* Every extension has a type, so once again we can use the compiler to catch the times where we forget to add an extension before using it.
* We don't change the definition of `Filepath`. A `Filepath` is always a `Filepath`, no matter where you see it in the code.
* If a function or method needs a `Filepath` that has a certain extension, that information is right there in the parameter type: `Filepath & GetMediaType` or `Filepath & MaybeGetMediaType`.
* And the extension's interface and protocol definition aren't unique to `Filepath`. They can be reused - without modification - to create an extension for any other type that does the same thing.

A little bit of extra setup work gives us a lot of extra benefits. Our code is explicit, not just for the compiler, but for the developer too. Our concept becomes reusable, allowing us to do the Golang thing and move more towards consuming interfaces over explicit types. And the code remains simple, robust, and largely maintenance-free.

### Programming By Feature aka The Golang Thing

Something Golang's standard library does exceptionally well is use interfaces everywhere instead of concrete types. Golang's standard library defines lots of very small interfaces - often containing only one or two methods. Both the standard library and userland code is written to accept and use these very targetted interfaces.

Once we're used to working with _extensions_ and _protocols_, we can do the same in our TypeScript modules.

Here's the two examples from the beginning of this _Concepts_ section. We've updated the parameter types in both examples to only ask for the extension that they need. We've basically dropped the `Filepath` requirement, because our examples were not relying on any of the `Filepath` functionality at all.

The end result? This code can now be applied to _any_ type that supports the `GetMediaType` protocol **without further modification**. Our code just got a whole lot more reusable.

```typescript
// we can use just GetMediaType here, because we don't need to know
// anything else about `input` for our code to work
function isJson(input: GetMediaType) {
    return input.getMediaType() === "text/json";
}
```

```typescript
import { implementsProtocol } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

// we can use `MaybeGetMediaType` here, because we don't need to know
// anything else about `input` for our code to work
//
// we're now using `MaybeGetMediaType` to tell the compiler what we need,
// as *well* as using it as documentation for developers
function isJson(input: MaybeGetMediaType) {
    // implementsProtocol() is a (very basic) type guard.
    //
    // it checks the `input` object, to see if it contains the functions
    // listed in the `GetMediaTypeProtocol`.
    if (!implementsProtocol(input, GetMediaTypeProtocol)) {
       return false;
    }

    // if we get here, we've convinced the TypeScript compiler that this
    // code will *probably* work
    return input.getMediaType() === "text/json";
}
```

## API

### ProtocolDefinition

```typescript
// how to import into your own code
import { ProtocolDefinition } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

/**
 * Contains a list of the methods that make up an Extension.
 *
 * This type is subject to change in the future. For forward-compatibility,
 * build it using `buildProtocolDefinition()`.
 */
export type ProtocolDefinition = string[];
```

`Protocol` is a value type. It contains a list of the methods implemented by an _extension_.

### addExtensions()

```typescript
// how to import into your own code
import { addExtensions } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

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
export function addExtensions<Target, Source>(target: Target, ...sources: Source[]): Target & Source;
```

`addExtensions()` is a _transform function_. It copes any visible properties from each `source` onto the `target`, and then returns the modified `target` object as an instance of the intersection type.

### buildProtocolDefinition()

```typescript
// how to import into your own code
import { buildProtocolDefinition } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

// our input parameters and/or return type
import { ProtocolDefinition } from "@ganbarodigital/ts-lib/augmentations/lib/v1";

/**
 * type factory. Builds a ProtocolDefinition.
 *
 * It will *NOT* pick up methods defined in parent classes. Use
 * `buildDeepProtocolDefinition()` for that.
 */
export function buildProtocolDefinition(input: object): ProtocolDefinition;
```

### buildDeepProtocolDefinition()

```typescript
// how to import into your own code
import { buildDeepProtocolDefinition } from "@ganbarodigital/ts-lib-augmentations/lib/v1";

// our input parameters and/or return type
import { ProtocolDefinition } from "@ganbarodigital/ts-lib/augmentations/lib/v1";

/**
 * type factory. Builds a ProtocolDefinition.
 *
 * This function supports:
 *
 * - getters and methods in your class
 * - getters and methods defined in your parent classes
 *
 * As a result, it will be slower than `buildProtocolDefinition()`. Use this
 * only where you definitely need the extra features.
 */
export function buildDeepProtocolDefinition(input: object): ProtocolDefinition;
```

#### Q & A:

* why doesn't `addExtensions()` treat `target` as immutable?

  In a word: _performance_. In real-world uses, `target` is going to be the largest object to start with, and each `source` will typically only have one or two methods to be copied across.

  If we had to copy everything from `target` too, that would make `addExtensions()` much more expensive, because we'd have to do a deep clone of `target` to make this work without surprises.

### hasAllMethodsCalled()

```typescript
// how to import it into your own code
import { hasAllMethodsCalled } from "@ganbarodigital/ts-lib-addExtensionsations/lib/v1";

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