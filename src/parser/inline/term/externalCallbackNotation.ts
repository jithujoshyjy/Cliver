import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateExternalCallbackNotation(context: Node, tokens: TokenStream): ExternalCallbackNotation | MismatchToken {
    const externalCallbackNotation = {
        type: "ExternalCallbackNotation",
        callback: null,
        caller: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return externalCallbackNotation as unknown as ExternalCallbackNotation
}