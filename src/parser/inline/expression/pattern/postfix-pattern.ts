import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, skip, type Node, _skipables, operatorPrecedence } from "../../../utility.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"

export function generatePostfixPattern(context: Node, tokens: TokenStream): PostfixPattern | MismatchToken {
    const postfixPattern: PostfixPattern = {
        type: "PostfixPattern",
        operand: null!,
        operator: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const operandGenerators = [
        generateBracePattern, generateBracketPattern, generateParenPattern,
        generateInterpPattern, generateIdentifier
    ]

    let operand: Identifier
        | BracePattern
        | BracketPattern
        | ParenPattern
        | InterpPattern
        | MismatchToken = null!

    for (let operandGenerator of operandGenerators) {
        operand = operandGenerator(postfixPattern, tokens)
        currentToken = tokens.currentToken
        if (operand.type != "MismatchToken") {
            break
        }
    }

    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    postfixPattern.operand = operand
    postfixPattern.start = operand.start

    currentToken = skip(tokens, _skipables) // operator
    let _operator = generateNonVerbalOperator(postfixPattern, tokens)

    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    const validPostfixOp = [
        "?",
    ]

    currentToken = tokens.currentToken
    if (!validPostfixOp.includes(currentToken.value as string)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const getPrecidence = (op: NonVerbalOperator): number => {
        const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
        const defaultPreced = isVerbalOperator ? 2 : 10
        switch (op.type) {
            case "NonVerbalOperator":
                return operatorPrecedence.postfix[op.name] ?? defaultPreced
        }
    }

    _operator.kind = "prefix"
    _operator.precedence = getPrecidence(_operator)
    _operator.end = _operator.end

    postfixPattern.operator = _operator

    return postfixPattern
}