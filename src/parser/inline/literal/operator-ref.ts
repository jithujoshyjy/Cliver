import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node } from "../../utility.js"
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

    /* if (currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    operatorRef.start = currentToken.start
    operatorRef.end = currentToken.end
    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = parenTokens.currentToken

    if (skipables.includes(currentToken.type))
        currentToken = skip(parenTokens, skipables)

    let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(operatorRef, parenTokens)

    if (_operator.type == "MismatchToken")
        _operator = generateVerbalOperator(operatorRef, parenTokens)
    
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    operatorRef.operator = _operator
    currentToken = skip(parenTokens, skipables)

    if (currentToken.type != "EOF") {
        currentToken = parenTokens.currentToken
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    } */
    return createMismatchToken(currentToken)
    return operatorRef
}

export function printOperatorRef(token: OperatorRef, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return "OperatorRef\n"
}