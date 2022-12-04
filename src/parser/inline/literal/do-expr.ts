import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { isKeyword, skip, skipables, type Node } from "../../utility"

export function generateDoExpr(context: Node, tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr: DoExpr = {
        type: "DoExpr",
        body: [],
        start: 0,
        end: 0
    }

    let currentToken = skip(tokens, skipables) // skip do
    const initialCursor = tokens.cursor

    const nodes = generateProgram(doExpr, tokens)

    for (let node of nodes) {
        currentToken = tokens.currentToken

        if (node.type == "MismatchToken" && isKeyword(currentToken, "end")) {
            break
        }
        else if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        doExpr.body.push(node)
    }

    return doExpr
}