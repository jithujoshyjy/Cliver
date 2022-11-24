import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateObjectExtendNotation(context: Node, tokens: TokenStream): ObjectExtendNotation | MismatchToken {
    const objectExtendNotation = {
        type: "ObjectExtendNotation",
        head: null,
        body: [],
        start: 0,
        end: 0
    }

    return objectExtendNotation as unknown as ObjectExtendNotation
}