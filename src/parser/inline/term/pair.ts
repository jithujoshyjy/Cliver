import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node, pickPrinter, NodePrinter } from "../../utility.js"
import { generateExpression, printExpression } from "../expression/expression.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { printPostfixOperation } from "../expression/operation.ts/postfix-operation.js"
import { generatePrefixOperation, printPrefixOperation } from "../expression/operation.ts/prefix-operation.js"
import { generateLiteral, printLiteral } from "../literal/literal.js"
import { generateTerm, printTerm } from "./term.js"

export function generatePair(context: Node, tokens: TokenStream): Pair | MismatchToken {
    const pair: Pair = {
        type: "Pair",
        key: null!,
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generatePrefixOperation, generateTerm,
        generateLiteral, generateGroupExpression
    ]

    let key: PrefixOperation
        | PostfixOperation
        | GroupExpression
        | Term
        | Literal
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        key = nodeGenerator(pair, tokens)
        currentToken = tokens.currentToken
        if (key.type != "MismatchToken")
            break

        if (key.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return key
        }
    }

    if (key.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return key
    }

    pair.key = key

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const value = generateExpression(pair, tokens)

    if (value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }

    pair.value = value

    return pair
}

export function printPair(token: Pair, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const keyPrinters = [
        printPrefixOperation, printPostfixOperation, printGroupExpression,
        printTerm, printLiteral
    ] as NodePrinter[]

    const keyPrinter = pickPrinter(keyPrinters, token.key)!
    const space = ' '.repeat(4)
    return "Pair\n" +
        space.repeat(indent) + middleJoiner +
        "key\n" + space.repeat(indent + 1) + endJoiner + keyPrinter(token.key, indent+2) +
        '\n' + space.repeat(indent) + endJoiner +
        "value\n" + space.repeat(indent + 1) + endJoiner + printExpression(token.value, indent+2)
}