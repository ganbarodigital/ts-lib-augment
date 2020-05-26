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
 *
 * @deprecated Use addExtension instead
 */
export function addExtensions<Target, Source>(target: Target, ...sources: Source[]): Target & Source {
    // nothing special here
    //
    // we just copy from each source in turn over to our target
    sources.forEach((source) => {
        const props = Object.getOwnPropertyDescriptors(source);

        // we know that `props` only contains attributes that we
        // want to copy across, so this is safe
        //
        // tslint:disable-next-line: forin
        for (const name in props) {
            Object.defineProperty(
                target,
                name,
                props[name],
            );
        }
    });

    // all done
    return target as Target & Source;
}