import { TokenStream } from "../lexer/token.js"
import { generateBlock, printBlock } from "./block/block.js"
import { generateInline, printInline } from "./inline/inline.js"
import { skip, skipables, type Node } from "./utility.js"

export function generateProgram(context: string[], tokens: TokenStream): Program | MismatchToken {
    const program: Program = {
        type: "Program",
        body: [],
        start: 0,
        end: 0,
        column: 0,
        line: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    while (!tokens.isFinished) {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        if (currentToken.type == "EOF")
            break

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            node = nodeGenerator(["Program", ...context], tokens)
            currentToken = tokens.currentToken
            if (node.type != "MismatchToken")
                break

            if (node.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return node
            }
        }

        if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        program.body.push(node)
    }

    return program
}

export function printProgram(token: Program, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "Program\n" + space.repeat(indent) +
        token.body.reduce((a, c, i, arr) => a +
            (i == arr.length - 1 ? endJoiner : middleJoiner) +
            (c.type == "Block" ? printBlock(c, indent + 1) : printInline(c, indent + 1)) +
            (i == arr.length - 1 ? '' : '\n'), '')
}