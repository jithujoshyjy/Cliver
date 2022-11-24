import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateTaggedString(context: Node, tokens: TokenStream): TaggedString | MismatchToken {
    const taggedString = {
        type: "TaggedString",
        value: null,
        tag: null,
        start: 0,
        end: 0
    }

    return taggedString as unknown as TaggedString
}