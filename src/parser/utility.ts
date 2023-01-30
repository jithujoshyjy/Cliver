import { type TokenStream } from "../lexer/token.js"
import { generateComment } from "./comment.js"
import diagnosticMessages from "./diagnostic-messages.js"

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

export const isKeyword = (token: Node, keyword: KeywordKind) =>
    token.type == "Keyword" && token.name == keyword

export const isOperator = (token: LexicalToken, opr: string) =>
    token.type == "Operator" && token.value == opr

export const isPunctuator = (token: LexicalToken, punctuator: string) =>
    token.type == "Punctuator" && token.value == punctuator

export const isRightAssociative = (op: InfixCallOperator | NonVerbalOperator | VerbalOperator) => {
    const value = op.type == "InfixCallOperator" ? "`" : op.name
    return value in operatorPrecedence.infix.right
}

export type PartialParse = { result: Node, cursor: number, meta?: { [x: string]: any } }
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

export const lookAheadForStringLiteral = (tokens: TokenStream) => {
    const initialCursor = tokens.cursor
    let currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const stringLiteralAhead = isPunctuator(currentToken, '"')
    tokens.cursor = initialCursor

    return stringLiteralAhead
}

export const lookAheadForSymbolLiteral = (tokens: TokenStream) => {
    const initialCursor = tokens.cursor
    let currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const symbolLiteralAhead = isPunctuator(currentToken, '\\')
    tokens.cursor = initialCursor

    return symbolLiteralAhead
}

export const lookAheadForFunctionCall = (tokens: TokenStream) => {
    const initialCursor = tokens.cursor
    let currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const functionCallAhead = isPunctuator(currentToken, '(')
    tokens.cursor = initialCursor

    return functionCallAhead
}

export const lookAheadForPropertyAccess = (tokens: TokenStream) => {
    const initialCursor = tokens.cursor
    let currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    let propertyAccessAhead = false
    if (isOperator(currentToken, '?'))
        currentToken = skip(tokens, _skipables)

    if (isPunctuator(currentToken, '['))
        propertyAccessAhead = true

    else {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const isDotOperator = isOperator(currentToken, '.') || isOperator(currentToken, '?.')
        if (isDotOperator)
            propertyAccessAhead = true
    }

    tokens.cursor = initialCursor
    return propertyAccessAhead
}

type NodeGenerator = (context: Node, tokens: TokenStream) => Node
export const reparseIfNeeded = <T extends NodeGenerator>(context: Node, tokens: TokenStream, partialParse: PartialParse, nodeGenerators: T[]): [Node, ReturnType<(typeof nodeGenerators)[0]> | MismatchToken] => {
    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const { result, cursor } = partialParse
    context.meta.resumeFrom = cursor

    let node: ReturnType<(typeof nodeGenerators)[0]> | MismatchToken = createMismatchToken(currentToken)

    if (!partialParse.meta?.parentType)
        return [result, node]

    const nodeGenerator = nodeGenerators
        .find(x => x.name.endsWith(partialParse.meta?.parentType))!

    node = nodeGenerator(context, tokens) as ReturnType<(typeof nodeGenerators)[0]> | MismatchToken

    node.line = result.line
    node.column = result.column
    node.start = result.start

    currentToken = tokens.currentToken
    if (!node.partialParse)
        return [result, node]

    return reparseIfNeeded(context, tokens, node.partialParse, nodeGenerators)
}