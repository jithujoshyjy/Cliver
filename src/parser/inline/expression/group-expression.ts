import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateGroupExpression(context: Node, tokens: TokenStream): GroupExpression | MismatchToken {
    const groupExpression: GroupExpression = {
        type: "GroupExpression",
        value: null!,
        start: 0,
        end: 0
    }

    return groupExpression
}