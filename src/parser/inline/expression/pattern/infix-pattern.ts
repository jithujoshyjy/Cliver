import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, skip, skipables, type Node, isOperator } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateCaseExpr } from "../case-expression.js"
import { generateExpression } from "../expression.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generateInfixPattern(context: Node, tokens: TokenStream): InfixPattern | MismatchToken {
    const infixPattern: InfixPattern = {
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

    type Operand = BracePattern
        | BracketPattern
        | ParenPattern
        | InterpPattern
        | InfixPattern
        | PrefixPattern
        | PostfixPattern
        | Literal
        | MismatchToken

    const nodeGenerators: Array<(context: Node, tokens: TokenStream) => Operand | CaseExpr | Expression> = [
        generatePrefixPattern, generatePostfixPattern,
        generateBracePattern, generateBracketPattern, generateParenPattern,
        generateInterpPattern, generateLiteral
    ]

    let lhs: Operand = null!
    for (let nodeGenerator of nodeGenerators) {
        lhs = nodeGenerator(infixPattern, tokens) as Operand
        currentToken = tokens.currentToken
        if (lhs.type != "MismatchToken")
            break

        if (lhs.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return lhs
        }
    }

    if (lhs.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return lhs
    }

    infixPattern.start = lhs.start
    infixPattern.end = lhs.end

    const getPrecidence = (op: typeof currentToken) =>
        operatorPrecedence.infix.left[op.value as string] ??
        operatorPrecedence.infix.right[op.value as string] ?? 10

    const isRightAssociative = (op: typeof currentToken) =>
        op.value as string in operatorPrecedence.infix.right

    const _infixPattern = _generateInfixPattern(lhs)

    if (_infixPattern.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _infixPattern
    }

    return _infixPattern

    function _generateInfixPattern(lhs: Exclude<Operand, MismatchToken>, minPrecedence = 0): InfixPattern | MismatchToken {

        const initialCursor = tokens.cursor
        let currentToken = tokens.currentToken

        if (skipables.includes(currentToken))
            currentToken = skip(tokens, skipables)

        let currentOpPrecedence = 0
        const isOpKind = (op: typeof currentToken) =>
            op.type == "Operator"

        const decidePreced = (op: typeof currentToken) => {
            currentOpPrecedence = isOpKind(op) ? getPrecidence(op) : 0
            return currentOpPrecedence
        }

        while (isOpKind(currentToken) && decidePreced(currentToken) >= minPrecedence) {

            const andConditionalExprs = [
                generateCaseExpr, generateExpression
            ]

            const orConditionalExprs = [
                generateCaseExpr
            ]

            let _operator: NonVerbalOperator | MismatchToken = generateNonVerbalOperator(infixPattern, tokens)

            if (_operator.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return _operator
            }

            const validInfixOp = [
                "&", "|", "-"
            ]

            currentToken = tokens.currentToken
            const isInvalidOp = !validInfixOp.includes(currentToken.value as string)

            let conditionalExprType: "and" | "or" | "none" = "none"
            if (isInvalidOp && isOperator(currentToken, "&&")) {
                conditionalExprType = "and"
                nodeGenerators.unshift(...andConditionalExprs)
            }
            else if (isInvalidOp && isOperator(currentToken, "||")) {
                conditionalExprType = "or"
                nodeGenerators.unshift(...orConditionalExprs)
            }
            else if (isInvalidOp) {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }

            _operator.precedence = currentOpPrecedence

            currentToken = skip(tokens, skipables) // skip operator

            let rhs: Operand | CaseExpr | Expression = null!

            for (let nodeGenerator of nodeGenerators) {
                rhs = nodeGenerator(infixPattern, tokens)
                if (rhs.type != "MismatchToken")
                    break

                if (rhs.errorDescription.severity <= 3) {
                    tokens.cursor = initialCursor
                    return rhs
                }
            }

            if (rhs.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return rhs
            }

            if (conditionalExprType == "and") {
                andConditionalExprs.forEach(_ =>
                    nodeGenerators.shift())
            }
            else if (conditionalExprType == "or") {
                orConditionalExprs.forEach(_ =>
                    nodeGenerators.shift())
            }

            let nextOpPrecedence = 0

            const isNextOperator = (nextToken: typeof currentToken) => {

                if (nextToken.type == "Operator") {
                    nextOpPrecedence = getPrecidence(nextToken)

                    const nextHasMorePreced = nextOpPrecedence > currentOpPrecedence
                    const isNextRightAssoc = nextOpPrecedence == currentOpPrecedence
                        && isRightAssociative(nextToken)

                    return nextHasMorePreced || isNextRightAssoc
                }

                return false
            }

            const resetCursorPoint = tokens.cursor
            currentToken = skipables.includes(tokens.currentToken) // operator
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (!isNextOperator(currentToken)) {
                tokens.cursor = resetCursorPoint
                currentToken = tokens.currentToken
            }
            else {
                nextOpPrecedence = currentOpPrecedence > nextOpPrecedence ? nextOpPrecedence : 0
                rhs = _generateInfixPattern(rhs as Exclude<Operand, MismatchToken>, nextOpPrecedence)

                if (rhs.type == "MismatchToken") {
                    tokens.cursor = initialCursor
                    return rhs
                }
            }

            lhs = {
                type: "InfixPattern",
                left: lhs,
                operator: _operator,
                right: rhs as Exclude<Operand, MismatchToken>,
                line: lhs.line,
                column: lhs.column,
                start: lhs.start,
                end: rhs.end
            }

            currentToken = skipables.includes(currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken
        }

        if (lhs.type != "InfixPattern") {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return lhs as InfixPattern
    }
}