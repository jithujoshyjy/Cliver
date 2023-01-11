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

            let lines = 1, startIdx = 0, errorLineText = ''

            for (let i = 0, _char = tokens.input[i]; i < tokens.input.length; i++, _char = tokens.input[i]) {
                if (value.line == lines)
                    break
                if (_char == '\n') {
                    lines++
                    startIdx = i + 1
                }
            }

            for (let i = startIdx; i < tokens.input.length; i++) {
                if (tokens.input.charAt(i) === '\n') break
                errorLineText += tokens.input.charAt(i)
            }

            let errorLine = value.value.line
            const underlineChar = '¯'
            const errorUnderline = "\n" +
                " ".repeat(errorLine.toString().length + value.column) +
                chalk.redBright(underlineChar.repeat(value.end - value.start+1)) +
                " ".repeat(errorLineText.length - value.end)

            const errorSite = `${chalk.bgWhite.blackBright(errorLine)} ${errorLineText
                .split('\n')
                .join('\n' + chalk.bgWhite.blackBright(++errorLine) + ' ')
                }${errorUnderline}`

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