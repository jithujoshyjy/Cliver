import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { createMismatchToken, isPunctuator, skip, skipables, _skipables, type Node } from "../utility.js"

export function generateUseDeclaration(context: Node, tokens: TokenStream): UseDeclaration | MismatchToken {
    const useDeclar: UseDeclaration = {
        type: "UseDeclaration",
        rules: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // use
    const initialCursor = tokens.cursor

    const captureRule = () => {
        currentToken = skip(tokens, skipables)
        let rule = generateStringLiteral(useDeclar, tokens)

        if (rule.type == "MismatchToken" || rule.kind == "inline")
            return rule

        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        currentToken = skip(tokens, _skipables)
        if (!isPunctuator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const firstRule = captureRule()
    if (firstRule.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return firstRule
    }

    useDeclar.rules.push(firstRule)

    while (!tokens.isFinished) {
        const comma = captureComma()
        if (comma.type == "MismatchToken")
            break
        const rule = captureRule()
        if (rule.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return rule
        }

        useDeclar.rules.push(rule)
    }

    return useDeclar
}