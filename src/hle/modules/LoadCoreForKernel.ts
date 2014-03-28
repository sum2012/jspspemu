import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class LoadCoreForKernel {
	constructor(private context: EmulatorContext) { }
}
