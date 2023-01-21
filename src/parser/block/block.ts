import { TokenStream } from "../../lexer/token.js"
import { skip, skipables, _skipables, type Node, NodePrinter, pickPrinter } from "../utility.js"
import { generateBlockMacroApplication, printBlockMacroApplication } from "./block-macro-application.js"
import { generateDoCatchBlock, printDoCatchBlock } from "./do-catch-block.js"
import { generateForBlock, printForBlock } from "./for-block.js"
import { generateIfBlock, printIfBlock } from "./if-block.js"
import { generateImportDeclaration, printImportDeclaration } from "./import-declaration.js"
import { generateLabelDeclaration, printLabelDeclaration } from "./label-declaration.js"
import { generateNamedFunction, printNamedFunction } from "./named-function.js"
import { generateUseDeclaration, printUseDeclaration } from "./use-declaration.js"
import { generateVariableDeclaration, printVariableDeclaration } from "./variable-declaration/variable-declaration.js"

export function generateBlock(context: Node, tokens: TokenStream): Inline | Block | MismatchToken {
    const block: Block = {
        type: "Block",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    
    if (skipables.includes(currentToken))
        currentToken = skip(tokens, skipables)

    const nodeGenerators = [
        generateLabelDeclaration, generateUseDeclaration, generateDoCatchBlock,
        generateForBlock, generateIfBlock, generateBlockMacroApplication,
        generateNamedFunction, generateImportDeclaration, generateVariableDeclaration
    ]

    let node: typeof block.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(block, tokens)
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

    block.start = node.start
    block.end = node.end
    block.value = node

    block.line = node.line
    block.column = node.column
    return block
}

export function printBlock(token: Block, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const printers = [
        printLabelDeclaration, printUseDeclaration, printDoCatchBlock,
        printForBlock, printIfBlock, printBlockMacroApplication,
        printNamedFunction, printImportDeclaration, printVariableDeclaration
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!
    const space = ' '.repeat(4)
    return "Block\n" + space.repeat(indent) + endJoiner + printer(token.value, indent+1)
}