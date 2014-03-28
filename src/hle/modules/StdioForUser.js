define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var StdioForUser = (function () {
        function StdioForUser(context) {
            this.context = context;
            this.sceKernelStdin = createNativeFunction(0x172D316E, 150, 'int', '', this, function () {
                return 10000001;
            });
            this.sceKernelStdout = createNativeFunction(0xA6BAB2E9, 150, 'int', '', this, function () {
                return 10000002;
            });
            this.sceKernelStderr = createNativeFunction(0xF78BA90A, 150, 'int', '', this, function () {
                return 10000003;
            });
        }
        return StdioForUser;
    })();
    exports.StdioForUser = StdioForUser;
});
//# sourceMappingURL=StdioForUser.js.map
