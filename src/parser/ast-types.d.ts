type Program = {
    type: "Program",
    value: Array<Inline | Block>,
    start: number,
    end: number
}

type MismatchToken = {
    type: "MismatchToken",
    error: string,
    value: import("../lexer/token").Token,
    start: number,
    end: number
}

type ImportDeclaration = {
    type: "ImportDeclaration",
    specifiers: Array<AsExpression | Identifier | ObjectExtendNotation | PrefixOperation | NonVerbalOperator>,
    sources: Array<StringLiteral | TaggedSymbol | FunctionCall | Identifier | PropertyAccess>,
    start: number,
    end: number
}

type VariableDeclaration = {
    type: "VariableDeclaration",
    signature: TypeExpression | null,
    declarations: VariableDeclarator[],
    kind: "var" | "val",
    start: number,
    end: number
}

type VariableDeclarator = {
    type: "VariableDeclarator",
    signature: TypeExpression | null,
    left: Pattern,
    right: Expression | null,
    start: number,
    end: number
}

type Identifier = {
    type: "Identifier",
    name: string,
    start: number,
    end: number
}

type KeywordKind = "do" | "done" | "end" | "fun" | "var" | "val" | "type" | "ref" | "case" | "if" | "elseif" | "else" | "for" | "catch" | "throw" | "in" | "in!" | "of" | "use" | "import" | "export" | "from" | "to" | "is" | "is!" | "as" | "match" | "where"

type Keyword = {
    type: "Keyword",
    name: string,
    start: number,
    end: number
}

type TypeDeclaration = {
    type: "TypeDeclaration",
    declarations: TypeDeclarator[],
    signature: TypeExpression | null,
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
    start: number,
    end: number
}

type UnitFunction = {
    type: "UnitFunction",
    params: Array<AssignExpr | Pattern>,
    signature: TypeExpression | null,
    body: Expression,
    start: number,
    end: number
}

type AnonFunction = {
    type: "AnonFunction",
    value: InlineAnonFunction | BlockAnonFunction,
    start: number,
    end: number
}

type InlineAnonFunction = {
    type: "InlineAnonFunction",
    params: Array<AssignExpr | Pattern>,
    signature: TypeExpression | null,
    body: Expression,
    start: number,
    end: number
}

type FunctionKind = "self" | "trait" | "macro" | "yield" | "payload" | "return" | "getter" | "setter"

type BlockAnonFunction = {
    type: "BlockAnonFunction",
    kind: FunctionKind[],
    params: Array<AssignExpr | Pattern>,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type NamedFunction = {
    type: "NamedFunction",
    name: Identifier,
    kind: FunctionKind[],
    params: Array<AssignExpr | Pattern>,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type FunctionPrototype = {
    type: "FunctionPrototype",
    kind: FunctionKind[],
    params: Array<AssignExpr | Pattern>,
    signature: TypeExpression | null,
    start: number,
    end: number
}

type NonVerbalOperator = {
    type: "NonVerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    precedence: number,
    name: string,
    start: number,
    end: number
}

type VerbalOperatorKind = "ref" | "case" | "throw" | "in" | "in!" | "of" | "to" | "is" | "is!" | "as"

type VerbalOperator = {
    type: "VerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    precedence: number,
    name: VerbalOperatorKind,
    start: number,
    end: number
}

type InfixOperation = {
    type: "InfixOperation",
    left: PrefixOperation | PostfixOperation | Literal | Term | GroupExpression,
    right: PrefixOperation | PostfixOperation | Literal | Term | GroupExpression,
    operator: InfixCallOperator | NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type PrefixOperation = {
    type: "PrefixOperation",
    operand: Literal | Term | GroupExpression | InfixPattern | PrefixOperation,
    operator: NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type PostfixOperation = {
    type: "PostfixOperation",
    operand: Literal | Term | GroupExpression | InfixPattern | PrefixOperation,
    operator: NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type InlineMacroApplication = {
    type: "InlineMacroApplication",
    caller: Identifier | PropertyAccess,
    arguments: CallSiteArgsList | null,
    body: PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    start: number,
    end: number
}

type FunctionCall = {
    type: "FunctionCall",
    arguments: CallSiteArgsList,
    caller: Identifier | PropertyAccess | OperatorRef | GroupExpression,
    externcallback: boolean,
    start: number,
    end: number
}

type OperatorRef = {
    type: "OperatorRef",
    operator: VerbalOperator | NonVerbalOperator,
    start: number,
    end: number
}

type CallSiteArgsList = {
    type: "CallSiteArgsList",
    positional: Array<Pair | Expression | FunctionPrototype>,
    keyword: Array<Pair | Identifier>,
    start: number,
    end: number
}

type DoExpr = {
    type: "DoExpr",
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type PipelineNotation = {
    type: "PipelineNotation",
    expression: AsExpression | Expression,
    pipes: Array<ErrorPipeline | TransformPipeline>,
    kind: "pointed" | "pointfree",
    start: number,
    end: number
}

type ErrorPipeline = {
    type: "ErrorPipeline",
    expression: Expression,
    handler: Expression,
    start: number,
    end: number
}

type TransformPipeline = {
    type: "TransformPipeline",
    expression: Expression,
    transformer: Expression,
    start: number,
    end: number
}

type InfixCallOperator = {
    type: "InfixCallOperator",
    caller: Identifier | PropertyAccess,
    precedence: 9,
    start: number,
    end: number
}

type ExternalCallbackNotation = {
    type: "ExternalCallbackNotation",
    caller: FunctionCall,
    callback: DoExpr,
    start: number,
    end: number
}

type BlockMacroApplication = {
    type: "BlockMacroApplication",
    caller: Identifier | PropertyAccess,
    left: Array<Inline | Block>,
    right: Array<Inline | Block>,
    start: number,
    end: number
}

type ObjectExtendNotation = {
    type: "ObjectExtendNotation",
    head: Expression,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type ObjectCascadeNotation = {
    type: "ObjectCascadeNotation",
    body: Array<ObjectOptionalCascade | ObjectRegularCascade>,
    start: number,
    end: number
}

type ObjectOptionalCascade = {
    type: "ObjectOptionalCascade",
    body: Array<FunctionCall | AssignExpr>,
    start: number,
    end: number
}

type ObjectRegularCascade = {
    type: "ObjectRegularCascade",
    body: Array<FunctionCall | AssignExpr>,
    start: number,
    end: number
}

type AssignExpr = {
    type: "AssignExpr",
    left: Pattern,
    right: Expression,
    signature: TypeExpression | null,
    start: number,
    end: number
}

type IfBlock = {
    type: "IfBlock",
    condition: AsExpression | Expression,
    body: Array<Inline | Block>,
    alternate: IfBlock | ElseBlock | null,
    start: number,
    end: number
}

type ElseBlock = {
    type: "ElseBlock",
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type IfInline = {
    type: "IfInline",
    condition: AsExpression | Expression,
    body: Expression,
    alternate: ElseInline,
    start: number,
    end: number
}

type AsExpression = {
    type: "AsExpression",
    left: Expression,
    right: Identifier | CaseExpr,
    start: number,
    end: number
}

type ElseInline = {
    type: "ElseInline",
    body: Expression,
    start: number,
    end: number
}

type MatchInline = {
    type: "MatchInline",
    head: Expression,
    cases: MatchCaseExpr[],
    start: number,
    end: number
}

type MatchCaseExpr = {
    type: "MatchCaseExpr",
    patterns: Pattern[],
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type CaseExpr = {
    type: "CaseExpr",
    pattern: Pattern,
    start: number,
    end: number
}

type ForBlock = {
    type: "ForBlock",
    condition: Expression,
    body: Array<Inline | Block>,
    done: DoneBlock | null,
    start: number,
    end: number
}

type DoneBlock = {
    type: "DoneBlock",
    status: Identifier,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type ForInline = {
    type: "ForInline",
    condition: Expression,
    body: Expression,
    start: number,
    end: number
}

type DoCatchBlock = {
    type: "DoCatchBlock",
    body: Array<Inline | Block>,
    handlers: CatchBlock[],
    done: DoneBlock | null,
    start: number,
    end: number
}

type CatchBlock = {
    type: "CatchBlock",
    body: Array<Inline | Block>,
    params: Array<Pattern>,
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
    | InfixPattern
    | PostfixPattern
    | InterpPattern
    | Identifier,
    start: number,
    end: number
}

type InterpPattern = {
    type: "InterpPattern",
    body: InlineFString | Expression,
    start: number,
    end: number
}

type PrefixPattern = {
    type: "PrefixPattern",
    operator: NonVerbalOperator,
    operand: Identifier | BracePattern | BracketPattern | ParenPattern | InterpPattern | PrefixPattern | InfixPattern | PostfixPattern,
    start: number,
    end: number
}

type PostfixPattern = {
    type: "PostfixPattern",
    operator: NonVerbalOperator,
    operand: Identifier | BracePattern | BracketPattern | ParenPattern | InterpPattern,
    start: number,
    end: number
}

type InfixPattern = {
    type: "InfixPattern",
    operator: NonVerbalOperator,
    left: BracePattern
    | BracketPattern
    | ParenPattern
    | InterpPattern
    | InfixPattern
    | PrefixPattern
    | PostfixPattern
    | Identifier,
    right: BracePattern
    | BracketPattern
    | ParenPattern
    | InterpPattern
    | InfixPattern
    | PrefixPattern
    | PostfixPattern
    | Identifier,
    start: number,
    end: number
}

type BracePattern = {
    type: "BracePattern",
    values: any[],
    start: number,
    end: number
}

type BracketPattern = {
    type: "BracketPattern",
    values: any[],
    start: number,
    end: number
}

type ParenPattern = {
    type: "ParenPattern",
    values: any[],
    start: number,
    end: number
}

type Literal = {
    type: "Literal",
    value: MapLiteral | TupleLiteral | ArrayLiteral | StringLiteral | CharLiteral | SymbolLiteral | NumericLiteral | DoExpr | Identifier | GroupExpression | OperatorRef,
    start: number,
    end: number
}

type Term = {
    type: "Term",
    value: MetaDataInterpolation | TaggedSymbol | TaggedString | InlineStringFragment | ImplicitMultiplication | TaggedNumber | ForInline | MatchInline | IfInline | AnonFunction | UnitFunction | ObjectCascadeNotation | ObjectExtendNotation | ExternalCallbackNotation | PipelineNotation | FunctionCall | InlineMacroApplication | PropertyAccess | TypeAssertion | AssignExpr | GroupExpression,
    start: number,
    end: number
}

type Expression = {
    type: "Expression",
    value: InfixPattern | PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    start: number,
    end: number
}

type GroupExpression = {
    type: "GroupExpression",
    value: InfixPattern | PrefixOperation | PostfixOperation | Term | Literal | GroupExpression,
    start: number,
    end: number
}

type UseDeclaration = {
    type: "UseDeclaration",
    rules: Array<StringLiteral | TypeAssertion>,
    start: number,
    end: number
}

type TypeAssertion = {
    type: "TypeAssertion",
    left: Expression,
    right: TypeExpression,
    start: number,
    end: number
}

type LabelDeclaration = {
    type: "LabelDeclaration",
    name: Identifier,
    body: IfBlock | ForBlock | DoCatchBlock | MatchInline | AnonFunction | UnitFunction,
    start: number,
    end: number
}

type TaggedNumber = {
    type: "TaggedNumber",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression,
    number: NumericLiteral,
    start: number,
    end: number
}

type ImplicitMultiplication = {
    type: "ImplicitMultiplication",
    left: NumericLiteral,
    right: Identifier | PropertyAccess | GroupExpression,
    start: number,
    end: number
}

type NumericLiteral = {
    type: "NumericLiteral",
    value: IntegerLiteral | FloatLiteral,
    start: number,
    end: number
}

type IntegerLiteral = {
    type: "IntegerLiteral",
    value: string,
    start: number,
    end: number
}

type FloatLiteral = {
    type: "FloatLiteral",
    value: string,
    start: number,
    end: number
}

type StringLiteral = {
    type: "StringLiteral",
    text: string,
    kind: "inline" | "multiline",
    charset: "ascii" | "unicode",
    start: number,
    end: number
}

type InlineStringLiteral = StringLiteral & { kind: "inline" }
type MultilineStringLiteral = StringLiteral & { kind: "multiline" }

type InlineTaggedString = {
    type: "InlineTaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression,
    fragments: InlineFString[],
    start: number,
    end: number
}

type InstringExpr = {
    type: "InstringExpr",
    body: Array<Pair | Expression>,
    start: number,
    end: number
}

type InstringId = {
    type: "InstringId",
    value: Identifier,
    start: number,
    end: number
}

type InlineFString = {
    type: "InlineFString",
    fragments: Array<InlineStringLiteral | InstringExpr | InstringId>,
    start: number,
    end: number
}

type InlineStringFragment = {
    type: "InlineStringFragment",
    fragments: InlineStringLiteral[],
    start: number,
    end: number
}

type MultilineASCIIString = {
    type: "MultilineASCIIString",
    text: string,
    start: number,
    end: number
}

type MultilineUnicodeString = {
    type: "MultilineUnicodeString",
    text: string,
    start: number,
    end: number
}

type MultilineTaggedString = {
    type: "MultilineTaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression,
    fragments: Array<MultilineStringLiteral | InstringExpr | InstringId>,
    start: number,
    end: number
}

type TaggedString = {
    type: "TaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression,
    value: InlineTaggedString | MultilineTaggedString,
    start: number,
    end: number
}

type TaggedSymbol = {
    type: "TaggedSymbol",
    tag: Identifier | PropertyAccess | FunctionCall | GroupExpression,
    fragments: Array<SymbolLiteral>,
    start: number,
    end: number
}

type SymbolLiteral = {
    type: "SymbolLiteral",
    text: string,
    kind: "string" | "char",
    charset: "ascii" | "unicode",
    start: number,
    end: number
}

type CharLiteral = {
    type: "CharLiteral",
    text: string,
    charset: "ascii" | "unicode",
    start: number,
    end: number
}

type ArrayLiteral = {
    type: "ArrayLiteral",
    values: Array<Expression>,
    start: number,
    end: number
}

type TupleLiteral = {
    type: "TupleLiteral",
    values: Array<Expression>,
    start: number,
    end: number
}

type MapLiteral = {
    type: "MapLiteral",
    pairs: Pair[],
    start: number,
    end: number
}

type Pair = {
    type: "Pair",
    key: PrefixOperation | PostfixOperation | GroupExpression | Term | Literal,
    value: Expression,
    start: number,
    end: number
}

type MetaDataInterpolation = {
    type: "MetaDataInterpolation",
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type Inline = {
    type: "Inline",
    value: Expression,
    start: number,
    end: number
}

type Block = {
    type: "Block",
    value: LabelDeclaration | UseDeclaration | DoCatchBlock | ForBlock | IfBlock | BlockMacroApplication | NamedFunction | ImportDeclaration | VariableDeclaration,
    start: number,
    end: number
}

type TypeName = {
    type: "TypeName",
    name: Identifier,
    start: number,
    end: number
}

type UnionType = {
    type: "UnionType",
    left: TypeName | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    start: number,
    end: number
}

type IntersectionType = {
    type: "IntersectionType",
    left: TypeName | UnionType | NegateType | DifferenceType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    start: number,
    end: number
}

type NegateType = {
    type: "NegateType",
    operand: TypeExpression | GroupTypeExpression,
    start: number,
    end: number
}

type DifferenceType = {
    type: "DifferenceType",
    left: TypeName | UnionType | IntersectionType | NegateType | FunctionType | FunctionCallType | StructureType | TupleType | GroupTypeExpression,
    right: TypeExpression,
    start: number,
    end: number
}

type FunctionType = {
    type: "FunctionType",
    head: FunctionCallType | TypeName | TupleType,
    body: TypeExpression,
    start: number,
    end: number
}

type TypeExpression = {
    type: "TypeExpression",
    body: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | GroupTypeExpression | StructureType,
    constraint: TypeConstraint | null,
    start: number,
    end: number
}

type GroupTypeExpression = {
    type: "GroupTypeExpression",
    body: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | FunctionCallType | TupleType | GroupTypeExpression | StructureType,
    constraint: TypeConstraint | null,
    start: number,
    end: number
}

type TypeConstraint = {
    type: "TypeConstraint",
    assert: FunctionType | null,
    structure: StructureType | null,
    body: TupleLiteral | null,
    start: number,
    end: number
}

type StructureType = {
    type: "StructureType",
    fields: Array<TypeAssertion>,
    start: number,
    end: number
}

type TupleType = {
    type: "TupleType",
    values: Array<TypeExpression>,
    start: number,
    end: number
}

type FunctionCallType = {
    type: "FunctionCallType",
    args: TupleType,
    caller: TypeName,
    start: number,
    end: number
}

type PropertyAccess = {
    type: "PropertyAccess",
    accessor: Literal | TaggedSymbol | TaggedString | ImplicitMultiplication | TaggedNumber | FunctionCall | GroupExpression | PropertyAccess,
    field: NumericLiteral | Identifier | ArrayLiteral,
    optional: boolean,
    computed: boolean,
    start: number,
    end: number
}