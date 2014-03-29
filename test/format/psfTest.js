define(["require", "exports", '../../src/format/psf', '../../src/util/stream'], function(require, exports, Psf, stream) {
    var Stream = stream.Stream;

    function test() {
        describe('psf', function () {
            it('should load fine', function () {
                var psf = new Psf.Psf();
                psf.load(Stream.fromBase64(rtctestPsfBase64));
                assert.equal(psf.entriesByName['BOOTABLE'], 1);
                assert.equal(psf.entriesByName['CATEGORY'], 'MG');
                assert.equal(psf.entriesByName['DISC_ID'], 'UCJS10041');
                assert.equal(psf.entriesByName['DISC_VERSION'], '1.00');
                assert.equal(psf.entriesByName['PARENTAL_LEVEL'], 1);
                assert.equal(psf.entriesByName['PSP_SYSTEM_VER'], '1.00');
                assert.equal(psf.entriesByName['REGION'], 32768);
                assert.equal(psf.entriesByName['TITLE'], 'rtctest');
            });
        });
    }
    exports.test = test;
});
//# sourceMappingURL=psfTest.js.map
