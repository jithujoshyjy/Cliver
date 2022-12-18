import { Token, TokenStream, TokenType } from "../lexer/token.js"

export const skip = (tokens: TokenStream, tokenTypes: TokenType[]) => {
    while (!tokens.isFinished) {
        tokens.advance()
        if (!tokenTypes.includes(tokens.currentToken.type))
            break
    }
    return tokens.currentToken
}

export const isKeyword = (token: Token, keyword: KeywordKind) =>
    token.type == TokenType.Keyword && token.value == keyword

export const isOperator = (token: Token, opr: VerbalOperatorKind | string) =>
    (token.type == TokenType.Keyword || token.type == TokenType.Operator) &&
    token.value == opr

export const isPunctuator = (token: Token, punctuator: string) =>
    token.type == TokenType.Punctuator && token.value == punctuator

export const createMismatchToken = (token: Token, error?: string): MismatchToken => ({
    type: "MismatchToken",
    error: error ?? `Unexpected token '${token.type}' on ${token.line}:${token.column}`,
    value: token,
    start: token.line,
    end: token.column
})

export type Node = {
    type: string,
    start: number,
    end: number
}

export const skipables = [
    TokenType.MultiLineComment,
    TokenType.SingleLineComment,
    TokenType.WhiteSpace,
    TokenType.Newline
];

export const _skipables = [
    TokenType.MultiLineComment,
    TokenType.SingleLineComment,
    TokenType.WhiteSpace
];

export const stringLiterals = [
    TokenType.InlineASCIIStringLiteral,
    TokenType.InlineUnicodeStringLiteral,
    TokenType.MultilineASCIIStringLiteral,
    TokenType.MultilineUnicodeStringLiteral,
]

type PrecidenceType = {
    infix: { left: { [key: string]: number }, right: { [key: string]: number }, },
    prefix: { [key: string]: number },
    postfix: { [key: string]: number },
}

export const operatorPrecedence: PrecidenceType = {
    infix: {
        left: {
            "..": 1, "..?": 1,
            ":": 2, "=": 2, ":=": 2, "::": 2,
            "+=": 2, "-=": 2, "*=": 2, "/=": 2, "^=": 2, "%=": 2,
            "&&=": 2, "||=": 2, ".&&=": 2, ".||=": 2,
            ".+=": 2, ".-=": 2, ".*=": 2, "./=": 2, ".%=": 2, ".^=": 2,
            "||": 3, "??": 3, ".||": 3,
            "&&": 4, ".&&": 4,
            "|": 5,
            "&": 7,
            "==": 8, "!=": 8,
            "in": 9, "in!": 9, "of": 9, "to": 9, "is": 9, "is!": 9, "as": 9,
            "<=": 9, ">=": 9, "<": 9, ">": 9,
            "+": 11, "-": 11, ".+": 11, ".-": 11,
            "*": 12, "/": 12, "%": 12, ".*": 12, "./": 12, ".%": 12,
            "<~": 17, ".": 17, "?.": 17,
        },
        right: {
            "`": 2,
            "^": 13, ".^": 13,
        }
    },
    prefix: {
        "...": 2, "ref": 2, "throw": 2,
        "~": 6,
        "!": 14, "+": 14, "-": 14,
    },
    postfix: {
        "?": 2,
    }
}