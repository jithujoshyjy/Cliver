import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateStringLiteral } from "../inline/literal/stringLiteral.js"
import { createMismatchToken, skip, skipables, _skipables, type Node } from "../utility"

export function generateUseDeclaration(context: Node, tokens: TokenStream): UseDeclaration | MismatchToken {
    const useDeclar: UseDeclaration = {
        type: "UseDeclaration",
        rules: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken // use

    const captureRule = () => {
        currentToken = skip(tokens, skipables)
        let rule = generateStringLiteral(useDeclar, tokens)

        if (rule.type == "MismatchToken" || rule.kind == "inline")
            return rule

        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        currentToken = skip(tokens, _skipables)
        const isComma = currentToken.type == TokenType.Punctuator && (currentToken.value as string) == ","

        if (!isComma)
            return createMismatchToken(currentToken)

        return currentToken
    }

    const firstRule = captureRule()
    if (firstRule.type == "MismatchToken")
        return firstRule

    useDeclar.rules.push(firstRule)

    while (!tokens.isFinished) {
        const comma = captureComma()
        if (comma.type == "MismatchToken")
            break
        const rule = captureRule()
        if (rule.type == "MismatchToken")
            return rule

        useDeclar.rules.push(rule)
    }

    return useDeclar
}