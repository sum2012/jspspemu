import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class KDebugForKernel {
	constructor(private context: EmulatorContext) { }
}
