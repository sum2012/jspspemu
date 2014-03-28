define(["require", "exports"], function(require, exports) {
    var EmulatorContext = (function () {
        function EmulatorContext() {
        }
        EmulatorContext.prototype.init = function (display, controller, gpu, memoryManager, threadManager, audio, memory, instructionCache, fileManager) {
            this.display = display;
            this.controller = controller;
            this.gpu = gpu;
            this.memoryManager = memoryManager;
            this.threadManager = threadManager;
            this.audio = audio;
            this.memory = memory;
            this.instructionCache = instructionCache;
            this.fileManager = fileManager;
        };
        return EmulatorContext;
    })();

    
    return EmulatorContext;
});
//# sourceMappingURL=context.js.map
