define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var Kernel_Library = (function () {
        function Kernel_Library(context) {
            this.context = context;
            this.sceKernelCpuSuspendIntr = createNativeFunction(0x092968F4, 150, 'uint', '', this, function () {
                console.warn(sprintf("sceKernelCpuSuspendIntr not implemented"));
                return 0;
            });
            this.sceKernelCpuResumeIntr = createNativeFunction(0x5F10D406, 150, 'uint', '', this, function (flags) {
                console.warn(sprintf("sceKernelCpuResumeIntr not implemented"));
                return 0;
            });
        }
        return Kernel_Library;
    })();
    exports.Kernel_Library = Kernel_Library;
});
//# sourceMappingURL=Kernel_Library.js.map
