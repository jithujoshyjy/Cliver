import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, _skipables, type Node } from "../../utility.js"
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

    /* const caller = generateTypeName(functionCallType, tokens)
    if (caller.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return caller
    }

    functionCallType.caller = caller
    currentToken = skip(tokens, _skipables)

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const args = generateTupleType(functionCallType, tokens)
    if(args.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return args
    }

    functionCallType.args = args as TupleType */

    return functionCallType
}