define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceRtc = (function () {
        function sceRtc(context) {
            this.context = context;
            this.sceRtcGetCurrentTick = createNativeFunction(0x3F7AD767, 150, 'int', 'void*', this, function (tickPtr) {
                tickPtr.writeInt32(new Date().getTime());
                tickPtr.writeInt32(0);
                return 0;
            });
            this.sceRtcGetDayOfWeek = createNativeFunction(0x57726BC1, 150, 'int', 'int/int/int', this, function (year, month, day) {
                return new Date(year, month, day).getDay();
            });
            this.sceRtcGetDaysInMonth = createNativeFunction(0x05EF322C, 150, 'int', 'int/int', this, function (year, month) {
                return new Date(year, month, 0).getDate();
            });
            this.sceRtcGetTickResolution = createNativeFunction(0xC41C2853, 150, 'uint', '', this, function (tickPtr) {
                return 1000000;
            });
            this.sceRtcSetTick = createNativeFunction(0x7ED29E40, 150, 'int', 'void*/void*', this, function (date, ticks) {
                throw (new TypeError("Not implemented sceRtcSetTick"));
            });
            this.sceRtcGetTick = createNativeFunction(0x6FF40ACC, 150, 'int', 'void*/void*', this, function (date, ticks) {
                throw (new TypeError("Not implemented sceRtcGetTick"));
            });
        }
        return sceRtc;
    })();
    exports.sceRtc = sceRtc;
});
//# sourceMappingURL=sceRtc.js.map
