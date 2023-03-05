import { TokenStream } from "../../../lexer/token.js"
import { createDiagnosticMessage, createMismatchToken, DiagnosticMessage, isPunctuator, type Node } from "../../utility.js"
import { generateEscapeSequence } from "./escape-sequence.js"

export function generateCharLiteral(context: string[], tokens: TokenStream): CharLiteral | MismatchToken {
    const charLiteral: CharLiteral = {
        type: "CharLiteral",
        charset: "ascii",
        text: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(!isPunctuator(currentToken, "'")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    charLiteral.start = currentToken.start
    charLiteral.line = currentToken.line

    charLiteral.column = currentToken.column
    tokens.advance()

    currentToken = tokens.currentToken
    if(isPunctuator(currentToken, '\\')) {
        const escapeSequence = generateEscapeSequence(["CharLiteral", ...context], tokens)
        
        if(escapeSequence.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return escapeSequence
        }

        if(escapeSequence.trailing) {
            tokens.cursor = initialCursor
            const error: DiagnosticMessage = "Multiple characters in character literal on {0}:{1}"
            return createMismatchToken(currentToken, [error, currentToken.line, escapeSequence.end + escapeSequence.trailing.length])
        }

        charLiteral.text = escapeSequence
        charLiteral.charset =  escapeSequence.value.codePointAt(0)! > 127 ? "unicode" : "ascii"
    }
    else {

        if(currentToken.type == "EOF") {
            tokens.cursor = initialCursor
            const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
            return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
        }

        charLiteral.text = currentToken.value
        if(/[\s\S]{2,}/u.test(currentToken.value)) {
            tokens.cursor = initialCursor
            const error: DiagnosticMessage = "Multiple characters in character literal on {0}:{1}"
            return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
        }

        charLiteral.charset = charLiteral.text.codePointAt(0)! > 127 ? "unicode" : "ascii"
        tokens.advance()
    }

    currentToken = tokens.currentToken
    if(!isPunctuator(currentToken, "'")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    charLiteral.end = currentToken.end
    tokens.advance()

    return charLiteral
}

export function printCharLiteral(token: CharLiteral, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    
    const quote = "'"
    const space = ' '.repeat(4)
    return "CharLiteral\n" + space.repeat(indent) + endJoiner +
        token.charset + quote + token.text + quote
}