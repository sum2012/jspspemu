import vfs = require('./vfs');
import iso = require('../format/iso');

class IsoVfsFile extends vfs.VfsEntry {
	constructor(private node: iso.IIsoNode) {
		super();
	}

	get isDirectory() { return this.node.isDirectory; }
	get size() { return this.node.size; }
	readChunkAsync(offset: number, length: number): Promise<ArrayBuffer> { return this.node.readChunkAsync(offset, length); }
	close() { }
}

export class IsoVfs extends vfs.Vfs {
	constructor(private iso: iso.Iso) {
		super();
	}

	open(path: string, flags: vfs.FileOpenFlags, mode: vfs.FileMode): vfs.VfsEntry {
		return new IsoVfsFile(this.iso.get(path));
	}
}
