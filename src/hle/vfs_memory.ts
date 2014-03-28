import vfs = require('./vfs');

export class MemoryVfsEntry extends vfs.VfsEntry {
	constructor(private data: ArrayBuffer) {
		super();
	}

	get isDirectory() { return false; }
	get size() { return this.data.byteLength; }
	readChunkAsync(offset: number, length: number): Promise<ArrayBuffer> { return Promise.resolve(this.data.slice(offset, offset + length)); }
	close() { }
}

export class MemoryVfs extends vfs.Vfs {
	private files: StringDictionary<ArrayBuffer> = {};

	addFile(name: string, data: ArrayBuffer) {
		this.files[name] = data;
	}

	open(path: string, flags: vfs.FileOpenFlags, mode: vfs.FileMode): vfs.VfsEntry {
		if (flags & vfs.FileOpenFlags.Write) {
			this.files[path] = new ArrayBuffer(0);
		}
		var file = this.files[path];
		if (!file) throw (new Error(sprintf("MemoryVfs: Can't find '%s'", path)));
		return new MemoryVfsEntry(file);
	}
}
