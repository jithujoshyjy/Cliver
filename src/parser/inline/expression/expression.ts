import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, operatorPrecedence, skip, skipables, type Node } from "../../utility.js"
import { generateLiteral } from "../literal/literal.js"
import { generateTerm } from "../term/term.js"
import { generateGroupExpression } from "./group-expression.js"
import { generateInfixOperation } from "./operation.ts/infix-operation.js"
import { generateNonVerbalOperator } from "./operation.ts/non-verbal-operator.js"
// import { generatePostfixOperation } from "./operation.ts/postfix-operation.js"
import { generatePrefixOperation } from "./operation.ts/prefix-operation.js"
import { generateVerbalOperator } from "./operation.ts/verbal-operator.js"

export function generateExpression(context: Node, tokens: TokenStream): Expression | MismatchToken {
    const expression: Expression = {
        type: "Expression",
        value: null!,
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
    }

    currentToken = tokens.currentToken
    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    expression.value = node
    expression.start = node.start
    expression.end = node.end
    return expression
}