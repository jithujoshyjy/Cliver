import { type TokenStream } from "../lexer/token.js";
import { skip, skipables, type Node } from "./utility.js";
import { generateProgram } from "./program.js";

let context: Node = {
    type: "Program",
    value: [],
    start: 0,
    end: 0
} as Program

export function generateAST(tokens: TokenStream): Program {
    const program = context as Program

    skip(tokens, skipables)
    const value = generateProgram(context, tokens)

    const isMismatchToken = !Array.isArray(value)
    if (isMismatchToken)
        throw new Error(value.error);

    program.value = value

    return program
}