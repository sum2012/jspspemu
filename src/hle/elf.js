define(["require", "exports", '../util/struct', '../core/memory', '../core/cpu/instructions'], function(require, exports, struct, Memory, instructions) {
    var Instruction = instructions.Instruction;

    var ElfHeader = (function () {
        function ElfHeader() {
        }
        Object.defineProperty(ElfHeader.prototype, "hasValidMagic", {
            get: function () {
                return this.magic == String.fromCharCode(0x7F) + 'ELF';
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ElfHeader.prototype, "hasValidMachine", {
            get: function () {
                return this.machine == 8 /* ALLEGREX */;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ElfHeader.prototype, "hasValidType", {
            get: function () {
                return [2 /* Executable */, 65440 /* Prx */].indexOf(this.type) >= 0;
            },
            enumerable: true,
            configurable: true
        });

        ElfHeader.struct = struct.StructClass.create(ElfHeader, [
            { type: struct.Stringn(4), name: 'magic' },
            { type: struct.Int8, name: 'class' },
            { type: struct.Int8, name: 'data' },
            { type: struct.Int8, name: 'idVersion' },
            { type: struct.StructArray.create(struct.Int8, 9), name: '_padding' },
            { type: struct.UInt16, name: 'type' },
            { type: struct.Int16, name: 'machine' },
            { type: struct.Int32, name: 'version' },
            { type: struct.Int32, name: 'entryPoint' },
            { type: struct.Int32, name: 'programHeaderOffset' },
            { type: struct.Int32, name: 'sectionHeaderOffset' },
            { type: struct.Int32, name: 'flags' },
            { type: struct.Int16, name: 'elfHeaderSize' },
            { type: struct.Int16, name: 'programHeaderEntrySize' },
            { type: struct.Int16, name: 'programHeaderCount' },
            { type: struct.Int16, name: 'sectionHeaderEntrySize' },
            { type: struct.Int16, name: 'sectionHeaderCount' },
            { type: struct.Int16, name: 'sectionHeaderStringTable' }
        ]);
        return ElfHeader;
    })();

    var ElfProgramHeader = (function () {
        function ElfProgramHeader() {
        }
        ElfProgramHeader.struct = struct.StructClass.create(ElfProgramHeader, [
            { type: struct.UInt32, name: 'type' },
            { type: struct.UInt32, name: 'offset' },
            { type: struct.UInt32, name: 'virtualAddress' },
            { type: struct.UInt32, name: 'psysicalAddress' },
            { type: struct.UInt32, name: 'fileSize' },
            { type: struct.UInt32, name: 'memorySize' },
            { type: struct.UInt32, name: 'flags' },
            { type: struct.UInt32, name: 'alignment' }
        ]);
        return ElfProgramHeader;
    })();

    var ElfSectionHeader = (function () {
        function ElfSectionHeader() {
            this.stream = null;
        }
        ElfSectionHeader.struct = struct.StructClass.create(ElfSectionHeader, [
            { type: struct.UInt32, name: 'nameOffset' },
            { type: struct.UInt32, name: 'type' },
            { type: struct.UInt32, name: 'flags' },
            { type: struct.UInt32, name: 'address' },
            { type: struct.UInt32, name: 'offset' },
            { type: struct.UInt32, name: 'size' },
            { type: struct.UInt32, name: 'link' },
            { type: struct.UInt32, name: 'info' },
            { type: struct.UInt32, name: 'addressAlign' },
            { type: struct.UInt32, name: 'entitySize' }
        ]);
        return ElfSectionHeader;
    })();

    var ElfProgramHeaderType;
    (function (ElfProgramHeaderType) {
        ElfProgramHeaderType[ElfProgramHeaderType["NoLoad"] = 0] = "NoLoad";
        ElfProgramHeaderType[ElfProgramHeaderType["Load"] = 1] = "Load";
        ElfProgramHeaderType[ElfProgramHeaderType["Reloc1"] = 0x700000A0] = "Reloc1";
        ElfProgramHeaderType[ElfProgramHeaderType["Reloc2"] = 0x700000A1] = "Reloc2";
    })(ElfProgramHeaderType || (ElfProgramHeaderType = {}));

    var ElfSectionHeaderType;
    (function (ElfSectionHeaderType) {
        ElfSectionHeaderType[ElfSectionHeaderType["Null"] = 0] = "Null";
        ElfSectionHeaderType[ElfSectionHeaderType["ProgramBits"] = 1] = "ProgramBits";
        ElfSectionHeaderType[ElfSectionHeaderType["SYMTAB"] = 2] = "SYMTAB";
        ElfSectionHeaderType[ElfSectionHeaderType["STRTAB"] = 3] = "STRTAB";
        ElfSectionHeaderType[ElfSectionHeaderType["RELA"] = 4] = "RELA";
        ElfSectionHeaderType[ElfSectionHeaderType["HASH"] = 5] = "HASH";
        ElfSectionHeaderType[ElfSectionHeaderType["DYNAMIC"] = 6] = "DYNAMIC";
        ElfSectionHeaderType[ElfSectionHeaderType["NOTE"] = 7] = "NOTE";
        ElfSectionHeaderType[ElfSectionHeaderType["NoBits"] = 8] = "NoBits";
        ElfSectionHeaderType[ElfSectionHeaderType["Relocation"] = 9] = "Relocation";
        ElfSectionHeaderType[ElfSectionHeaderType["SHLIB"] = 10] = "SHLIB";
        ElfSectionHeaderType[ElfSectionHeaderType["DYNSYM"] = 11] = "DYNSYM";

        ElfSectionHeaderType[ElfSectionHeaderType["LOPROC"] = 0x70000000] = "LOPROC";
        ElfSectionHeaderType[ElfSectionHeaderType["HIPROC"] = 0x7FFFFFFF] = "HIPROC";
        ElfSectionHeaderType[ElfSectionHeaderType["LOUSER"] = 0x80000000] = "LOUSER";
        ElfSectionHeaderType[ElfSectionHeaderType["HIUSER"] = 0xFFFFFFFF] = "HIUSER";

        ElfSectionHeaderType[ElfSectionHeaderType["PrxRelocation"] = (ElfSectionHeaderType.LOPROC | 0xA0)] = "PrxRelocation";
        ElfSectionHeaderType[ElfSectionHeaderType["PrxRelocation_FW5"] = (ElfSectionHeaderType.LOPROC | 0xA1)] = "PrxRelocation_FW5";
    })(ElfSectionHeaderType || (ElfSectionHeaderType = {}));

    var ElfSectionHeaderFlags;
    (function (ElfSectionHeaderFlags) {
        ElfSectionHeaderFlags[ElfSectionHeaderFlags["None"] = 0] = "None";
        ElfSectionHeaderFlags[ElfSectionHeaderFlags["Write"] = 1] = "Write";
        ElfSectionHeaderFlags[ElfSectionHeaderFlags["Allocate"] = 2] = "Allocate";
        ElfSectionHeaderFlags[ElfSectionHeaderFlags["Execute"] = 4] = "Execute";
    })(ElfSectionHeaderFlags || (ElfSectionHeaderFlags = {}));

    var ElfProgramHeaderFlags;
    (function (ElfProgramHeaderFlags) {
        ElfProgramHeaderFlags[ElfProgramHeaderFlags["Executable"] = 0x1] = "Executable";

        // Note: demo PRX's were found to be not writable
        ElfProgramHeaderFlags[ElfProgramHeaderFlags["Writable"] = 0x2] = "Writable";
        ElfProgramHeaderFlags[ElfProgramHeaderFlags["Readable"] = 0x4] = "Readable";
    })(ElfProgramHeaderFlags || (ElfProgramHeaderFlags = {}));

    var ElfType;
    (function (ElfType) {
        ElfType[ElfType["Executable"] = 0x0002] = "Executable";
        ElfType[ElfType["Prx"] = 0xFFA0] = "Prx";
    })(ElfType || (ElfType = {}));

    var ElfMachine;
    (function (ElfMachine) {
        ElfMachine[ElfMachine["ALLEGREX"] = 8] = "ALLEGREX";
    })(ElfMachine || (ElfMachine = {}));

    var ElfRelocType;
    (function (ElfRelocType) {
        ElfRelocType[ElfRelocType["None"] = 0] = "None";
        ElfRelocType[ElfRelocType["Mips16"] = 1] = "Mips16";
        ElfRelocType[ElfRelocType["Mips32"] = 2] = "Mips32";
        ElfRelocType[ElfRelocType["MipsRel32"] = 3] = "MipsRel32";
        ElfRelocType[ElfRelocType["Mips26"] = 4] = "Mips26";
        ElfRelocType[ElfRelocType["MipsHi16"] = 5] = "MipsHi16";
        ElfRelocType[ElfRelocType["MipsLo16"] = 6] = "MipsLo16";
        ElfRelocType[ElfRelocType["MipsGpRel16"] = 7] = "MipsGpRel16";
        ElfRelocType[ElfRelocType["MipsLiteral"] = 8] = "MipsLiteral";
        ElfRelocType[ElfRelocType["MipsGot16"] = 9] = "MipsGot16";
        ElfRelocType[ElfRelocType["MipsPc16"] = 10] = "MipsPc16";
        ElfRelocType[ElfRelocType["MipsCall16"] = 11] = "MipsCall16";
        ElfRelocType[ElfRelocType["MipsGpRel32"] = 12] = "MipsGpRel32";
        ElfRelocType[ElfRelocType["StopRelocation"] = 0xFF] = "StopRelocation";
    })(ElfRelocType || (ElfRelocType = {}));

    var ElfReloc = (function () {
        function ElfReloc() {
        }
        Object.defineProperty(ElfReloc.prototype, "pointeeSectionHeaderBase", {
            get: function () {
                return (this.info >> 16) & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElfReloc.prototype, "pointerSectionHeaderBase", {
            get: function () {
                return (this.info >> 8) & 0xFF;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElfReloc.prototype, "type", {
            get: function () {
                return ((this.info >> 0) & 0xFF);
            },
            enumerable: true,
            configurable: true
        });

        ElfReloc.struct = struct.StructClass.create(ElfReloc, [
            { type: struct.UInt32, name: "pointerAddress" },
            { type: struct.UInt32, name: "info" }
        ]);
        return ElfReloc;
    })();

    var ElfLoader = (function () {
        function ElfLoader() {
            this.header = null;
            this.stream = null;
        }
        ElfLoader.prototype.load = function (stream) {
            var _this = this;
            this.readAndCheckHeaders(stream);

            var programHeadersStream = stream.sliceWithLength(this.header.programHeaderOffset, this.header.programHeaderCount * this.header.programHeaderEntrySize);
            var sectionHeadersStream = stream.sliceWithLength(this.header.sectionHeaderOffset, this.header.sectionHeaderCount * this.header.sectionHeaderEntrySize);

            this.programHeaders = struct.StructArray.create(ElfProgramHeader.struct, this.header.programHeaderCount).read(programHeadersStream);
            this.sectionHeaders = struct.StructArray.create(ElfSectionHeader.struct, this.header.sectionHeaderCount).read(sectionHeadersStream);

            this.sectionHeaderStringTable = this.sectionHeaders[this.header.sectionHeaderStringTable];
            this.stringTableStream = this.getSectionHeaderFileStream(this.sectionHeaderStringTable);

            this.sectionHeadersByName = {};
            this.sectionHeaders.forEach(function (sectionHeader) {
                var name = _this.getStringFromStringTable(sectionHeader.nameOffset);
                sectionHeader.name = name;
                if (sectionHeader.type != 0 /* Null */) {
                    sectionHeader.stream = _this.getSectionHeaderFileStream(sectionHeader);
                }
                _this.sectionHeadersByName[name] = sectionHeader;
            });
        };

        ElfLoader.prototype.readAndCheckHeaders = function (stream) {
            this.stream = stream;
            var header = this.header = ElfHeader.struct.read(stream);
            if (!header.hasValidMagic)
                throw ('Not an ELF file');
            if (!header.hasValidMachine)
                throw ('Not a PSP ELF file');
            if (!header.hasValidType)
                throw ('Not a executable or a Prx but has type ' + header.type);
        };

        ElfLoader.prototype.getStringFromStringTable = function (index) {
            this.stringTableStream.position = index;
            return this.stringTableStream.readStringz();
        };

        ElfLoader.prototype.getSectionHeaderFileStream = function (sectionHeader) {
            switch (sectionHeader.type) {
                case 8 /* NoBits */:
                case 0 /* Null */:
                    return this.stream.sliceWithLength(0, 0);
                    break;
                default:
                    return this.stream.sliceWithLength(sectionHeader.offset, sectionHeader.size);
            }
        };

        ElfLoader.fromStream = function (stream) {
            var elf = new ElfLoader();
            elf.load(stream);
            return elf;
        };

        Object.defineProperty(ElfLoader.prototype, "isPrx", {
            get: function () {
                return (this.header.type & 65440 /* Prx */) != 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElfLoader.prototype, "needsRelocation", {
            get: function () {
                return this.isPrx || (this.header.entryPoint < Memory.MAIN_OFFSET);
            },
            enumerable: true,
            configurable: true
        });
        return ElfLoader;
    })();

    var InstructionReader = (function () {
        function InstructionReader(memory) {
            this.memory = memory;
        }
        InstructionReader.prototype.read = function (address) {
            return new Instruction(address, this.memory.readUInt32(address));
        };

        InstructionReader.prototype.write = function (address, instruction) {
            this.memory.writeInt32(address, instruction.data);
        };
        return InstructionReader;
    })();
});
//# sourceMappingURL=elf.js.map
