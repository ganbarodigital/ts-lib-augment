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

import { hasAllMethodsCalled } from "./hasAllMethodsCalled";

class UnitTestExample {
    public fn4 = true;
    public fn5 = 100;
    public fn6 = "function";

    public fn1() {
        return;
    }

    public fn2(input: any): input is any {
        return true;
    }

    public* fn3(input: any): any {
        yield input;

        return;
    }
}

// tslint:disable-next-line: max-classes-per-file
class UnitTestChildExample extends UnitTestExample {
    public fn8(input: any): any {
        return true;
    }
}

describe("hasAllMethodsCalled()", () => {
    it("supports checking for a regular method", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn1" ]);

        expect(actualValue).to.equal(true);
    });

    it("supports checking for a type-guard method", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn2" ]);

        expect(actualValue).to.equal(true);
    });

    it("supports checking for a generator method", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn3" ]);

        expect(actualValue).to.equal(true);
    });

    it("returns true if the object has the requested method", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn1" ]);

        expect(actualValue).to.equal(true);
    });

    it("returns true if the object has all the requested methods", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn1", "fn2", "fn3" ]);

        expect(actualValue).to.equal(true);
    });

    it("returns true only if the object has all the requested methods", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn1", "fn200", "fn3" ]);

        expect(actualValue).to.equal(false);
    });

    it("returns false if the object has none of the requested methods", () => {
        const unit = new UnitTestExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn100", "fn102", "fn103" ]);

        expect(actualValue).to.equal(false);
    });

    it("returns false if the property is not a method", () => {
        [ "fn4", "fn5", "fn6" ].forEach((name) => {
            const unit = new UnitTestExample();

            const actualValue = hasAllMethodsCalled(unit, [ name ]);

            expect(actualValue).to.equal(false);
        });
    });

    it("supports methods defined on a parent class", () => {
        const unit = new UnitTestChildExample();

        const actualValue = hasAllMethodsCalled(unit, [ "fn1", "fn8", "fn3" ]);

        expect(actualValue).to.equal(true);
    });
});