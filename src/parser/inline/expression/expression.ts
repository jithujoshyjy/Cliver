import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, operatorPrecedence, skip, skipables, type Node, pickPrinter, NodePrinter } from "../../utility.js"
import { generateLiteral, printLiteral } from "../literal/literal.js"
import { generateTerm, printTerm } from "../term/term.js"
import { generateGroupExpression, printGroupExpression } from "./group-expression.js"
import { generateInfixOperation, printInfixOperation } from "./operation.ts/infix-operation.js"
import { generateNonVerbalOperator } from "./operation.ts/non-verbal-operator.js"
import { printPostfixOperation } from "./operation.ts/postfix-operation.js"
// import { generatePostfixOperation } from "./operation.ts/postfix-operation.js"
import { generatePrefixOperation, printPrefixOperation } from "./operation.ts/prefix-operation.js"
import { generateVerbalOperator } from "./operation.ts/verbal-operator.js"

export function generateExpression(context: Node, tokens: TokenStream): Expression | MismatchToken {
    const expression: Expression = {
        type: "Expression",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateInfixOperation, generatePrefixOperation, /* generatePostfixOperation, */
        generateTerm, generateLiteral
    ]

    let node: typeof expression.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(expression, tokens)
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

    expression.value = node
    expression.start = node.start
    expression.end = node.end

    expression.line = node.line
    expression.column = node.column

    return expression
}

export function printExpression(token: Expression, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printInfixOperation, printPrefixOperation, printPostfixOperation,
        printTerm, printLiteral, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!

    return "Expression\n" + '\t'.repeat(indent) + endJoiner + printer(token.value, indent+1)
}