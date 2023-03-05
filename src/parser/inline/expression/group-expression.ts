import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node, NodePrinter, pickPrinter, isPunctuator, PartialParse } from "../../utility.js"
import { printLiteral } from "../literal/literal.js"
import { printTerm } from "../term/term.js"
import { generateExpression } from "./expression.js"
import { printInfixOperation } from "./operation.ts/infix-operation.js"
import { printPostfixOperation } from "./operation.ts/postfix-operation.js"
import { printPrefixOperation } from "./operation.ts/prefix-operation.js"

export function generateGroupExpression(context: string[], tokens: TokenStream): GroupExpression | MismatchToken {
    const groupExpression: GroupExpression = {
        type: "GroupExpression",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, '(')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    groupExpression.start = currentToken.start
    groupExpression.line = currentToken.line
    groupExpression.column = currentToken.column

    currentToken = skip(tokens, skipables) // skip (

    let expression: Expression | MismatchToken = generateExpression(["GroupExpression", ...context], tokens)
    currentToken = tokens.currentToken

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    groupExpression.value = expression.value

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (!isPunctuator(currentToken, ')')) {
        tokens.cursor = initialCursor

        const partialParse: PartialParse = {
            result: expression,
            cursor: currentToken.end
        }

        return createMismatchToken(currentToken, partialParse)
    }

    groupExpression.end = currentToken.end
    currentToken = skip(tokens, skipables) // skip )

    return groupExpression
}

export function printGroupExpression(token: GroupExpression, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printInfixOperation, printPostfixOperation, printPrefixOperation,
        printTerm, printLiteral, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!
    const space = ' '.repeat(4)
    return "GroupExpression\n" + space.repeat(indent) + endJoiner + printer(token.value, indent + 1)
}