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

    (function (CpuSpecialAddresses) {
        CpuSpecialAddresses[CpuSpecialAddresses["EXIT_THREAD"] = 0x0FFFFFFF] = "EXIT_THREAD";
    })(exports.CpuSpecialAddresses || (exports.CpuSpecialAddresses = {}));
    var CpuSpecialAddresses = exports.CpuSpecialAddresses;
});
//# sourceMappingURL=interop.js.map
