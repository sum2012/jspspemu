define(["require", "exports", './cpu/state', './cpu/function_generator', './cpu/instruction_cache'], function(require, exports, CpuState, FunctionGenerator, InstructionCache) {
    var SyscallManager = Syscall.SyscallManager;
    exports.SyscallManager = SyscallManager;

    exports.CpuState = CpuState;

    var CpuSpecialAddresses = Interop.CpuSpecialAddresses;
    exports.CpuSpecialAddresses = CpuSpecialAddresses;
    var CpuBreakException = Interop.CpuBreakException;
    exports.CpuBreakException = CpuBreakException;

    var Instruction = CpuInstructions.Instruction;
    exports.Instruction = Instruction;
    var Instructions = CpuInstructions.Instructions;
    exports.Instructions = Instructions;
    var DecodedInstruction = CpuInstructions.DecodedInstruction;
    exports.DecodedInstruction = DecodedInstruction;

    exports.FunctionGenerator = FunctionGenerator;
    exports.InstructionCache = InstructionCache;

    var MipsAssembler = Assembler.MipsAssembler;
    exports.MipsAssembler = MipsAssembler;
    var MipsDisassembler = Assembler.MipsDisassembler;
    exports.MipsDisassembler = MipsDisassembler;
});
//# sourceMappingURL=cpu.js.map
