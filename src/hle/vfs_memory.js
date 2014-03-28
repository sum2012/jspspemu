var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './vfs'], function(require, exports, vfs) {
    var MemoryVfsEntry = (function (_super) {
        __extends(MemoryVfsEntry, _super);
        function MemoryVfsEntry(data) {
            _super.call(this);
            this.data = data;
        }
        Object.defineProperty(MemoryVfsEntry.prototype, "isDirectory", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MemoryVfsEntry.prototype, "size", {
            get: function () {
                return this.data.byteLength;
            },
            enumerable: true,
            configurable: true
        });
        MemoryVfsEntry.prototype.readChunkAsync = function (offset, length) {
            return Promise.resolve(this.data.slice(offset, offset + length));
        };
        MemoryVfsEntry.prototype.close = function () {
        };
        return MemoryVfsEntry;
    })(vfs.VfsEntry);
    exports.MemoryVfsEntry = MemoryVfsEntry;

    var MemoryVfs = (function (_super) {
        __extends(MemoryVfs, _super);
        function MemoryVfs() {
            _super.apply(this, arguments);
            this.files = {};
        }
        MemoryVfs.prototype.addFile = function (name, data) {
            this.files[name] = data;
        };

        MemoryVfs.prototype.open = function (path, flags, mode) {
            if (flags & 2 /* Write */) {
                this.files[path] = new ArrayBuffer(0);
            }
            var file = this.files[path];
            if (!file)
                throw (new Error(sprintf("MemoryVfs: Can't find '%s'", path)));
            return new MemoryVfsEntry(file);
        };
        return MemoryVfs;
    })(vfs.Vfs);
    exports.MemoryVfs = MemoryVfs;
});
//# sourceMappingURL=vfs_memory.js.map
