import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateExpression(context: Node, tokens: TokenStream): Expression | MismatchToken {
    const expression: Expression = {
        type: "Expression",
        value: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return expression
}