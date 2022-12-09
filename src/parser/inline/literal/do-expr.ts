import { TokenStream } from "../../../lexer/token.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../../utility.js"

export function generateDoExpr(context: Node, tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr: DoExpr = {
        type: "DoExpr",
        body: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // do
    const initialCursor = tokens.cursor

    if(!isKeyword(currentToken, "do")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip do

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

    // tokens.advance()
    return doExpr
}