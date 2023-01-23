import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, skip, skipables, type Node, isOperator, PartialParse, isRightAssociative } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateVerbalOperator } from "../operation.ts/verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateInfixPattern(context: Node, tokens: TokenStream): InfixPattern | MismatchToken {
    let infixPattern: InfixPattern = {
        type: "InfixPattern",
        operator: null!,
        left: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    type OperandGenerator = Array<(context: Node, tokens: TokenStream) =>
        typeof infixPattern.left | MismatchToken>

    let operandGenerators: OperandGenerator = [
        generatePrefixPattern, generatePostfixPattern,
        generateBracePattern, generateBracketPattern, generateParenPattern,
        generateInterpPattern, generateLiteral
    ]

    const generateOperand = () => {
        let operand: typeof infixPattern.left
            | MismatchToken = null!

        for (let operandGenerator of operandGenerators) {
            operand = operandGenerator(infixPattern, tokens)
            currentToken = tokens.currentToken

            if (operand.type != "MismatchToken")
                break

            if (operand.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return operand
            }
        }

        return operand
    }

    let operand: typeof infixPattern.left
        | MismatchToken = generateOperand()

    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    currentToken = tokens.currentToken
    infixPattern.left = operand

    infixPattern.start = operand.start
    infixPattern.line = operand.line
    infixPattern.column = operand.column

    const getPrecidence = (op: NonVerbalOperator | VerbalOperator) => {
        return operatorPrecedence.infix.left[op.name]
            ?? operatorPrecedence.infix.right[op.name]
            ?? 10
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const operatorGenerators = [
        generateNonVerbalOperator, generateVerbalOperator
    ]

    let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = null!;

    for (let operatorGenerator of operatorGenerators) {
        _operator = operatorGenerator(infixPattern, tokens)
        currentToken = tokens.currentToken

        if (_operator.type != "MismatchToken")
            break

        if (_operator.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return _operator
        }
    }

    currentToken = tokens.currentToken
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    _operator.precedence = getPrecidence(_operator)
    infixPattern.operator = _operator

    if (infixPattern.left.type == "PrefixPattern") {
        const thisOpPreced = _operator.precedence
        let lhsPrefixOpr = infixPattern.left

        const lhsPrefixOprPreced = infixPattern.left.operator.precedence

        if (thisOpPreced > lhsPrefixOprPreced) {
            infixPattern.left = lhsPrefixOpr.operand
            lhsPrefixOpr.operand = infixPattern

            const partialParse: PartialParse = {
                result: lhsPrefixOpr,
                cursor: tokens.cursor
            }

            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, partialParse)
        }
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    operandGenerators = [
        generateInfixPattern, ...operandGenerators
    ]

    operand = generateOperand()
    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    infixPattern.end = operand.end
    currentToken = tokens.currentToken

    if (operand.type == "InfixPattern") {
        const thisOpPreced = _operator.precedence
        const otherOpPreced = operand.operator.precedence

        if (thisOpPreced > otherOpPreced || thisOpPreced == otherOpPreced && !isRightAssociative(operand.operator)) {

            operand.line = infixPattern.line
            operand.column = infixPattern.column

            operand.start = infixPattern.start
            infixPattern.end = operand.start

            infixPattern.right = operand.left
            operand.left = infixPattern
            infixPattern = operand
        }
        else {
            infixPattern.right = operand
            infixPattern.end = operand.end
        }
    }
    else {
        infixPattern.right = operand
        infixPattern.end = operand.end
    }

    return infixPattern
}