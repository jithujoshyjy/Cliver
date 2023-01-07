type LexicalKind = "Integer"
    | "Punctuator"
    | "Operator"
    | "Newline"
    | "Word"
    | "Whitespace"
    | "UnknownToken"
    | "EmptyToken"
    | "EOF"

type LexicalToken = {
    type: LexicalKind,
    file: string,
    value: string,
    line: number,
    column: number,
    start: number,
    end: number
}