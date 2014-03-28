import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

import controller = require('../../core/controller');

import SceCtrlData = controller.SceCtrlData;

export class sceCtrl {
    constructor(private context: EmulatorContext) { }

    sceCtrlPeekBufferPositive = createNativeFunction(0x3A622550, 150, 'uint', 'void*/int', this, (sceCtrlDataPtr: Stream, count: number) => {
		SceCtrlData.struct.write(sceCtrlDataPtr, this.context.controller.data);
        return 0;
    });

	sceCtrlReadBufferPositive = createNativeFunction(0x1F803938, 150, 'uint', 'void*/int', this, (sceCtrlDataPtr: Stream, count: number) => {
		SceCtrlData.struct.write(sceCtrlDataPtr, this.context.controller.data);

        return this.context.display.waitVblankAsync();
    });

    sceCtrlSetSamplingCycle = createNativeFunction(0x6A2774F3, 150, 'uint', 'int', this, (samplingCycle: number) => {
        console.warn('Not implemented sceCtrl.sceCtrlSetSamplingCycle');
        return 0;
    });

    sceCtrlSetSamplingMode = createNativeFunction(0x1F4011E6, 150, 'uint', 'int', this, (samplingMode: number) => {
        console.warn('Not implemented sceCtrl.sceCtrlSetSamplingMode');
        return 0;
    });
}
