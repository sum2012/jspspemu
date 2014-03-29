define(["require", "exports"], function(require, exports) {
    var BitUtils = (function () {
        function BitUtils() {
        }
        BitUtils.mask = function (value) {
            return (1 << value) - 1;
        };

        BitUtils.bitrev32 = function (v) {
            v = ((v >>> 1) & 0x55555555) | ((v & 0x55555555) << 1); // swap odd and even bits
            v = ((v >>> 2) & 0x33333333) | ((v & 0x33333333) << 2); // swap consecutive pairs
            v = ((v >>> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4); // swap nibbles ...
            v = ((v >>> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8); // swap bytes
            v = ((v >>> 16) & 0x0000FFFF) | ((v & 0x0000FFFF) << 16); // swap 2-byte long pairs
            return v;
        };

        BitUtils.rotr = function (value, offset) {
            return (value >>> offset) | (value << (32 - offset));
        };

        BitUtils.clo = function (x) {
            var ret = 0;
            while ((x & 0x80000000) != 0) {
                x <<= 1;
                ret++;
            }
            return ret;
        };

        BitUtils.clz = function (x) {
            return BitUtils.clo(~x);
        };

        BitUtils.seb = function (x) {
            x = x & 0xFF;
            if (x & 0x80)
                x = 0xFFFFFF00 | x;
            return x;
        };

        BitUtils.seh = function (x) {
            x = x & 0xFFFF;
            if (x & 0x8000)
                x = 0xFFFF0000 | x;
            return x;
        };

        BitUtils.wsbh = function (v) {
            return ((v & 0xFF00FF00) >>> 8) | ((v & 0x00FF00FF) << 8);
        };

        BitUtils.wsbw = function (v) {
            return (((v & 0xFF000000) >>> 24) | ((v & 0x00FF0000) >>> 8) | ((v & 0x0000FF00) << 8) | ((v & 0x000000FF) << 24));
        };

        BitUtils.extract = function (data, offset, length) {
            return (data >>> offset) & BitUtils.mask(length);
        };

        BitUtils.extractScale = function (data, offset, length, scale) {
            var mask = BitUtils.mask(length);
            return (((data >>> offset) & mask) * scale / mask) | 0;
        };

        BitUtils.extractEnum = function (data, offset, length) {
            return this.extract(data, offset, length);
        };

        BitUtils.clear = function (data, offset, length) {
            data &= ~(BitUtils.mask(length) << offset);
            return data;
        };

        BitUtils.insert = function (data, offset, length, value) {
            value &= BitUtils.mask(length);
            data = BitUtils.clear(data, offset, length);
            data |= value << offset;
            return data;
        };
        return BitUtils;
    })();
    exports.BitUtils = BitUtils;

    var MathFloat = (function () {
        function MathFloat() {
        }
        MathFloat.reinterpretFloatAsInt = function (floatValue) {
            MathFloat.floatArray[0] = floatValue;
            return MathFloat.intArray[0];
        };

        MathFloat.reinterpretIntAsFloat = function (integerValue) {
            MathFloat.intArray[0] = integerValue;
            return MathFloat.floatArray[0];
        };

        MathFloat.round = function (value) {
            return Math.round(value);
        };

        MathFloat.rint = function (value) {
            return Math.round(value);
        };

        MathFloat.cast = function (value) {
            return (value < 0) ? Math.ceil(value) : Math.floor(value);
        };

        MathFloat.floor = function (value) {
            return Math.floor(value);
        };

        MathFloat.ceil = function (value) {
            return Math.ceil(value);
        };
        MathFloat.floatArray = new Float32Array(1);
        MathFloat.intArray = new Int32Array(MathFloat.floatArray.buffer);
        return MathFloat;
    })();
    exports.MathFloat = MathFloat;

    var MathUtils = (function () {
        function MathUtils() {
        }
        MathUtils.prevAligned = function (value, alignment) {
            return Math.floor(value / alignment) * alignment;
        };

        MathUtils.nextAligned = function (value, alignment) {
            if (alignment <= 1)
                return value;
            if ((value % alignment) == 0)
                return value;
            return value + (alignment - (value % alignment));
        };
        return MathUtils;
    })();
    exports.MathUtils = MathUtils;
});
//# sourceMappingURL=math.js.map
