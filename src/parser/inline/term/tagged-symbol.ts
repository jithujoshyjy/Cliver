import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateTaggedSymbol(context: Node, tokens: TokenStream): TaggedSymbol | MismatchToken {
    const taggedSymbol: TaggedSymbol = {
        type: "TaggedSymbol",
        fragments: [],
        tag: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    return taggedSymbol
}