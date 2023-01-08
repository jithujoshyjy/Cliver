import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generatePairPattern(context: Node, tokens: TokenStream): PairPattern | MismatchToken {
    const pairPattern: PairPattern = {
        type: "PairPattern",
        key: null!,
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const keyGenerators = [
        generatePrefixPattern, generatePostfixPattern, generateLiteral,
    ]

    const valueGenerators = [
        generateAsExpression, generateInfixPattern, generatePrefixPattern, generatePostfixPattern, generateTypeAssertion, generateBracePattern, generateParenPattern, generateBracketPattern,
        generateInterpPattern, generateLiteral
    ]

    let key: PrefixPattern
        | PostfixPattern
        | Literal
        | MismatchToken = null!

    for (let keyGenerator of keyGenerators) {
        key = keyGenerator(pairPattern, tokens)
        currentToken = tokens.currentToken
        if (key.type != "MismatchToken") {
            break
        }
    }

    if (key.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return key
    }

    pairPattern.key = key
    currentToken = skip(tokens, skipables) // :

    if (!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    let value: AsExpression
        | TypeAssertion
        | BracePattern
        | BracketPattern
        | ParenPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | InterpPattern
        | Literal
        | MismatchToken = null!

    for (let valueGenerator of valueGenerators) {
        value = valueGenerator(pairPattern, tokens)
        currentToken = tokens.currentToken
        if (value.type != "MismatchToken") {
            break
        }
    }

    if (value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }

    pairPattern.value = value

    return pairPattern
}