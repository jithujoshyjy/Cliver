import { TokenType, type TokenStream } from "../lexer/token";

export function generateAST(tokens: TokenStream): object {
    const currentToken = tokens.currentToken;
    switch (currentToken.type) {
        case TokenType.SingleLineComment:
        case TokenType.MultiLineComment:
            return {};
        case TokenType.IntegerLiteral:
        case TokenType.FloatLiteral:
            return {};
        case TokenType.Keyword:
            return {};
        case TokenType.Identifier:
            return {};
        case TokenType.Operator:
            return {};
        case TokenType.ParenEnclosed:
            return {};
        case TokenType.BraceEnclosed:
            return {};
        case TokenType.BraceEnclosed:
            return {};
        case TokenType.ASCIICharLiteral:
        case TokenType.UnicodeCharLiteral:
            return {};
        case TokenType.SymASCIIStringLiteral:
        case TokenType.SymUnicodeStringLiteral:
            return {};
        case TokenType.SymASCIICharLiteral:
        case TokenType.SymUnicodeCharLiteral:
            return {};
        case TokenType.MultilineASCIIStringLiteral:
        case TokenType.MultilineUnicodeStringLiteral:
            return {};
        case TokenType.InlineASCIIStringLiteral:
        case TokenType.InlineUnicodeStringLiteral:
            return {};
        case TokenType.MultilineFormatString:
            return {};
        case TokenType.InlineFormatString:
            return {};
        case TokenType.Newline:
            return {};
        case TokenType.WhiteSpace:
            return {};
        case TokenType.Punctuator:
            return {};
    }
    return {};
}