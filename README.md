# Augmentations for Typescript

## Introduction

Use this TypeScript library to add additional features to a TypeScript type at runtime.

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

TBD.

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