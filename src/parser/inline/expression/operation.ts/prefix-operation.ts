import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../../term/term.js"
import { generateGroupExpression } from "../group-expression.js"
import { generateNonVerbalOperator } from "./non-verbal-operator.js"
import { generateVerbalOperator } from "./verbal-operator.js"

export function generatePrefixOperation(context: Node, tokens: TokenStream): PrefixOperation | MismatchToken {
    const prefixOperation: PrefixOperation = {
        type: "PrefixOperation",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(prefixOperation, tokens)
    
    if(operator.type == "MismatchToken") {
        operator = generateVerbalOperator(prefixOperation, tokens)
    }

    if(operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operator
    }

    prefixOperation.operator = operator
    currentToken = skip(tokens, skipables)

    const operandGenerators = [
        generateTerm, generateLiteral, generateGroupExpression
    ]

    let operand: Literal | Term | GroupExpression | MismatchToken = null!
    for(let operandGenerator of operandGenerators) {
        operand = operandGenerator(prefixOperation, tokens)
        currentToken = tokens.currentToken
        if(operand.type != "MismatchToken") {
            break
        }
    }

    if(operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    if(operand == null) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    prefixOperation.operand = operand

    return prefixOperation
}