define(["require", "exports"], function(require, exports) {
    var VfsEntry = (function () {
        function VfsEntry() {
        }
        Object.defineProperty(VfsEntry.prototype, "isDirectory", {
            get: function () {
                throw (new Error("Must override isDirectory"));
            },
            enumerable: true,
            configurable: true
        });
        VfsEntry.prototype.enumerateAsync = function () {
            throw (new Error("Must override enumerateAsync"));
        };
        Object.defineProperty(VfsEntry.prototype, "size", {
            get: function () {
                throw (new Error("Must override size"));
            },
            enumerable: true,
            configurable: true
        });
        VfsEntry.prototype.readAllAsync = function () {
            return this.readChunkAsync(0, this.size);
        };
        VfsEntry.prototype.readChunkAsync = function (offset, length) {
            throw (new Error("Must override readChunkAsync"));
        };
        VfsEntry.prototype.close = function () {
        };
        return VfsEntry;
    })();
    exports.VfsEntry = VfsEntry;

    (function (FileOpenFlags) {
        FileOpenFlags[FileOpenFlags["Read"] = 0x0001] = "Read";
        FileOpenFlags[FileOpenFlags["Write"] = 0x0002] = "Write";
        FileOpenFlags[FileOpenFlags["ReadWrite"] = FileOpenFlags.Read | FileOpenFlags.Write] = "ReadWrite";
        FileOpenFlags[FileOpenFlags["NoBlock"] = 0x0004] = "NoBlock";
        FileOpenFlags[FileOpenFlags["_InternalDirOpen"] = 0x0008] = "_InternalDirOpen";
        FileOpenFlags[FileOpenFlags["Append"] = 0x0100] = "Append";
        FileOpenFlags[FileOpenFlags["Create"] = 0x0200] = "Create";
        FileOpenFlags[FileOpenFlags["Truncate"] = 0x0400] = "Truncate";
        FileOpenFlags[FileOpenFlags["Excl"] = 0x0800] = "Excl";
        FileOpenFlags[FileOpenFlags["Unknown1"] = 0x4000] = "Unknown1";
        FileOpenFlags[FileOpenFlags["NoWait"] = 0x8000] = "NoWait";
        FileOpenFlags[FileOpenFlags["Unknown2"] = 0xf0000] = "Unknown2";
        FileOpenFlags[FileOpenFlags["Unknown3"] = 0x2000000] = "Unknown3";
    })(exports.FileOpenFlags || (exports.FileOpenFlags = {}));
    var FileOpenFlags = exports.FileOpenFlags;

    (function (FileMode) {
    })(exports.FileMode || (exports.FileMode = {}));
    var FileMode = exports.FileMode;

    var Vfs = (function () {
        function Vfs() {
        }
        Vfs.prototype.open = function (path, flags, mode) {
            throw (new Error("Must override open"));
        };
        return Vfs;
    })();
    exports.Vfs = Vfs;
});
//# sourceMappingURL=vfs.js.map
