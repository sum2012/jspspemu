import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class UtilsForKernel {
	constructor(private context: EmulatorContext) { }

	sceKernelIcacheInvalidateRange = createNativeFunction(0xC2DF770E, 150, 'void', 'uint/uint', this, (address: number, size: number) => {
		this.context.instructionCache.invalidateRange(address, address + size);
	});
}
