export class VfsEntry {
	get isDirectory(): boolean { throw (new Error("Must override isDirectory")); }
	enumerateAsync() { throw (new Error("Must override enumerateAsync")); }
	get size(): number { throw (new Error("Must override size")); }
	readAllAsync() { return this.readChunkAsync(0, this.size); }
	readChunkAsync(offset: number, length: number): Promise<ArrayBuffer> { throw (new Error("Must override readChunkAsync")); }
	close() { }
}

export enum FileOpenFlags {
	Read = 0x0001,
	Write = 0x0002,
	ReadWrite = Read | Write,
	NoBlock = 0x0004,
	_InternalDirOpen = 0x0008, // Internal use for dopen
	Append = 0x0100,
	Create = 0x0200,
	Truncate = 0x0400,
	Excl = 0x0800,
	Unknown1 = 0x4000, // something async?
	NoWait = 0x8000,
	Unknown2 = 0xf0000, // seen on Wipeout Pure and Infected
	Unknown3 = 0x2000000, // seen on Puzzle Guzzle, Hammerin' Hero
}

export enum FileMode {
}

export class Vfs {
	open(path: string, flags: FileOpenFlags, mode: FileMode): VfsEntry {
		throw (new Error("Must override open"));
	}
}

