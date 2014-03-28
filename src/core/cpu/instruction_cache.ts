import Interop = require('./interop');
import FunctionGenerator = require('./function_generator');
import CpuState = require('./state');
import Memory = require('../memory');

class InstructionCache {
	private functionGenerator: FunctionGenerator;
	private cache: any = {};

	constructor(public memory: Memory) {
		this.functionGenerator = new FunctionGenerator(memory);
	}

	invalidateRange(from: number, to: number) {
		for (var n = from; n < to; n += 4) delete this.cache[n];
	}

	getFunction(address: number) {
		var item = this.cache[address];
		if (item) return item;

		switch (address) {
			case Interop.CpuSpecialAddresses.EXIT_THREAD:
				return this.cache[address] = function (state: CpuState) {
					console.log(state);
					console.log(state.thread);
					console.warn('Thread: CpuSpecialAddresses.EXIT_THREAD: ' + state.thread.name);
					state.thread.stop();
					throw (new Interop.CpuBreakException());
				};
				break;
			default: return this.cache[address] = this.functionGenerator.create(address);
		}
	}
}

export = InstructionCache;
