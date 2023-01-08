import { TokenStream } from "../../../lexer/token.js"
import { generateBlock, printBlock } from "../../block/block.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node } from "../../utility.js"
import { generateInline, printInline } from "../inline.js"

export function generateDoExpr(context: Node, tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr: DoExpr = {
        type: "DoExpr",
        body: [],
        line: 0,
        column: 0,
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
    doExpr.line = currentToken.line

    doExpr.column = currentToken.column
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

            if (node.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return node
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

export function printDoExpr(token: DoExpr, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    
    return "DoExpr\n" + '\t'.repeat(indent) + token.body
        .reduce((a, c, i, arr) => a +
            (i == arr.length-1 ? endJoiner : middleJoiner) +
            (c.type == "Block" ? printBlock(c, indent+1) : printInline(c, indent+1)) + '\n', '')
}