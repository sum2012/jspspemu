﻿import ast = require('./ast');
import cpu = require('./core/cpu');
import Memory = require('./core/memory');
import EmulatorContext = require('./context');
import controller = require('./core/controller');
import format = require('./format/format');
import detectFormatAsync = format.detectFormatAsync;

import Cso = require('./format/cso');
import Pbp = require('./format/pbp');
import _Iso = require('./format/iso');

import Iso = _Iso.Iso;

import PspCtrlButtons = controller.PspCtrlButtons;

class Emulator {
	private emulatorContext: EmulatorContext;
	private memory: Memory;
	private memoryManager: hle.MemoryManager;
	private fileManager: hle.FileManager;
	private audio: core.PspAudio;
	private canvas: HTMLCanvasElement;
	private webgl_canvas: HTMLCanvasElement;
	private display: core.PspDisplay;
	private gpu: core.gpu.PspGpu;
	private controller: core.PspController;
	private instructionCache: InstructionCache;
	private syscallManager: core.SyscallManager;
	private threadManager: hle.ThreadManager;
	private moduleManager: hle.ModuleManager;

	constructor() {
		this.memory = new Memory();
	}

	stopAsync() {
		if (!this.display) return Promise.resolve();

		return Promise.all([
			this.display.stopAsync(),
			this.controller.stopAsync(),
			this.gpu.stopAsync(),
			this.audio.stopAsync(),
			this.threadManager.stopAsync(),
		]);
	}

	startAsync() {
		return this.stopAsync().then(() => {
			this.memory.reset();
			this.emulatorContext = new EmulatorContext();
			this.memoryManager = new hle.MemoryManager();
			this.audio = new core.PspAudio();
			this.canvas = <HTMLCanvasElement>(document.getElementById('canvas'));
			this.webgl_canvas = <HTMLCanvasElement>(document.getElementById('webgl_canvas'));
			this.display = new core.PspDisplay(this.memory, this.canvas);
			this.gpu = new core.gpu.PspGpu(this.memory, this.webgl_canvas);
			this.controller = new core.PspController();
			this.instructionCache = new InstructionCache(this.memory);
			this.syscallManager = new core.SyscallManager(this.emulatorContext);
			this.fileManager = new hle.FileManager();
			this.threadManager = new hle.ThreadManager(this.memory, this.memoryManager, this.display, this.syscallManager, this.instructionCache);
			this.moduleManager = new hle.ModuleManager(this.emulatorContext);

			this.fileManager.mount('ms0', new hle.vfs.MemoryVfs());

			hle.ModuleManagerSyscalls.registerSyscalls(this.syscallManager, this.moduleManager);

			this.emulatorContext.init(this.display, this.controller, this.gpu, this.memoryManager, this.threadManager, this.audio, this.memory, this.instructionCache, this.fileManager);

			return Promise.all([
				this.display.startAsync(),
				this.controller.startAsync(),
				this.gpu.startAsync(),
				this.audio.startAsync(),
				this.threadManager.startAsync(),
			]);
		});
	}

	private _loadAsync(asyncStream: AsyncStream, pathToFile:string) {
		return format.detectFormatAsync(asyncStream).then(fileFormat => {
			console.info(sprintf('File:: size: %d, format: "%s", name: "%s"', asyncStream.size, fileFormat, asyncStream.name));
			switch (fileFormat) {
				case 'ciso':
					return Cso.fromStreamAsync(asyncStream).then(asyncStream2 => this._loadAsync(asyncStream2, pathToFile));
				case 'pbp':
					return asyncStream.readChunkAsync(0, asyncStream.size).then(executableArrayBuffer => {
						var pbp = Pbp.fromStream(Stream.fromArrayBuffer(executableArrayBuffer));
						return this._loadAsync(new MemoryAsyncStream(pbp.get('psp.data').toArrayBuffer()), pathToFile);
					});
				case 'iso':
					return Iso.fromStreamAsync(asyncStream).then(iso => {
						var isoFs = new hle.vfs.IsoVfs(iso);
						this.fileManager.mount('umd0', isoFs);
						this.fileManager.mount('disc0', isoFs);
						
						return isoFs.open('PSP_GAME/SYSDIR/BOOT.BIN', hle.vfs.FileOpenFlags.Read, parseInt('777', 8)).readAllAsync().then((data) => {
							return this._loadAsync(new MemoryAsyncStream(data), 'umd0:/PSP_GAME/SYSDIR/BOOT.BIN');
						});
					});
				case 'elf':
					return asyncStream.readChunkAsync(0, asyncStream.size).then(executableArrayBuffer => {
						(<hle.vfs.MemoryVfs>this.fileManager.getDevice('ms0').vfs).addFile('/PSP/GAME/virtual/EBOOT.ELF', executableArrayBuffer);

						var elfStream = Stream.fromArrayBuffer(executableArrayBuffer);

						//console.log(new Uint8Array(executableArrayBuffer));
						var pspElf = new hle.elf.PspElfLoader(this.memory, this.memoryManager, this.moduleManager, this.syscallManager);

						pspElf.load(elfStream);

						var moduleInfo = pspElf.moduleInfo;

						var arguments = [pathToFile];
						var argumentsPartition = this.memoryManager.userPartition.allocateLow(0x4000);

						var argument = arguments.map(argument => argument + String.fromCharCode(0)).join('');

						//console.log(argument);

						this.memory.getPointerStream(argumentsPartition.low).writeString(argument);

						//argumentsPartition.low

						// "ms0:/PSP/GAME/virtual/EBOOT.PBP"
						var thread = this.threadManager.create('main', moduleInfo.pc, 10);
						thread.state.GP = moduleInfo.gp;
						thread.state.gpr[4] = argument.length;
						thread.state.gpr[5] = argumentsPartition.low;
						thread.start();
					});

				default:
					throw(new Error(sprintf("Unhandled format '%s'", fileFormat)));
			}
		});
	}

	loadAndExecuteAsync(asyncStream: AsyncStream) {
		return this.startAsync().then(() => {
			return this._loadAsync(asyncStream, "ms0:/PSP/GAME/virtual/EBOOT.PBP");
		}).catch(e => {
			console.error(e);
			console.error(e['stack']);
			throw (e);
		});
	}

	downloadAndExecuteAsync(url: string) {
		return downloadFileAsync(url).then((data) => {
			setImmediate(() => {
				// escape try/catch!
				this.loadAndExecuteAsync(new MemoryAsyncStream(data, url));
			});
		});
	}

	executeFileAsync(file: File) {
		setImmediate(() => {
			// escape try/catch!
			this.loadAndExecuteAsync(new FileAsyncStream(file));
		});
	}
}

function controllerRegister() {
	function createButton(query, button) {
		var jq = $(query);
		function down() { jq.addClass('pressed'); window['emulator'].controller.simulateButtonDown(button); }
		function up() { jq.removeClass('pressed'); window['emulator'].controller.simulateButtonUp(button); }

		jq
			.mousedown(down)
			.mouseup(up)
			.on('touchstart', down)
			.on('touchend', up)
		;
	}

	createButton('#button_left', PspCtrlButtons.left);
	createButton('#button_up', PspCtrlButtons.up);
	createButton('#button_down', PspCtrlButtons.down);
	createButton('#button_right', PspCtrlButtons.right);

	createButton('#button_up_left', PspCtrlButtons.up | PspCtrlButtons.left);
	createButton('#button_up_right', PspCtrlButtons.up | PspCtrlButtons.right);
	createButton('#button_down_left', PspCtrlButtons.down | PspCtrlButtons.left);
	createButton('#button_down_right', PspCtrlButtons.down | PspCtrlButtons.right);

	createButton('#button_cross', PspCtrlButtons.cross);
	createButton('#button_circle', PspCtrlButtons.circle);
	createButton('#button_triangle', PspCtrlButtons.triangle);
	createButton('#button_square', PspCtrlButtons.square);

	createButton('#button_l', PspCtrlButtons.leftTrigger);
	createButton('#button_r', PspCtrlButtons.rightTrigger);

	createButton('#button_start', PspCtrlButtons.start);
	createButton('#button_select', PspCtrlButtons.select);

	//document['ontouchmove'] = (e) => { e.preventDefault(); };

	//document.onselectstart = () => { return false; };
}

var emulator = new Emulator();

export function main() {
	var sampleDemo = '';

	if (document.location.hash) {
		sampleDemo = document.location.hash.substr(1);
	}

	if (sampleDemo) {
		emulator.downloadAndExecuteAsync(sampleDemo);
	}
}

main();

