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

import { addExtensions } from "./addExtensions";

class Unit1 {
    public prop1 = 100;
}

interface PropCounter {
    countProps(): number;
}

interface Unit2 extends Unit1, PropCounter {}

// tslint:disable-next-line: max-classes-per-file
class Unit2 {
    public prop2 = 200;

    public countProps() {
        let retval = this.prop1;

        if (this.prop2 !== undefined) {
            retval += this.prop2;
        }

        return retval;
    }
}

describe("augment()", () => {
    describe("on objects", () => {
        it("copies methods from source prototype to target", () => {
            const target = new Unit1();

            const unit = addExtensions(target, Unit2.prototype);

            // the properties haven't been copied over,
            // only the methods defined by Unit2 itself
            expect(unit.countProps()).to.equal(100);
        });

        it("copies attributes from the seed to target", () => {
            const target = new Unit1();
            const seed = new Unit2();

            // we use the seed to give us attributes to copy over
            const unit = addExtensions(target, Unit2.prototype, seed);

            expect(unit.countProps()).to.equal(300);
        });

        it("`target` is an instanceof `target`'s class", () => {
            const source = new Unit2();
            const target = new Unit1();

            const unit = addExtensions(target, source);

            expect(unit).to.be.instanceOf(Unit1);
        });

        it("`target` is NOT an instanceof `source`'s class", () => {
            const target = new Unit1();

            const unit = addExtensions(target, Unit2.prototype);

            expect(unit).to.not.be.instanceOf(Unit2);
        });

        it("the returned value is the original `target` parameter", () => {
            const target = new Unit1();

            const unit = addExtensions(target, Unit2.prototype);

            target.prop1 = 300;
            expect(unit.prop1).to.equal(300);
        });

        it("does not modify the prototype of all instances of `target`", () => {
            const target = new Unit1();
            const control = new Unit1();

            const unit = addExtensions(target, Unit2.prototype);

            expect(unit.countProps).to.not.equal(undefined);
            expect((control as Unit2).countProps).to.equal(undefined);
        });
    });
});