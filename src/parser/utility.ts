import { type TokenStream } from "../lexer/token.js"
import { generateComment } from "./comment.js"
import diagnosticMessages from "./diagnosticMessages.js"

export type Node = {
    type: string,
    line: number,
    column: number,
    start: number,
    end: number
} & { [x: string]: any }

export type DiagnosticMessage = keyof typeof diagnosticMessages
export type DiagnosticDescription = {
    code: string,
    severity: number,
    catagory: string
}

export const createDiagnosticMessage = <T extends DiagnosticMessage>(message: T, ...args: unknown[]): T => {

    for (const [i, arg] of args.entries())
        message = message.replace("{" + i + "}", String(arg)) as T

    return message
}

export const skip = (tokens: TokenStream, skipable: Skipable) => {
    let currentToken = tokens.currentToken
    while (!tokens.isFinished) {
        tokens.advance()
        currentToken = tokens.currentToken

        if (!skipable.includes(currentToken))
            break

        if (currentToken.value == "#") {
            const comment = generateComment(tokens)
        }
    }
    return currentToken
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

export const isOperator = (token: LexicalToken, opr: string) =>
    token.type == "Operator" && token.value == opr

export const isPunctuator = (token: LexicalToken, punctuator: string) =>
    token.type == "Punctuator" && token.value == punctuator

export type PartialParse = { result: Node, cursor: number }
export type DiagnosticDescriptionObj = Partial<DiagnosticDescription> & { message: DiagnosticMessage, args: any[] }

type DiagnosticObj = {
    partialParse?: PartialParse,
    diagnostics: DiagnosticDescriptionObj
}

export const createMismatchToken = (token: LexicalToken, error?: [DiagnosticMessage, ...any] | PartialParse | DiagnosticObj): MismatchToken => {

    if (Array.isArray(error)) {
        let [message, ...args] = error

        return {
            type: "MismatchToken",
            error: createDiagnosticMessage(message, ...args),
            errorDescription: diagnosticMessages[message],
            value: token,
            line: token.line,
            column: token.column,
            start: token.start,
            end: token.end
        }
    }

    if (error && "diagnostics" in error) {

        const diagnosticDescription: Partial<DiagnosticDescription> = {
            ...(error.diagnostics.catagory ? { catagory: error.diagnostics.catagory } : {}),
            ...(error.diagnostics.code ? { code: error.diagnostics.code } : {}),
            ...(error.diagnostics.severity ? { severity: error.diagnostics.severity } : {})
        }


        return {
            type: "MismatchToken",
            error: createDiagnosticMessage(error.diagnostics.message, ...error.diagnostics.args),
            errorDescription: { ...diagnosticMessages[error.diagnostics.message], ...diagnosticDescription },
            value: token,
            ...(error.partialParse ? { partialParse: error.partialParse } : {}),
            line: token.line,
            column: token.column,
            start: token.start,
            end: token.end
        }
    }

    const partialParse = error ? { partialParse: { ...error } } : {}
    const defaultMessage: DiagnosticMessage = "Unexpected token '{0}' on {1}:{2}"

    return {
        type: "MismatchToken",
        error: createDiagnosticMessage(defaultMessage, token.type, token.line, token.column),
        errorDescription: diagnosticMessages[defaultMessage],
        value: token,
        ...partialParse,
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end
    }
}

type Skipable = {
    includes: (token: LexicalToken) => boolean
}

export type NodePrinter = (token: Node, indent?: number) => string

export const pickPrinter = (printers: Array<NodePrinter>, token: Node) =>
    printers.find(x => x.name.replace(/^print/, "") == token.type)

export const skipables: Skipable = {
    includes(token: LexicalToken) {
        return token.type == "Punctuator" && token.value == "#" ||
            token.type == "Whitespace" ||
            token.type == "Newline"
    }
}

export const _skipables: Skipable = {
    includes(token: LexicalToken) {
        return token.type == "Punctuator" && token.value == "#" ||
            token.type == "Whitespace"
    }
}

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