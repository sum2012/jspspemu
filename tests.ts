declare var mocha: any;

import csoTest = require('test/format/csoTest'); 
import isoTest = require('test/format/isoTest');
import pbpTest = require('test/format/pbpTest');
import psfTest = require('test/format/psfTest');
import testasm = require('test/testasm');

describe("format", () => {
	csoTest.test();
	isoTest.test();
	pbpTest.test();
	pbpTest.test();
});

import instructionTest = require('test/core/cpu/instructionTest');

instructionTest.test();
testasm.test();

mocha.run();
