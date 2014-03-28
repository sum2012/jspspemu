﻿import vfs = require('./vfs');

export class Device {
	cwd: string = '';

	constructor(public name: string, public vfs: vfs.Vfs) {
	}

	open(uri: Uri, flags: vfs.FileOpenFlags, mode: vfs.FileMode) {
		var entry = this.vfs.open(uri.pathWithoutDevice, flags, mode);
		return entry;
	}
}

export class HleFile {
	cursor = 0;

	constructor(public entry: vfs.VfsEntry) {
	}

	close() {
		this.entry.close();
	}
}

export class Uri {
	constructor(public path: string) {
	}

	get device() {
		return (this.path.split(':'))[0];
	}

	get pathWithoutDevice() {
		return (this.path.split(':'))[1];
	}

	get isAbsolute() {
		return this.path.contains(':');
	}

	append(that: Uri) {
		if (that.isAbsolute) return that;
		return new Uri(this.path + '/' + that.path);
	}
}

export class FileManager {
	private devices: StringDictionary<Device> = {};
	cwd: Uri = new Uri('');

	chdir(cwd:string) {
		this.cwd = new Uri(cwd);
	}

	getDevice(name: string) {
		var device = this.devices[name];
		if (!device) throw(new Error(sprintf("Can't find device '%s'", name)));
		return device;
	}

	open(name: string, flags: vfs.FileOpenFlags, mode: vfs.FileMode) {
		var uri = this.cwd.append(new Uri(name));
		var entry = this.getDevice(uri.device).open(uri, flags, mode);
		return new HleFile(entry);
	}

	mount(device: string, vfs: vfs.Vfs) {
		this.devices[device] = new Device(device, vfs);
	}
}
