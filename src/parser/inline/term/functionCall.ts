import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateFunctionCall(context: Node, tokens: TokenStream): FunctionCall | MismatchToken {
    const functionCall = {
        type: "FunctionCall",
        arguments: null,
        caller: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return functionCall as unknown as FunctionCall
}