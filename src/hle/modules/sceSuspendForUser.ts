import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class sceSuspendForUser {
	constructor(private context: EmulatorContext) { }
}
