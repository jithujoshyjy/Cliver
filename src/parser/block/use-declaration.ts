import { TokenStream } from "../../lexer/token.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateStringLiteral, printStringLiteral } from "../inline/literal/string-literal.js"
import { createMismatchToken, isPunctuator, skip, _skipables, type Node, isKeyword } from "../utility.js"

export function generateUseDeclaration(context: Node, tokens: TokenStream): UseDeclaration | MismatchToken {
    const useDeclar: UseDeclaration = {
        type: "UseDeclaration",
        rules: [],
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const useKeyword = generateKeyword(useDeclar, tokens)
    if (useKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return useKeyword
    }

    if (!isKeyword(useKeyword, "use")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    useDeclar.start = useKeyword.start
    useDeclar.line = useKeyword.line
    useDeclar.column = useKeyword.column

    let isInitial = true, lastDelim: LexicalToken | MismatchToken | null = null
    const parseRule = () => {
        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken

        let rule = generateStringLiteral(useDeclar, tokens)

        if (rule.type == "MismatchToken" || rule.kind == "inline")
            return rule

        lastDelim = null
        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        const initialToken = tokens.currentToken

        if (!isPunctuator(initialToken, ","))
            return createMismatchToken(initialToken)

        currentToken = skip(tokens, _skipables)
        return initialToken
    }

    while (!tokens.isFinished) {
        
        if (currentToken.type == "EOF" || currentToken.type == "Newline" || isPunctuator(currentToken, ';')) {
            useDeclar.end = currentToken.end
            tokens.advance()
            break
        }

        if (!isInitial && lastDelim == null) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (lastDelim?.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return lastDelim
        }

        const rule = parseRule()
        if (rule.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return rule
        }

        useDeclar.rules.push(rule)
        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken

        lastDelim = captureComma()
        isInitial = false
    }

    if (useDeclar.rules.length == 0) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return useDeclar
}

export function printUseDeclaration(token: UseDeclaration, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "UseDeclaration" +
        token.rules.reduce((a, c, i, arr) => a + '\n' + space.repeat(indent) +
            (i == arr.length - 1 ? endJoiner : middleJoiner) + printStringLiteral(c, indent + 1), "")
}