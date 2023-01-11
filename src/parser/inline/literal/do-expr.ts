import { TokenStream } from "../../../lexer/token.js"
import { generateBlock, printBlock } from "../../block/block.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node, keywords } from "../../utility.js"
import { generateInline, printInline } from "../inline.js"
import { generateIdentifier } from "./identifier.js"

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

    const doKeyword = generateIdentifier(doExpr, tokens)

    if (doKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return doKeyword
    }

    if (!isKeyword(doKeyword, "do")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    doExpr.start = doKeyword.start
    doExpr.line = doKeyword.line
    doExpr.column = doKeyword.column


    const nodeGenerators = [
        generateBlock, generateInline
    ]

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            node = nodeGenerator(doExpr, tokens)
            currentToken = tokens.currentToken
            if (node.type != "MismatchToken") {
                break
            }

            if (node.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return node
            }
        }

        currentToken = tokens.currentToken
        if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        if (node.type == "Inline"
            && node.value.type == "Expression"
            && node.value.value.type == "Literal"
            && node.value.value.value.type == "Identifier"
            && isKeyword(node.value.value.value, "end")) {

            doExpr.end = node.end
            break
        }

        doExpr.body.push(node)
    }

    return doExpr
}

export function printDoExpr(token: DoExpr, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return "DoExpr\n" +
        token.body.reduce((a, c, i, arr) => a +
            '\t'.repeat(indent) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            (c.type == "Block" ? printBlock(c, indent + 1) : printInline(c, indent + 1)) + '\n', '')
}