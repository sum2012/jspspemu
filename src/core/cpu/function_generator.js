define(["require", "exports", '../../ast', './instructions', './cpu_ast'], function(require, exports, Ast, CpuInstructions, CpuAst) {
    var Instruction = CpuInstructions.Instruction;
    var Instructions = CpuInstructions.Instructions;
    var DecodedInstruction = CpuInstructions.DecodedInstruction;

    var FunctionGenerator = (function () {
        function FunctionGenerator(memory) {
            this.memory = memory;
            this.instructions = Instructions.instance;
            this.instructionAst = new CpuAst.InstructionAst();
        }
        FunctionGenerator.prototype.decodeInstruction = function (address) {
            var instruction = Instruction.fromMemoryAndPC(this.memory, address);
            var instructionType = this.getInstructionType(instruction);
            return new DecodedInstruction(instruction, instructionType);
        };

        FunctionGenerator.prototype.getInstructionType = function (i) {
            return this.instructions.findByData(i.data, i.PC);
        };

        FunctionGenerator.prototype.generateInstructionAstNode = function (di) {
            var instruction = di.instruction;
            var instructionType = di.type;
            var func = this.instructionAst[instructionType.name];
            if (func === undefined)
                throw (sprintf("Not implemented '%s' at 0x%08X", instructionType, di.instruction.PC));
            return func.call(this.instructionAst, instruction);
        };

        FunctionGenerator.prototype.create = function (address) {
            var _this = this;
            if (address == 0x00000000) {
                throw (new Error("Trying to execute 0x00000000"));
            }

            var ast2 = new Ast.MipsAstBuilder();

            var PC = address;
            var stms = [ast2.functionPrefix()];

            var emitInstruction = function () {
                var result = _this.generateInstructionAstNode(_this.decodeInstruction(PC));
                PC += 4;
                return result;
            };

            for (var n = 0; n < 100000; n++) {
                var di = this.decodeInstruction(PC + 0);

                //console.log(di);
                if (PC == 0x089005D0) {
                    //stms.push(ast.debugger());
                }

                if (di.type.hasDelayedBranch) {
                    var di2 = this.decodeInstruction(PC + 4);

                    stms.push(emitInstruction());

                    var delayedSlotInstruction = emitInstruction();
                    if (di2.type.isSyscall) {
                        stms.push(this.instructionAst._postBranch(PC));
                        stms.push(this.instructionAst._likely(di.type.isLikely, delayedSlotInstruction));
                    } else {
                        stms.push(this.instructionAst._likely(di.type.isLikely, delayedSlotInstruction));
                        stms.push(this.instructionAst._postBranch(PC));
                    }

                    break;
                } else {
                    if (di.type.isSyscall) {
                        stms.push(this.instructionAst._storePC(PC + 4));
                    }
                    stms.push(emitInstruction());
                    if (di.type.isBreak) {
                        break;
                    }
                }
            }

            //console.debug(sprintf("// function_%08X:\n%s", address, ast.stms(stms).toJs()));
            if (n >= 100000)
                throw (new Error(sprintf("Too large function PC=%08X", address)));

            return new Function('state', ast2.stms(stms).toJs());
        };
        return FunctionGenerator;
    })();

    
    return FunctionGenerator;
});
//# sourceMappingURL=function_generator.js.map
