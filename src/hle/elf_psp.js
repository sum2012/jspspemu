define(["require", "exports", '../util/struct', '../core/cpu', '../core/cpu/assembler', '../format/elf'], function(require, exports, struct, cpu, assembler, elf) {
    var MipsAssembler = assembler.MipsAssembler;

    var InstructionReader = cpu.InstructionReader;
    var NativeFunction = cpu.NativeFunction;

    var SyscallManager = cpu.SyscallManager;

    var ElfRelocType = elf.ElfRelocType;
    var ElfSectionHeaderFlags = elf.ElfSectionHeaderFlags;
    var ElfLoader = elf.ElfLoader;
    var ElfSectionHeaderType = elf.ElfSectionHeaderType;
    var ElfProgramHeaderType = elf.ElfProgramHeaderType;

    var ElfReloc = elf.ElfReloc;

    var ElfPspModuleInfo = (function () {
        function ElfPspModuleInfo() {
        }
        ElfPspModuleInfo.struct = struct.StructClass.create(ElfPspModuleInfo, [
            { type: struct.UInt16, name: "moduleAtributes" },
            { type: struct.UInt16, name: "moduleVersion" },
            { type: struct.Stringz(28), name: "name" },
            { type: struct.UInt32, name: "gp" },
            { type: struct.UInt32, name: "exportsStart" },
            { type: struct.UInt32, name: "exportsEnd" },
            { type: struct.UInt32, name: "importsStart" },
            { type: struct.UInt32, name: "importsEnd" }
        ]);
        return ElfPspModuleInfo;
    })();
    exports.ElfPspModuleInfo = ElfPspModuleInfo;

    var PspElfLoader = (function () {
        function PspElfLoader(memory, memoryManager, moduleManager, syscallManager) {
            this.memory = memory;
            this.memoryManager = memoryManager;
            this.moduleManager = moduleManager;
            this.syscallManager = syscallManager;
            this.assembler = new MipsAssembler();
            this.baseAddress = 0;
        }
        PspElfLoader.prototype.load = function (stream) {
            this.elfLoader = ElfLoader.fromStream(stream);

            //ElfSectionHeaderFlags.Allocate
            this.allocateMemory();
            this.writeToMemory();
            this.relocateFromHeaders();
            this.readModuleInfo();
            this.updateModuleImports();

            console.log(this.moduleInfo);
        };

        PspElfLoader.prototype.getSectionHeaderMemoryStream = function (sectionHeader) {
            return this.memory.getPointerStream(this.baseAddress + sectionHeader.address, sectionHeader.size);
        };

        PspElfLoader.prototype.readModuleInfo = function () {
            this.moduleInfo = ElfPspModuleInfo.struct.read(this.getSectionHeaderMemoryStream(this.elfLoader.sectionHeadersByName['.rodata.sceModuleInfo']));
            this.moduleInfo.pc = this.baseAddress + this.elfLoader.header.entryPoint;
        };

        PspElfLoader.prototype.allocateMemory = function () {
            this.baseAddress = 0;

            if (this.elfLoader.needsRelocation) {
                this.baseAddress = this.memoryManager.userPartition.childPartitions.sortBy(function (partition) {
                    return partition.size;
                }).reverse().first().low;
                this.baseAddress = MathUtils.nextAligned(this.baseAddress, 0x1000);
            }
        };

        PspElfLoader.prototype.relocateFromHeaders = function () {
            var _this = this;
            var RelocProgramIndex = 0;
            this.elfLoader.programHeaders.forEach(function (programHeader) {
                switch (programHeader.type) {
                    case 1879048352 /* Reloc1 */:
                        console.warn("SKIPPING Elf.ProgramHeader.TypeEnum.Reloc1!");
                        break;
                    case 1879048353 /* Reloc2 */:
                        throw ("Not implemented");
                }
            });

            var RelocSectionIndex = 0;
            this.elfLoader.sectionHeaders.forEach(function (sectionHeader) {
                switch (sectionHeader.type) {
                    case 9 /* Relocation */:
                        console.log(sectionHeader);
                        console.error("Not implemented ElfSectionHeaderType.Relocation");
                        break;

                    case ElfSectionHeaderType.PrxRelocation:
                        var relocs = struct.StructArray.create(ElfReloc.struct, sectionHeader.stream.length / ElfReloc.struct.length).read(sectionHeader.stream);
                        _this.relocateRelocs(relocs);
                        break;
                    case ElfSectionHeaderType.PrxRelocation_FW5:
                        throw ("Not implemented ElfSectionHeader.Type.PrxRelocation_FW5");
                }
            });
        };

        PspElfLoader.prototype.relocateRelocs = function (relocs) {
            var baseAddress = this.baseAddress;
            var hiValue;
            var deferredHi16 = [];
            var instructionReader = new InstructionReader(this.memory);

            for (var index = 0; index < relocs.length; index++) {
                var reloc = relocs[index];
                if (reloc.type == 255 /* StopRelocation */)
                    break;

                var pointerBaseOffset = this.elfLoader.programHeaders[reloc.pointerSectionHeaderBase].virtualAddress;
                var pointeeBaseOffset = this.elfLoader.programHeaders[reloc.pointeeSectionHeaderBase].virtualAddress;

                // Address of data to relocate
                var RelocatedPointerAddress = (baseAddress + reloc.pointerAddress + pointerBaseOffset);

                // Value of data to relocate
                var instruction = instructionReader.read(RelocatedPointerAddress);

                var S = baseAddress + pointeeBaseOffset;
                var GP_ADDR = (baseAddress + reloc.pointerAddress);
                var GP_OFFSET = GP_ADDR - (baseAddress & 0xFFFF0000);

                switch (reloc.type) {
                    case 0 /* None */:
                        break;
                    case 1 /* Mips16 */:
                        instruction.u_imm16 += S;
                        break;
                    case 2 /* Mips32 */:
                        instruction.data += S;
                        break;
                    case 3 /* MipsRel32 */:
                        throw ("Not implemented MipsRel32");
                    case 4 /* Mips26 */:
                        instruction.jump_real = instruction.jump_real + S;
                        break;
                    case 5 /* MipsHi16 */:
                        hiValue = instruction.u_imm16;
                        deferredHi16.push(RelocatedPointerAddress);
                        break;
                    case 6 /* MipsLo16 */:
                        var A = instruction.u_imm16;

                        instruction.u_imm16 = ((hiValue << 16) | (A & 0x0000FFFF)) + S;

                        deferredHi16.forEach(function (data_addr2) {
                            var data2 = instructionReader.read(data_addr2);
                            var result = ((data2.data & 0x0000FFFF) << 16) + A + S;
                            if ((A & 0x8000) != 0) {
                                result -= 0x10000;
                            }
                            if ((result & 0x8000) != 0) {
                                result += 0x10000;
                            }
                            data2.u_imm16 = (result >>> 16);
                            instructionReader.write(data_addr2, data2);
                        });

                        deferredHi16 = [];
                        break;
                    case 7 /* MipsGpRel16 */:
                        break;
                    default:
                        throw (new Error(sprintf("RelocType %d not implemented", reloc.type)));
                }

                instructionReader.write(RelocatedPointerAddress, instruction);
            }
        };

        PspElfLoader.prototype.writeToMemory = function () {
            var _this = this;
            var needsRelocate = this.elfLoader.needsRelocation;

            //var loadAddress = this.elfLoader.programHeaders[0].psysicalAddress;
            var loadAddress = this.baseAddress;

            console.info(sprintf("PspElfLoader: needsRelocate=%s, loadAddress=%08X", needsRelocate, loadAddress));

            //console.log(moduleInfo);
            this.elfLoader.sectionHeaders.filter(function (sectionHeader) {
                return ((sectionHeader.flags & 2 /* Allocate */) != 0);
            }).forEach(function (sectionHeader) {
                var low = loadAddress + sectionHeader.address;

                switch (sectionHeader.type) {
                    case 8 /* NoBits */:
                        for (var n = 0; n < sectionHeader.size; n++)
                            _this.memory.writeInt8(low + n, 0);
                        break;
                    default:
                        break;
                    case 1 /* ProgramBits */:
                        var stream = sectionHeader.stream;

                        var length = stream.length;

                        var memorySegment = _this.memoryManager.userPartition.allocateSet(length, low);

                        //console.log(sprintf('low: %08X, %08X, size: %08X', sectionHeader.address, low, stream.length));
                        _this.memory.writeStream(low, stream);

                        break;
                }
            });
        };

        PspElfLoader.prototype.updateModuleImports = function () {
            var _this = this;
            var moduleInfo = this.moduleInfo;
            console.log(moduleInfo);
            var importsBytesSize = moduleInfo.importsEnd - moduleInfo.importsStart;
            var importsStream = this.memory.sliceWithBounds(moduleInfo.importsStart, moduleInfo.importsEnd);
            var importsCount = importsBytesSize / ElfPspModuleImport.struct.length;
            var imports = struct.StructArray.create(ElfPspModuleImport.struct, importsCount).read(importsStream);
            imports.forEach(function (_import) {
                _import.name = _this.memory.readStringz(_import.nameOffset);
                _this.updateModuleFunctions(_import);
                _this.updateModuleVars(_import);
            });
            //console.log(imports);
        };

        PspElfLoader.prototype.updateModuleFunctions = function (moduleImport) {
            var _this = this;
            var _module = this.moduleManager.getByName(moduleImport.name);
            var nidsStream = this.memory.sliceWithSize(moduleImport.nidAddress, moduleImport.functionCount * 4);
            var callStream = this.memory.sliceWithSize(moduleImport.callAddress, moduleImport.functionCount * 8);

            var registerN = function (nid, n) {
                var nfunc;
                try  {
                    nfunc = _module.getByNid(nid);
                } catch (e) {
                    console.warn(e);
                    nfunc = new NativeFunction();
                    nfunc.name = sprintf("%s:0x%08X", moduleImport.name, nid);
                    nfunc.nid = nid;
                    nfunc.firmwareVersion = 150;
                    nfunc.call = function (context, state) {
                        throw ("Not implemented '" + nfunc.name + "'");
                    };
                }
                var syscallId = _this.syscallManager.register(nfunc);

                //printf("%s:%08X -> %s", moduleImport.name, nid, syscallId);
                return syscallId;
            };

            for (var n = 0; n < moduleImport.functionCount; n++) {
                var nid = nidsStream.readUInt32();
                var syscall = registerN(nid, n);

                callStream.writeInt32(this.assembler.assemble(0, sprintf('jr $31'))[0].data);
                callStream.writeInt32(this.assembler.assemble(0, sprintf('syscall %d', syscall))[0].data);
            }
        };

        PspElfLoader.prototype.updateModuleVars = function (moduleImport) {
        };
        return PspElfLoader;
    })();
    exports.PspElfLoader = PspElfLoader;

    var ElfPspModuleFlags;
    (function (ElfPspModuleFlags) {
        ElfPspModuleFlags[ElfPspModuleFlags["User"] = 0x0000] = "User";
        ElfPspModuleFlags[ElfPspModuleFlags["Kernel"] = 0x1000] = "Kernel";
    })(ElfPspModuleFlags || (ElfPspModuleFlags = {}));

    var ElfPspLibFlags;
    (function (ElfPspLibFlags) {
        ElfPspLibFlags[ElfPspLibFlags["DirectJump"] = 0x0001] = "DirectJump";
        ElfPspLibFlags[ElfPspLibFlags["Syscall"] = 0x4000] = "Syscall";
        ElfPspLibFlags[ElfPspLibFlags["SysLib"] = 0x8000] = "SysLib";
    })(ElfPspLibFlags || (ElfPspLibFlags = {}));

    var ElfPspModuleNids;
    (function (ElfPspModuleNids) {
        ElfPspModuleNids[ElfPspModuleNids["MODULE_INFO"] = 0xF01D73A7] = "MODULE_INFO";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_BOOTSTART"] = 0xD3744BE0] = "MODULE_BOOTSTART";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_REBOOT_BEFORE"] = 0x2F064FA6] = "MODULE_REBOOT_BEFORE";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_START"] = 0xD632ACDB] = "MODULE_START";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_START_THREAD_PARAMETER"] = 0x0F7C276C] = "MODULE_START_THREAD_PARAMETER";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_STOP"] = 0xCEE8593C] = "MODULE_STOP";
        ElfPspModuleNids[ElfPspModuleNids["MODULE_STOP_THREAD_PARAMETER"] = 0xCF0CC697] = "MODULE_STOP_THREAD_PARAMETER";
    })(ElfPspModuleNids || (ElfPspModuleNids = {}));

    var ElfPspModuleImport = (function () {
        function ElfPspModuleImport() {
        }
        ElfPspModuleImport.struct = struct.Struct.create([
            { type: struct.UInt32, name: "nameOffset" },
            { type: struct.UInt16, name: "version" },
            { type: struct.UInt16, name: "flags" },
            { type: struct.UInt8, name: "entrySize" },
            { type: struct.UInt8, name: "variableCount" },
            { type: struct.UInt16, name: "functionCount" },
            { type: struct.UInt32, name: "nidAddress" },
            { type: struct.UInt32, name: "callAddress" }
        ]);
        return ElfPspModuleImport;
    })();

    var ElfPspModuleExport = (function () {
        function ElfPspModuleExport() {
        }
        ElfPspModuleExport.struct = struct.Struct.create([
            { type: struct.UInt32, name: "name" },
            { type: struct.UInt16, name: "version" },
            { type: struct.UInt16, name: "flags" },
            { type: struct.UInt8, name: "entrySize" },
            { type: struct.UInt8, name: "variableCount" },
            { type: struct.UInt16, name: "functionCount" },
            { type: struct.UInt32, name: "exports" }
        ]);
        return ElfPspModuleExport;
    })();

    var ElfPspModuleInfoAtributesEnum;
    (function (ElfPspModuleInfoAtributesEnum) {
        ElfPspModuleInfoAtributesEnum[ElfPspModuleInfoAtributesEnum["UserMode"] = 0x0000] = "UserMode";
        ElfPspModuleInfoAtributesEnum[ElfPspModuleInfoAtributesEnum["KernelMode"] = 0x100] = "KernelMode";
    })(ElfPspModuleInfoAtributesEnum || (ElfPspModuleInfoAtributesEnum = {}));
});
//# sourceMappingURL=elf_psp.js.map
