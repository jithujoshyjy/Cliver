import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateTaggedSymbol(context: Node, tokens: TokenStream): TaggedSymbol | MismatchToken {
    const taggedSymbol = {
        type: "TaggedSymbol",
        fragments: [],
        tag: {},
        start: 0,
        end: 0
    }
    let token = tokens.currentToken

    return taggedSymbol as unknown as TaggedSymbol
}