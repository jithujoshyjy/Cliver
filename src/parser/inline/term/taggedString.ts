import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateTaggedString(context: Node, tokens: TokenStream): TaggedString | MismatchToken {
    const taggedString: TaggedString = {
        type: "TaggedString",
        value: null!,
        tag: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return taggedString
}