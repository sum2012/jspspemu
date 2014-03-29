﻿export enum Endian {
	LITTLE = 0,
	BIG = 1,
}
export interface AsyncStream {
	name: string;
	size: number;
	readChunkAsync(offset: number, count: number): Promise<ArrayBuffer>;
}

export class MemoryAsyncStream implements AsyncStream {
	constructor(private data: ArrayBuffer, public name = 'memory') {
	}

	get size() { return this.data.byteLength; }

	readChunkAsync(offset: number, count: number) {
        return Promise.resolve(this.data.slice(offset, offset + count))
    }
}

export class FileAsyncStream implements AsyncStream {
	constructor(private file: File) {
	}

	get name() { return this.file.name; }
	get size() { return this.file.size; }

	readChunkAsync(offset: number, count: number) {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			var fileReader = new FileReader();
			fileReader.onload = (e) => { resolve(fileReader.result); };
			fileReader.onerror = (e) => { reject(e.error); };
			fileReader.readAsArrayBuffer(this.file.slice(offset, offset + count));
		});
	}
}

export class Stream {
	constructor(private data: DataView, private offset: number = 0) {
	}

	static fromArrayBuffer(data: ArrayBuffer) {
		return new Stream(new DataView(data));
	}

	static fromDataView(data: DataView, offset: number = 0) {
		return new Stream(data);
	}

	static fromBase64(data: string) {
		return new Stream(new DataView(base64_toArrayBuffer(data)));
	}

	toUInt8Array() {
		return new Uint8Array(this.toArrayBuffer());
	}

	toArrayBuffer() {
		return this.data.buffer.slice(this.data.byteOffset, this.data.byteOffset + this.data.byteLength);
	}

	static fromUint8Array(array: Uint8Array) {
		return Stream.fromArray(<any>array);
	}

	static fromArray(array: any[]) {
		var buffer = new ArrayBuffer(array.length);
		var w8 = new Uint8Array(buffer);
		for (var n = 0; n < array.length; n++) w8[n] = array[n];
		return new Stream(new DataView(buffer));
	}

	sliceWithLength(low: number, count?: number) {
		return new Stream(new DataView(this.data.buffer, this.data.byteOffset + low, count));
	}

	sliceWithLowHigh(low: number, high: number) {
		return new Stream(new DataView(this.data.buffer, this.data.byteOffset + low, high - low));
	}

	get available() {
		return this.length - this.offset;
	}

	get length() {
		return this.data.byteLength;
	}

	set position(value: number) {
		this.offset = value;
	}

	get position() {
		return this.offset;
	}

	skip<T>(count: number, pass?: T): T {
		this.offset += count;
		return pass;
	}

	readInt8(endian: Endian = Endian.LITTLE) { return this.skip(1, this.data.getInt8(this.offset)); }
	readInt16(endian: Endian = Endian.LITTLE) { return this.skip(2, this.data.getInt16(this.offset, (endian == Endian.LITTLE))); }
	readInt32(endian: Endian = Endian.LITTLE) { return this.skip(4, this.data.getInt32(this.offset, (endian == Endian.LITTLE))); }
	//readInt64() { return this.skip(8, this.data.getInt32(this.offset + 0, true) * Math.pow(2, 32) + this.data.getInt32(this.offset + 4, true) * Math.pow(2, 0)); }

	readFloat32(endian: Endian = Endian.LITTLE) { return this.skip(4, this.data.getFloat32(this.offset, (endian == Endian.LITTLE))); }

	readUInt8(endian: Endian = Endian.LITTLE) { return this.skip(1, this.data.getUint8(this.offset)); }
	readUInt16(endian: Endian = Endian.LITTLE) { return this.skip(2, this.data.getUint16(this.offset, (endian == Endian.LITTLE))); }
	readUInt32(endian: Endian = Endian.LITTLE) { return this.skip(4, this.data.getUint32(this.offset, (endian == Endian.LITTLE))); }
	readUInt64(endian: Endian = Endian.LITTLE) { return this.skip(8, this.data.getUint32(this.offset, (endian == Endian.LITTLE))); }

	writeInt8(value: number, endian: Endian = Endian.LITTLE) { return this.skip(1, this.data.setInt8(this.offset, value)); }
	writeInt16(value: number, endian: Endian = Endian.LITTLE) { return this.skip(2, this.data.setInt16(this.offset, value, (endian == Endian.LITTLE))); }
	writeInt32(value: number, endian: Endian = Endian.LITTLE) { return this.skip(4, this.data.setInt32(this.offset, value, (endian == Endian.LITTLE))); }

	writeUInt8(value: number, endian: Endian = Endian.LITTLE) { return this.skip(1, this.data.setUint8(this.offset, value)); }
	writeUInt16(value: number, endian: Endian = Endian.LITTLE) { return this.skip(2, this.data.setUint16(this.offset, value, (endian == Endian.LITTLE))); }
	writeUInt32(value: number, endian: Endian = Endian.LITTLE) { return this.skip(4, this.data.setUint32(this.offset, value, (endian == Endian.LITTLE))); }

	readBytes(count: number) {
		return this.skip(count, new Uint8Array(this.data.buffer, this.data.byteOffset + this.offset, count));
	}

	readInt16Array(count: number) {
		return this.skip(count, new Int16Array(this.data.buffer, this.data.byteOffset + this.offset, count));
	}

	readFloat32Array(count: number) {
		return new Float32Array(this.readBytes(count));
	}

	readStream(count: number) {
		return Stream.fromUint8Array(this.readBytes(count));
	}

	readUtf8String(count: number) {
		return Utf8.decode(this.readString(count));
	}

	/*
	writeStream(from: Stream) {
		new Uint8Array(this.data.buffer, this.data.byteOffset).set();
	}
	*/

	writeString(str: string) {
		str.split('').forEach(char => {
			this.writeUInt8(char.charCodeAt(0));
		});
	}

	readString(count: number) {
		var str = '';
		for (var n = 0; n < count; n++) {
			str += String.fromCharCode(this.readInt8());
		}
		return str;
	}

	readUtf8Stringz(maxCount: number = 2147483648) {
		return Utf8.decode(this.readStringz(maxCount));
	}

	readStringz(maxCount: number = 2147483648) {
		var str = '';
		for (var n = 0; n < maxCount; n++) {
			if (this.available <= 0) break;
			var char = this.readInt8();
			if (char == 0) break;
			str += String.fromCharCode(char);
		}
		return str;
	}
}

function base64_toArrayBuffer(base64string: string) {
	var outstr = atob(base64string);
	var out = new ArrayBuffer(outstr.length);
	var ia = new Uint8Array(out);
	for (var n = 0; n < outstr.length; n++) ia[n] = outstr.charCodeAt(n);
	return out;
}
