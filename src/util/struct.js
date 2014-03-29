define(["require", "exports", './stream'], function(require, exports, stream) {
    var Endian = stream.Endian;

    var Int64Type = (function () {
        function Int64Type(endian) {
            this.endian = endian;
        }
        Int64Type.prototype.read = function (stream) {
            if (this.endian == 0 /* LITTLE */) {
                var low = stream.readUInt32(this.endian);
                var high = stream.readUInt32(this.endian);
            } else {
                var high = stream.readUInt32(this.endian);
                var low = stream.readUInt32(this.endian);
            }
            return high * Math.pow(2, 32) + low;
        };
        Int64Type.prototype.write = function (stream, value) {
            var low = Math.floor(value % Math.pow(2, 32));
            var high = Math.floor(value / Math.pow(2, 32));
            if (this.endian == 0 /* LITTLE */) {
                stream.writeInt32(low, this.endian);
                stream.writeInt32(high, this.endian);
            } else {
                stream.writeInt32(high, this.endian);
                stream.writeInt32(low, this.endian);
            }
        };
        Object.defineProperty(Int64Type.prototype, "length", {
            get: function () {
                return 8;
            },
            enumerable: true,
            configurable: true
        });
        return Int64Type;
    })();
    exports.Int64Type = Int64Type;

    var Int32Type = (function () {
        function Int32Type(endian) {
            this.endian = endian;
        }
        Int32Type.prototype.read = function (stream) {
            return stream.readInt32(this.endian);
        };
        Int32Type.prototype.write = function (stream, value) {
            stream.writeInt32(value, this.endian);
        };
        Object.defineProperty(Int32Type.prototype, "length", {
            get: function () {
                return 4;
            },
            enumerable: true,
            configurable: true
        });
        return Int32Type;
    })();
    exports.Int32Type = Int32Type;

    var Int16Type = (function () {
        function Int16Type(endian) {
            this.endian = endian;
        }
        Int16Type.prototype.read = function (stream) {
            return stream.readInt16(this.endian);
        };
        Int16Type.prototype.write = function (stream, value) {
            stream.writeInt16(value, this.endian);
        };
        Object.defineProperty(Int16Type.prototype, "length", {
            get: function () {
                return 2;
            },
            enumerable: true,
            configurable: true
        });
        return Int16Type;
    })();
    exports.Int16Type = Int16Type;

    var Int8Type = (function () {
        function Int8Type(endian) {
            this.endian = endian;
        }
        Int8Type.prototype.read = function (stream) {
            return stream.readInt8(this.endian);
        };
        Int8Type.prototype.write = function (stream, value) {
            stream.writeInt8(value, this.endian);
        };
        Object.defineProperty(Int8Type.prototype, "length", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        return Int8Type;
    })();
    exports.Int8Type = Int8Type;

    var UInt32Type = (function () {
        function UInt32Type(endian) {
            this.endian = endian;
        }
        UInt32Type.prototype.read = function (stream) {
            return stream.readUInt32(this.endian);
        };
        UInt32Type.prototype.write = function (stream, value) {
            stream.writeUInt32(value, this.endian);
        };
        Object.defineProperty(UInt32Type.prototype, "length", {
            get: function () {
                return 4;
            },
            enumerable: true,
            configurable: true
        });
        return UInt32Type;
    })();
    exports.UInt32Type = UInt32Type;

    var UInt16Type = (function () {
        function UInt16Type(endian) {
            this.endian = endian;
        }
        UInt16Type.prototype.read = function (stream) {
            return stream.readUInt16(this.endian);
        };
        UInt16Type.prototype.write = function (stream, value) {
            stream.writeUInt16(value, this.endian);
        };
        Object.defineProperty(UInt16Type.prototype, "length", {
            get: function () {
                return 2;
            },
            enumerable: true,
            configurable: true
        });
        return UInt16Type;
    })();
    exports.UInt16Type = UInt16Type;

    var UInt8Type = (function () {
        function UInt8Type(endian) {
            this.endian = endian;
        }
        UInt8Type.prototype.read = function (stream) {
            return stream.readUInt8(this.endian);
        };
        UInt8Type.prototype.write = function (stream, value) {
            stream.writeUInt8(value, this.endian);
        };
        Object.defineProperty(UInt8Type.prototype, "length", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        return UInt8Type;
    })();
    exports.UInt8Type = UInt8Type;

    var Struct = (function () {
        function Struct(items) {
            this.items = items;
        }
        Struct.create = function (items) {
            return new Struct(items);
        };

        Struct.prototype.read = function (stream) {
            var out = {};
            this.items.forEach(function (item) {
                out[item.name] = item.type.read(stream);
            });
            return out;
        };
        Struct.prototype.write = function (stream, value) {
            this.items.forEach(function (item) {
                item.type.write(stream, value[item.name]);
            });
        };
        Object.defineProperty(Struct.prototype, "length", {
            get: function () {
                return this.items.sum(function (item) {
                    if (!item)
                        throw ("Invalid item!!");
                    if (!item.type)
                        throw ("Invalid item type!!");
                    return item.type.length;
                });
            },
            enumerable: true,
            configurable: true
        });
        return Struct;
    })();
    exports.Struct = Struct;

    var StructClass = (function () {
        function StructClass(_class, items) {
            this._class = _class;
            this.items = items;
        }
        StructClass.create = function (_class, items) {
            return new StructClass(_class, items);
        };

        StructClass.prototype.read = function (stream) {
            var _class = this._class;
            var out = new _class();
            this.items.forEach(function (item) {
                out[item.name] = item.type.read(stream);
            });
            return out;
        };
        StructClass.prototype.write = function (stream, value) {
            this.items.forEach(function (item) {
                item.type.write(stream, value[item.name]);
            });
        };
        Object.defineProperty(StructClass.prototype, "length", {
            get: function () {
                return this.items.sum(function (item) {
                    if (!item)
                        throw ("Invalid item!!");
                    if (!item.type) {
                        console.log(item);
                        throw ("Invalid item type!!");
                    }
                    return item.type.length;
                });
            },
            enumerable: true,
            configurable: true
        });
        return StructClass;
    })();
    exports.StructClass = StructClass;

    var StructArray = (function () {
        function StructArray(elementType, count) {
            this.elementType = elementType;
            this.count = count;
        }
        StructArray.create = function (elementType, count) {
            return new StructArray(elementType, count);
        };

        StructArray.prototype.read = function (stream) {
            var out = [];
            for (var n = 0; n < this.count; n++) {
                out.push(this.elementType.read(stream));
            }
            return out;
        };
        StructArray.prototype.write = function (stream, value) {
            for (var n = 0; n < this.count; n++)
                this.elementType.write(stream, value[n]);
        };
        Object.defineProperty(StructArray.prototype, "length", {
            get: function () {
                return this.elementType.length * this.count;
            },
            enumerable: true,
            configurable: true
        });
        return StructArray;
    })();
    exports.StructArray = StructArray;

    var StructStringn = (function () {
        function StructStringn(count) {
            this.count = count;
        }
        StructStringn.prototype.read = function (stream) {
            var out = '';
            for (var n = 0; n < this.count; n++) {
                out += String.fromCharCode(stream.readUInt8());
            }
            return out;
        };
        StructStringn.prototype.write = function (stream, value) {
            throw ("Not implemented StructStringn.write");
        };
        Object.defineProperty(StructStringn.prototype, "length", {
            get: function () {
                return this.count;
            },
            enumerable: true,
            configurable: true
        });
        return StructStringn;
    })();
    exports.StructStringn = StructStringn;

    var StructStringz = (function () {
        function StructStringz(count) {
            this.count = count;
            this.stringn = new StructStringn(count);
        }
        StructStringz.prototype.read = function (stream) {
            return this.stringn.read(stream).split(String.fromCharCode(0))[0];
        };
        StructStringz.prototype.write = function (stream, value) {
            var items = value.split('').map(function (char) {
                return char.charCodeAt(0);
            });
            while (items.length < this.count)
                items.push(0);
            for (var n = 0; n < items.length; n++)
                stream.writeUInt8(items[n]);
        };
        Object.defineProperty(StructStringz.prototype, "length", {
            get: function () {
                return this.count;
            },
            enumerable: true,
            configurable: true
        });
        return StructStringz;
    })();
    exports.StructStringz = StructStringz;

    exports.Int16 = new Int16Type(0 /* LITTLE */);
    exports.Int32 = new Int32Type(0 /* LITTLE */);
    exports.Int64 = new Int64Type(0 /* LITTLE */);
    exports.Int8 = new Int8Type(0 /* LITTLE */);

    exports.UInt16 = new UInt16Type(0 /* LITTLE */);
    exports.UInt32 = new UInt32Type(0 /* LITTLE */);
    exports.UInt8 = new UInt8Type(0 /* LITTLE */);

    exports.UInt16_b = new UInt16Type(1 /* BIG */);
    exports.UInt32_b = new UInt32Type(1 /* BIG */);

    var UInt32_2lbStruct = (function () {
        function UInt32_2lbStruct() {
        }
        UInt32_2lbStruct.prototype.read = function (stream) {
            var l = stream.readUInt32(0 /* LITTLE */);
            var b = stream.readUInt32(1 /* BIG */);
            return l;
        };
        UInt32_2lbStruct.prototype.write = function (stream, value) {
            stream.writeUInt32(value, 0 /* LITTLE */);
            stream.writeUInt32(value, 1 /* BIG */);
        };
        Object.defineProperty(UInt32_2lbStruct.prototype, "length", {
            get: function () {
                return 8;
            },
            enumerable: true,
            configurable: true
        });
        return UInt32_2lbStruct;
    })();
    exports.UInt32_2lbStruct = UInt32_2lbStruct;

    var UInt16_2lbStruct = (function () {
        function UInt16_2lbStruct() {
        }
        UInt16_2lbStruct.prototype.read = function (stream) {
            var l = stream.readUInt16(0 /* LITTLE */);
            var b = stream.readUInt16(1 /* BIG */);
            return l;
        };
        UInt16_2lbStruct.prototype.write = function (stream, value) {
            stream.writeUInt16(value, 0 /* LITTLE */);
            stream.writeUInt16(value, 1 /* BIG */);
        };
        Object.defineProperty(UInt16_2lbStruct.prototype, "length", {
            get: function () {
                return 4;
            },
            enumerable: true,
            configurable: true
        });
        return UInt16_2lbStruct;
    })();
    exports.UInt16_2lbStruct = UInt16_2lbStruct;

    exports.UInt32_2lb = new UInt32_2lbStruct();
    exports.UInt16_2lb = new UInt16_2lbStruct();

    function Stringn(count) {
        return new StructStringn(count);
    }
    exports.Stringn = Stringn;
    function Stringz(count) {
        return new StructStringz(count);
    }
    exports.Stringz = Stringz;
});
//# sourceMappingURL=struct.js.map
