import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateDoExpr(context: Node, tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr = {
        type: "DoExpr",
        value: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return doExpr as unknown as DoExpr
}