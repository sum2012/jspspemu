import Ast = require('../../ast');
import Memory = require('../memory');
import CpuInstructions = require('./instructions');

import CpuAst = require('./cpu_ast');

import Instruction = CpuInstructions.Instruction;
import Instructions = CpuInstructions.Instructions;
import DecodedInstruction = CpuInstructions.DecodedInstruction;

class FunctionGenerator {
	private instructions: Instructions = Instructions.instance;
	private instructionAst = new CpuAst.InstructionAst();

	constructor(public memory: Memory) {
	}

	private decodeInstruction(address: number) {
		var instruction = Instruction.fromMemoryAndPC(this.memory, address);
		var instructionType = this.getInstructionType(instruction);
		return new DecodedInstruction(instruction, instructionType);
	}

	private getInstructionType(i: Instruction) {
		return this.instructions.findByData(i.data, i.PC);
	}

	private generateInstructionAstNode(di: DecodedInstruction): Ast.ANodeStm {
		var instruction = di.instruction;
		var instructionType = di.type;
		var func: Function = this.instructionAst[instructionType.name];
		if (func === undefined) throw (sprintf("Not implemented '%s' at 0x%08X", instructionType, di.instruction.PC));
		return func.call(this.instructionAst, instruction);
	}

	create(address: number) {
		if (address == 0x00000000) {
			throw (new Error("Trying to execute 0x00000000"));
		}

		var ast2 = new Ast.MipsAstBuilder();

		var PC = address;
		var stms: Ast.ANodeStm[] = [ast2.functionPrefix()];

		var emitInstruction = () => {
			var result = this.generateInstructionAstNode(this.decodeInstruction(PC))
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
				}
				else {
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

		if (n >= 100000) throw (new Error(sprintf("Too large function PC=%08X", address)));

		return new Function('state', ast2.stms(stms).toJs());
	}
}

export = FunctionGenerator;
