import EmulatorContext = require('../../context');
import utils = require('../utils');
import stream = require('../../util/stream');
import Stream = stream.Stream;
import createNativeFunction = utils.createNativeFunction;

export class UtilsForKernel {
	constructor(private context: EmulatorContext) { }

	sceKernelIcacheInvalidateRange = createNativeFunction(0xC2DF770E, 150, 'void', 'uint/uint', this, (address: number, size: number) => {
		this.context.instructionCache.invalidateRange(address, address + size);
	});
}
