﻿import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class InterruptManager {
	constructor(private context: EmulatorContext) { }
}
