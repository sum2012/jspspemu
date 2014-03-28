define(["require", "exports"], function(require, exports) {
    var ProgramExecutor = (function () {
        function ProgramExecutor(state, instructionCache) {
            this.state = state;
            this.instructionCache = instructionCache;
            this.lastPC = 0;
        }
        ProgramExecutor.prototype.executeStep = function () {
            if (this.state.PC == 0) {
                console.error(sprintf("Calling 0x%08X from 0x%08X", this.state.PC, this.lastPC));
            }
            this.lastPC = this.state.PC;
            var func = this.instructionCache.getFunction(this.state.PC);
            func(this.state);
        };

        ProgramExecutor.prototype.execute = function (maxIterations) {
            if (typeof maxIterations === "undefined") { maxIterations = -1; }
            try  {
                while (maxIterations != 0) {
                    this.executeStep();
                    if (maxIterations > 0)
                        maxIterations--;
                }
            } catch (e) {
                if (!(e instanceof CpuBreakException)) {
                    console.log(this.state);
                    throw (e);
                }
            }
        };
        return ProgramExecutor;
    })();
    exports.ProgramExecutor = ProgramExecutor;
});
//# sourceMappingURL=program_executor.js.map
