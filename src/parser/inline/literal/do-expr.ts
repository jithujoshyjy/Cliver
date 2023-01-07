import { TokenStream } from "../../../lexer/token.js"
import { generateBlock } from "../../block/block.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../../utility.js"
import { generateInline } from "../inline.js"

export function generateDoExpr(context: Node, tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr: DoExpr = {
        type: "DoExpr",
        body: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // do
    const initialCursor = tokens.cursor

    if (!isKeyword(currentToken, "do")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    doExpr.start = currentToken.start
    currentToken = skip(tokens, skipables) // skip do

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    while(currentToken.type != "EOF") {

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            node = nodeGenerator(doExpr, tokens)
            currentToken = tokens.currentToken
            if(node.type != "MismatchToken") {
                break
            }
        }

        if(node.type == "MismatchToken" && isKeyword(node.value, "end")) {
            currentToken = skip(tokens, skipables) // skip end
            doExpr.end = node.value.end
            break
        }

        if(node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        doExpr.body.push(node)
        currentToken = tokens.currentToken
    }

    return doExpr
}