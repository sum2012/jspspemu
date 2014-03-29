define(["require", "exports", './cpu/function_generator', './cpu/instruction_cache'], function(require, exports, FunctionGenerator, InstructionCache) {
    var CpuState = cpu_state.CpuState;
    exports.CpuState = CpuState;

    var NativeFunction = Syscall.NativeFunction;
    exports.NativeFunction = NativeFunction;
    var SyscallManager = Syscall.SyscallManager;
    exports.SyscallManager = SyscallManager;

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
    var InstructionReader = CpuInstructions.InstructionReader;
    exports.InstructionReader = InstructionReader;

    exports.FunctionGenerator = FunctionGenerator;
    exports.InstructionCache = InstructionCache;

    var MipsAssembler = Assembler.MipsAssembler;
    exports.MipsAssembler = MipsAssembler;
    var MipsDisassembler = Assembler.MipsDisassembler;
    exports.MipsDisassembler = MipsDisassembler;
});
//# sourceMappingURL=cpu.js.map
