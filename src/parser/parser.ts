import { type TokenStream } from "../lexer/token.js";
import { skip, skipables, type Node } from "./utility.js";
import { generateProgram } from "./program.js";
import chalk from "chalk";

let context: Node = {
    type: "Program",
    value: [],
    line: 0,
    column: 0,
    start: 0,
    end: 0
} as Program

export function generateAST(tokens: TokenStream): Program {
    const program = context as Program

    let currentToken = tokens.currentToken
    if (skipables.includes(currentToken))
        currentToken = skip(tokens, skipables)

    const nodeGenerator = generateProgram(context, tokens)

    while (true) {
        const { done, value } = nodeGenerator.next()

        if (Array.isArray(value)) {
            program.value = value
        }
        else if (value.type == "MismatchToken") {
            const errorCode = "[" + value.errorDescription.code + "]"
            const errorDescription = `${chalk.bold.redBright(errorCode)} ${chalk.redBright(value.error)}\n`

            let errorLine = value.value.line
            const errorSite = `${chalk.bgWhite.blackBright(errorLine)} ${tokens.input
                .substring(value.start, value.end + 1)
                .split('\n')
                .join('\n' + chalk.bgWhite.blackBright(errorLine++) + ' ')
                }`

            console.error(errorDescription)
            console.error(errorSite)

            process.exit(1)
        }

        if (done) break
    }

    return program
}

// guards in pattern matching
// .. extensible type constructors
// with blocks