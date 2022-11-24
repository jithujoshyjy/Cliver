import { TokenStream, TokenType } from "../lexer/token"

export const skip = (tokens: TokenStream, tokenTypes: TokenType[]) => {
    while (!tokens.isFinished)
        if (tokenTypes.includes(tokens.currentToken.type))
            tokens.advance()
        else
            break
    return tokens.currentToken
}

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