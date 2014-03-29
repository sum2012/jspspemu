define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceDmac = (function () {
        function sceDmac(context) {
            var _this = this;
            this.context = context;
            this.sceDmacMemcpy = createNativeFunction(0x617F3FE6, 150, 'uint', 'uint/uint/int', this, function (destination, source, size) {
                _this.context.memory.copy(source, destination, size);
                return 0;
            });
        }
        return sceDmac;
    })();
    exports.sceDmac = sceDmac;
});
//# sourceMappingURL=sceDmac.js.map
