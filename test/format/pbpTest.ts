import Pbp = require('../../src/format/pbp');
import stream = require('../../src/util/stream');
import Stream = stream.Stream;

export function test() {
	describe('pbp', () => {
		it('should load fine', () => {
			var pbp = new Pbp();
			pbp.load(Stream.fromBase64(rtctestPbpBase64));
			var pspData = pbp.get('psp.data');
			assert.equal(pspData.length, 77550);
		});
	});
}