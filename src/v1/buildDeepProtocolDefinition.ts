//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
//   * Re-distributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in
//     the documentation and/or other materials provided with the
//     distribution.
//
//   * Neither the names of the copyright holders nor the names of his
//     contributors may be used to endorse or promote products derived
//     from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//

import { ProtocolDefinition } from "./ProtocolDefinition";

// This code has been adapted from:
//
// https://stackoverflow.com/a/47714550

function isGetter<T extends object>(x: T, name: keyof T) {
    // typecast because this cannot fail
    return (Object.getOwnPropertyDescriptor(x, name) as PropertyDescriptor).get !== undefined;
}

function isFunction<T extends object>(x: T, name: keyof T ) {
    return typeof x[name] === "function";
}

function getAllMethodsFrom<T extends object>(x: T): string[] {
    return (
        x
        && x !== Object.prototype
        && Object.getOwnPropertyNames(x)
            .filter((name) => isGetter(x, name as keyof T) || isFunction(x, name as keyof T))
            .concat(getAllMethodsFrom(Object.getPrototypeOf(x)))
     ) || [];
}

function getDistinctMethodsFrom(x: object) {
    return Array.from(new Set(getAllMethodsFrom(x)));
}

function getUserFunctionsFrom(x: object) {
    return getDistinctMethodsFrom(x)
        .filter((name) => name !== "constructor" && !name.startsWith( "__" ));
}

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
export function buildDeepProtocolDefinition(input: object): ProtocolDefinition {
    return getUserFunctionsFrom(input);
}