define(["require", "exports"], function(require, exports) {
    var PixelConverter = (function () {
        function PixelConverter() {
        }
        PixelConverter.decode = function (format, from, fromIndex, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            if (typeof palette === "undefined") { palette = null; }
            if (typeof clutStart === "undefined") { clutStart = 0; }
            if (typeof clutShift === "undefined") { clutShift = 0; }
            if (typeof clutMask === "undefined") { clutMask = 0; }
            switch (format) {
                case PixelFormat.RGBA_8888:
                    PixelConverter.decode8888(new Uint8Array(from), (fromIndex >>> 0) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case PixelFormat.RGBA_5551:
                    PixelConverter.update5551(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case PixelFormat.RGBA_5650:
                    PixelConverter.update5650(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case PixelFormat.RGBA_4444:
                    PixelConverter.update4444(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case PixelFormat.PALETTE_T8:
                    PixelConverter.updateT8(new Uint8Array(from), (fromIndex >>> 0) & Memory.MASK, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask);
                    break;
                case PixelFormat.PALETTE_T4:
                    PixelConverter.updateT4(new Uint8Array(from), (fromIndex >>> 0) & Memory.MASK, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask);
                    break;
                default:
                    throw (new Error(sprintf("Unsupported pixel format %d", format)));
            }
        };

        PixelConverter.updateT4 = function (from, fromIndex, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            if (typeof palette === "undefined") { palette = null; }
            if (typeof clutStart === "undefined") { clutStart = 0; }
            if (typeof clutShift === "undefined") { clutShift = 0; }
            if (typeof clutMask === "undefined") { clutMask = 0; }
            for (var n = 0, m = 0; n < count * 8; n += 8, m++) {
                var color1 = palette[clutStart + ((BitUtils.extract(from[fromIndex + m], 0, 4) & clutMask) << clutShift)];
                var color2 = palette[clutStart + ((BitUtils.extract(from[fromIndex + m], 4, 4) & clutMask) << clutShift)];
                to[toIndex + n + 0] = BitUtils.extract(color1, 0, 8);
                to[toIndex + n + 1] = BitUtils.extract(color1, 8, 8);
                to[toIndex + n + 2] = BitUtils.extract(color1, 16, 8);
                to[toIndex + n + 3] = useAlpha ? BitUtils.extract(color1, 24, 8) : 0xFF;

                to[toIndex + n + 4] = BitUtils.extract(color2, 0, 8);
                to[toIndex + n + 5] = BitUtils.extract(color2, 8, 8);
                to[toIndex + n + 6] = BitUtils.extract(color2, 16, 8);
                to[toIndex + n + 7] = useAlpha ? BitUtils.extract(color2, 24, 8) : 0xFF;
            }
        };

        PixelConverter.updateT8 = function (from, fromIndex, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            if (typeof palette === "undefined") { palette = null; }
            if (typeof clutStart === "undefined") { clutStart = 0; }
            if (typeof clutShift === "undefined") { clutShift = 0; }
            if (typeof clutMask === "undefined") { clutMask = 0; }
            for (var n = 0, m = 0; n < count * 4; n += 4, m++) {
                var colorIndex = clutStart + ((from[fromIndex + m] & clutMask) << clutShift);
                var color = palette[colorIndex];
                to[toIndex + n + 0] = BitUtils.extract(color, 0, 8);
                to[toIndex + n + 1] = BitUtils.extract(color, 8, 8);
                to[toIndex + n + 2] = BitUtils.extract(color, 16, 8);
                to[toIndex + n + 3] = useAlpha ? BitUtils.extract(color, 24, 8) : 0xFF;
            }
        };

        PixelConverter.decode8888 = function (from, fromIndex, to, toIndex, count, useAlpha) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            for (var n = 0; n < count * 4; n += 4) {
                to[toIndex + n + 0] = from[fromIndex + n + 0];
                to[toIndex + n + 1] = from[fromIndex + n + 1];
                to[toIndex + n + 2] = from[fromIndex + n + 2];
                to[toIndex + n + 3] = useAlpha ? from[fromIndex + n + 3] : 0xFF;
            }
        };

        PixelConverter.update5551 = function (from, fromIndex, to, toIndex, count, useAlpha) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            for (var n = 0; n < count * 4; n += 4) {
                var it = from[fromIndex++];
                to[toIndex + n + 0] = BitUtils.extractScale(it, 0, 5, 0xFF);
                to[toIndex + n + 1] = BitUtils.extractScale(it, 5, 5, 0xFF);
                to[toIndex + n + 2] = BitUtils.extractScale(it, 10, 5, 0xFF);
                to[toIndex + n + 3] = useAlpha ? BitUtils.extractScale(it, 15, 1, 0xFF) : 0xFF;
            }
        };

        PixelConverter.update5650 = function (from, fromIndex, to, toIndex, count, useAlpha) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            for (var n = 0; n < count * 4; n += 4) {
                var it = from[fromIndex++];
                to[toIndex + n + 0] = BitUtils.extractScale(it, 0, 5, 0xFF);
                to[toIndex + n + 1] = BitUtils.extractScale(it, 5, 6, 0xFF);
                to[toIndex + n + 2] = BitUtils.extractScale(it, 11, 5, 0xFF);
                to[toIndex + n + 3] = 0xFF;
            }
        };

        PixelConverter.update4444 = function (from, fromIndex, to, toIndex, count, useAlpha) {
            if (typeof useAlpha === "undefined") { useAlpha = true; }
            for (var n = 0; n < count * 4; n += 4) {
                var it = from[fromIndex++];
                to[toIndex + n + 0] = BitUtils.extractScale(it, 0, 4, 0xFF);
                to[toIndex + n + 1] = BitUtils.extractScale(it, 4, 4, 0xFF);
                to[toIndex + n + 2] = BitUtils.extractScale(it, 8, 4, 0xFF);
                to[toIndex + n + 3] = useAlpha ? BitUtils.extractScale(it, 12, 4, 0xFF) : 0xFF;
            }
        };
        return PixelConverter;
    })();

    
    return PixelConverter;
});
//# sourceMappingURL=pixelconverter.js.map
