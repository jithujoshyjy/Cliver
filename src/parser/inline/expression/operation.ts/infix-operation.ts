import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { skip, skipables, operatorPrecedence, type Node, createMismatchToken } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../../term/term.js"
import { generateGroupExpression } from "../group-expression.js"
import { generateInfixCallOperator } from "./infix-call-operator.js"
import { generateNonVerbalOperator } from "./non-verbal-operator.js"
// import { generatePostfixOperation } from "./postfix-operation.js"
import { generatePrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator } from "./verbal-operator.js"

export function generateInfixOperation(context: Node, tokens: TokenStream): InfixOperation | MismatchToken {
    let infixOperation: InfixOperation = {
        type: "InfixOperation",
        left: null!,
        operator: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generatePrefixOperation, generateTerm, generateLiteral
    ]

    type Operand = PrefixOperation
        | GroupExpression
        | Term
        | Literal
        | InfixOperation
        | MismatchToken

    let lhs: Operand = null!
    for (let nodeGenerator of nodeGenerators) {
        lhs = nodeGenerator(infixOperation, tokens)
        currentToken = tokens.currentToken
        if (lhs.type != "MismatchToken")
            break
    }

    if (lhs.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return lhs
    }

    infixOperation.start = lhs.start
    infixOperation.end = lhs.end

    const getPrecidence = (op: typeof currentToken) =>
        operatorPrecedence.infix.left[op.value as string] ??
        operatorPrecedence.infix.right[op.value as string] ?? 10

    const isRightAssociative = (op: typeof currentToken) =>
        Object.keys(operatorPrecedence.infix.right).includes(op.value as string)

    const _infixOperation = _generateInfixOperation(lhs)
    
    if (_infixOperation.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _infixOperation
    }

    return _infixOperation

    function _generateInfixOperation(lhs: Exclude<Operand, MismatchToken>, minPrecedence = 0): InfixOperation | MismatchToken {

        const initialCursor = tokens.cursor
        let currentToken = tokens.currentToken

        if (skipables.includes(currentToken.type))
            currentToken = skip(tokens, skipables)

        const currentOpPrecedence = currentToken.type == TokenType.Operator ? getPrecidence(currentToken) : 0

        while (currentToken.type == TokenType.Operator && currentOpPrecedence >= minPrecedence) {

            let _operator: NonVerbalOperator
                | VerbalOperator
                | MismatchToken = generateNonVerbalOperator(infixOperation, tokens)

            if (_operator.type == "MismatchToken")
                _operator = generateVerbalOperator(infixOperation, tokens)
            if (_operator.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return _operator
            }

            _operator.precedence = currentOpPrecedence

            currentToken = skip(tokens, skipables) // skip operator

            let rhs: Operand = null!

            for (let nodeGenerator of nodeGenerators) {
                rhs = nodeGenerator(infixOperation, tokens)
                if (rhs.type != "MismatchToken")
                    break
            }

            if (rhs.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return rhs
            }

            let nextOpPrecedence = 0

            const isNextOperator = (nextToken: typeof currentToken) => {

                if (nextToken.type == TokenType.Operator) {
                    nextOpPrecedence = getPrecidence(nextToken)

                    const nextHasMorePreced = nextOpPrecedence > currentOpPrecedence
                    const isNextRightAssoc = nextOpPrecedence == currentOpPrecedence
                        && isRightAssociative(nextToken)

                    return nextHasMorePreced || isNextRightAssoc
                }

                return false
            }

            const resetCursorPoint = tokens.cursor
            currentToken = skipables.includes(tokens.currentToken.type) // operator
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (!isNextOperator(currentToken)) {
                tokens.cursor = resetCursorPoint
                currentToken = tokens.currentToken
            }
            else {
                nextOpPrecedence = currentOpPrecedence > nextOpPrecedence ? nextOpPrecedence : 0
                rhs = _generateInfixOperation(rhs as Exclude<Operand, MismatchToken>, nextOpPrecedence)

                if(rhs.type == "MismatchToken") {
                    tokens.cursor = initialCursor
                    return rhs
                }
            }

            lhs = {
                type: "InfixOperation",
                left: lhs,
                operator: _operator,
                right: rhs as Exclude<Operand, MismatchToken>,
                start: lhs.start,
                end: rhs.end
            }

            currentToken = skipables.includes(currentToken.type)
                ? skip(tokens, skipables)
                : tokens.currentToken
        }

        return lhs as InfixOperation
    }
}