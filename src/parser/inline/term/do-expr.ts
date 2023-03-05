import { TokenStream } from "../../../lexer/token.js"
import { generateBlock, printBlock } from "../../block/block.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node, keywords, DiagnosticMessage, isBlockedType } from "../../utility.js"
import { generateInline, printInline } from "../inline.js"
import { generateKeyword } from "../keyword.js"

export function generateDoExpr(context: string[], tokens: TokenStream): DoExpr | MismatchToken {
    const doExpr: DoExpr = {
        type: "DoExpr",
        body: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const doKeyword = generateKeyword(["DoExpr", ...context], tokens)

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

        const endKeyword = generateKeyword(["DoExpr", ...context], tokens)

        if (isKeyword(endKeyword, "end")) {
            doExpr.end = endKeyword.end
            break
        }
        else if (endKeyword.type != "MismatchToken") {
            const error = "Unexpected Keyword '{0}' on {1}:{2}"
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, [error, endKeyword.name, endKeyword.line, endKeyword.column])
        }

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {

            if (isBlockedType(nodeGenerator.name.replace("generate", '')))
                continue

            node = nodeGenerator(["DoExpr", ...context], tokens)
            currentToken = tokens.currentToken

            if (node.type != "MismatchToken")
                break

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

        doExpr.body.push(node)
    }

    if (doExpr.body.length == 0) {
        const error: DiagnosticMessage = "Empty DoExpression on {0}:{1}"
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken, [error, doExpr.line, doExpr.column])
    }

    return doExpr
}

export function printDoExpr(token: DoExpr, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "DoExpr\n" +
        token.body.reduce((a, c, i, arr) => a +
            space.repeat(indent) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            (c.type == "Block" ? printBlock(c, indent + 1) : printInline(c, indent + 1)) + '\n', '')
}