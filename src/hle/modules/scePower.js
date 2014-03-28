define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var scePower = (function () {
        function scePower(context) {
            var _this = this;
            this.context = context;
            this.cpuFreq = 222;
            this.scePowerGetCpuClockFrequencyInt = createNativeFunction(0xFDB5BFE9, 150, 'int', '', this, function () {
                return _this.cpuFreq;
            });
            this.scePowerRegisterCallback = createNativeFunction(0x04B7766E, 150, 'int', '', this, function (slotIndex, callbackId) {
                console.warn("Not implemented scePowerRegisterCallback");
                return 0;
            });
        }
        return scePower;
    })();
    exports.scePower = scePower;
});
//# sourceMappingURL=scePower.js.map
