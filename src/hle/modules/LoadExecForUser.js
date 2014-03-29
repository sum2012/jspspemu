define(["require", "exports", '../../core/cpu', '../utils'], function(require, exports, cpu, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var CpuBreakException = cpu.CpuBreakException;

    var LoadExecForUser = (function () {
        function LoadExecForUser(context) {
            this.context = context;
            this.sceKernelExitGame = createNativeFunction(0xBD2F1094, 150, 'uint', 'HleThread', this, function (thread) {
                console.info('sceKernelExitGame');
                thread.stop();
                throw (new CpuBreakException());
                return 0;
            });
            this.sceKernelExitGame2 = createNativeFunction(0x05572A5F, 150, 'uint', 'HleThread', this, function (currentThread) {
                console.info('sceKernelExitGame');
                currentThread.stop();
                throw (new cpu.CpuBreakException());
            });
            this.sceKernelRegisterExitCallback = createNativeFunction(0x4AC57943, 150, 'uint', 'int', this, function (callbackId) {
                console.warn('Not implemented sceKernelRegisterExitCallback: ' + callbackId);
                return 0;
            });
        }
        return LoadExecForUser;
    })();
    exports.LoadExecForUser = LoadExecForUser;
});
//# sourceMappingURL=LoadExecForUser.js.map
