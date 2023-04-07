type Program = {
    type: "Program",
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type MismatchToken = {
    type: "MismatchToken",
    error: string,
    errorDescription: import("./utility").DiagnosticDescription,
    value: LexicalToken,
    partialParse?: {
        result: any,
        cursor: number
    },
    line: number,
    column: number,
    start: number,
    end: number
}

type ImportDeclaration = {
    type: "ImportDeclaration",
    specifiers: Array<AsExpression | Identifier | ObjectExtendNotation | PrefixOperation | NonVerbalOperator>,
    sources: Array<StringLiteral | TaggedSymbol | FunctionCall | Identifier | PropertyAccess>,
    line: number,
    column: number,
    start: number,
    end: number
}

type VariableDeclaration = {
    type: "VariableDeclaration",
    signature: TypeExpression | null,
    declarations: VariableDeclarator[],
    kind: "var" | "val",
    line: number,
    column: number,
    start: number,
    end: number
}

type VariableDeclarator = {
    type: "VariableDeclarator",
    signature: TypeExpression | null,
    left: Pattern,
    right: Expression | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type Identifier = {
    type: "Identifier",
    name: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type KeywordKind = "do" | "done" | "end" | "fun" | "var" | "val" | "type" | "ref" | "case" | "if" | "elseif" | "else" | "for" | "catch" | "throw" | "in" | "in!" | "of" | "use" | "import" | "export" | "from" | "to" | "is" | "is!" | "as" | "match" | "where"

type Keyword = {
    type: "Keyword",
    name: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeDeclaration = {
    type: "TypeDeclaration",
    declarations: TypeDeclarator[],
    signature: TypeExpression | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeDeclarKind = "alias" | "abstract" | "data"

type TypeDeclarator = {
    type: "TypeDeclarator",
    signature: TypeExpression | null,
    kind: TypeDeclarKind,
    name: Identifier,
    args: Array<Pattern>,
    right: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type UnitFunction = {
    type: "UnitFunction",
    parameters: ParamList,
    signature: TypeExpression | null,
    body: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type AnonFunction = {
    type: "AnonFunction",
    value: InlineAnonFunction | BlockAnonFunction,
    line: number,
    column: number,
    start: number,
    end: number
}

type InlineAnonFunction = {
    type: "InlineAnonFunction",
    parameters: ParamList,
    body: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type BlockAnonFunction = {
    type: "BlockAnonFunction",
    kinds: KindList,
    parameters: ParamList,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type NamedFunction = {
    type: "NamedFunction",
    name: PropertyAccess | Identifier,
    kinds: KindList,
    parameters: ParamList,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type FunctionPrototype = {
    type: "FunctionPrototype",
    kind: FunctionKind[],
    positional: Array<AssignExpr | Pattern>,
    keyword: AssignExpr[],
    captured: Identifier[],
    signature: TypeExpression | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type NonVerbalOperator = {
    type: "NonVerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    precedence: number,
    name: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type VerbalOperatorKind = "ref" | "case" | "throw" | "in" | "in!" | "of" | "to" | "is" | "is!" | "as"

type VerbalOperator = {
    type: "VerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    precedence: number,
    name: VerbalOperatorKind,
    line: number,
    column: number,
    start: number,
    end: number
}

type InfixOperation = {
    type: "InfixOperation",
    left: PrefixOperation | Term | Literal | PostfixOperation | InfixOperation,
    right: PrefixOperation | Term | Literal | PostfixOperation | InfixOperation,
    operator: InfixCallOperator | NonVerbalOperator | VerbalOperator,
    line: number,
    column: number,
    start: number,
    end: number
}

type PrefixOperation = {
    type: "PrefixOperation",
    operand: Literal | Term | InfixOperation | PrefixOperation | PostfixOperation,
    operator: NonVerbalOperator | VerbalOperator,
    line: number,
    column: number,
    start: number,
    end: number
}

type PostfixOperation = {
    type: "PostfixOperation",
    operand: Literal | Term,
    operator: NonVerbalOperator | VerbalOperator,
    line: number,
    column: number,
    start: number,
    end: number
}

type InlineMacroApplication = {
    type: "InlineMacroApplication",
    caller: Identifier | PropertyAccess,
    arguments: CallSiteArgsList | null,
    body: PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type FunctionCall = {
    type: "FunctionCall",
    arguments: CallSiteArgsList,
    caller: Identifier | Keyword | DoExpr | PropertyAccess | OperatorRef | GroupExpression | TaggedSymbol | TaggedNumber | TaggedString | ImplicitMultiplication | FunctionCall,
    externcallback: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type OperatorRef = {
    type: "OperatorRef",
    operator: VerbalOperator | NonVerbalOperator,
    line: number,
    column: number,
    start: number,
    end: number
}

type KindList = {
    type: "KindList",
    kinds: Identifier[],
    line: number,
    column: number,
    start: number,
    end: number
}

type ParamList = {
    type: "ParamList",
    positional: Array<AssignExpr | Identifier>,
    keyword: Array<AssignExpr | Identifier>,
    captured: Array<Identifier>,
    line: number,
    column: number,
    start: number,
    end: number
}

type CallSiteArgsList = {
    type: "CallSiteArgsList",
    positional: Array<Pair | Expression | FunctionPrototype>,
    keyword: Array<Pair | Identifier>,
    captured: Array<Identifier>,
    line: number,
    column: number,
    start: number,
    end: number
}

type DoExpr = {
    type: "DoExpr",
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type PipelineNotation = {
    type: "PipelineNotation",
    expression: AsExpression | Expression,
    pipes: Array<ErrorPipeline | TransformPipeline>,
    kind: "pointed" | "pointfree",
    line: number,
    column: number,
    start: number,
    end: number
}

type ErrorPipeline = {
    type: "ErrorPipeline",
    expression: Expression,
    isIterative: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type TransformPipeline = {
    type: "TransformPipeline",
    expression: Expression,
    isIterative: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type InfixCallOperator = {
    type: "InfixCallOperator",
    caller: Identifier | PropertyAccess,
    precedence: 9,
    line: number,
    column: number,
    start: number,
    end: number
}

type ExternalCallbackNotation = {
    type: "ExternalCallbackNotation",
    caller: FunctionCall,
    callback: DoExpr,
    line: number,
    column: number,
    start: number,
    end: number
}

type BlockMacroApplication = {
    type: "BlockMacroApplication",
    caller: Identifier | PropertyAccess,
    left: Array<Inline | Block>,
    right: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type ObjectCascadeNotation = {
    type: "ObjectCascadeNotation",
    object: Term | Literal,
    body: Array<ObjectOptionalCascade | ObjectRegularCascade>,
    line: number,
    column: number,
    start: number,
    end: number
}

type ObjectOptionalCascade = {
    type: "ObjectOptionalCascade",
    body: PropertyAccess | FunctionCall | Keyword | Identifier,
    line: number,
    column: number,
    start: number,
    end: number
}

type ObjectRegularCascade = {
    type: "ObjectRegularCascade",
    body: PropertyAccess | FunctionCall | Keyword | Identifier,
    line: number,
    column: number,
    start: number,
    end: number
}

type AssignExpr = {
    type: "AssignExpr",
    left: Pattern,
    right: Expression,
    signature: TypeExpression | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type IfBlock = {
    type: "IfBlock",
    condition: AsExpression | Expression,
    body: Array<Inline | Block>,
    alternatives: Array<ElseIfBlock>,
    fallback: ElseBlock,
    line: number,
    column: number,
    start: number,
    end: number
}

type ElseIfBlock = {
    type: "ElseIfBlock",
    condition: AsExpression | Expression,
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type ElseBlock = {
    type: "ElseBlock",
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type IfInline = {
    type: "IfInline",
    condition: AsExpression | Expression,
    body: Expression,
    fallback: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type AsExpression = {
    type: "AsExpression",
    left: Expression,
    right: Identifier | CaseExpr,
    line: number,
    column: number,
    start: number,
    end: number
}

type ElseInline = {
    type: "ElseInline",
    body: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type MatchInline = {
    type: "MatchInline",
    matcher: Expression,
    cases: Array<(CaseExpr & { body: Expression | Block })>,
    line: number,
    column: number,
    start: number,
    end: number
}

type CaseExpr = {
    type: "CaseExpr",
    pattern: Pattern,
    body?: Expression | Block,
    line: number,
    column: number,
    start: number,
    end: number
}

type ForBlock = {
    type: "ForBlock",
    condition: Expression,
    body: Array<Inline | Block>,
    done: DoneBlock | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type DoneBlock = {
    type: "DoneBlock",
    status: Identifier | StringLiteral,
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type ForInline = {
    type: "ForInline",
    condition: Expression,
    body: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type DoCatchBlock = {
    type: "DoCatchBlock",
    body: Array<Inline | Block>,
    handlers: CatchBlock[],
    done: DoneBlock | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type CatchBlock = {
    type: "CatchBlock",
    body: Array<Inline | Block>,
    params: Array<Pattern>,
    line: number,
    column: number,
    start: number,
    end: number
}

type Pattern = {
    type: "Pattern",
    body: AsExpression
    | BracePattern
    | BracketPattern
    | ParenPattern
    | TypeAssertion
    | PrefixPattern
    | InfixPattern
    | PostfixPattern
    | InterpPattern
    | Literal,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type PairPattern = {
    type: "PairPattern",
    key: PrefixPattern | PostfixPattern | Literal,
    value: AsExpression
    | TypeAssertion
    | BracePattern
    | BracketPattern
    | ParenPattern
    | PrefixPattern
    | InfixPattern
    | PostfixPattern
    | InterpPattern
    | Literal,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type InterpPattern = {
    type: "InterpPattern",
    body: TaggedString | MetaDataInterpolation,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type PrefixPattern = {
    type: "PrefixPattern",
    operator: NonVerbalOperator,
    operand: Literal | BracePattern | BracketPattern | ParenPattern | InterpPattern | PrefixPattern | InfixPattern | PostfixPattern,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type PostfixPattern = {
    type: "PostfixPattern",
    operator: NonVerbalOperator,
    operand: Literal | BracePattern | BracketPattern | ParenPattern | InterpPattern,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type InfixPattern = {
    type: "InfixPattern",
    operator: VerbalOperator | NonVerbalOperator,
    left: BracePattern
    | BracketPattern
    | ParenPattern
    | InterpPattern
    | InfixPattern
    | PrefixPattern
    | PostfixPattern
    | Literal,
    right: BracePattern
    | BracketPattern
    | ParenPattern
    | InterpPattern
    | InfixPattern
    | PrefixPattern
    | PostfixPattern
    | Literal,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type BracePattern = {
    type: "BracePattern",
    values: Array<TypeAssertion
        | AsExpression
        | PairPattern
        | PrefixPattern
        | Literal>,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type BracketPattern = {
    type: "BracketPattern",
    values: Array<AsExpression
        | InfixPattern
        | PrefixPattern
        | PostfixPattern
        | TypeAssertion
        | BracePattern
        | ParenPattern
        | BracketPattern
        | InterpPattern
        | Literal
        | MismatchToken>[],
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type ParenPattern = {
    type: "ParenPattern",
    positional: Array<PairPattern
        | AsExpression
        | TypeAssertion
        | BracePattern
        | BracketPattern
        | ParenPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | InterpPattern
        | Literal
        | MismatchToken>,
    keyword: Array<PairPattern
        | AsExpression
        | TypeAssertion
        | BracePattern
        | BracketPattern
        | ParenPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | InterpPattern
        | Literal
        | MismatchToken>,
    includesNamed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}

type CommentLiteral = {
    type: "CommentLiteral",
    value: string,
    kind: "inline" | "block",
    line: number,
    column: number,
    start: number,
    end: number
}

type Literal = {
    type: "Literal",
    value: MapLiteral | TupleLiteral | ArrayLiteral | StringLiteral | CharLiteral | SymbolLiteral | NumericLiteral | Identifier | OperatorRef,
    line: number,
    column: number,
    start: number,
    end: number
}

type Term = {
    type: "Term",
    value: MetaDataInterpolation | TaggedSymbol | SymbolFragment | TaggedString | InlineStringFragment | ImplicitMultiplication | TaggedNumber | ForInline | MatchInline | IfInline | AnonFunction | UnitFunction | ObjectCascadeNotation | ExternalCallbackNotation | PipelineNotation | FunctionCall | InlineMacroApplication | PropertyAccess | DoExpr | GroupExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type Expression = {
    type: "Expression",
    value: AssignExpr | TypeAssertion | InfixOperation | PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type GroupExpression = {
    type: "GroupExpression",
    value: AssignExpr | TypeAssertion | InfixOperation | PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type UseDeclaration = {
    type: "UseDeclaration",
    rules: Array<StringLiteral /* | TypeAssertion */>,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeAssertion = {
    type: "TypeAssertion",
    left: Expression,
    right: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type LabelDeclaration = {
    type: "LabelDeclaration",
    name: Identifier,
    body: IfBlock | ForBlock | DoCatchBlock,
    line: number,
    column: number,
    start: number,
    end: number
}

type TaggedNumber = {
    type: "TaggedNumber",
    tag: Identifier | GroupExpression,
    number: NumericLiteral,
    line: number,
    column: number,
    start: number,
    end: number
}

type ImplicitMultiplication = {
    type: "ImplicitMultiplication",
    left: NumericLiteral,
    right: Identifier | GroupExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type NumericLiteral = {
    type: "NumericLiteral",
    value: string,
    kind: "float" | "integer",
    line: number,
    column: number,
    start: number,
    end: number
}

type IntegerLiteral = {
    type: "IntegerLiteral",
    value: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type FloatLiteral = {
    type: "FloatLiteral",
    value: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type StringLiteral = {
    type: "StringLiteral",
    text: string,
    kind: "inline" | "multiline",
    charset: "ascii" | "unicode",
    line: number,
    column: number,
    start: number,
    end: number
}

type InlineStringLiteral = StringLiteral & { kind: "inline" }
type MultilineStringLiteral = StringLiteral & { kind: "multiline" }

type InlineFStringFragment = {
    type: "InlineFStringFragment"
    fragments: InlineFString[],
    line: number,
    column: number,
    start: number,
    end: number
}

type InStringExpr = {
    type: "InStringExpr",
    positional: Array<Expression>,
    keyword: Array<Pair>,
    line: number,
    column: number,
    start: number,
    end: number
}

type InStringId = {
    type: "InStringId",
    value: Identifier,
    line: number,
    column: number,
    start: number,
    end: number
}

type InlineFString = {
    type: "InlineFString",
    fragments: Array<StringLiteral & { kind: "inline" } | InStringExpr | InStringId>,
    line: number,
    column: number,
    start: number,
    end: number
}

type InlineStringFragment = {
    type: "InlineStringFragment",
    fragments: InlineStringLiteral[],
    line: number,
    column: number,
    start: number,
    end: number
}

type MultilineASCIIString = {
    type: "MultilineASCIIString",
    text: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type MultilineUnicodeString = {
    type: "MultilineUnicodeString",
    text: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type MultilineFString = {
    type: "MultilineFString",
    fragments: Array<MultilineStringLiteral | InStringExpr | InStringId>,
    line: number,
    column: number,
    start: number,
    end: number
}

type TaggedString = {
    type: "TaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression | TaggedSymbol | TaggedString,
    value: InlineFStringFragment | MultilineFString,
    line: number,
    column: number,
    start: number,
    end: number
}

type TaggedSymbol = {
    type: "TaggedSymbol",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression | TaggedSymbol | TaggedString,
    fragments: Array<SymbolLiteral>,
    line: number,
    column: number,
    start: number,
    end: number
}

type SymbolFragment = {
    type: "SymbolFragment",
    fragments: Array<SymbolLiteral>,
    line: number,
    column: number,
    start: number,
    end: number
}

type SymbolLiteral = {
    type: "SymbolLiteral",
    text: string,
    kind: "string" | "char",
    charset: "ascii" | "unicode",
    line: number,
    column: number,
    start: number,
    end: number
}

type CharLiteral = {
    type: "CharLiteral",
    text: string | EscapeSequence,
    charset: "ascii" | "unicode",
    line: number,
    column: number,
    start: number,
    end: number
}

type ArrayLiteral = {
    type: "ArrayLiteral",
    values: Array<Expression[]>,
    line: number,
    column: number,
    start: number,
    end: number
}

type TupleLiteral = {
    type: "TupleLiteral",
    positional: Array<Expression>,
    keyword: Array<Pair | Expression>,
    line: number,
    column: number,
    start: number,
    end: number
}

type MapLiteral = {
    type: "MapLiteral",
    pairs: Array<Identifier | Pair>,
    line: number,
    column: number,
    start: number,
    end: number
}

type Pair = {
    type: "Pair",
    key: PrefixOperation | PostfixOperation | GroupExpression | Term | Literal,
    value: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type MetaDataInterpolation = {
    type: "MetaDataInterpolation",
    body: Array<Inline | Block>,
    line: number,
    column: number,
    start: number,
    end: number
}

type Inline = {
    type: "Inline",
    value: Expression,
    line: number,
    column: number,
    start: number,
    end: number
}

type Block = {
    type: "Block",
    value: LabelDeclaration | UseDeclaration | DoCatchBlock | ForBlock | IfBlock | BlockMacroApplication | NamedFunction | ImportDeclaration | VariableDeclaration,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeName = {
    type: "TypeName",
    name: Identifier,
    line: number,
    column: number,
    start: number,
    end: number
}

type UnionType = {
    type: "UnionType",
    left: TypeName | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type IntersectionType = {
    type: "IntersectionType",
    left: TypeName | UnionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type NegateType = {
    type: "NegateType",
    operand: TypeExpression | GroupTypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type DifferenceType = {
    type: "DifferenceType",
    left: TypeName | UnionType | IntersectionType | NegateType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type FunctionType = {
    type: "FunctionType",
    head: FunctionCallType | TypeName | TupleType,
    body: TypeExpression,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeExpression = {
    type: "TypeExpression",
    body: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | GroupTypeExpression | StructureType,
    constraint: TypeConstraint | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type GroupTypeExpression = {
    type: "GroupTypeExpression",
    body: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | GroupTypeExpression | StructureType,
    constraint: TypeConstraint | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type EscapeSequence = {
    type: "EscapeSequence",
    value: string,
    kind: "regular" | "doubleHex" | "quadHex" | "polyHex",
    raw: string,
    trailing: string,
    line: number,
    column: number,
    start: number,
    end: number
}

type TypeConstraint = {
    type: "TypeConstraint",
    assert: FunctionType | null,
    structure: StructureType | null,
    body: TupleLiteral | null,
    line: number,
    column: number,
    start: number,
    end: number
}

type StructureType = {
    type: "StructureType",
    fields: Array<TypeAssertion>,
    line: number,
    column: number,
    start: number,
    end: number
}

type TupleType = {
    type: "TupleType",
    values: Array<TypeExpression>,
    line: number,
    column: number,
    start: number,
    end: number
}

type FunctionCallType = {
    type: "FunctionCallType",
    args: TupleType,
    caller: TypeName,
    line: number,
    column: number,
    start: number,
    end: number
}

type PropertyAccess = {
    type: "PropertyAccess",
    accessor: Keyword | Literal | TaggedSymbol | TaggedString | ImplicitMultiplication | TaggedNumber | FunctionCall | GroupExpression | PropertyAccess,
    field: FunctionCall | IntegerLiteral | Identifier | Keyword | ArrayLiteral,
    optional: boolean,
    computed: boolean,
    line: number,
    column: number,
    start: number,
    end: number
}