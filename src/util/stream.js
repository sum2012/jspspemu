define(["require", "exports"], function(require, exports) {
    (function (Endian) {
        Endian[Endian["LITTLE"] = 0] = "LITTLE";
        Endian[Endian["BIG"] = 1] = "BIG";
    })(exports.Endian || (exports.Endian = {}));
    var Endian = exports.Endian;

    var MemoryAsyncStream = (function () {
        function MemoryAsyncStream(data, name) {
            if (typeof name === "undefined") { name = 'memory'; }
            this.data = data;
            this.name = name;
        }
        Object.defineProperty(MemoryAsyncStream.prototype, "size", {
            get: function () {
                return this.data.byteLength;
            },
            enumerable: true,
            configurable: true
        });

        MemoryAsyncStream.prototype.readChunkAsync = function (offset, count) {
            return Promise.resolve(this.data.slice(offset, offset + count));
        };
        return MemoryAsyncStream;
    })();
    exports.MemoryAsyncStream = MemoryAsyncStream;

    var FileAsyncStream = (function () {
        function FileAsyncStream(file) {
            this.file = file;
        }
        Object.defineProperty(FileAsyncStream.prototype, "name", {
            get: function () {
                return this.file.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileAsyncStream.prototype, "size", {
            get: function () {
                return this.file.size;
            },
            enumerable: true,
            configurable: true
        });

        FileAsyncStream.prototype.readChunkAsync = function (offset, count) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    resolve(fileReader.result);
                };
                fileReader.onerror = function (e) {
                    reject(e.error);
                };
                fileReader.readAsArrayBuffer(_this.file.slice(offset, offset + count));
            });
        };
        return FileAsyncStream;
    })();
    exports.FileAsyncStream = FileAsyncStream;

    var Stream = (function () {
        function Stream(data, offset) {
            if (typeof offset === "undefined") { offset = 0; }
            this.data = data;
            this.offset = offset;
        }
        Stream.fromArrayBuffer = function (data) {
            return new Stream(new DataView(data));
        };

        Stream.fromDataView = function (data, offset) {
            if (typeof offset === "undefined") { offset = 0; }
            return new Stream(data);
        };

        Stream.fromBase64 = function (data) {
            return new Stream(new DataView(base64_toArrayBuffer(data)));
        };

        Stream.prototype.toUInt8Array = function () {
            return new Uint8Array(this.toArrayBuffer());
        };

        Stream.prototype.toArrayBuffer = function () {
            return this.data.buffer.slice(this.data.byteOffset, this.data.byteOffset + this.data.byteLength);
        };

        Stream.fromUint8Array = function (array) {
            return Stream.fromArray(array);
        };

        Stream.fromArray = function (array) {
            var buffer = new ArrayBuffer(array.length);
            var w8 = new Uint8Array(buffer);
            for (var n = 0; n < array.length; n++)
                w8[n] = array[n];
            return new Stream(new DataView(buffer));
        };

        Stream.prototype.sliceWithLength = function (low, count) {
            return new Stream(new DataView(this.data.buffer, this.data.byteOffset + low, count));
        };

        Stream.prototype.sliceWithLowHigh = function (low, high) {
            return new Stream(new DataView(this.data.buffer, this.data.byteOffset + low, high - low));
        };

        Object.defineProperty(Stream.prototype, "available", {
            get: function () {
                return this.length - this.offset;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Stream.prototype, "length", {
            get: function () {
                return this.data.byteLength;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Stream.prototype, "position", {
            get: function () {
                return this.offset;
            },
            set: function (value) {
                this.offset = value;
            },
            enumerable: true,
            configurable: true
        });

        Stream.prototype.skip = function (count, pass) {
            this.offset += count;
            return pass;
        };

        Stream.prototype.readInt8 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(1, this.data.getInt8(this.offset));
        };
        Stream.prototype.readInt16 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(2, this.data.getInt16(this.offset, (endian == 0 /* LITTLE */)));
        };
        Stream.prototype.readInt32 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(4, this.data.getInt32(this.offset, (endian == 0 /* LITTLE */)));
        };

        //readInt64() { return this.skip(8, this.data.getInt32(this.offset + 0, true) * Math.pow(2, 32) + this.data.getInt32(this.offset + 4, true) * Math.pow(2, 0)); }
        Stream.prototype.readFloat32 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(4, this.data.getFloat32(this.offset, (endian == 0 /* LITTLE */)));
        };

        Stream.prototype.readUInt8 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(1, this.data.getUint8(this.offset));
        };
        Stream.prototype.readUInt16 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(2, this.data.getUint16(this.offset, (endian == 0 /* LITTLE */)));
        };
        Stream.prototype.readUInt32 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(4, this.data.getUint32(this.offset, (endian == 0 /* LITTLE */)));
        };
        Stream.prototype.readUInt64 = function (endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(8, this.data.getUint32(this.offset, (endian == 0 /* LITTLE */)));
        };

        Stream.prototype.writeInt8 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(1, this.data.setInt8(this.offset, value));
        };
        Stream.prototype.writeInt16 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(2, this.data.setInt16(this.offset, value, (endian == 0 /* LITTLE */)));
        };
        Stream.prototype.writeInt32 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(4, this.data.setInt32(this.offset, value, (endian == 0 /* LITTLE */)));
        };

        Stream.prototype.writeUInt8 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(1, this.data.setUint8(this.offset, value));
        };
        Stream.prototype.writeUInt16 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(2, this.data.setUint16(this.offset, value, (endian == 0 /* LITTLE */)));
        };
        Stream.prototype.writeUInt32 = function (value, endian) {
            if (typeof endian === "undefined") { endian = 0 /* LITTLE */; }
            return this.skip(4, this.data.setUint32(this.offset, value, (endian == 0 /* LITTLE */)));
        };

        Stream.prototype.readBytes = function (count) {
            return this.skip(count, new Uint8Array(this.data.buffer, this.data.byteOffset + this.offset, count));
        };

        Stream.prototype.readInt16Array = function (count) {
            return this.skip(count, new Int16Array(this.data.buffer, this.data.byteOffset + this.offset, count));
        };

        Stream.prototype.readFloat32Array = function (count) {
            return new Float32Array(this.readBytes(count));
        };

        Stream.prototype.readStream = function (count) {
            return Stream.fromUint8Array(this.readBytes(count));
        };

        Stream.prototype.readUtf8String = function (count) {
            return Utf8.decode(this.readString(count));
        };

        /*
        writeStream(from: Stream) {
        new Uint8Array(this.data.buffer, this.data.byteOffset).set();
        }
        */
        Stream.prototype.writeString = function (str) {
            var _this = this;
            str.split('').forEach(function (char) {
                _this.writeUInt8(char.charCodeAt(0));
            });
        };

        Stream.prototype.readString = function (count) {
            var str = '';
            for (var n = 0; n < count; n++) {
                str += String.fromCharCode(this.readInt8());
            }
            return str;
        };

        Stream.prototype.readUtf8Stringz = function (maxCount) {
            if (typeof maxCount === "undefined") { maxCount = 2147483648; }
            return Utf8.decode(this.readStringz(maxCount));
        };

        Stream.prototype.readStringz = function (maxCount) {
            if (typeof maxCount === "undefined") { maxCount = 2147483648; }
            var str = '';
            for (var n = 0; n < maxCount; n++) {
                if (this.available <= 0)
                    break;
                var char = this.readInt8();
                if (char == 0)
                    break;
                str += String.fromCharCode(char);
            }
            return str;
        };
        return Stream;
    })();
    exports.Stream = Stream;

    function base64_toArrayBuffer(base64string) {
        var outstr = atob(base64string);
        var out = new ArrayBuffer(outstr.length);
        var ia = new Uint8Array(out);
        for (var n = 0; n < outstr.length; n++)
            ia[n] = outstr.charCodeAt(n);
        return out;
    }
});
//# sourceMappingURL=stream.js.map
