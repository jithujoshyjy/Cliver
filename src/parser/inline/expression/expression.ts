import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"
import { generateLiteral } from "../literal/literal.js"
import { generateTerm } from "../term/term.js"
import { generateInfixOperation } from "./operation.ts/infix-operation.js"
// import { generatePostfixOperation } from "./operation.ts/postfix-operation.js"
import { generatePrefixOperation } from "./operation.ts/prefix-operation.js"

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
    for(let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(expression, tokens)
        currentToken = tokens.currentToken
        if(node.type != "MismatchToken") {
            break
        }
    }

    if(node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    expression.value = node

    return expression
}