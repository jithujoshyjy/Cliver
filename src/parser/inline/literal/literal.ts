import { TokenStream } from "../../../lexer/token.js"
import { NodePrinter, pickPrinter, type Node, createMismatchToken, PartialParse } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateArrayLiteral, printArrayLiteral } from "./array-literal.js"
import { generateDoExpr, printDoExpr } from "./do-expr.js"
import { generateIdentifier, printIdentifier } from "./identifier.js"
import { generateMapLiteral, printMapLiteral } from "./map-literal.js"
import { generateNumericLiteral, printNumericLiteral } from "./numeric-literal/numericLiteral.js"
import { generateStringLiteral, printStringLiteral } from "./string-literal.js"
import { generateTupleLiteral, printTupleLiteral } from "./tuple-literal.js"
import { generateCharLiteral, printCharLiteral } from "./char-literal.js"
import { generateSymbolLiteral, printSymbolLiteral } from "./symbol-literal.js"
import { generateOperatorRef, printOperatorRef } from "./operator-ref.js"

export function generateLiteral(context: Node, tokens: TokenStream): Literal | MismatchToken {
    const literal: Literal = {
        type: "Literal",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateMapLiteral, generateTupleLiteral, generateArrayLiteral, generateStringLiteral,
        generateCharLiteral, generateSymbolLiteral, generateNumericLiteral, generateDoExpr,
        generateIdentifier, generateGroupExpression, generateOperatorRef,
    ]

    let node: typeof literal.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(literal, tokens)
        currentToken = tokens.currentToken
        if (node.type != "MismatchToken") {
            break
        }

        if (node.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return node
        }
    }

    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    literal.start = node.start
    literal.end = node.end
    literal.value = node

    literal.line = node.line
    literal.column = node.column

    return literal
}

export function printLiteral(token: Literal, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printMapLiteral, printTupleLiteral, printArrayLiteral,
        printStringLiteral, printCharLiteral, printSymbolLiteral,
        printNumericLiteral, printDoExpr, printIdentifier,
        printGroupExpression, printOperatorRef
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!

    return "Literal\n" + '\t'.repeat(indent) + endJoiner + printer(token.value, indent+1)
}