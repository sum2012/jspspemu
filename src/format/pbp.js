define(["require", "exports", '../util/struct'], function(require, exports, struct) {
    var PbpMagic;
    (function (PbpMagic) {
        PbpMagic[PbpMagic["expected"] = 0x50425000] = "expected";
    })(PbpMagic || (PbpMagic = {}));

    var PbpHeader = (function () {
        function PbpHeader() {
        }
        PbpHeader.struct = struct.StructClass.create(PbpHeader, [
            { type: struct.Int32, name: 'magic' },
            { type: struct.Int32, name: 'version' },
            { type: new struct.StructArray(struct.Int32, 8), name: 'offsets' }
        ]);
        return PbpHeader;
    })();

    var Pbp = (function () {
        function Pbp() {
        }
        Pbp.fromStream = function (stream) {
            var pbp = new Pbp();
            pbp.load(stream);
            return pbp;
        };

        Pbp.prototype.load = function (stream) {
            this.stream = stream;
            this.header = PbpHeader.struct.read(stream);
            if (this.header.magic != 1346523136 /* expected */)
                throw ("Not a PBP file");
            this.header.offsets.push(stream.length);
        };

        Pbp.prototype.get = function (name) {
            var index = Pbp.names.indexOf(name);
            return this.getByIndex(index);
        };

        Pbp.prototype.getByIndex = function (index) {
            var offsets = this.header.offsets;
            return this.stream.sliceWithLowHigh(offsets[index + 0], offsets[index + 1]);
        };
        Pbp.names = ["param.sfo", "icon0.png", "icon1.pmf", "pic0.png", "pic1.png", "snd0.at3", "psp.data", "psar.data"];
        return Pbp;
    })();

    
    return Pbp;
});
//# sourceMappingURL=pbp.js.map
