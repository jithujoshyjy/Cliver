import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateTaggedNumber(context: Node, tokens: TokenStream): TaggedNumber | MismatchToken {
    const taggedNumber: TaggedNumber = {
        type: "TaggedNumber",
        tag: null!,
        number: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return taggedNumber
}