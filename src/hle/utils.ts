﻿import EmulatorContext = require('../context');
import cpu = require('../core/cpu');
import math = require('../util/math');

import MathUtils = math.MathUtils;
import CpuState = cpu.CpuState;
import NativeFunction = cpu.NativeFunction;

export function createNativeFunction(exportId: number, firmwareVersion: number, retval: string, arguments: string, _this: any, internalFunc: Function) {
    var code = '';

    var args = [];
    var argindex = 4;

    function readGpr32() {
		return 'state.gpr[' + argindex++ + ']';
    }

	function readGpr64() {
		argindex = MathUtils.nextAligned(argindex, 2);
		var gprLow = readGpr32();
		var gprHigh = readGpr32();
		return sprintf('%s + %s * Math.pow(2, 32)', gprLow, gprHigh);
	}

    arguments.split('/').forEach(item => {
        switch (item) {
            case 'EmulatorContext': args.push('context'); break;
            case 'HleThread': args.push('state.thread'); break;
            case 'CpuState': args.push('state'); break;
            case 'Memory': args.push('state.memory'); break;
            case 'string': args.push('state.memory.readStringz(' + readGpr32() + ')'); break;
			case 'uint': case 'int': args.push(readGpr32()); break;
			case 'ulong': case 'long': args.push(readGpr64()); break;
            case 'void*': args.push('state.getPointerStream(' + readGpr32() + ')'); break;
            case '': break;
            default: throw ('Invalid argument "' + item + '"');
        }
    });

    code += 'var result = internalFunc.apply(_this, [' + args.join(', ') + ']);';

    code += 'if (typeof result == "object") { state.thread.suspendUntilPromiseDone(result); throw (new CpuBreakException()); } ';

    switch (retval) {
        case 'void': break;
        //case 'Promise': code += 'state.thread.suspendUntilPromiseDone(result);'; break; break;
        case 'uint': case 'int': code += 'state.V0 = result | 0;'; break;
        case 'long':
            code += 'state.V0 = (result >>> 0) & 0xFFFFFFFF; state.V1 = (result >>> 32) & 0xFFFFFFFF;'; break;
            break;
        default: throw ('Invalid return value "' + retval + '"');
    }

    var out = new NativeFunction();
    out.name = 'unknown';
    out.nid = exportId;
    out.firmwareVersion = firmwareVersion;
    //console.log(code);
    var func = <any>new Function('_this', 'internalFunc', 'context', 'state', code);
	out.call = (context: EmulatorContext, state: CpuState) => {
        func(_this, internalFunc, context, state);
    };
    //console.log(out);
    return out;
}
