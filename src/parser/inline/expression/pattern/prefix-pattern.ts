import { TokenStream } from "../../../../lexer/token.js"
import { skip, type Node, _skipables, operatorPrecedence, createMismatchToken, skipables, isBlockedType } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateNonVerbalOperator } from "../operation.ts/non-verbal-operator.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"

export function generatePrefixPattern(context: string[], tokens: TokenStream): PrefixPattern | MismatchToken {
    const prefixPattern: PrefixPattern = {
        type: "PrefixPattern",
        operand: null!,
        operator: null!,
        includesNamed: false,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let _operator = generateNonVerbalOperator(["PrefixPattern", ...context], tokens)

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
    prefixPattern.line = _operator.line
    prefixPattern.column = _operator.column

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
    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const operandGenerators = [
        generatePrefixPattern, generatePostfixPattern, generateBracePattern,
        generateBracketPattern, generateParenPattern,
        generateInterpPattern, generateLiteral
    ]

    let operand: Literal
        | BracePattern
        | BracketPattern
        | ParenPattern
        | InterpPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | MismatchToken = null!

    for (let operandGenerator of operandGenerators) {
        if (isBlockedType(operandGenerator.name.replace("generate", '')))
            continue

        operand = operandGenerator(["PrefixPattern", ...context], tokens)
        currentToken = tokens.currentToken

        if (operand.type != "MismatchToken") {
            break
        }

        if (operand.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return operand
        }
    }

    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    prefixPattern.includesNamed =
        operand.type == "Literal" && operand.value.type == "Identifier" ||
        operand.type != "Literal" && operand.includesNamed

    prefixPattern.operand = operand
    prefixPattern.end = operand.end

    return prefixPattern
}