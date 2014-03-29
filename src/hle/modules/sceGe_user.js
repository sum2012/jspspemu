define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceGe_user = (function () {
        function sceGe_user(context) {
            var _this = this;
            this.context = context;
            this.sceGeEdramGetAddr = createNativeFunction(0xE47E40E4, 150, 'uint', '', this, function () {
                return 0x04000000;
            });
            this.sceGeSetCallback = createNativeFunction(0xA4FC06A4, 150, 'uint', 'int', this, function (callbackDataPtr) {
                //console.warn('Not implemented sceGe_user.sceGeSetCallback');
                return 0;
            });
            this.sceGeListEnQueue = createNativeFunction(0xAB49E76A, 150, 'uint', 'uint/uint/int/void*', this, function (start, stall, callbackId, argsPtr) {
                return _this.context.gpu.listEnqueue(start, stall, callbackId, argsPtr);
            });
            this.sceGeListSync = createNativeFunction(0x03444EB4, 150, 'uint', 'int/int', this, function (displayListId, syncType) {
                //console.warn('Not implemented sceGe_user.sceGeListSync');
                return _this.context.gpu.listSync(displayListId, syncType);
            });
            this.sceGeListUpdateStallAddr = createNativeFunction(0xE0D68148, 150, 'uint', 'int/int', this, function (displayListId, stall) {
                //console.warn('Not implemented sceGe_user.sceGeListUpdateStallAddr');
                return _this.context.gpu.updateStallAddr(displayListId, stall);
            });
            this.sceGeDrawSync = createNativeFunction(0xB287BD61, 150, 'uint', 'int', this, function (syncType) {
                //console.warn('Not implemented sceGe_user.sceGeDrawSync');
                return _this.context.gpu.drawSync(syncType);
            });
        }
        return sceGe_user;
    })();
    exports.sceGe_user = sceGe_user;
});
//# sourceMappingURL=sceGe_user.js.map
