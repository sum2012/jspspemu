import Memory = require('./memory');
import Display = require('./display');
import GpuOpcodes = require('gpu/opcodes');
import State = require('gpu/state');

import WebGlPspDrawDriver = require('gpu/gpu_webgl');

import Matrix4x3 = State.Matrix4x3;
import Matrix4x4 = State.Matrix4x4;
import Vertex = State.Vertex;
import VertexState = State.VertexState;
import ColorEnum = State.ColorEnum;
import NumericEnum = State.NumericEnum;
import GpuState = State.GpuState;
import TextureFilter = State.TextureFilter;
import WrapMode = State.WrapMode;
import CullingDirection = State.CullingDirection;
import PrimitiveType = State.PrimitiveType;
import SyncType = State.SyncType;
import TextureColorComponent = State.TextureColorComponent;
import TextureEffect = State.TextureEffect;
import IDrawDriver = State.IDrawDriver;

import PixelFormat = Display.PixelFormat;


export interface IPspGpu {
    startAsync();
    stopAsync();

    listEnqueue(start: number, stall: number, callbackId: number, argsPtr: Stream);
    listSync(displayListId: number, syncType: SyncType);
    updateStallAddr(displayListId: number, stall: number);
    drawSync(syncType: SyncType);
}

class VertexBuffer {
    vertices: Vertex[] = [];

    constructor() {
        for (var n = 0; n < 1024; n++) this.vertices[n] = new Vertex();
    }
}

export class VertexReaderFactory {
    private static cache: NumberDictionary<VertexReader> = {};

    static get(vertexState: VertexState): VertexReader {
		var cacheId = vertexState.hash;
        var vertexReader = this.cache[cacheId];
        if (vertexReader !== undefined) return vertexReader;
		return this.cache[cacheId] = new VertexReader(vertexState);
    }
}

export class VertexReader {
    private readOneFunc: (output: Vertex, input: DataView, inputOffset: number) => void;
    private readOffset: number = 0;
    public readCode: string;

	constructor(private vertexState: VertexState) {
        this.readCode = this.createJs();
        this.readOneFunc = <any>(new Function('output', 'input', 'inputOffset', this.readCode));
    }

    readCount(output: Vertex[], input: DataView, count: number) {
        var inputOffset = 0;
        for (var n = 0; n < count; n++) {
            this.readOneFunc(output[n], input, inputOffset);
            inputOffset += this.vertexState.size;
        }
    }

    read(output: Vertex, input: DataView, inputOffset: number) {
        this.readOneFunc(output, input, inputOffset);
    }

    private createJs() {
        var indentStringGenerator = new IndentStringGenerator();

        this.readOffset = 0;

		this.createNumberJs(indentStringGenerator, ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'].slice(0, this.vertexState.realWeightCount), this.vertexState.weight, !this.vertexState.transform2D);
		this.createNumberJs(indentStringGenerator, ['tx', 'ty', 'tx'].slice(0, this.vertexState.textureComponentCount), this.vertexState.texture, !this.vertexState.transform2D);
		this.createColorJs(indentStringGenerator, this.vertexState.color);
		this.createNumberJs(indentStringGenerator, ['nx', 'ny', 'nz'], this.vertexState.normal, !this.vertexState.transform2D);
		this.createNumberJs(indentStringGenerator, ['px', 'py', 'pz'], this.vertexState.position, !this.vertexState.transform2D);

        return indentStringGenerator.output;
    }

    private createColorJs(indentStringGenerator:IndentStringGenerator, type: ColorEnum) {
        if (type == ColorEnum.Void) return;

        switch (type) {
            case ColorEnum.Color8888:
                this.align(4);
                indentStringGenerator.write('output.r = (input.getUint8(inputOffset + ' + this.getOffsetAlignAndIncrement(1) + ') / 255.0);\n');
				indentStringGenerator.write('output.g = (input.getUint8(inputOffset + ' + this.getOffsetAlignAndIncrement(1) + ') / 255.0);\n');
				indentStringGenerator.write('output.b = (input.getUint8(inputOffset + ' + this.getOffsetAlignAndIncrement(1) + ') / 255.0);\n');
				indentStringGenerator.write('output.a = (input.getUint8(inputOffset + ' + this.getOffsetAlignAndIncrement(1) + ') / 255.0);\n');
                break;
            default:
                throw("Not implemented color format");
        }
    }

    private align(count: number) {
        this.readOffset = MathUtils.nextAligned(this.readOffset, count);
    }

    private getOffsetAlignAndIncrement(size: number) {
        this.align(size);
        var offset = this.readOffset;
        this.readOffset += size;
        return offset;
    }

    private createNumberJs(indentStringGenerator: IndentStringGenerator, components: string[], type: NumericEnum, normalize: boolean) {
        if (type == NumericEnum.Void) return;

        components.forEach((component) => {
            switch (type) {
                case NumericEnum.Byte:
                    indentStringGenerator.write('output.' + component + ' = (input.getInt8(inputOffset + ' + this.getOffsetAlignAndIncrement(1) + ')');
                    if (normalize) indentStringGenerator.write(' / 127.0');
                    break;
                case NumericEnum.Short:
                    indentStringGenerator.write('output.' + component + ' = (input.getInt16(inputOffset + ' + this.getOffsetAlignAndIncrement(2) + ', true)');
                    if (normalize) indentStringGenerator.write(' / 32767.0');
                    break;
                case NumericEnum.Float:
                    indentStringGenerator.write('output.' + component + ' = (input.getFloat32(inputOffset + ' + this.getOffsetAlignAndIncrement(4) + ', true)');
                    break;
            }
            indentStringGenerator.write(');\n');
        });
    }
}

var vertexBuffer = new VertexBuffer();
var singleCallTest = false;

class PspGpuList {
    current: number;
    stall: number;
    callbackId: number;
    completed: boolean = false;
	state: GpuState = new GpuState();
	private promise: Promise<any>;
	private promiseResolve: Function;
	private promiseReject: Function;
	private errorCount: number = 0;

    constructor(public id: number, private memory: Memory, private drawDriver:IDrawDriver, private runner: PspGpuListRunner) {
    }

    private complete() {
        this.completed = true;
		this.runner.deallocate(this);
		this.promiseResolve(0);
    }

    private jumpRelativeOffset(offset:number) {
        this.current = this.state.baseAddress + offset;
	}

    private runInstruction(current: number, instruction: number) {
        var op: GpuOpcodes = instruction >>> 24;
        var params24: number = instruction & 0xFFFFFF;

		switch (op) {
			case GpuOpcodes.IADDR:
				this.state.indexAddress = params24;
				break;
			case GpuOpcodes.OFFSET_ADDR:
				this.state.baseOffset = (params24 << 8);
				break;
            case GpuOpcodes.FBP:
                this.state.frameBuffer.lowAddress = params24;
				break;
			case GpuOpcodes.REGION1:
				this.state.viewPort.x1 = BitUtils.extract(params24, 0, 10);
				this.state.viewPort.y1 = BitUtils.extract(params24, 10, 10);
				break;
			case GpuOpcodes.REGION2:
				this.state.viewPort.x2 = BitUtils.extract(params24, 0, 10);
				this.state.viewPort.y2 = BitUtils.extract(params24, 10, 10);
				break;			
            case GpuOpcodes.FBW:
                this.state.frameBuffer.highAddress = BitUtils.extract(params24, 16, 8);
                this.state.frameBuffer.width = BitUtils.extract(params24, 0, 16);
				break;
			case GpuOpcodes.LTE:
				this.state.lightning.enabled = params24 != 0;
				break;
			case GpuOpcodes.LTE0: this.state.lightning.lights[0].enabled = params24 != 0; break;
			case GpuOpcodes.LTE1: this.state.lightning.lights[1].enabled = params24 != 0; break;
			case GpuOpcodes.LTE2: this.state.lightning.lights[2].enabled = params24 != 0; break;
			case GpuOpcodes.LTE3: this.state.lightning.lights[3].enabled = params24 != 0; break;
            case GpuOpcodes.BASE: this.state.baseAddress = ((params24 << 8) & 0xff000000); break;
            case GpuOpcodes.JUMP: this.jumpRelativeOffset(params24 & ~3); break;
            case GpuOpcodes.NOP: break;
            case GpuOpcodes.VTYPE: this.state.vertex.value = params24; break;
			case GpuOpcodes.VADDR: this.state.vertex.address = params24; break;
			case GpuOpcodes.TMODE:
				this.state.texture.swizzled = BitUtils.extract(params24, 0, 8) != 0;
				this.state.texture.mipmapShareClut = BitUtils.extract(params24, 8, 8) != 0;
				this.state.texture.mipmapMaxLevel = BitUtils.extract(params24, 16, 8);
				break;
			case GpuOpcodes.TFLT:
				this.state.texture.filterMinification = <TextureFilter>BitUtils.extract(params24, 0, 8);
				this.state.texture.filterMagnification = <TextureFilter>BitUtils.extract(params24, 8, 8);
				break;
			case GpuOpcodes.TWRAP:
				this.state.texture.wrapU = <WrapMode>BitUtils.extract(params24, 0, 8);
				this.state.texture.wrapV = <WrapMode>BitUtils.extract(params24, 8, 8);
				break;

			case GpuOpcodes.TME: this.state.texture.enabled = (params24 != 0); break;

			case GpuOpcodes.TEC:
				this.state.texture.envColor.r = BitUtils.extractScale(params24, 0, 8, 1);
				this.state.texture.envColor.g = BitUtils.extractScale(params24, 8, 8, 1);
				this.state.texture.envColor.b = BitUtils.extractScale(params24, 16, 8, 1);
				break;

			case GpuOpcodes.TFUNC:
				this.state.texture.effect = <TextureEffect>BitUtils.extract(params24, 0, 8);
				this.state.texture.colorComponent = <TextureColorComponent>BitUtils.extract(params24, 8, 8);
				this.state.texture.fragment2X = (BitUtils.extract(params24, 16, 8) != 0);
				break;
			case GpuOpcodes.UOFFSET: this.state.texture.offsetU = MathFloat.reinterpretIntAsFloat(params24 << 8); break;
			case GpuOpcodes.VOFFSET: this.state.texture.offsetV = MathFloat.reinterpretIntAsFloat(params24 << 8); break;

			case GpuOpcodes.USCALE: this.state.texture.scaleU = MathFloat.reinterpretIntAsFloat(params24 << 8); break;
			case GpuOpcodes.VSCALE: this.state.texture.scaleV = MathFloat.reinterpretIntAsFloat(params24 << 8); break;

			case GpuOpcodes.TFLUSH: this.drawDriver.textureFlush(this.state); break;
			case GpuOpcodes.TPSM: this.state.texture.pixelFormat = <PixelFormat>BitUtils.extract(params24, 0, 4); break;

			case GpuOpcodes.TSIZE0:
			case GpuOpcodes.TSIZE1:
			case GpuOpcodes.TSIZE2:
			case GpuOpcodes.TSIZE3:
			case GpuOpcodes.TSIZE4:
			case GpuOpcodes.TSIZE5:
			case GpuOpcodes.TSIZE6:
			case GpuOpcodes.TSIZE7:
				var mipMap = this.state.texture.mipmaps[op - GpuOpcodes.TSIZE0];
				var WidthExp = BitUtils.extract(params24, 0, 4);
				var HeightExp = BitUtils.extract(params24, 8, 4);
				var UnknownFlag = (BitUtils.extract(params24, 15, 1) != 0);
				WidthExp = Math.min(WidthExp, 9);
				HeightExp = Math.min(HeightExp, 9);
				mipMap.textureWidth = 1 << WidthExp;
				mipMap.textureHeight = 1 << HeightExp;

				break;

			case GpuOpcodes.TBP0:
			case GpuOpcodes.TBP1:
			case GpuOpcodes.TBP2:
			case GpuOpcodes.TBP3:
			case GpuOpcodes.TBP4:
			case GpuOpcodes.TBP5:
			case GpuOpcodes.TBP6:
			case GpuOpcodes.TBP7:
				var mipMap = this.state.texture.mipmaps[op - GpuOpcodes.TBP0];
				mipMap.address = (mipMap.address & 0xFF000000) | (params24 & 0x00FFFFFF);
				break;

			case GpuOpcodes.TBW0:
			case GpuOpcodes.TBW1:
			case GpuOpcodes.TBW2:
			case GpuOpcodes.TBW3:
			case GpuOpcodes.TBW4:
			case GpuOpcodes.TBW5:
			case GpuOpcodes.TBW6:
			case GpuOpcodes.TBW7:
				var mipMap = this.state.texture.mipmaps[op - GpuOpcodes.TBW0];
				mipMap.bufferWidth = BitUtils.extract(params24, 0, 16);
				mipMap.address = (mipMap.address & 0x00FFFFFF) | ((BitUtils.extract(params24, 16, 8) << 24) & 0xFF000000);
				break;

			case GpuOpcodes.CBP:
				this.state.texture.clut.adress = (this.state.texture.clut.adress & 0xFF000000) | ((params24 << 0) & 0x00FFFFFF);
				break;

			case GpuOpcodes.CBPH:
				this.state.texture.clut.adress = (this.state.texture.clut.adress & 0x00FFFFFF) | ((params24 << 8) & 0xFF000000);
				break;

			case GpuOpcodes.CLOAD:
				this.state.texture.clut.numberOfColors = BitUtils.extract(params24, 0, 8) * 8;
				break;

			case GpuOpcodes.CMODE:
				this.state.texture.clut.pixelFormat = <PixelFormat>BitUtils.extract(params24, 0, 2);
				this.state.texture.clut.shift = BitUtils.extract(params24, 2, 5);
				this.state.texture.clut.mask = BitUtils.extract(params24, 8, 8);
				this.state.texture.clut.start = BitUtils.extract(params24, 16, 5);
				break;

            case GpuOpcodes.PROJ_START: this.state.projectionMatrix.reset(params24); break;
            case GpuOpcodes.PROJ_PUT: this.state.projectionMatrix.put(MathFloat.reinterpretIntAsFloat(params24 << 8)); break;

            case GpuOpcodes.VIEW_START: this.state.viewMatrix.reset(params24); break;
            case GpuOpcodes.VIEW_PUT: this.state.viewMatrix.put(MathFloat.reinterpretIntAsFloat(params24 << 8)); break;

            case GpuOpcodes.WORLD_START: this.state.worldMatrix.reset(params24); break;
            case GpuOpcodes.WORLD_PUT: this.state.worldMatrix.put(MathFloat.reinterpretIntAsFloat(params24 << 8)); break;

            case GpuOpcodes.CLEAR:
                this.state.clearing = (BitUtils.extract(params24, 0, 1) != 0);
                this.state.clearFlags = BitUtils.extract(params24, 8, 8);
                this.drawDriver.setClearMode(this.state.clearing, this.state.clearFlags);
				break;

			case GpuOpcodes.BCE: this.state.culling.enabled = (params24 != 0);
			case GpuOpcodes.FFACE:
				this.state.culling.direction = <CullingDirection>params24; // FrontFaceDirectionEnum
				break;

			case GpuOpcodes.PRIM:
				//console.log('GPU PRIM');

                var primitiveType = BitUtils.extractEnum<PrimitiveType>(params24, 16, 3);
                var vertexCount = BitUtils.extract(params24, 0, 16);
                var vertexState = this.state.vertex;
                var vertexSize = this.state.vertex.size;
				var vertexAddress = this.state.baseAddress + this.state.vertex.address;
				var vertexReader = VertexReaderFactory.get(vertexState);
                var vertexInput = this.memory.getPointerDataView(vertexAddress);
                var vertices = vertexBuffer.vertices;
				vertexReader.readCount(vertices, vertexInput, vertexCount);

                this.drawDriver.setMatrices(this.state.projectionMatrix, this.state.viewMatrix, this.state.worldMatrix);
				this.drawDriver.setState(this.state);

				if (this.errorCount < 400) {
					//console.log('PRIM:' + primitiveType + ' : ' + vertexCount + ':' + vertexState.hasIndex);
				}


				this.drawDriver.drawElements(primitiveType, vertices, vertexCount, vertexState);

                break;

            case GpuOpcodes.FINISH:
                break;

			case GpuOpcodes.END:
					
                this.complete();
                return true;
                break;

            default:
				//setTimeout(() => this.complete(), 50);
				this.errorCount++;
				if (this.errorCount >= 400) {
					if (this.errorCount == 400) {
						console.error(sprintf('Stop showing gpu errors'));
					}
				} else {
					//console.error(sprintf('Not implemented gpu opcode 0x%02X : %s', op, GpuOpCodes[op]));
				}
        }

        return false;
    }

    private get hasMoreInstructions() {
        return !this.completed && ((this.stall == 0) || (this.current < this.stall));
    }

    private runUntilStall() {
        while (this.hasMoreInstructions) {
            var instruction = this.memory.readUInt32(this.current);
            this.current += 4
            if (this.runInstruction(this.current - 4, instruction)) return;
        }
    }

    private enqueueRunUntilStall() {
        setImmediate(() => {
            this.runUntilStall();
        });
    }

    updateStall(stall: number) {
        this.stall = stall;
        this.enqueueRunUntilStall();
    }

	start() {
		this.promise = new Promise((resolve, reject) => {
			this.promiseResolve = resolve;
			this.promiseReject = reject;
		});
        this.completed = false;

        this.enqueueRunUntilStall();
    }

    waitAsync() {
        return this.promise;
    }
}

class PspGpuListRunner {
    private lists: PspGpuList[] = [];
    private freeLists: PspGpuList[] = [];
    private runningLists: PspGpuList[] = [];

    constructor(private memory: Memory, private drawDriver: IDrawDriver) {
        for (var n = 0; n < 32; n++) {
            var list = new PspGpuList(n, memory, drawDriver, this);
            this.lists.push(list);
            this.freeLists.push(list);
        }
    }

    allocate() {
        if (!this.freeLists.length) throw('Out of gpu free lists');
        var list = this.freeLists.pop();
        this.runningLists.push(list);
        return list;
    }

    getById(id: number) {
        return this.lists[id];
    }

    deallocate(list: PspGpuList) {
        this.freeLists.push(list);
        this.runningLists.remove(list);
    }

	waitAsync() {
		return Promise.all(this.runningLists.map(list => list.waitAsync())).then(() => 0);
    }
}

export class PspGpu implements IPspGpu {
    //private gl: WebGLRenderingContext;
	private listRunner: PspGpuListRunner;
	driver: IDrawDriver;

	constructor(private memory: Memory, private canvas: HTMLCanvasElement) {
		this.driver = new WebGlPspDrawDriver(memory, canvas);
		//this.driver = new Context2dPspDrawDriver(memory, canvas);
        this.listRunner = new PspGpuListRunner(memory, this.driver);
    }

	startAsync() {
		return this.driver.initAsync();
    }

	stopAsync() {
		return Promise.resolve();
    }

        
    listEnqueue(start: number, stall: number, callbackId: number, argsPtr: Stream) {
        var list = this.listRunner.allocate();
        list.current = start;
        list.stall = stall;
        list.callbackId = callbackId;
        list.start();
        return list.id;
    }

    listSync(displayListId: number, syncType: SyncType) {
        //console.log('listSync');
        return this.listRunner.getById(displayListId).waitAsync();
    }

    updateStallAddr(displayListId: number, stall: number) {
        this.listRunner.getById(displayListId).updateStall(stall);
        return 0;
    }

	drawSync(syncType: SyncType) {
		//console.log('drawSync');
        return this.listRunner.waitAsync();
    }
}
