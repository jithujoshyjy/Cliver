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
    const nodeGenerator = generateProgram(context, tokens)

    while (true) {
        const { done, value } = nodeGenerator.next()

        if (Array.isArray(value))
            program.value = value
        else if (value.type == "MismatchToken")
            throw new Error(value.error)

        if (done) break
    }

    return program
}