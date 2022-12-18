import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { skip, type Node, _skipables, operatorPrecedence, createMismatchToken } from "../../../utility.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"

export function generatePrefixPattern(context: Node, tokens: TokenStream): PrefixPattern | MismatchToken {
    const prefixPattern: PrefixPattern = {
        type: "PrefixPattern",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let _operator = generateNonVerbalOperator(prefixPattern, tokens)

    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    const validPrefixOp = [
        "...",
    ]

    currentToken = tokens.currentToken
    if (!validPrefixOp.includes(currentToken.value as string)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    prefixPattern.start = _operator.start

    const getPrecidence = (op: NonVerbalOperator): number => {
        const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
        const defaultPreced = isVerbalOperator ? 2 : 10
        switch (op.type) {
            case "NonVerbalOperator":
                return operatorPrecedence.prefix[op.name] ?? defaultPreced
        }
    }

    _operator.kind = "prefix"
    _operator.precedence = getPrecidence(_operator)

    prefixPattern.operator = _operator
    currentToken = skip(tokens, _skipables) // skip operator
    const resetCursorPoint = tokens.cursor

    const operandGenerators = [
        generateBracePattern, generateBracketPattern, generateParenPattern,
        generateInterpPattern, generatePrefixPattern, generatePostfixPattern,
        generateIdentifier
    ]

    let operand: Identifier
        | BracePattern
        | BracketPattern
        | ParenPattern
        | InterpPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | MismatchToken = null!
    
    for (let operandGenerator of operandGenerators) {
        operand = operandGenerator(prefixPattern, tokens)
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
        while (nextToken && nextToken.type != TokenType.EOF && _skipables.includes(nextToken.type)) {
            idx++
            nextToken = tokens.peek(idx)
        }
        return nextToken
    }

    const nextToken = _skipables.includes(currentToken.type) ? skipNpeek() : currentToken
    if (nextToken && nextToken.type == TokenType.Operator) {

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
            const infixPattern = generateInfixPattern(prefixPattern, tokens)
            if (infixPattern.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return infixPattern
            }
            operand = infixPattern
        }
    }

    prefixPattern.operand = operand
    prefixPattern.end = operand.end

    return prefixPattern
}