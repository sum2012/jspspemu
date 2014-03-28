export class CpuBreakException implements Error {
	constructor(public name: string = 'CpuBreakException', public message: string = 'CpuBreakException') {
	}
}

export enum CpuSpecialAddresses {
	EXIT_THREAD = 0x0FFFFFFF,
}
