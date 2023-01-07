import { type TokenStream } from "../lexer/token.js"

export type Node = {
    type: string,
    start: number,
    end: number
}

export const skip = (tokens: TokenStream, tokenTypes: LexicalKind[]) => {
    while (!tokens.isFinished) {
        tokens.advance()
        if (!tokenTypes.includes(tokens.currentToken.type))
            break
    }
    return tokens.currentToken
}
export const punctuators = ['(', ')', '[', ']', '{', '}', ',', ';', '\'', '"', "\\", "$", "#"]
export const operators = [
    "=", "@", "~", ".", "?", "|", "&", "~", "!", "+", "-", "*", "^", "/",
    "%", "<", ">", '`', ":",
]
export const keywords = [
    "done", "do", "fun", "var", "val", "type",
    "end", "ref", "case", "if", "elseif", "else", "for", "catch",
    "throw", "in!", "in", "of", "use", "import", "export", "from",
    "to", "is!", "is", "as"
]

export const isKeyword = (token: LexicalToken, keyword: KeywordKind) =>
    token.type == "Word" && keywords.includes(token.value)

export const isOperator = (token: LexicalToken, opr: VerbalOperatorKind | string) =>
    (token.type == "Word" && keywords.includes(token.value) || token.type == "Operator")
    && token.value == opr

export const isPunctuator = (token: LexicalToken, punctuator: string) =>
    token.type == "Punctuator" && token.value == punctuator

type PartialParse = { result: Node, cursor: number }
export const createMismatchToken = (token: LexicalToken, error?: string | PartialParse): MismatchToken => {

    const partialParse = error && typeof error == "object"
        ? { partialParse: { ...error } }
        : {}

    return {
        type: "MismatchToken",
        error: typeof error != "string"
            ? `Unexpected token '${token.type}' on ${token.line}:${token.column}`
            : error,
        value: token,
        ...partialParse,
        start: token.line,
        end: token.column
    }
}

export const skipables = [
    /* TokenType.MultiLineComment,
    TokenType.SingleLineComment, */
    "WhiteSpace",
    "Newline"
] as LexicalKind[]

export const _skipables = [
    /* TokenType.MultiLineComment,
    TokenType.SingleLineComment, */
    "WhiteSpace" as LexicalKind,
]

export const stringLiterals = [
    /* TokenType.InlineASCIIStringLiteral,
    TokenType.InlineUnicodeStringLiteral,
    TokenType.MultilineASCIIStringLiteral,
    TokenType.MultilineUnicodeStringLiteral, */
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