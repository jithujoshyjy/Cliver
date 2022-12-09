import { type TokenStream } from "../lexer/token.js";
import { skip, skipables, type Node } from "./utility.js";
import { generateProgram } from "./program.js";
import chalk from "chalk";

let context: Node = {
    type: "Program",
    value: [],
    start: 0,
    end: 0
} as Program

export function generateAST(tokens: TokenStream): Program {
    const program = context as Program

    let currentToken = tokens.currentToken
    if (skipables.includes(currentToken.type))
        currentToken = skip(tokens, skipables)

    const nodeGenerator = generateProgram(context, tokens)

    while (true) {
        const { done, value } = nodeGenerator.next()
        
        if (Array.isArray(value))
            program.value = value
        else if (value.type == "MismatchToken") {
            console.error(chalk.bgRed.white(value.error))
            process.exit(1)
        }

        if (done) break
    }

    return program
}

// guards in pattern matching
// .. extensible type constructors
// with blocks