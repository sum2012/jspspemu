define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceDisplay = (function () {
        function sceDisplay(context) {
            var _this = this;
            this.context = context;
            this.sceDisplaySetMode = createNativeFunction(0x0E20F177, 150, 'uint', 'uint/uint/uint', this, function (mode, width, height) {
                console.info(sprintf("sceDisplay.sceDisplaySetMode(mode: %d, width: %d, height: %d)", mode, width, height));
                return 0;
            });
            this.sceDisplayWaitVblank = createNativeFunction(0x36CDFADE, 150, 'uint', 'int', this, function (cycleNum) {
                return _this.context.display.waitVblankAsync();
            });
            this.sceDisplayWaitVblankCB = createNativeFunction(0x8EB9EC49, 150, 'uint', 'int', this, function (cycleNum) {
                return _this.context.display.waitVblankAsync();
            });
            this.sceDisplayWaitVblankStart = createNativeFunction(0x984C27E7, 150, 'uint', '', this, function () {
                return _this.context.display.waitVblankAsync();
            });
            this.sceDisplayGetVcount = createNativeFunction(0x9C6EAAD7, 150, 'uint', '', this, function () {
                return _this.context.display.vblankCount;
            });
            this.sceDisplayWaitVblankStartCB = createNativeFunction(0x46F186C3, 150, 'uint', '', this, function () {
                return _this.context.display.waitVblankAsync();
            });
            this.sceDisplaySetFrameBuf = createNativeFunction(0x289D82FE, 150, 'uint', 'uint/int/uint/uint', this, function (address, bufferWidth, pixelFormat, sync) {
                _this.context.display.address = address;
                _this.context.display.bufferWidth = bufferWidth;
                _this.context.display.pixelFormat = pixelFormat;
                _this.context.display.sync = sync;
                return 0;
            });
        }
        return sceDisplay;
    })();
    exports.sceDisplay = sceDisplay;
});
//# sourceMappingURL=sceDisplay.js.map
