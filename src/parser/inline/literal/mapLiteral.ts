import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"
import { generatePair } from "../term/pair.js"

export function generateMapLiteral(context: Node, tokens: TokenStream): MapLiteral | MismatchToken {
    const mapLiteral: MapLiteral = {
        type: "MapLiteral",
        elements: [],
        start: 0,
        end: 0
    }
    const token = tokens.currentToken
    const values = token.value as Token[]
    const invalidStartTokens = [
        TokenType.Keyword,
        TokenType.Operator,
        TokenType.Punctuator,
        TokenType.BraceEnclosed
    ]

    for (let value of values) {
        if (skipables.includes(value.type))
            continue

        if (invalidStartTokens.includes(value.type)) {
            let mismatchToken: MismatchToken = {
                type: "MismatchToken",
                error: `Unexpected token ${token.type} on ${token.line}:${token.column}`,
                value: token,
                start: 0,
                end: 0
            }
            return mismatchToken
        }

        generatePair(context, tokens)
    }

    return mapLiteral as MapLiteral
}