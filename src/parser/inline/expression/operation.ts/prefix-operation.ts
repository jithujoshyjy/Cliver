import { TokenStream } from "../../../../lexer/token.js"
import { operatorPrecedence, skip, skipables, type Node, createMismatchToken } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../../term/term.js"
import { generateGroupExpression } from "../group-expression.js"
import { generateInfixOperation } from "./infix-operation.js"
import { generateNonVerbalOperator } from "./non-verbal-operator.js"
import { generateVerbalOperator } from "./verbal-operator.js"

export function generatePrefixOperation(context: Node, tokens: TokenStream): PrefixOperation | MismatchToken {
    const prefixOperation: PrefixOperation = {
        type: "PrefixOperation",
        operand: null!,
        operator: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    return createMismatchToken(currentToken)
    /* let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(prefixOperation, tokens)

    if (_operator.type == "MismatchToken") {
        _operator = generateVerbalOperator(prefixOperation, tokens)
    }
    
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    prefixOperation.start = _operator.start

    const getPrecidence = (op: NonVerbalOperator | VerbalOperator): number => {
        const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
        const defaultPreced = isVerbalOperator ? 2 : 10
        switch (op.type) {
            case "VerbalOperator":
            case "NonVerbalOperator":
                return operatorPrecedence.prefix[op.name] ?? defaultPreced
        }
    }

    _operator.kind = "prefix"
    _operator.precedence = getPrecidence(_operator)

    prefixOperation.operator = _operator
    currentToken = skip(tokens, skipables) // skip operator
    const resetCursorPoint = tokens.cursor

    const operandGenerators = [
        generateTerm, generateLiteral, generateGroupExpression, generatePrefixOperation
    ]

    let operand: InfixOperation | Literal | Term | GroupExpression | PrefixOperation | MismatchToken = null!
    for (let operandGenerator of operandGenerators) {
        operand = operandGenerator(prefixOperation, tokens)
        currentToken = tokens.currentToken
        if (operand.type != "MismatchToken") {
            break
        }
    }
    
    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    const skipNpeek = () => {
        let idx = 1
        let nextToken = tokens.peek(idx)
        while (nextToken && nextToken.type != "EOF" && skipables.includes(nextToken.type)) {
            idx++
            nextToken = tokens.peek(idx)
        }
        return nextToken
    }

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
            const infixOperation = generateInfixOperation(prefixOperation, tokens)
            if (infixOperation.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return infixOperation
            }
            operand = infixOperation
        }
    }

    prefixOperation.operand = operand
    prefixOperation.end = operand.end

    return prefixOperation */
}

export function printPrefixOperation(token: PrefixOperation, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return "PrefixOperation\n"
}