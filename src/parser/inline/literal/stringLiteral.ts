import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateStringLiteral(context: Node, tokens: TokenStream): StringLiteral | MismatchToken {
    const stringLiteral = {
        type: "StringLiteral",
        text: "",
        kind: "inline",
        format: "ascii",
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return stringLiteral as StringLiteral
}