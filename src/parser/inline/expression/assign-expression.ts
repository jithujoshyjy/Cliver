import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isKeyword, skip, _skipables, type Node } from "../../utility"

export function generateAssignExpr(context: Node, tokens: TokenStream): AssignExpr | MismatchToken {
    const assignExpr: AssignExpr = {
        type: "AssignExpr",
        left: null!,
        right: null!,
        signature: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return assignExpr
}