define(["require", "exports"], function(require, exports) {
    var CpuBreakException = (function () {
        function CpuBreakException(name, message) {
            if (typeof name === "undefined") { name = 'CpuBreakException'; }
            if (typeof message === "undefined") { message = 'CpuBreakException'; }
            this.name = name;
            this.message = message;
        }
        return CpuBreakException;
    })();
    exports.CpuBreakException = CpuBreakException;
});
//# sourceMappingURL=interop.js.map
