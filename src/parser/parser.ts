import { type TokenStream } from "../lexer/token.js"
import { generateProgram } from "./program.js"
import chalk from "chalk"

export function generateAST(tokens: TokenStream): Program | void {

	const program = generateProgram([], tokens)
    
	if (program.type != "MismatchToken")
		return program

    
	const errorCode = "[" + program.errorDescription.code + "]"
	const errorDescription = `${chalk.bold.redBright(errorCode)} ${chalk.redBright(program.error)}\n`

	let lines = 1, startIdx = 0, errorLineText = ""

	for (let i = 0, _char = tokens.input[i]; i < tokens.input.length; i++, _char = tokens.input[i]) {
		if (program.line == lines)
			break
		if (_char == "\n") {
			lines++
			startIdx = i + 1
		}
	}

	for (let i = startIdx; i < tokens.input.length; i++) {
		if (tokens.input.charAt(i) === "\n") break
		errorLineText += tokens.input.charAt(i)
	}

	let errorLine = program.value.line
	const underlineChar = "¯"
	const errorUnderline = (errorLineText.length - program.end) > 0
		? "\n" +
        " ".repeat(errorLine.toString().length + program.column) +
        chalk.redBright(underlineChar.repeat(program.end - program.start + 1)) +
        " ".repeat(errorLineText.length - program.end)
		: ""

	const errorSite = `${chalk.bgWhite.blackBright(errorLine)} ${errorLineText
		.split("\n")
		.join("\n" + chalk.bgWhite.blackBright(++errorLine) + " ")
	}${errorUnderline}`

	console.error(errorDescription)
	if (errorLineText.length - program.end > 0)
		console.error(errorSite)

	process.exit(1)
}

// guards in pattern matching
// .. extensible type constructors
// with blocks