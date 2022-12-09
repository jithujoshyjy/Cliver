import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, skip, skipables, type Node } from "../../utility.js"
import { generateNonVerbalOperator } from "../expression/operation.ts/non-verbal-operator.js"
import { generateVerbalOperator } from "../expression/operation.ts/verbal-operator.js"

export function generateOperatorRef(context: Node, tokens: TokenStream): OperatorRef | MismatchToken {
    const operatorRef: OperatorRef = {
        type: "OperatorRef",
        operator: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type != TokenType.ParenEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const parenTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = parenTokens.currentToken

    if(skipables.includes(currentToken.type)) {
        currentToken = skip(parenTokens, skipables)
    }

    let _operator: MismatchToken
        | NonVerbalOperator
        | VerbalOperator = generateNonVerbalOperator(operatorRef, parenTokens)
    
    if(_operator.type == "MismatchToken") {
        _operator = generateVerbalOperator(operatorRef, parenTokens)
    }

    if(_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    operatorRef.operator = _operator
    if(!parenTokens.isFinished) {
        currentToken = parenTokens.currentToken
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    // tokens.advance()
    return operatorRef
}