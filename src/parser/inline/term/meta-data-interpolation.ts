import { TokenStream } from "../../../lexer/token.js"
import { generateBlock, printBlock } from "../../block/block.js"
import { generateProgram } from "../../program.js"
import { createMismatchToken, isPunctuator, skip, type Node, skipables, isKeyword } from "../../utility.js"
import { generateInline, printInline } from "../inline.js"
import { generateKeyword } from "../keyword.js"

export function generateMetaDataInterpolation(context: string[], tokens: TokenStream): MetaDataInterpolation | MismatchToken {
    const metaDataInterpolation: MetaDataInterpolation = {
        type: "MetaDataInterpolation",
        body: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, "$")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    metaDataInterpolation.start = currentToken.start
    metaDataInterpolation.line = currentToken.line
    metaDataInterpolation.column = currentToken.column
    currentToken = skip(tokens, skipables)

    if (!isPunctuator(currentToken, '{')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    const nodeGenerators = [
        generateBlock, generateInline
    ]

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (isPunctuator(currentToken, '}')) {
            metaDataInterpolation.end = currentToken.end
            currentToken = skip(tokens, skipables)
            break
        }

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            node = nodeGenerator(["MetaDataInterpolation", ...context], tokens)
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

        metaDataInterpolation.body.push(node)
    }

    return metaDataInterpolation
}

export function printMetaDataInterpolation(token: MetaDataInterpolation, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "MetaDataInterpolation" +
        '\n' + token.body.reduce((a, c, i, arr) => a +
            space.repeat(indent) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            (c.type == "Block" ? printBlock(c, indent + 1) : printInline(c, indent + 1)) + '\n', '')
}