import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateForInline(context: Node, tokens: TokenStream): ForInline | MismatchToken {
    const forInline = {
        type: "ForInline",
        body: null,
        condition: null,
        start: 0,
        end: 0
    }

    return forInline as unknown as ForInline
}