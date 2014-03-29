﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './memory', '../util/math'], function(require, exports, Memory, math) {
    var BitUtils = math.BitUtils;

    (function (PixelFormat) {
        PixelFormat[PixelFormat["NONE"] = -1] = "NONE";
        PixelFormat[PixelFormat["RGBA_5650"] = 0] = "RGBA_5650";
        PixelFormat[PixelFormat["RGBA_5551"] = 1] = "RGBA_5551";
        PixelFormat[PixelFormat["RGBA_4444"] = 2] = "RGBA_4444";
        PixelFormat[PixelFormat["RGBA_8888"] = 3] = "RGBA_8888";
        PixelFormat[PixelFormat["PALETTE_T4"] = 4] = "PALETTE_T4";
        PixelFormat[PixelFormat["PALETTE_T8"] = 5] = "PALETTE_T8";
        PixelFormat[PixelFormat["PALETTE_T16"] = 6] = "PALETTE_T16";
        PixelFormat[PixelFormat["PALETTE_T32"] = 7] = "PALETTE_T32";
        PixelFormat[PixelFormat["COMPRESSED_DXT1"] = 8] = "COMPRESSED_DXT1";
        PixelFormat[PixelFormat["COMPRESSED_DXT3"] = 9] = "COMPRESSED_DXT3";
        PixelFormat[PixelFormat["COMPRESSED_DXT5"] = 10] = "COMPRESSED_DXT5";
    })(exports.PixelFormat || (exports.PixelFormat = {}));
    var PixelFormat = exports.PixelFormat;

    var BasePspDisplay = (function () {
        function BasePspDisplay() {
            this.address = Memory.DEFAULT_FRAME_ADDRESS;
            this.bufferWidth = 512;
            this.pixelFormat = 3 /* RGBA_8888 */;
            this.sync = 1;
        }
        return BasePspDisplay;
    })();
    exports.BasePspDisplay = BasePspDisplay;

    var DummyPspDisplay = (function (_super) {
        __extends(DummyPspDisplay, _super);
        function DummyPspDisplay() {
            _super.call(this);
            this.vblankCount = 0;
        }
        DummyPspDisplay.prototype.waitVblankAsync = function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 20);
            });
        };

        DummyPspDisplay.prototype.startAsync = function () {
            return Promise.resolve();
        };

        DummyPspDisplay.prototype.stopAsync = function () {
            return Promise.resolve();
        };
        return DummyPspDisplay;
    })(BasePspDisplay);
    exports.DummyPspDisplay = DummyPspDisplay;

    var PspDisplay = (function (_super) {
        __extends(PspDisplay, _super);
        function PspDisplay(memory, canvas) {
            _super.call(this);
            this.memory = memory;
            this.canvas = canvas;
            this.vblank = new Signal();
            this.interval = -1;
            this.vblankCount = 0;
            this.context = this.canvas.getContext('2d');
            this.imageData = this.context.createImageData(512, 272);
        }
        PspDisplay.prototype.update = function () {
            if (!this.context || !this.imageData)
                return;

            var count = 512 * 272;
            var imageData = this.imageData;
            var w8 = imageData.data;
            var baseAddress = this.address & 0x0FFFFFFF;

            //var from8 = this.memory.u8;
            //var from16 = this.memory.u16;
            PixelConverter.decode(this.pixelFormat, this.memory.buffer, baseAddress, w8, 0, count, false);

            this.context.putImageData(imageData, 0, 0);
        };

        PspDisplay.prototype.startAsync = function () {
            var _this = this;
            //$(this.canvas).focus();
            this.interval = setInterval(function () {
                _this.vblankCount++;
                _this.update();
                _this.vblank.dispatch();
            }, 1000 / 59.999);
            return Promise.resolve();
        };

        PspDisplay.prototype.stopAsync = function () {
            clearInterval(this.interval);
            this.interval = -1;
            return Promise.resolve();
        };

        PspDisplay.prototype.waitVblankAsync = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this.vblank.once(function () {
                    resolve(0);
                });
            });
        };
        return PspDisplay;
    })(BasePspDisplay);
    exports.PspDisplay = PspDisplay;

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
                case 3 /* RGBA_8888 */:
                    PixelConverter.decode8888(new Uint8Array(from), (fromIndex >>> 0) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case 1 /* RGBA_5551 */:
                    PixelConverter.update5551(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case 0 /* RGBA_5650 */:
                    PixelConverter.update5650(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case 2 /* RGBA_4444 */:
                    PixelConverter.update4444(new Uint16Array(from), (fromIndex >>> 1) & Memory.MASK, to, toIndex, count, useAlpha);
                    break;
                case 5 /* PALETTE_T8 */:
                    PixelConverter.updateT8(new Uint8Array(from), (fromIndex >>> 0) & Memory.MASK, to, toIndex, count, useAlpha, palette, clutStart, clutShift, clutMask);
                    break;
                case 4 /* PALETTE_T4 */:
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
    exports.PixelConverter = PixelConverter;
});
//# sourceMappingURL=display.js.map
