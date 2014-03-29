define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var ModuleMgrForUser = (function () {
        function ModuleMgrForUser(context) {
            this.context = context;
            this.sceKernelSelfStopUnloadModule = createNativeFunction(0xD675EBB8, 150, 'uint', 'int/int/int', this, function (unknown, argsize, argp) {
                console.warn(sprintf('Not implemented ModuleMgrForUser.sceKernelSelfStopUnloadModule(%d, %d, %d)', unknown, argsize, argp));
                return 0;
            });
            this.sceKernelLoadModule = createNativeFunction(0x977DE386, 150, 'uint', 'string/uint/void*', this, function (path, flags, sceKernelLMOption) {
                console.warn(sprintf('Not implemented ModuleMgrForUser.sceKernelLoadModule(%s, %d)', path, flags));
                return 0;
            });
            this.sceKernelStartModule = createNativeFunction(0x50F0C1EC, 150, 'uint', 'int/int/uint/void*/void*', this, function (moduleId, argumentSize, argumentPointer, status, sceKernelSMOption) {
                console.warn(sprintf('Not implemented ModuleMgrForUser.sceKernelStartModule(%d, %d, %d)', moduleId, argumentSize, argumentPointer));
                return 0;
            });
            this.sceKernelGetModuleIdByAddress = createNativeFunction(0xD8B73127, 150, 'uint', 'uint', this, function (address) {
                console.warn(sprintf('Not implemented ModuleMgrForUser.sceKernelGetModuleIdByAddress(%08X)', address));
                return -1;
            });
        }
        return ModuleMgrForUser;
    })();
    exports.ModuleMgrForUser = ModuleMgrForUser;
});
//# sourceMappingURL=ModuleMgrForUser.js.map
