define(["require", "exports", '../utils', '../../core/controller'], function(require, exports, utils, controller) {
    var createNativeFunction = utils.createNativeFunction;

    var SceCtrlData = controller.SceCtrlData;

    var sceCtrl = (function () {
        function sceCtrl(context) {
            var _this = this;
            this.context = context;
            this.sceCtrlPeekBufferPositive = createNativeFunction(0x3A622550, 150, 'uint', 'void*/int', this, function (sceCtrlDataPtr, count) {
                SceCtrlData.struct.write(sceCtrlDataPtr, _this.context.controller.data);
                return 0;
            });
            this.sceCtrlReadBufferPositive = createNativeFunction(0x1F803938, 150, 'uint', 'void*/int', this, function (sceCtrlDataPtr, count) {
                SceCtrlData.struct.write(sceCtrlDataPtr, _this.context.controller.data);

                return _this.context.display.waitVblankAsync();
            });
            this.sceCtrlSetSamplingCycle = createNativeFunction(0x6A2774F3, 150, 'uint', 'int', this, function (samplingCycle) {
                console.warn('Not implemented sceCtrl.sceCtrlSetSamplingCycle');
                return 0;
            });
            this.sceCtrlSetSamplingMode = createNativeFunction(0x1F4011E6, 150, 'uint', 'int', this, function (samplingMode) {
                console.warn('Not implemented sceCtrl.sceCtrlSetSamplingMode');
                return 0;
            });
        }
        return sceCtrl;
    })();
    exports.sceCtrl = sceCtrl;
});
//# sourceMappingURL=sceCtrl.js.map
