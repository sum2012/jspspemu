define(["require", "exports", '../../src/util/stream', '../../src/format/cso', '../../src/format/iso'], function(require, exports, stream, Cso, Iso) {
    var Stream = stream.Stream;
    var MemoryAsyncStream = stream.MemoryAsyncStream;

    function test() {
        describe('cso', function () {
            it('should load fine', function (done) {
                var csoData = Stream.fromBase64(testCsoBase64).toUInt8Array();

                Cso.fromStreamAsync(new MemoryAsyncStream(csoData.buffer)).then(function (cso) {
                    //cso.readChunkAsync(0x10 * 0x800 - 10, 0x800).then(data => {
                    return cso.readChunkAsync(0x10 * 0x800 - 10, 0x800).then(function (data) {
                        console.log('cccc');
                        var stream = Stream.fromArrayBuffer(data);
                        stream.skip(10);
                        var CD0001 = stream.readStringz(6);
                        assert.equal(CD0001, '\u0001CD001');
                        done();
                    });
                    //console.log(cso);
                }, done);
            });

            it('should work with iso', function (done) {
                var csoData = Stream.fromBase64(testCsoBase64).toUInt8Array();

                Cso.fromStreamAsync(new MemoryAsyncStream(csoData.buffer)).then(function (cso) {
                    return Iso.Iso.fromStreamAsync(cso).then(function (iso) {
                        assert.equal(JSON.stringify(iso.children.slice(0, 4).map(function (node) {
                            return node.path;
                        })), JSON.stringify(["path", "path/0", "path/1", "path/2"]));
                        done();
                    });
                }, done);
            });
        });
    }
    exports.test = test;
});
//# sourceMappingURL=csoTest.js.map
