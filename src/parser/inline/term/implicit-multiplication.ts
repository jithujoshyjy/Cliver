import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isBlockedType, NodePrinter, pickPrinter, type Node } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateNumericLiteral, printNumericLiteral } from "../literal/numeric-literal/numericLiteral.js"

export function generateImplicitMultiplication(context: string[], tokens: TokenStream): ImplicitMultiplication | MismatchToken {
    const implicitMultiplication: ImplicitMultiplication = {
        type: "ImplicitMultiplication",
        left: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const number = generateNumericLiteral(["ImplicitMultiplication", ...context], tokens)
    if (number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    implicitMultiplication.left = number
    currentToken = tokens.currentToken

    const nodeGenerators = [
        generateGroupExpression, generateIdentifier
    ]

    let multiplier: Identifier | GroupExpression | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        if (isBlockedType(nodeGenerator.name.replace("generate", '')))
            continue
        
        multiplier = nodeGenerator(["ImplicitMultiplication", ...context], tokens)
        currentToken = tokens.currentToken

        if (multiplier.type != "MismatchToken")
            break

        if (multiplier.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return multiplier
        }
    }

    if (multiplier.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return multiplier
    }

    implicitMultiplication.right = multiplier
    return implicitMultiplication
}

export function printImplicitMultiplication(token: ImplicitMultiplication, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printIdentifier, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.right)!

    const space = ' '.repeat(4)
    return "ImplicitMultiplication" +
        '\n' + space.repeat(indent) + middleJoiner +
        printNumericLiteral(token.left, indent + 1) +
        '\n' + space.repeat(indent) + endJoiner +
        printer(token.right, indent + 1)
}