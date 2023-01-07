import { TokenStream } from "../../../../lexer/token.js"
import { operatorPrecedence, skip, skipables, type Node, createMismatchToken } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../../term/term.js"
import { generateGroupExpression } from "../group-expression.js"
import { generateInfixOperation } from "./infix-operation.js"
import { generateNonVerbalOperator } from "./non-verbal-operator.js"
import { generatePrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator } from "./verbal-operator.js"

export function generatePostfixOperation(context: Node, tokens: TokenStream): PostfixOperation | MismatchToken {
    const postfixOperation: PostfixOperation = {
        type: "PostfixOperation",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const operandGenerators = [
        generateTerm, generateLiteral, generateGroupExpression, generatePrefixOperation
    ]

    let operand: InfixOperation | Literal | Term | GroupExpression | PrefixOperation | MismatchToken = null!
    for (let operandGenerator of operandGenerators) {
        operand = operandGenerator(postfixOperation, tokens)
        currentToken = tokens.currentToken
        if (operand.type != "MismatchToken") {
            break
        }
    }
    
    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    currentToken = skipables.includes(tokens.currentToken.type)
        ? skip(tokens, skipables)
        : tokens.currentToken // skip operand
    
    const skipNpeek = () => {
        let idx = 1
        let nextToken = tokens.peek(idx)
        while (nextToken && nextToken.type != "EOF" && skipables.includes(nextToken.type)) {
            idx++
            nextToken = tokens.peek(idx)
        }
        return nextToken
    }

    let _operator: NonVerbalOperator
        | MismatchToken = generateNonVerbalOperator(postfixOperation, tokens)
    
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    if(!(_operator.name in operatorPrecedence.postfix)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    postfixOperation.start = _operator.start

    const getPrecidence = (op: NonVerbalOperator): number => {
        const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
        const defaultPreced = isVerbalOperator ? 2 : 5
        switch (op.type) {
            // case "VerbalOperator":
            case "NonVerbalOperator":
                return operatorPrecedence.postfix[op.name] ?? defaultPreced
        }
    }

    _operator.kind = "postfix"
    _operator.precedence = getPrecidence(_operator)

    postfixOperation.operator = _operator
    const resetCursorPoint = tokens.cursor

    const nextToken = skipables.includes(currentToken.type) ? skipNpeek() : currentToken
    if (nextToken && nextToken.type == "Operator") {

        const getPrecidence = (op: typeof currentToken) =>
            operatorPrecedence.infix.left[op.value as string] ??
            operatorPrecedence.infix.right[op.value as string] ?? 10

        const isRightAssociative = (op: typeof currentToken) =>
            Object.keys(operatorPrecedence.infix.right).includes(op.value as string)

        const nextOpPrecedence = getPrecidence(nextToken)
        const nextHasMorePreced = nextOpPrecedence > _operator.precedence
        const isNextRightAssoc = nextOpPrecedence == _operator.precedence
            && isRightAssociative(nextToken)

        if (nextHasMorePreced || isNextRightAssoc) {
            tokens.cursor = resetCursorPoint
            const infixOperation = generateInfixOperation(postfixOperation, tokens)
            if (infixOperation.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return infixOperation
            }
            operand = infixOperation
        }
    }

    postfixOperation.operand = operand
    postfixOperation.end = operand.end

    return postfixOperation
}