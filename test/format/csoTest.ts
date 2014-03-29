import stream = require('../../src/util/stream');
import Cso = require('../../src/format/cso');
import Iso = require('../../src/format/iso');

import AsyncStream = stream.AsyncStream;
import Stream = stream.Stream;
import MemoryAsyncStream = stream.MemoryAsyncStream;

export function test() {
	describe('cso', () => {
		it('should load fine', (done) => {
			var csoData = Stream.fromBase64(testCsoBase64).toUInt8Array();

			Cso.fromStreamAsync(new MemoryAsyncStream(csoData.buffer)).then(cso => {
				//cso.readChunkAsync(0x10 * 0x800 - 10, 0x800).then(data => {
				return cso.readChunkAsync(0x10 * 0x800 - 10, 0x800).then(data => {
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

		it('should work with iso', (done) => {
			var csoData = Stream.fromBase64(testCsoBase64).toUInt8Array();

			Cso.fromStreamAsync(new MemoryAsyncStream(csoData.buffer)).then(cso => {
				return Iso.Iso.fromStreamAsync(cso).then(iso => {
					assert.equal(
						JSON.stringify(iso.children.slice(0, 4).map(node => node.path)),
						JSON.stringify(["path", "path/0", "path/1", "path/2"])
						);
					done();
				});
			}, done);
		});
	});
}
