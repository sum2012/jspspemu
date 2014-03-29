define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceAtrac3plus = (function () {
        function sceAtrac3plus(context) {
            this.context = context;
            this.sceAtracSetDataAndGetID = createNativeFunction(0x7A20E7AF, 150, 'uint', 'void*/int', this, function (dataPointer, dataLength) {
                return 0;
            });
            this.sceAtracGetSecondBufferInfo = createNativeFunction(0x83E85EA0, 150, 'uint', 'int/void*/void*', this, function (id, puiPosition, puiDataByte) {
                puiPosition.writeInt32(0);
                puiDataByte.writeInt32(0);
                return 0;
            });
        }
        return sceAtrac3plus;
    })();
    exports.sceAtrac3plus = sceAtrac3plus;
});
//# sourceMappingURL=sceAtrac3plus.js.map
