import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node, isPunctuator } from "../../utility.js"
import { generateNonVerbalOperator } from "../expression/operation.ts/non-verbal-operator.js"
import { generateVerbalOperator } from "../expression/operation.ts/verbal-operator.js"

export function generateOperatorRef(context: Node, tokens: TokenStream): OperatorRef | MismatchToken {
    const operatorRef: OperatorRef = {
        type: "OperatorRef",
        operator: null!,
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

    operatorRef.start = currentToken.start
    operatorRef.line = currentToken.line
    operatorRef.column = currentToken.column

    currentToken = skip(tokens, skipables)

    let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(operatorRef, tokens)

    if (_operator.type == "MismatchToken")
        _operator = generateVerbalOperator(operatorRef, tokens)

    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    operatorRef.operator = _operator
    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (!isPunctuator(currentToken, ')')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)
    operatorRef.end = currentToken.end

    return operatorRef
}

export function printOperatorRef(token: OperatorRef, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "OperatorRef\n" +
        space.repeat(indent) + endJoiner + `(${token.operator.name})`
}