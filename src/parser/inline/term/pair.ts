import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generatePair(context: Node, tokens: TokenStream): Pair | MismatchToken {
    const pair: Pair = {
        type: "Pair",
        key: null!,
        value: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return pair
}