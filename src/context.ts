import Display = require('core/display');
import Controller = require('core/controller');

import IPspDisplay = Display.IPspDisplay;
import IPspController = Controller.IPspController;

class EmulatorContext {
	display: IPspDisplay;
	controller: IPspController;
	gpu: core.gpu.IPspGpu;
	memoryManager: hle.MemoryManager;
	threadManager: hle.ThreadManager;
	audio: core.PspAudio;
	memory: core.Memory;
	instructionCache: InstructionCache;
	fileManager: hle.FileManager;

	constructor() {
	}

	init(display: IPspDisplay, controller: IPspController, gpu: core.gpu.IPspGpu, memoryManager: hle.MemoryManager, threadManager: hle.ThreadManager, audio: core.PspAudio, memory: core.Memory, instructionCache: InstructionCache, fileManager: hle.FileManager) {
		this.display = display;
		this.controller = controller;
		this.gpu = gpu;
		this.memoryManager = memoryManager;
		this.threadManager = threadManager;
		this.audio = audio;
		this.memory = memory;
		this.instructionCache = instructionCache;
		this.fileManager = fileManager;
	}
}

export = EmulatorContext;