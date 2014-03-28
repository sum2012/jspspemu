define(["require", "exports", '../display'], function(require, exports, display) {
    (function (SyncType) {
        SyncType[SyncType["ListDone"] = 0] = "ListDone";
        SyncType[SyncType["ListQueued"] = 1] = "ListQueued";
        SyncType[SyncType["ListDrawingDone"] = 2] = "ListDrawingDone";
        SyncType[SyncType["ListStallReached"] = 3] = "ListStallReached";
        SyncType[SyncType["ListCancelDone"] = 4] = "ListCancelDone";
    })(exports.SyncType || (exports.SyncType = {}));
    var SyncType = exports.SyncType;

    var GpuFrameBufferState = (function () {
        function GpuFrameBufferState() {
            this.lowAddress = 0;
            this.highAddress = 0;
            this.width = 0;
        }
        return GpuFrameBufferState;
    })();
    exports.GpuFrameBufferState = GpuFrameBufferState;

    (function (IndexEnum) {
        IndexEnum[IndexEnum["Void"] = 0] = "Void";
        IndexEnum[IndexEnum["Byte"] = 1] = "Byte";
        IndexEnum[IndexEnum["Short"] = 2] = "Short";
    })(exports.IndexEnum || (exports.IndexEnum = {}));
    var IndexEnum = exports.IndexEnum;

    (function (NumericEnum) {
        NumericEnum[NumericEnum["Void"] = 0] = "Void";
        NumericEnum[NumericEnum["Byte"] = 1] = "Byte";
        NumericEnum[NumericEnum["Short"] = 2] = "Short";
        NumericEnum[NumericEnum["Float"] = 3] = "Float";
    })(exports.NumericEnum || (exports.NumericEnum = {}));
    var NumericEnum = exports.NumericEnum;

    (function (ColorEnum) {
        ColorEnum[ColorEnum["Void"] = 0] = "Void";
        ColorEnum[ColorEnum["Invalid1"] = 1] = "Invalid1";
        ColorEnum[ColorEnum["Invalid2"] = 2] = "Invalid2";
        ColorEnum[ColorEnum["Invalid3"] = 3] = "Invalid3";
        ColorEnum[ColorEnum["Color5650"] = 4] = "Color5650";
        ColorEnum[ColorEnum["Color5551"] = 5] = "Color5551";
        ColorEnum[ColorEnum["Color4444"] = 6] = "Color4444";
        ColorEnum[ColorEnum["Color8888"] = 7] = "Color8888";
    })(exports.ColorEnum || (exports.ColorEnum = {}));
    var ColorEnum = exports.ColorEnum;

    var Vertex = (function () {
        function Vertex() {
            this.px = 0.0;
            this.py = 0.0;
            this.pz = 0.0;
            this.nx = 0.0;
            this.ny = 0.0;
            this.nz = 0.0;
            this.tx = 0.0;
            this.ty = 0.0;
            this.tz = 0.0;
            this.r = 0.0;
            this.g = 0.0;
            this.b = 0.0;
            this.a = 1.0;
            this.w0 = 0.0;
            this.w1 = 0.0;
            this.w2 = 0.0;
            this.w3 = 0.0;
            this.w4 = 0.0;
            this.w5 = 0.0;
            this.w6 = 0.0;
            this.w7 = 0.0;
        }
        Vertex.prototype.clone = function () {
            var vertex = new Vertex();
            vertex.px = this.px;
            vertex.py = this.py;
            vertex.pz = this.pz;
            vertex.nx = this.nx;
            vertex.ny = this.ny;
            vertex.nz = this.nz;
            vertex.tx = this.tx;
            vertex.ty = this.ty;
            vertex.tz = this.tz;
            vertex.r = this.r;
            vertex.g = this.g;
            vertex.b = this.b;
            vertex.a = this.a;
            vertex.w0 = this.w0;
            vertex.w1 = this.w1;
            vertex.w2 = this.w2;
            vertex.w3 = this.w3;
            vertex.w4 = this.w4;
            vertex.w5 = this.w5;
            vertex.w6 = this.w6;
            vertex.w7 = this.w7;
            return vertex;
        };
        return Vertex;
    })();
    exports.Vertex = Vertex;

    var VertexState = (function () {
        function VertexState() {
            this.address = 0;
            this._value = 0;
            this.reversedNormal = false;
            this.textureComponentCount = 2;
        }
        Object.defineProperty(VertexState.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value;
                this.size = this.getVertexSize();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(VertexState.prototype, "hash", {
            //getReader() { return VertexReaderFactory.get(this.size, this.texture, this.color, this.normal, this.position, this.weight, this.index, this.realWeightCount, this.realMorphingVertexCount, this.transform2D, this.textureComponentCount); }
            get: function () {
                return [this.size, this.texture, this.color, this.normal, this.position, this.weight, this.index, this.weightSize, this.morphingVertexCount, this.transform2D, this.textureComponentCount].join('_');
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(VertexState.prototype, "hasTexture", {
            get: function () {
                return this.texture != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "hasColor", {
            get: function () {
                return this.color != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "hasNormal", {
            get: function () {
                return this.normal != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "hasPosition", {
            get: function () {
                return this.position != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "hasWeight", {
            get: function () {
                return this.weight != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "hasIndex", {
            get: function () {
                return this.index != 0 /* Void */;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(VertexState.prototype, "texture", {
            get: function () {
                return BitUtils.extractEnum(this.value, 0, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "color", {
            get: function () {
                return BitUtils.extractEnum(this.value, 2, 3);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "normal", {
            get: function () {
                return BitUtils.extractEnum(this.value, 5, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "position", {
            get: function () {
                return BitUtils.extractEnum(this.value, 7, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "weight", {
            get: function () {
                return BitUtils.extractEnum(this.value, 9, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "index", {
            get: function () {
                return BitUtils.extractEnum(this.value, 11, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "weightCount", {
            get: function () {
                return BitUtils.extract(this.value, 14, 3);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "morphingVertexCount", {
            get: function () {
                return BitUtils.extract(this.value, 18, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "transform2D", {
            get: function () {
                return BitUtils.extractEnum(this.value, 23, 1);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(VertexState.prototype, "weightSize", {
            get: function () {
                return this.NumericEnumGetSize(this.weight);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "colorSize", {
            get: function () {
                return this.ColorEnumGetSize(this.color);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "textureSize", {
            get: function () {
                return this.NumericEnumGetSize(this.texture);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "positionSize", {
            get: function () {
                return this.NumericEnumGetSize(this.position);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(VertexState.prototype, "normalSize", {
            get: function () {
                return this.NumericEnumGetSize(this.normal);
            },
            enumerable: true,
            configurable: true
        });

        VertexState.prototype.IndexEnumGetSize = function (item) {
            switch (item) {
                case 0 /* Void */:
                    return 0;
                case 1 /* Byte */:
                    return 1;
                case 2 /* Short */:
                    return 2;
                default:
                    throw ("Invalid enum");
            }
        };

        VertexState.prototype.NumericEnumGetSize = function (item) {
            switch (item) {
                case 0 /* Void */:
                    return 0;
                case 1 /* Byte */:
                    return 1;
                case 2 /* Short */:
                    return 2;
                case 3 /* Float */:
                    return 4;
                default:
                    throw ("Invalid enum");
            }
        };

        VertexState.prototype.ColorEnumGetSize = function (item) {
            switch (item) {
                case 0 /* Void */:
                    return 0;
                case 4 /* Color5650 */:
                    return 2;
                case 5 /* Color5551 */:
                    return 2;
                case 6 /* Color4444 */:
                    return 2;
                case 7 /* Color8888 */:
                    return 4;
                default:
                    throw ("Invalid enum");
            }
        };

        VertexState.prototype.GetMaxAlignment = function () {
            return Math.max(this.weightSize, this.colorSize, this.textureSize, this.positionSize, this.normalSize);
        };

        Object.defineProperty(VertexState.prototype, "realWeightCount", {
            get: function () {
                return this.weightCount + 1;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(VertexState.prototype, "realMorphingVertexCount", {
            get: function () {
                return this.morphingVertexCount + 1;
            },
            enumerable: true,
            configurable: true
        });

        VertexState.prototype.getVertexSize = function () {
            var size = 0;
            size = MathUtils.nextAligned(size, this.weightSize);
            size += this.realWeightCount * this.weightSize;
            size = MathUtils.nextAligned(size, this.textureSize);
            size += this.textureComponentCount * this.textureSize;
            size = MathUtils.nextAligned(size, this.colorSize);
            size += 1 * this.colorSize;
            size = MathUtils.nextAligned(size, this.normalSize);
            size += 3 * this.normalSize;
            size = MathUtils.nextAligned(size, this.positionSize);
            size += 3 * this.positionSize;

            var alignmentSize = this.GetMaxAlignment();
            size = MathUtils.nextAligned(size, alignmentSize);

            //Console.WriteLine("Size:" + Size);
            return size;
        };

        VertexState.prototype.read = function (memory, count) {
            //console.log('read vertices ' + count);
            var vertices = [];
            for (var n = 0; n < count; n++)
                vertices.push(this.readOne(memory));
            return vertices;
        };

        VertexState.prototype.readOne = function (memory) {
            var address = this.address;
            var vertex = {};

            //console.log(vertex);
            this.address += this.size;

            return vertex;
        };
        return VertexState;
    })();
    exports.VertexState = VertexState;

    var Matrix4x4 = (function () {
        function Matrix4x4() {
            this.index = 0;
            this.values = mat4.create();
        }
        Matrix4x4.prototype.put = function (value) {
            this.values[this.index++] = value;
        };

        Matrix4x4.prototype.reset = function (startIndex) {
            this.index = startIndex;
        };
        return Matrix4x4;
    })();
    exports.Matrix4x4 = Matrix4x4;

    var Matrix4x3 = (function () {
        function Matrix4x3() {
            this.index = 0;
            this.values = mat4.create();
        }
        Matrix4x3.prototype.put = function (value) {
            this.values[Matrix4x3.indices[this.index++]] = value;
        };

        Matrix4x3.prototype.reset = function (startIndex) {
            this.index = startIndex;
        };
        Matrix4x3.indices = [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14];
        return Matrix4x3;
    })();
    exports.Matrix4x3 = Matrix4x3;

    var ViewPort = (function () {
        function ViewPort() {
            this.x1 = 0;
            this.y1 = 0;
            this.x2 = 0;
            this.y2 = 0;
        }
        return ViewPort;
    })();
    exports.ViewPort = ViewPort;

    var Light = (function () {
        function Light() {
            this.enabled = false;
        }
        return Light;
    })();
    exports.Light = Light;

    var Lightning = (function () {
        function Lightning() {
            this.enabled = false;
            this.lights = [new Light(), new Light(), new Light(), new Light()];
        }
        return Lightning;
    })();
    exports.Lightning = Lightning;

    var MipmapState = (function () {
        function MipmapState() {
            this.address = 0;
            this.bufferWidth = 0;
            this.textureWidth = 0;
            this.textureHeight = 0;
        }
        return MipmapState;
    })();
    exports.MipmapState = MipmapState;

    var ColorState = (function () {
        function ColorState() {
            this.r = 1;
            this.g = 1;
            this.b = 1;
            this.a = 1;
        }
        return ColorState;
    })();
    exports.ColorState = ColorState;

    var ClutState = (function () {
        function ClutState() {
            this.adress = 0;
            this.numberOfColors = 0;
            this.pixelFormat = 3 /* RGBA_8888 */;
            this.shift = 0;
            this.mask = 0x00;
            this.start = 0;
        }
        return ClutState;
    })();
    exports.ClutState = ClutState;

    var TextureState = (function () {
        function TextureState() {
            this.enabled = false;
            this.swizzled = false;
            this.mipmapShareClut = false;
            this.mipmapMaxLevel = 0;
            this.filterMinification = 0 /* Nearest */;
            this.filterMagnification = 0 /* Nearest */;
            this.wrapU = 0 /* Repeat */;
            this.offsetU = 0;
            this.offsetV = 0;
            this.scaleU = 1;
            this.scaleV = 1;
            this.wrapV = 0 /* Repeat */;
            this.effect = 0 /* Modulate */;
            this.colorComponent = 0 /* Rgb */;
            this.envColor = new ColorState();
            this.fragment2X = false;
            this.pixelFormat = 3 /* RGBA_8888 */;
            this.clut = new ClutState();
            this.mipmaps = [new MipmapState(), new MipmapState(), new MipmapState(), new MipmapState(), new MipmapState(), new MipmapState(), new MipmapState(), new MipmapState()];
        }
        return TextureState;
    })();
    exports.TextureState = TextureState;

    var CullingState = (function () {
        function CullingState() {
        }
        return CullingState;
    })();
    exports.CullingState = CullingState;

    (function (CullingDirection) {
        CullingDirection[CullingDirection["CounterClockWise"] = 0] = "CounterClockWise";
        CullingDirection[CullingDirection["ClockWise"] = 1] = "ClockWise";
    })(exports.CullingDirection || (exports.CullingDirection = {}));
    var CullingDirection = exports.CullingDirection;

    var GpuState = (function () {
        function GpuState() {
            this.clearing = false;
            this.clearFlags = 0;
            this.baseAddress = 0;
            this.baseOffset = 0;
            this.indexAddress = 0;
            this.frameBuffer = new GpuFrameBufferState();
            this.vertex = new VertexState();
            this.projectionMatrix = new Matrix4x4();
            this.viewMatrix = new Matrix4x3();
            this.worldMatrix = new Matrix4x3();
            this.viewPort = new ViewPort();
            this.lightning = new Lightning();
            this.texture = new TextureState();
            this.culling = new CullingState();
        }
        return GpuState;
    })();
    exports.GpuState = GpuState;

    (function (WrapMode) {
        WrapMode[WrapMode["Repeat"] = 0] = "Repeat";
        WrapMode[WrapMode["Clamp"] = 1] = "Clamp";
    })(exports.WrapMode || (exports.WrapMode = {}));
    var WrapMode = exports.WrapMode;

    (function (TextureEffect) {
        TextureEffect[TextureEffect["Modulate"] = 0] = "Modulate";
        TextureEffect[TextureEffect["Decal"] = 1] = "Decal";
        TextureEffect[TextureEffect["Blend"] = 2] = "Blend";
        TextureEffect[TextureEffect["Replace"] = 3] = "Replace";
        TextureEffect[TextureEffect["Add"] = 4] = "Add";
    })(exports.TextureEffect || (exports.TextureEffect = {}));
    var TextureEffect = exports.TextureEffect;

    (function (TextureFilter) {
        TextureFilter[TextureFilter["Nearest"] = 0] = "Nearest";
        TextureFilter[TextureFilter["Linear"] = 1] = "Linear";
        TextureFilter[TextureFilter["NearestMipmapNearest"] = 4] = "NearestMipmapNearest";
        TextureFilter[TextureFilter["LinearMipmapNearest"] = 5] = "LinearMipmapNearest";
        TextureFilter[TextureFilter["NearestMipmapLinear"] = 6] = "NearestMipmapLinear";
        TextureFilter[TextureFilter["LinearMipmapLinear"] = 7] = "LinearMipmapLinear";
    })(exports.TextureFilter || (exports.TextureFilter = {}));
    var TextureFilter = exports.TextureFilter;

    (function (TextureColorComponent) {
        TextureColorComponent[TextureColorComponent["Rgb"] = 0] = "Rgb";
        TextureColorComponent[TextureColorComponent["Rgba"] = 1] = "Rgba";
    })(exports.TextureColorComponent || (exports.TextureColorComponent = {}));
    var TextureColorComponent = exports.TextureColorComponent;

    (function (PrimitiveType) {
        PrimitiveType[PrimitiveType["Points"] = 0] = "Points";
        PrimitiveType[PrimitiveType["Lines"] = 1] = "Lines";
        PrimitiveType[PrimitiveType["LineStrip"] = 2] = "LineStrip";
        PrimitiveType[PrimitiveType["Triangles"] = 3] = "Triangles";
        PrimitiveType[PrimitiveType["TriangleStrip"] = 4] = "TriangleStrip";
        PrimitiveType[PrimitiveType["TriangleFan"] = 5] = "TriangleFan";
        PrimitiveType[PrimitiveType["Sprites"] = 6] = "Sprites";
        PrimitiveType[PrimitiveType["ContinuePreviousPrim"] = 7] = "ContinuePreviousPrim";
    })(exports.PrimitiveType || (exports.PrimitiveType = {}));
    var PrimitiveType = exports.PrimitiveType;
});
//# sourceMappingURL=state.js.map
