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
import { expect } from "chai";
import { describe } from "mocha";

import { buildDeepProtocolDefinition } from "./buildDeepProtocolDefinition";

// this is the type that we are going to Extend
class ExampleValue {
    public constructor(private value: string) { }
    public valueOf(): string {
        return this.value;
    }
}

// protocol, without any base class to worry about
interface GuessMediaType {
    guessMediaType(): string;
}

// extension, without any base class to worry about
interface UnitTestGuessMediaType extends ExampleValue, GuessMediaType { }
// tslint:disable-next-line: max-classes-per-file
class UnitTestGuessMediaType {
    public guessMediaType() {
        return this.valueOf();
    }
}

// protocol, that has a base class
interface GetMediaType extends GuessMediaType {
    getMediaType(): string;
}

// extension, that has a base class
interface UnitTestGetMediaType extends ExampleValue, GetMediaType { }
// tslint:disable-next-line: max-classes-per-file
class UnitTestGetMediaType extends UnitTestGuessMediaType {
    public getMediaType() {
        return this.valueOf();
    }
}

describe("buildDeepProtocolDefinition()", () => {
    it("can detect methods defined in a base class", () => {
        const expectedValue = [ "getMediaType", "guessMediaType" ];
        const actualValue = buildDeepProtocolDefinition(UnitTestGetMediaType.prototype);

        expect(actualValue).to.eql(expectedValue);
    });
});