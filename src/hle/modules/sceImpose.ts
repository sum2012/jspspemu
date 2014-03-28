import EmulatorContext = require('../../context');
import utils = require('../utils');
import createNativeFunction = utils.createNativeFunction;

export class sceImpose {
	constructor(private context: EmulatorContext) { }

	sceImposeGetBatteryIconStatus = createNativeFunction(0x8C943191, 150, 'uint', 'void*/void*', this, (isChargingPointer: Stream, iconStatusPointer: Stream) => {
		isChargingPointer.writeInt32(0);
		iconStatusPointer.writeInt32(0);
		return 0;
	});
}
