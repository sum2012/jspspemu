import stream = require('./stream');
import Stream = stream.Stream;
import Endian = stream.Endian;

export interface IType {
	read(stream: Stream): any;
	write(stream: Stream, value: any): void;
	length: number;
}

export interface StructEntry {
	name: string;
	type: IType;
}

export class Int64Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any {
		if (this.endian == Endian.LITTLE) {
			var low = stream.readUInt32(this.endian);
			var high = stream.readUInt32(this.endian);
		} else {
			var high = stream.readUInt32(this.endian);
			var low = stream.readUInt32(this.endian);
		}
		return high * Math.pow(2, 32) + low;
	}
	write(stream: Stream, value: any): void {
		var low = Math.floor(value % Math.pow(2, 32));
		var high = Math.floor(value / Math.pow(2, 32));
		if (this.endian == Endian.LITTLE) {
			stream.writeInt32(low, this.endian);
			stream.writeInt32(high, this.endian);
		} else {
			stream.writeInt32(high, this.endian);
			stream.writeInt32(low, this.endian);
		}
	}
	get length() { return 8; }
}

export class Int32Type implements IType {
	constructor(public endian: Endian) { }
	read(stream: Stream): any { return stream.readInt32(this.endian); }
	write(stream: Stream, value: any): void { stream.writeInt32(value, this.endian); }
	get length() { return 4; }
}

export class Int16Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any { return stream.readInt16(this.endian); }
	write(stream: Stream, value: any): void { stream.writeInt16(value, this.endian); }
	get length() { return 2; }
}

export class Int8Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any { return stream.readInt8(this.endian); }
	write(stream: Stream, value: any): void { stream.writeInt8(value, this.endian); }
	get length() { return 1; }
}

export class UInt32Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any { return stream.readUInt32(this.endian); }
	write(stream: Stream, value: any): void { stream.writeUInt32(value, this.endian); }
	get length() { return 4; }
}

export class UInt16Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any { return stream.readUInt16(this.endian); }
	write(stream: Stream, value: any): void { stream.writeUInt16(value, this.endian); }
	get length() { return 2; }
}

export class UInt8Type implements IType {
	constructor(public endian: Endian) { }

	read(stream: Stream): any { return stream.readUInt8(this.endian); }
	write(stream: Stream, value: any): void { stream.writeUInt8(value, this.endian); }
	get length() { return 1; }
}

export class Struct<T> implements IType {
	constructor(private items: StructEntry[]) {
	}

	static create<T>(items: StructEntry[]) {
		return new Struct<T>(items);
	}

	read(stream: Stream): T {
		var out: any = {};
		this.items.forEach(item => { out[item.name] = item.type.read(stream); });
		return out;
	}
	write(stream: Stream, value: T): void {
		this.items.forEach(item => { item.type.write(stream, value[item.name]); });
	}
	get length() {
		return this.items.sum<number>(item => {
			if (!item) throw ("Invalid item!!");
			if (!item.type) throw ("Invalid item type!!");
			return item.type.length;
		});
	}
}

export class StructClass<T> implements IType {
	constructor(private _class: any, private items: StructEntry[]) {
	}

	static create<T>(_class: any, items: StructEntry[]) {
		return new StructClass<T>(_class, items);
	}

	read(stream: Stream): T {
		var _class = this._class;
		var out: T = new _class();
		this.items.forEach(item => { out[item.name] = item.type.read(stream); });
		return out;
	}
	write(stream: Stream, value: T): void {
		this.items.forEach(item => { item.type.write(stream, value[item.name]); });
	}
	get length() {
		return this.items.sum<number>(item => {
			if (!item) throw ("Invalid item!!");
			if (!item.type) {
				console.log(item);
				throw ("Invalid item type!!");
			}
			return item.type.length;
		});
	}
}

export class StructArray<T> implements IType {
	constructor(private elementType: IType, private count: number) {
	}

	static create<T>(elementType: IType, count: number) {
		return new StructArray<T>(elementType, count);
	}

	read(stream: Stream): T[] {
		var out = [];
		for (var n = 0; n < this.count; n++) {
			out.push(this.elementType.read(stream));
		}
		return out;
	}
	write(stream: Stream, value: T[]): void {
		for (var n = 0; n < this.count; n++) this.elementType.write(stream, value[n]);
	}
	get length() {
		return this.elementType.length * this.count;
	}
}

export class StructStringn {
	constructor(private count: number) {
	}

	read(stream: Stream): string {
		var out = '';
		for (var n = 0; n < this.count; n++) {
			out += String.fromCharCode(stream.readUInt8());
		}
		return out;
	}
	write(stream: Stream, value: string): void {
		throw ("Not implemented StructStringn.write");
	}
	get length() {
		return this.count;
	}
}

export class StructStringz {
	stringn: StructStringn;

	constructor(private count: number) {
		this.stringn = new StructStringn(count);
	}

	read(stream: Stream): string {
		return this.stringn.read(stream).split(String.fromCharCode(0))[0];
	}
	write(stream: Stream, value: string): void {
		var items = value.split('').map(char => char.charCodeAt(0));
		while (items.length < this.count) items.push(0);
		for (var n = 0; n < items.length; n++) stream.writeUInt8(items[n]);
	}
	get length() {
		return this.count;
	}
}

export var Int16 = new Int16Type(Endian.LITTLE);
export var Int32 = new Int32Type(Endian.LITTLE);
export var Int64 = new Int64Type(Endian.LITTLE);
export var Int8 = new Int8Type(Endian.LITTLE);

export var UInt16 = new UInt16Type(Endian.LITTLE);
export var UInt32 = new UInt32Type(Endian.LITTLE);
export var UInt8 = new UInt8Type(Endian.LITTLE);

export var UInt16_b = new UInt16Type(Endian.BIG);
export var UInt32_b = new UInt32Type(Endian.BIG);

export class UInt32_2lbStruct implements IType {
	read(stream: Stream): number {
		var l = stream.readUInt32(Endian.LITTLE);
		var b = stream.readUInt32(Endian.BIG);
		return l;
	}
	write(stream: Stream, value: number): void {
		stream.writeUInt32(value, Endian.LITTLE);
		stream.writeUInt32(value, Endian.BIG);
	}
	get length() { return 8; }
}

export class UInt16_2lbStruct implements IType {
	read(stream: Stream): number {
		var l = stream.readUInt16(Endian.LITTLE);
		var b = stream.readUInt16(Endian.BIG);
		return l;
	}
	write(stream: Stream, value: number): void {
		stream.writeUInt16(value, Endian.LITTLE);
		stream.writeUInt16(value, Endian.BIG);
	}
	get length() { return 4; }
}

export var UInt32_2lb = new UInt32_2lbStruct();
export var UInt16_2lb = new UInt16_2lbStruct();

export function Stringn(count: number) { return new StructStringn(count); }
export function Stringz(count: number) { return new StructStringz(count); }
