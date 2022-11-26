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