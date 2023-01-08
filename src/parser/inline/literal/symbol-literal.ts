import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isPunctuator, type Node } from "../../utility.js"

export function generateSymbolLiteral(context: Node, tokens: TokenStream): SymbolLiteral | MismatchToken {
    const symbolLiteral: SymbolLiteral = {
        type: "SymbolLiteral",
        text: "",
        charset: "ascii",
        kind: "char",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (!isPunctuator(currentToken, '\\')) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    symbolLiteral.start = currentToken.start
    symbolLiteral.line = currentToken.line
    symbolLiteral.column = currentToken.column

    tokens.advance()
    currentToken = tokens.currentToken

    while (!tokens.isFinished && ["Word", "Integer"].includes(currentToken.type)) {

        symbolLiteral.text += currentToken.value
        symbolLiteral.end = currentToken.end

        tokens.advance()
        currentToken = tokens.currentToken
    }

    const charCount = symbolLiteral.text.match(/[\s\S]+?/gu)?.length ?? 0
    
    if(charCount == 0) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if (charCount > 1)
        symbolLiteral.kind = "string"

    for (const _char of symbolLiteral.text)
        if (_char.codePointAt(0)! > 127)
            symbolLiteral.charset = "unicode"

    return symbolLiteral
}

export function printSymbolLiteral(token: SymbolLiteral, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    
    const slash = '\\'
    return "SymbolLiteral\n" + '\t'.repeat(indent) + endJoiner +
        token.charset + slash + token.text + '\n'
}