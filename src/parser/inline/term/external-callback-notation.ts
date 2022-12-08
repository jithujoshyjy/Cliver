import { TokenStream } from "../../../lexer/token.js"
import { skip, skipables, type Node } from "../../utility.js"
import { generateDoExpr } from "../literal/do-expr.js"
import { generateFunctionCall } from "./function-call.js"

export function generateExternalCallbackNotation(context: Node, tokens: TokenStream): FunctionCall | ExternalCallbackNotation | MismatchToken {
    const externalCallbackNotation: ExternalCallbackNotation = {
        type: "ExternalCallbackNotation",
        callback: null!,
        caller: null!,
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

    currentToken = skip(tokens, skipables)
    if(!functionCall.externcallback) {
        return functionCall
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