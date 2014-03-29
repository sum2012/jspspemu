define(["require", "exports", '../../src/format/pbp', '../../src/util/stream'], function(require, exports, Pbp, stream) {
    var Stream = stream.Stream;

    function test() {
        describe('pbp', function () {
            it('should load fine', function () {
                var pbp = new Pbp();
                pbp.load(Stream.fromBase64(rtctestPbpBase64));
                var pspData = pbp.get('psp.data');
                assert.equal(pspData.length, 77550);
            });
        });
    }
    exports.test = test;
});
//# sourceMappingURL=pbpTest.js.map
