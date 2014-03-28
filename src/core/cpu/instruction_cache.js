define(["require", "exports", './interop', './function_generator'], function(require, exports, Interop, FunctionGenerator) {
    var InstructionCache = (function () {
        function InstructionCache(memory) {
            this.memory = memory;
            this.cache = {};
            this.functionGenerator = new FunctionGenerator(memory);
        }
        InstructionCache.prototype.invalidateRange = function (from, to) {
            for (var n = from; n < to; n += 4)
                delete this.cache[n];
        };

        InstructionCache.prototype.getFunction = function (address) {
            var item = this.cache[address];
            if (item)
                return item;

            switch (address) {
                case 268435455 /* EXIT_THREAD */:
                    return this.cache[address] = function (state) {
                        console.log(state);
                        console.log(state.thread);
                        console.warn('Thread: CpuSpecialAddresses.EXIT_THREAD: ' + state.thread.name);
                        state.thread.stop();
                        throw (new Interop.CpuBreakException());
                    };
                    break;
                default:
                    return this.cache[address] = this.functionGenerator.create(address);
            }
        };
        return InstructionCache;
    })();

    
    return InstructionCache;
});
//# sourceMappingURL=instruction_cache.js.map
