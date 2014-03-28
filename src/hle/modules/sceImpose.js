define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceImpose = (function () {
        function sceImpose(context) {
            this.context = context;
            this.sceImposeGetBatteryIconStatus = createNativeFunction(0x8C943191, 150, 'uint', 'void*/void*', this, function (isChargingPointer, iconStatusPointer) {
                isChargingPointer.writeInt32(0);
                iconStatusPointer.writeInt32(0);
                return 0;
            });
        }
        return sceImpose;
    })();
    exports.sceImpose = sceImpose;
});
//# sourceMappingURL=sceImpose.js.map
