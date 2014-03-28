import struct = require('../util/struct');
import Memory = require('../core/memory');
import instructions = require('../core/cpu/instructions');
import EmulatorContext = require('../context');
import assembler = require('../core/cpu/assembler');
import CpuState = require('../core/cpu/state');

import InstructionReader = instructions.InstructionReader;
import Instruction = instructions.Instruction;
import MipsAssembler = assembler.MipsAssembler;

export class ElfHeader {
    magic: string;
    class: number;
    data: number;
    idVersion: number;
    _padding: number[];
    type: ElfType;
    machine: ElfMachine;
    version: number;
    entryPoint: number;
    programHeaderOffset: number;
    sectionHeaderOffset: number;
    flags: number;
    elfHeaderSize: number;
    programHeaderEntrySize: number;
    programHeaderCount: number;
    sectionHeaderEntrySize: number;
    sectionHeaderCount: number;
    sectionHeaderStringTable: number;

    get hasValidMagic() {
        return this.magic == String.fromCharCode(0x7F) + 'ELF';
    }

    get hasValidMachine() {
        return this.machine == ElfMachine.ALLEGREX;
    }

    get hasValidType() {
        return [ElfType.Executable, ElfType.Prx].indexOf(this.type) >= 0;
    }

	static struct = struct.StructClass.create<ElfHeader>(ElfHeader, [
		{ type: struct.Stringn(4), name: 'magic' },
		{ type: struct.Int8, name: 'class' },
		{ type: struct.Int8, name: 'data' },
		{ type: struct.Int8, name: 'idVersion' },
		{ type: struct.StructArray.create<number>(struct.Int8, 9), name: '_padding' },
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
		{ type: struct.Int16, name: 'sectionHeaderStringTable' },
    ]);
}

export class ElfProgramHeader {
    type: ElfProgramHeaderType;
    offset: number;
    virtualAddress: number;
    psysicalAddress: number;
    fileSize: number;
    memorySize: number;
    flags: ElfProgramHeaderFlags;
    alignment: number;

	static struct = struct.StructClass.create<ElfProgramHeader>(ElfProgramHeader, [
		{ type: struct.UInt32, name: 'type' },
		{ type: struct.UInt32, name: 'offset' },
		{ type: struct.UInt32, name: 'virtualAddress' },
		{ type: struct.UInt32, name: 'psysicalAddress' },
		{ type: struct.UInt32, name: 'fileSize' },
		{ type: struct.UInt32, name: 'memorySize' },
		{ type: struct.UInt32, name: 'flags' },
		{ type: struct.UInt32, name: 'alignment' },
    ]);
}

export class ElfSectionHeader {
    nameOffset: number;
    name: string;
    stream: Stream = null;
    type: ElfSectionHeaderType;
    flags: ElfSectionHeaderFlags;
    address: number;
    offset: number;
    size: number;
    link: number;
    info: number;
    addressAlign: number;
    entitySize: number;

	static struct = struct.StructClass.create<ElfSectionHeader>(ElfSectionHeader, [
		{ type: struct.UInt32, name: 'nameOffset' },
		{ type: struct.UInt32, name: 'type' },
		{ type: struct.UInt32, name: 'flags' },
		{ type: struct.UInt32, name: 'address' },
		{ type: struct.UInt32, name: 'offset' },
		{ type: struct.UInt32, name: 'size' },
		{ type: struct.UInt32, name: 'link' },
		{ type: struct.UInt32, name: 'info' },
		{ type: struct.UInt32, name: 'addressAlign' },
		{ type: struct.UInt32, name: 'entitySize' },
    ]);
}


export enum ElfProgramHeaderType {
    NoLoad = 0,
    Load = 1,
    Reloc1 = 0x700000A0,
    Reloc2 = 0x700000A1,
}

export enum ElfSectionHeaderType {
    Null = 0,
    ProgramBits = 1,
    SYMTAB = 2,
    STRTAB = 3,
    RELA = 4,
    HASH = 5,
    DYNAMIC = 6,
    NOTE = 7,
    NoBits = 8,
    Relocation = 9,
    SHLIB = 10,
    DYNSYM = 11,

    LOPROC = 0x70000000, HIPROC = 0x7FFFFFFF,
    LOUSER = 0x80000000, HIUSER = 0xFFFFFFFF,

    PrxRelocation = (LOPROC | 0xA0),
    PrxRelocation_FW5 = (LOPROC | 0xA1),
}

export enum ElfSectionHeaderFlags {
    None = 0,
    Write = 1,
    Allocate = 2,
    Execute = 4
}

export enum ElfProgramHeaderFlags {
    Executable = 0x1,
    // Note: demo PRX's were found to be not writable
    Writable = 0x2,
    Readable = 0x4,
}

export enum ElfType {
    Executable = 0x0002,
    Prx = 0xFFA0,
}

export enum ElfMachine {
    ALLEGREX = 8,
}

export enum ElfRelocType {
	None = 0,
	Mips16 = 1,
	Mips32 = 2,
	MipsRel32 = 3,
	Mips26 = 4,
	MipsHi16 = 5,
	MipsLo16 = 6,
	MipsGpRel16 = 7,
	MipsLiteral = 8,
	MipsGot16 = 9,
	MipsPc16 = 10,
	MipsCall16 = 11,
	MipsGpRel32 = 12,
	StopRelocation = 0xFF,
}

export class ElfReloc
{
	pointerAddress: number;
	info: number;

	get pointeeSectionHeaderBase() { return (this.info >> 16) & 0xFF; }
	get pointerSectionHeaderBase() { return (this.info >> 8) & 0xFF; }
	get type() { return <ElfRelocType>((this.info >> 0) & 0xFF); }

	static struct = struct.StructClass.create<ElfReloc>(ElfReloc, [
		{ type: struct.UInt32, name: "pointerAddress" },
		{ type: struct.UInt32, name: "info" },
	]);
}


export class ElfLoader {
    public header: ElfHeader = null;
    private stream: Stream = null;
    public programHeaders: ElfProgramHeader[];
    public sectionHeaders: ElfSectionHeader[];
    public sectionHeadersByName: StringDictionary<ElfSectionHeader>;
    private sectionHeaderStringTable: ElfSectionHeader;
    private stringTableStream: Stream;

    constructor() {
    }

	load(stream: Stream) {
		this.readAndCheckHeaders(stream);

		var programHeadersStream = stream.sliceWithLength(this.header.programHeaderOffset, this.header.programHeaderCount * this.header.programHeaderEntrySize);
		var sectionHeadersStream = stream.sliceWithLength(this.header.sectionHeaderOffset, this.header.sectionHeaderCount * this.header.sectionHeaderEntrySize);

		this.programHeaders = struct.StructArray.create<ElfProgramHeader>(ElfProgramHeader.struct, this.header.programHeaderCount).read(programHeadersStream);
		this.sectionHeaders = struct.StructArray.create<ElfSectionHeader>(ElfSectionHeader.struct, this.header.sectionHeaderCount).read(sectionHeadersStream);

		this.sectionHeaderStringTable = this.sectionHeaders[this.header.sectionHeaderStringTable];
        this.stringTableStream = this.getSectionHeaderFileStream(this.sectionHeaderStringTable);

        this.sectionHeadersByName = {};
        this.sectionHeaders.forEach((sectionHeader) => {
            var name = this.getStringFromStringTable(sectionHeader.nameOffset);
            sectionHeader.name = name;
            if (sectionHeader.type != ElfSectionHeaderType.Null) {
                sectionHeader.stream = this.getSectionHeaderFileStream(sectionHeader);
            }
            this.sectionHeadersByName[name] = sectionHeader;
        });
	}

	private readAndCheckHeaders(stream: Stream) {
		this.stream = stream;
		var header = this.header = ElfHeader.struct.read(stream);
		if (!header.hasValidMagic) throw ('Not an ELF file');
		if (!header.hasValidMachine) throw ('Not a PSP ELF file');
		if (!header.hasValidType) throw ('Not a executable or a Prx but has type ' + header.type);
	}

    private getStringFromStringTable(index: number) {
        this.stringTableStream.position = index;
        return this.stringTableStream.readStringz();
    }

    private getSectionHeaderFileStream(sectionHeader: ElfSectionHeader) {
        //console.log('::' + sectionHeader.type + ' ; ' + sectionHeader.offset + ' ; ' + sectionHeader.size);
        switch (sectionHeader.type) {
            case ElfSectionHeaderType.NoBits: case ElfSectionHeaderType.Null:
                return this.stream.sliceWithLength(0, 0);
                break;
            default:
                return this.stream.sliceWithLength(sectionHeader.offset, sectionHeader.size);
        }
    }

    static fromStream(stream: Stream) {
        var elf = new ElfLoader();
        elf.load(stream);
        return elf;
	}

	get isPrx() { return (this.header.type & ElfType.Prx) != 0; }
	get needsRelocation() { return this.isPrx || (this.header.entryPoint < Memory.MAIN_OFFSET); }
}

