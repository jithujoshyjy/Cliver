import { TokenStream } from "../../../lexer/token.js"
import { skip, skipables, type Node, PartialParse, createMismatchToken } from "../../utility.js"
import { generateDoExpr } from "../literal/do-expr.js"
import { generateFunctionCall } from "./function-call.js"

export function generateExternalCallbackNotation(context: Node, tokens: TokenStream): ExternalCallbackNotation | MismatchToken {
    const externalCallbackNotation: ExternalCallbackNotation = {
        type: "ExternalCallbackNotation",
        callback: null!,
        caller: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const functionCall = generateFunctionCall(externalCallbackNotation, tokens)
    if(functionCall.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return functionCall
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken
    
    if(!functionCall.externcallback) {
        const partialParse: PartialParse = {
            result: functionCall,
            cursor: tokens.cursor
        }
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    externalCallbackNotation.caller = functionCall

    const doExpr = generateDoExpr(externalCallbackNotation, tokens)
    if(doExpr.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return doExpr
    }

    externalCallbackNotation.callback = doExpr
    return externalCallbackNotation
}