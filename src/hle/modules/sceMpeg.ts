﻿import EmulatorContext = require('../../context');
import utils = require('../utils');
import stream = require('../../util/stream');
import Stream = stream.Stream;
import createNativeFunction = utils.createNativeFunction;

export class sceMpeg {
	constructor(private context: EmulatorContext) { }
}
