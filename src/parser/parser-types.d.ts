type ProgramToken = ( Program
    | Statement
    | Block
    | Term
    | Literal
    ) & {
        type: string,
        line: number,
        column: number,
        parent?: ProgramToken
    }

type Program = {
    type: "Program",
    value: Array<Expression | Block | Statement>
}

type Statement = ImportStatement | UseStatement | VariableDeclaration | ValueDeclaration | TypeDeclaration | ValuedTypeSignature

type ImportStatement = {
    type: "ImportStatement",
    args: Array<Identifier|PrefixOperator>,
    module: Array<Identifier> | StringLiteral
}

type UseStatement = {
    type: "UseStatement",
    value: string
}

type VariableDeclaration = {
    type: "VariableDeclaration",
    left: TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed,
    right: Expression
}

type ValueDeclaration = {
    type: "ValueDeclaration",
    left: TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed,
    right: Expression
}

type TypeDeclaration = {
    type: "TypeDeclaration",
    left: FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed,
    right: Expression
}

type ValuedTypeSignature = {
    type: "ValuedTypeSignature",
    left: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
    right: Expression
}
 
type Block = NamedFunction | IfBlock | ForBlock | DoBlock | BlockMacro | Label

type NamedFunction = {
    type: "NamedFunction",
    name: Identifier,
    args: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
    modifiers: Array<Identifier>,
    body: Array<Expression | Block | Statement>
}

type IfBlock = {
    type: "IfBlock",
    blocks: {
        if: {
            condition: Array<Expression>,
            body: Array<Expression | Block | Statement>
        },
        elseif: Array<{
            condition: Array<Expression>,
            body: Array<Expression | Block | Statement>
        }>,
        else?: Array<Expression | Block | Statement>
    },
}

type ForBlock = {
    type: "ForBlock",
    blocks: {
        for: {
            condition: Array<Expression>,
            body: Array<Expression | Block | Statement>
        },
        done?: {
            status: Identifier,
            body: Array<Expression | Block | Statement>
        }
    },
}

type DoBlock = {
    type: "DoBlock",
    blocks: {
        do: Array<Expression | Block | Statement>,
        catch: Array<{
            condition: Array<Expression>,
            body: Array<Expression | Block | Statement>
        }>
    },
}

type BlockMacro = {
    type: "BlockMacro",
    caller: Identifier
}

type Label = {
    type: "Label",
    name: Identifier,
    value: Expression
}

 
type Term = AssignExpr | AnonFunction | AnonTypeSignature | PipelineConstruct | InlineMacro | IfExpr | ForExpr | DoExpr | MatchExpr | TypeExpr | AsExpr | UnitFunction | StringFragment | SymFragment | CharFragment | CharLiteral | InfixCallNotation | ObjectExtendNotation | ObjectCascadeNotation | ExternalCallbackNotation | Literal

type AssignExpr = {
    type: "AssignExpr",
    left: FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed,
    right: Expression
}

type AnonFunction = {
    type: "AnonFunction",
    args: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
    modifiers: Array<Identifier>,
    body: Array<Expression | Block | Statement>
}

type AnonTypeSignature = {
    type: "AnonTypeSignature",
    value: Expression,
    constraints: CurlyBraceEnclosed
}

type PipelineConstruct = {
    type: "PipelineConstruct",
    payload: AsExpr | Term | Expression,
    pipes: Array<{ type: "TransformPipe", value: Identifier | FunctionCall | PropertyDotAccess | ProperyBracketAccess | TaggedString | TaggedNumber | ImplicitMultip | OperatorRef | UnitFunction | AnonFunction | Expression } |
    { type: "ErrorPipe", value: Identifier | FunctionCall | PropertyDotAccess | ProperyBracketAccess | TaggedString | TaggedNumber | ImplicitMultip | OperatorRef | UnitFunction | AnonFunction | Expression }>
}

type InlineMacro = {
    type: "InlineMacro",
    caller: Identifier | FunctionCall | PropertyDotAccess | ProperyBracketAccess,
    args: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
}

type IfExpr = {
    type: "IfExpr",
    condition: Expression,
    body: Expression,
    else: Expression
}

type ForExpr = {
    type: "ForExpr",
    condition: Expression,
    body: Expression
}

type DoExpr = {
    type: "DoExpr",
    body: Array<Expression | Block | Statement>,
}

type MatchExpr = {
    type: "MatchExpr",
    conditions: Expression,
    body: Array<CaseExpr>,
}

type CaseExpr = {
    type: "CaseExpr",
    pattern: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
    body: Expression
}

type TypeExpr = {
    type: "TypeExpr",
    value: Expression
}

type AsExpr = {
    type: "AsExpr",
    value: Expression,
    label: Identifier | CaseExpr | TypeExpr
}

type UnitFunction = {
    type: "UnitFunction",
    args: Array<FunctionCall | TupleLiteral | Array | Identifier | ObjectExtendNotation | CurlyBraceEnclosed>,
    body: Expression
}

type StringFragment = {
    type: "StringFragment",
    value: StringLiteral[]
}

type SymFragment = {
    type: "SymFragment",
    value: SymbolicLiteral[]
}

type CharFragment = {
    type: "CharFragment",
    value: CharLiteral[]
}

type InfixCallNotation = {
    type: "InfixCallNotation",
    caller: PropertyDotAccess | Identifier,
    left: Expression,
    right: Expression
}

type ObjectExtendNotation = {
    type: "ObjectExtendNotation",
    left: Identifier | FunctionCall | PropertyDotAccess | ProperyBracketAccess | Expression,
    right: CurlyBraceEnclosed
}

type ObjectCascadeNotation = {
    type: "ObjectCascadeNotation",
    object: Identifier | FunctionCall | PropertyDotAccess | ProperyBracketAccess | Expression,
    cascades: Array<AssignExpr | FunctionCall>
}

type ExternalCallbackNotation = {
    type: "ExternalCallbackNotation",
    caller: TaggedString | TaggedNumber | OperatorRef | Identifier | PropertyDotAccess | ProperyBracketAccess | FunctionCall | Expression,
    args: TupleLiteral,
    body: Array<Expression | Block | Statement>
}
 
type Literal = FunctionCall | PropertyDotAccess | ProperyBracketAccess | TaggedString | TaggedNumber | NumericLiteral | ImplicitMultip | StringLiteral | SymbolicLiteral | CharLiteral | Identifier | MetaDataInterp | TupleLiteral | ArrayLiteral | CurlyBraceEnclosed | OperatorRef

type FunctionCall = {
    type: "FunctionCall",
    caller: TaggedString | TaggedNumber | OperatorRef | Identifier | PropertyDotAccess | ProperyBracketAccess | FunctionCall | Expression,
    args: TupleLiteral
}

type PropertyDotAccess = {
    type: "PropertyDotAccess",
    object: Literal | Expression,
    property: Identifier | IntegerLiteral
}

type ProperyBracketAccess = {
    type: "ProperyBracketAccess",
    object: Literal | Expression,
    property: Identifier | IntegerLiteral
}

type TaggedString = {
    type: "TaggedString",
    value: InlineTaggedString | MultilineTaggedString
}

type InlineTaggedString = {
    type: "InlineTaggedString",
    tag: OperatorRef | Identifier | PropertyDotAccess | ProperyBracketAccess | FunctionCall | Expression,
    parts: Array<StringLiteral|CurlyBraceEnclosed|Identifier>
}

type MultilineTaggedString = {
    type: "MultilineTaggedString",
    tag: OperatorRef | Identifier | PropertyDotAccess | ProperyBracketAccess | FunctionCall | Expression,
    parts: Array<StringLiteral|CurlyBraceEnclosed|Identifier>
}

type TaggedNumber = {
    type: "TaggedNumber",
    tag: OperatorRef | Identifier | Expression
}

type NumericLiteral = {
    type: "NumericLiteral",
    value: IntegerLiteral | FloatLiteral
}

type IntegerLiteral = {
    type: "IntegerLiteral",
    value: string
}

type FloatLiteral = {
    type: "FloatLiteral",
    value: string
}

type ImplicitMultip = {
    type: "ImplicitMultip",
    number: NumericLiteral,
    identifier: Identifier | Expression
}

type StringLiteral = {
    type: "StringLiteral",
    value: InlineStringLiteral | MultilineStringLiteral
}

type EscapeSequence = {
    type: "EscapeSequence",
    value: string,
    kind: "regular" | "doubleHex" | "quadHex" | "polyHex",
    raw: string,
    trailing: string,
    start: number,
    end: number
}

type InlineStringLiteral = {
    type: "InlineStringLiteral",
    value: InlineASCIIStringLiteral | InlineUnicodeStringLiteral
}

type InlineASCIIStringLiteral = {
    type: "InlineASCIIStringLiteral",
    value: string
}

type InlineUnicodeStringLiteral = {
    type: "InlineUnicodeStringLiteral",
    value: string
}

type MultilineStringLiteral = {
    type: "MultilineStringLiteral",
    value: MultilineASCIIStringLiteral | MultilineUnicodeStringLiteral
}

type MultilineASCIIStringLiteral = {
    type: "MultilineASCIIStringLiteral",
    value: string
}

type MultilineUnicodeStringLiteral = {
    type: "MultilineUnicodeStringLiteral",
    value: string
}

type SymbolicLiteral = {
    type: "SymbolicLiteral"
    value: SymbolicCharLiteral | SymbolicStringLiteral
}

type SymbolicStringLiteral = {
    type: "SymbolicStringLiteral",
    value: string
}

type SymbolicCharLiteral = {
    type: "SymbolicCharLiteral",
    value: string
}

type CharLiteral = {
    type: "CharLiteral",
    value: string
}

type Identifier = {
    type: "Identifier",
    value: string
}

type MetaDataInterp = {
    type: "MetaDataInterp",
    value: Array<Statement|Block|Expression>
}

type TupleLiteral = {
    type: "TupleLiteral",
    value: Array<Expression|Pair>
}

type ArrayLiteral = {
    type: "ArrayLiteral",
    value: Array<Expression|Pair>
}

type CurlyBraceEnclosed = {
    type: "CurlyBraceEnclosed",
    value: Array<Expression | Statement | Block>
}

type OperatorRef = {
    type: "OperatorRef",
    value: Operator
}

type Operator = {
    type: "Operator",
    value: PrefixOperator | InfixOperator | PostfixOperator
}

type InfixOperator = {
    type: "InfixOperator",
    value: NonVerbalInfixOperator | VerbalInfixOperator | InfixCallSite
}

type NonVerbalInfixOperator = {
    type: "NonVerbalInfixOperator",
    value: string
}

type VerbalInfixOperator = {
    type: "VerbalInfixOperator",
    value: string
}

type InfixCallSite = {
    type: "InfixCallSite",
    value: PropertyDotAccess | Identifier
}

type PrefixOperator = {
    type: "PrefixOperator",
    value: NonVerbalPrefixOperator | VerbalPrefixOperator
}

type NonVerbalPrefixOperator = {
    type: "NonVerbalPrefixOperator",
    value: string
}

type VerbalPrefixOperator = {
    type: "VerbalPrefixOperator",
    value: string
}

type PostfixOperator = {
    type: "PostfixOperator",
    value: NonVerbalPostfixOperator | VerbalPostfixOperator
}

type NonVerbalPostfixOperator = {
    type: "NonVerbalPostfixOperator",
    value: string
}

type VerbalPostfixOperator = {
    type: "VerbalPostfixOperator",
    value: string
}

type Pair = {
    type: "Pair",
    key: Literal | Expression,
    value: Expression
}

type Expression = {
    type: "Expression",
    operands: Array<Expression | Term>
    operators: Array<Operator>
}
