import EmulatorContext = require('../../context');
import utils = require('../utils');
import stream = require('../../util/stream');
import Stream = stream.Stream;
import createNativeFunction = utils.createNativeFunction;

export class sceImpose {
	constructor(private context: EmulatorContext) { }

	sceImposeGetBatteryIconStatus = createNativeFunction(0x8C943191, 150, 'uint', 'void*/void*', this, (isChargingPointer: Stream, iconStatusPointer: Stream) => {
		isChargingPointer.writeInt32(0);
		iconStatusPointer.writeInt32(0);
		return 0;
	});
}
