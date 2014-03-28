import struct = require('../util/struct');
import Memory = require('../core/memory');
import instructions = require('../core/cpu/instructions');
import EmulatorContext = require('../context');
import assembler = require('../core/cpu/assembler');
import CpuState = require('../core/cpu/state');
import elf = require('../format/elf');
import Instruction = instructions.Instruction;
import MipsAssembler = assembler.MipsAssembler;

import ElfRelocType = elf.ElfRelocType;
import ElfSectionHeaderFlags = elf.ElfSectionHeaderFlags;
import ElfLoader = elf.ElfLoader;


export class ElfPspModuleInfo {
	moduleAtributes: number;
	moduleVersion: number;
	name: string;
	gp: number;
	pc: number;
	exportsStart: number;
	exportsEnd: number;
	importsStart: number;
	importsEnd: number;

	// http://hitmen.c02.at/files/yapspd/psp_doc/chap26.html
	// 26.2.2.8
	static struct = struct.StructClass.create<ElfPspModuleInfo>(ElfPspModuleInfo, [
		{ type: struct.UInt16, name: "moduleAtributes" },
		{ type: struct.UInt16, name: "moduleVersion" },
		{ type: struct.Stringz(28), name: "name" },
		{ type: struct.UInt32, name: "gp" },
		{ type: struct.UInt32, name: "exportsStart" },
		{ type: struct.UInt32, name: "exportsEnd" },
		{ type: struct.UInt32, name: "importsStart" },
		{ type: struct.UInt32, name: "importsEnd" },
	]);
}

export class PspElfLoader {
    private elfLoader: ElfLoader;
    moduleInfo: ElfPspModuleInfo;
	assembler = new MipsAssembler();
	baseAddress: number = 0;
	partition: MemoryPartition;

	constructor(private memory: Memory, private memoryManager: MemoryManager, private moduleManager: hle.ModuleManager, private syscallManager: core.SyscallManager) {
    }

    load(stream: Stream) {
		this.elfLoader = ElfLoader.fromStream(stream);

		//ElfSectionHeaderFlags.Allocate

		this.allocateMemory();
		this.writeToMemory();
		this.relocateFromHeaders();
		this.readModuleInfo();
		this.updateModuleImports();

		console.log(this.moduleInfo);
	}

	private getSectionHeaderMemoryStream(sectionHeader: ElfSectionHeader) {
		return this.memory.getPointerStream(this.baseAddress + sectionHeader.address, sectionHeader.size);
	}

	private readModuleInfo() {
		this.moduleInfo = ElfPspModuleInfo.struct.read(this.getSectionHeaderMemoryStream(this.elfLoader.sectionHeadersByName['.rodata.sceModuleInfo']));
		this.moduleInfo.pc = this.baseAddress + this.elfLoader.header.entryPoint;
	}

	private allocateMemory() {
		this.baseAddress = 0;

		if (this.elfLoader.needsRelocation) {
			this.baseAddress = this.memoryManager.userPartition.childPartitions.sortBy(partition => partition.size).reverse().first().low
			this.baseAddress = MathUtils.nextAligned(this.baseAddress, 0x1000);
		}
	}

	private relocateFromHeaders() {
		var RelocProgramIndex = 0;
		this.elfLoader.programHeaders.forEach((programHeader) => {
			switch (programHeader.type) {
				case ElfProgramHeaderType.Reloc1:
					console.warn("SKIPPING Elf.ProgramHeader.TypeEnum.Reloc1!");
					break;
				case ElfProgramHeaderType.Reloc2:
					throw ("Not implemented");
			}
		});

		var RelocSectionIndex = 0;
		this.elfLoader.sectionHeaders.forEach((sectionHeader) => {
			//RelocOutput.WriteLine("Section Header: %d : %s".Sprintf(RelocSectionIndex++, SectionHeader.ToString()));

			switch (sectionHeader.type) {
				case ElfSectionHeaderType.Relocation:
					console.log(sectionHeader);
					console.error("Not implemented ElfSectionHeaderType.Relocation");
					break;

				case ElfSectionHeaderType.PrxRelocation:
					var relocs = struct.StructArray.create<ElfReloc>(ElfReloc.struct, sectionHeader.stream.length / ElfReloc.struct.length).read(sectionHeader.stream);
					this.relocateRelocs(relocs);
					break;
				case ElfSectionHeaderType.PrxRelocation_FW5:
					throw ("Not implemented ElfSectionHeader.Type.PrxRelocation_FW5");
			}
		});
	}

	private relocateRelocs(relocs: ElfReloc[]) {
		var baseAddress = this.baseAddress;
		var hiValue: number;
		var deferredHi16: number[] = [];
		var instructionReader = new InstructionReader(this.memory);

		for (var index = 0; index < relocs.length; index++) {
			var reloc = relocs[index];
			if (reloc.type == ElfRelocType.StopRelocation) break;

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
				case ElfRelocType.None: break;
				case ElfRelocType.Mips16: instruction.u_imm16 += S; break;
				case ElfRelocType.Mips32: instruction.data += S; break;
				case ElfRelocType.MipsRel32: throw ("Not implemented MipsRel32"); 
				case ElfRelocType.Mips26: instruction.jump_real = instruction.jump_real + S; break;
				case ElfRelocType.MipsHi16: hiValue = instruction.u_imm16; deferredHi16.push(RelocatedPointerAddress); break;
				case ElfRelocType.MipsLo16:
					var A = instruction.u_imm16;

					instruction.u_imm16 = ((hiValue << 16) | (A & 0x0000FFFF)) + S;

					deferredHi16.forEach(data_addr2 => {
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
				case ElfRelocType.MipsGpRel16:
					break;
				default: throw (new Error(sprintf("RelocType %d not implemented", reloc.type)));
			}

			instructionReader.write(RelocatedPointerAddress, instruction);
		}
	}

    private writeToMemory() {
		var needsRelocate = this.elfLoader.needsRelocation;

        //var loadAddress = this.elfLoader.programHeaders[0].psysicalAddress;
        var loadAddress = this.baseAddress;

        console.info(sprintf("PspElfLoader: needsRelocate=%s, loadAddress=%08X", needsRelocate, loadAddress));
        //console.log(moduleInfo);

		this.elfLoader.sectionHeaders.filter(sectionHeader => ((sectionHeader.flags & ElfSectionHeaderFlags.Allocate) != 0)).forEach(sectionHeader => {
			var low = loadAddress + sectionHeader.address;

            //console.log(sectionHeader);
            switch (sectionHeader.type) {
				case ElfSectionHeaderType.NoBits:
					for (var n = 0; n < sectionHeader.size; n++) this.memory.writeInt8(low + n, 0);
					break;
				default:
					//console.log(sprintf('low: %08X type: %08X', low, sectionHeader.type));
					break;
                case ElfSectionHeaderType.ProgramBits:
                    var stream = sectionHeader.stream;

					var length = stream.length;
							
					var memorySegment = this.memoryManager.userPartition.allocateSet(length, low);
					//console.log(sprintf('low: %08X, %08X, size: %08X', sectionHeader.address, low, stream.length));
                    this.memory.writeStream(low, stream);

                    break;
            }
		});

    }

    private updateModuleImports() {
		var moduleInfo = this.moduleInfo;
		console.log(moduleInfo);
        var importsBytesSize = moduleInfo.importsEnd - moduleInfo.importsStart;
        var importsStream = this.memory.sliceWithBounds(moduleInfo.importsStart, moduleInfo.importsEnd);
        var importsCount = importsBytesSize / ElfPspModuleImport.struct.length;
		var imports = struct.StructArray.create<ElfPspModuleImport>(ElfPspModuleImport.struct, importsCount).read(importsStream);
        imports.forEach(_import => {
            _import.name = this.memory.readStringz(_import.nameOffset)
            this.updateModuleFunctions(_import);
            this.updateModuleVars(_import);
        });
        //console.log(imports);
    }

    private updateModuleFunctions(moduleImport: ElfPspModuleImport) {
        var _module = this.moduleManager.getByName(moduleImport.name);
        var nidsStream = this.memory.sliceWithSize(moduleImport.nidAddress, moduleImport.functionCount * 4);
        var callStream = this.memory.sliceWithSize(moduleImport.callAddress, moduleImport.functionCount * 8);

        var registerN = (nid: number, n: number) => {
            var nfunc: core.NativeFunction;
            try {
                nfunc = _module.getByNid(nid)
            } catch (e) {
                console.warn(e);
				nfunc = new core.NativeFunction();
                nfunc.name = sprintf("%s:0x%08X", moduleImport.name, nid);
                nfunc.nid = nid;
                nfunc.firmwareVersion = 150;
				nfunc.call = (context: EmulatorContext, state: CpuState) => {
                    throw ("Not implemented '" + nfunc.name + "'");
                };
            }
            var syscallId = this.syscallManager.register(nfunc);
            //printf("%s:%08X -> %s", moduleImport.name, nid, syscallId);
            return syscallId;
        };

        for (var n = 0; n < moduleImport.functionCount; n++) {
            var nid = nidsStream.readUInt32();
            var syscall = registerN(nid, n);

            callStream.writeInt32(this.assembler.assemble(0, sprintf('jr $31'))[0].data);
            callStream.writeInt32(this.assembler.assemble(0, sprintf('syscall %d', syscall))[0].data);
        }
    }

    private updateModuleVars(moduleImport: ElfPspModuleImport) {
    }
}


enum ElfPspModuleFlags // ushort
{
	User = 0x0000,
	Kernel = 0x1000,
}

enum ElfPspLibFlags // ushort
{
	DirectJump = 0x0001,
	Syscall = 0x4000,
	SysLib = 0x8000,
}

enum ElfPspModuleNids // uint
{
	MODULE_INFO = 0xF01D73A7,
	MODULE_BOOTSTART = 0xD3744BE0,
	MODULE_REBOOT_BEFORE = 0x2F064FA6,
	MODULE_START = 0xD632ACDB,
	MODULE_START_THREAD_PARAMETER = 0x0F7C276C,
	MODULE_STOP = 0xCEE8593C,
	MODULE_STOP_THREAD_PARAMETER = 0xCF0CC697,
}

class ElfPspModuleImport {
	name: string;
	nameOffset: number;
	version: number;
	flags: number;
	entrySize: number;
	functionCount: number;
	variableCount: number;
	nidAddress: number;
	callAddress: number;

	static struct = struct.Struct.create<ElfPspModuleImport>([
		{ type: struct.UInt32, name: "nameOffset" },
		{ type: struct.UInt16, name: "version" },
		{ type: struct.UInt16, name: "flags" },
		{ type: struct.UInt8, name: "entrySize" },
		{ type: struct.UInt8, name: "variableCount" },
		{ type: struct.UInt16, name: "functionCount" },
		{ type: struct.UInt32, name: "nidAddress" },
		{ type: struct.UInt32, name: "callAddress" },
	]);
}

class ElfPspModuleExport {
	name: string;
	version: number;
	flags: number;
	entrySize: number;
	variableCount: number;
	functionCount: number;
	exports: number;

	static struct = struct.Struct.create([
		{ type: struct.UInt32, name: "name" },
		{ type: struct.UInt16, name: "version" },
		{ type: struct.UInt16, name: "flags" },
		{ type: struct.UInt8, name: "entrySize" },
		{ type: struct.UInt8, name: "variableCount" },
		{ type: struct.UInt16, name: "functionCount" },
		{ type: struct.UInt32, name: "exports" },
	]);
}

enum ElfPspModuleInfoAtributesEnum // ushort
{
	UserMode = 0x0000,
	KernelMode = 0x100,
}