var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './vfs'], function(require, exports, vfs) {
    var IsoVfsFile = (function (_super) {
        __extends(IsoVfsFile, _super);
        function IsoVfsFile(node) {
            _super.call(this);
            this.node = node;
        }
        Object.defineProperty(IsoVfsFile.prototype, "isDirectory", {
            get: function () {
                return this.node.isDirectory;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IsoVfsFile.prototype, "size", {
            get: function () {
                return this.node.size;
            },
            enumerable: true,
            configurable: true
        });
        IsoVfsFile.prototype.readChunkAsync = function (offset, length) {
            return this.node.readChunkAsync(offset, length);
        };
        IsoVfsFile.prototype.close = function () {
        };
        return IsoVfsFile;
    })(vfs.VfsEntry);

    var IsoVfs = (function (_super) {
        __extends(IsoVfs, _super);
        function IsoVfs(iso) {
            _super.call(this);
            this.iso = iso;
        }
        IsoVfs.prototype.open = function (path, flags, mode) {
            return new IsoVfsFile(this.iso.get(path));
        };
        return IsoVfs;
    })(vfs.Vfs);
    exports.IsoVfs = IsoVfs;
});
//# sourceMappingURL=vfs_iso.js.map
