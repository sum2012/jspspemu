///<reference path="../../typings/promise/promise.d.ts" />

function compare<T>(a: T, b: T): number {
	if (a < b) return -1;
	if (a > b) return +1;
	return 0;
}

function identity<T>(a: T) { return a; }

interface Array<T> {
	remove(item: T);
	sortBy(item: (item: T) => any): T[];
	first(filter?: (item: T) => boolean): T;
	sum<Q>(selector?: (item: T) => Q);
	max<Q>(selector?: (item: T) => Q);
}

Array.prototype.max = <any>(function (selector: Function) {
	var array = <any[]>this;
	if (!selector) selector = a => a;
	return array.reduce((previous, current) => { return Math.max(previous, selector(current)); }, selector(array[0]));
});

Array.prototype.sortBy = function (selector: Function) {
	return (<any[]>this).slice(0).sort((a, b) => compare(selector(a), selector(b)));
};

Array.prototype.first = <any>(function (selector: Function) {
	var array = <any[]>this;
	if (!selector) selector = identity;
	for (var n = 0; n < array.length; n++) if (selector(array[n])) return array[n];
	return undefined;
});

Array.prototype.sum = <any>(function (selector: Function) {
	var array = <any[]>this;
	if (!selector) selector = a => a;
	return array.reduce((previous, current) => { return previous + selector(current); }, 0);
});

Array.prototype.remove = function (item) {
	var array = <any[]>this;
	var index = array.indexOf(item);
	if (index >= 0) array.splice(index, 1);
};

interface ArrayBuffer {
	slice(begin: number, end?: number): ArrayBuffer;
}

if (!ArrayBuffer.prototype.slice) {
	ArrayBuffer.prototype.slice = function (begin: number, end?: number): ArrayBuffer {
		var that = new Uint8Array(this);
		if (end == undefined) end = that.length;
		var result = new ArrayBuffer(end - begin);
		var resultArray = new Uint8Array(result);
		for (var i = 0; i < resultArray.length; i++) resultArray[i] = that[i + begin];
		return result;
	};
}

interface NumberDictionary<V> {
	[key: number]: V;
}

interface StringDictionary<V> {
	[key: string]: V;
}

function String_repeat(str: string, num: number) {
	return new Array(num + 1).join(str);
}

interface String {
	rstrip(): string;
	contains(value: string): boolean;
}

String.prototype.rstrip = function () {
	var string = <string>this;
	return string.replace(/\s+$/, '');
};

String.prototype.contains = function (value: string) {
	var string = <string>this;
	return string.indexOf(value) >= 0;
};

class ArrayBufferUtils {
	static fromUInt8Array(input: Uint8Array) {
		return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
	}

	static concat(chunks: ArrayBuffer[]) {
		var tmp = new Uint8Array(chunks.sum(chunk => chunk.byteLength));
		var offset = 0;
		chunks.forEach(chunk => {
			tmp.set(new Uint8Array(chunk), offset);
			offset += chunk.byteLength;
		});
		return tmp.buffer;
	}
}

function setImmediate(callback: () => void) {
	setTimeout(callback, 0);
}

declare function escape(input: string): string;
declare function unescape(input: string): string;

class Utf8 {
	static decode(input: string): string {
		return decodeURIComponent(escape(input));
	}

	static encode(input: string): string {
		return unescape(encodeURIComponent(input));
	}
}

declare function sprintf(...args: any[]);
declare function printf(...args: any[]);

interface AudioNode {
	context: AudioContext;
	numberOfInputs: number;
	numberOfOutputs: number;
	channelCount: number;
	channelCountMode: string;
	channelInterpretation: any;

	connect(to: AudioNode);
	disconnect();
}

interface AudioBuffer {
	sampleRate: number;
	length: number;
	duration: number;
	numberOfChannels: number;
	getChannelData(channel: number): Float32Array;
}

interface AudioProcessingEvent extends Event {
	playbackTime: number;
	inputBuffer: AudioBuffer;
	outputBuffer: AudioBuffer;
}

interface ScriptProcessorNode extends AudioNode {
	bufferSize: number;
	onaudioprocess: Function;
}

interface AudioDestinationNode extends AudioNode {
	maxChannelCount: number;
}

interface AudioContext {
	createScriptProcessor(bufferSize: number, numInputChannels: number, numOutputChannels: number): ScriptProcessorNode;
	destination: AudioDestinationNode;
	sampleRate: number;
	currentTime: number;
	//listener: AudioListener;
}

declare var AudioContext: {
	new (): AudioContext;
};

window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];

interface PromiseGenerator<T> {
	(): Promise<T>;
}

class PromiseUtils {
	static sequence<T>(generators: PromiseGenerator<T>[]) {
		return new Promise((resolve, reject) => {
			generators = generators.slice(0);
			function step() {
				if (generators.length > 0) {
					var generator = generators.shift();
					var promise = generator();
					promise.then(step);
				} else {
					resolve();
				}
			}
			step();
		});
	}

	static delayAsync(ms: number) {
		return new Promise((resolve, reject) => setTimeout(resolve, ms));
	}
}

declare var vec4: {
	create(): number[];
	fromValues(x: number, y: number, z: number, w: number): number[];
	transformMat4(out: number[], a: number[], m: number[]): number[]
};

declare var mat4: {
	create(): number[];
	clone(a: number[]): number[];
	copy(out: number[], a: number[]): number[];
	identity(a: number[]): number[];
	multiply(out: number[], a: number[], b: number[]): number[];
	ortho(out: number[], left: number, right: number, bottom: number, top: number, near: number, far: number): number[];
};

window['requestFileSystem'] = window['requestFileSystem'] || window['webkitRequestFileSystem'];

function downloadFileAsync(url: string) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		var request = new XMLHttpRequest();

		request.open("GET", url, true);
		request.overrideMimeType("text/plain; charset=x-user-defined");
		request.responseType = "arraybuffer";
		request.onload = function (e) {
			var arraybuffer: ArrayBuffer = request.response; // not responseText
			//var data = new Uint8Array(arraybuffer);
			resolve(arraybuffer);
			//console.log(data);
			//console.log(data.length);
		};
		request.onerror = function (e) {
			reject(e.error);
		};
		request.send();
	});
}

class SortedSet<T> {
	public elements: T[] = [];

	has(element: T) {
		return this.elements.indexOf(element) >= 0;
	}

	add(element: T) {
		if (!this.has(element)) this.elements.push(element);
		return element;
	}

	get length() { return this.elements.length; }

	delete(element: T) {
		this.elements.remove(element);
	}

	filter(callback: (value: T, index: number, array: T[]) => boolean) {
		return this.elements.filter(callback);
	}

	forEach(callback: (element: T) => void) {
		this.elements.slice(0).forEach(callback);
	}
}

class UidCollection<T> {
	private items: NumberDictionary<T> = {};

	constructor(private lastId: number = 1) {
	}

	allocate(item: T) {
		var id = this.lastId++;
		this.items[id] = item;
		return id;
	}

	get(id: number) {
		return this.items[id];
	}

	remove(id: number) {
		delete this.items[id];
	}
}

class Signal {
	callbacks = new SortedSet<Function>();

	add(callback: Function) {
		this.callbacks.add(callback);
	}

	remove(callback: Function) {
		this.callbacks.delete(callback);
	}

	once(callback: Function) {
		var once = () => {
			this.remove(once);
			callback();
		};
		this.add(once);
	}

	dispatch() {
		this.callbacks.forEach((callback) => {
			callback();
		});
	}
}

