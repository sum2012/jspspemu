define(["require", "exports", 'test/format/csoTest', 'test/format/isoTest', 'test/format/pbpTest', 'test/testasm', 'test/core/cpu/instructionTest'], function(require, exports, csoTest, isoTest, pbpTest, testasm, instructionTest) {
    describe("format", function () {
        csoTest.test();
        isoTest.test();
        pbpTest.test();
        pbpTest.test();
    });

    instructionTest.test();
    testasm.test();

    mocha.run();
});
//# sourceMappingURL=tests.js.map
