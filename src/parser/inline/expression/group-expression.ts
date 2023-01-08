import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node, NodePrinter, pickPrinter } from "../../utility.js"
import { printLiteral } from "../literal/literal.js"
import { printTerm } from "../term/term.js"
import { generateExpression } from "./expression.js"
import { printInfixOperation } from "./operation.ts/infix-operation.js"
import { printPostfixOperation } from "./operation.ts/postfix-operation.js"
import { printPrefixOperation } from "./operation.ts/prefix-operation.js"

export function generateGroupExpression(context: Node, tokens: TokenStream): GroupExpression | MismatchToken {
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

    /* let expression: Expression | MismatchToken = null!

    if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    groupExpression.start = currentToken.start
    groupExpression.end = currentToken.end

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = parenTokens.currentToken

    const parseValue = () => {

        if (skipables.includes(currentToken.type))
            currentToken = skip(parenTokens, skipables)

        let value: Expression | MismatchToken = generateExpression(groupExpression, parenTokens)
        currentToken = parenTokens.currentToken

        return value
    }

    expression = parseValue()
    currentToken = parenTokens.currentToken

    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    if (currentToken.type != TokenType.EOF) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const { value } = expression
    groupExpression.value = value  */   
    return createMismatchToken(currentToken)
    return groupExpression
}

export function printGroupExpression(token: GroupExpression, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printInfixOperation, printPrefixOperation, printPostfixOperation,
        printTerm, printLiteral, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!

    return "GroupExpression\n" + '\t'.repeat(indent) + endJoiner + printer(token.value, indent+1) + '\n'
}