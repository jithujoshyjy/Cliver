import { TokenStream } from "../../../lexer/token.js"
import { skip, _skipables } from "../../utility.js"
import { generateTupleType } from "./tuple-type.js"
import { generateTypeName } from "./type-name.js"

export function generateFunctionCallType(context: string[], tokens: TokenStream): FunctionCallType | MismatchToken {
	const functionCallType: FunctionCallType = {
		type: "FunctionCallType",
		args: null!,
		caller: null!,
		line: 0,
		column: 0,
		start: 0,
		end: 0
	}

	const initialCursor = tokens.cursor
	let currentToken = tokens.currentToken

	const caller = generateTypeName(["FunctionCallType", ...context], tokens)
    if (caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    functionCallType.start = caller.start
    functionCallType.line = caller.line
    functionCallType.column = caller.column
    functionCallType.caller = caller
    
    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const args = generateTupleType(["FunctionCallType", ...context], tokens)
    if(args.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return args
    }

    functionCallType.args = args
    functionCallType.end = args.end

	return functionCallType
}