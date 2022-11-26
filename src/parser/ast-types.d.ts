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
    specifiers: Array<AsExpression | Identifier | ObjectExtendNotation> | PrefixOperation | NonVerbalOperator,
    source: StringLiteral | TaggedSymbol | FunctionCall | Identifier | PropertyAccess,
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
    right: Expression,
    start: number,
    end: number
}

type Identifier = {
    type: "Identifier",
    name: string,
    start: number,
    end: number
}

type KeywordKind = "do" | "done" | "end" | "fun" | "var" | "val" | "type" | "ref" | "case" | "if" | "elseif" | "else" | "for" | "catch" | "throw" | "in" | "in!" | "of" | "use" | "import" | "export" | "from" | "to" | "is" | "is!" | "as" | "match"

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
    params: Array<Pattern>,
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
    params: Array<Pattern>,
    signature: TypeExpression | null,
    body: Expression,
    start: number,
    end: number
}

type FunctionKind = "self" | "trait" | "macro" | "yield" | "payload" | "return" | "getter" | "setter"

type BlockAnonFunction = {
    type: "BlockAnonFunction",
    kind: FunctionKind,
    params: Array<Pattern>,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type NamedFunction = {
    type: "NamedFunction",
    name: Identifier,
    kind: FunctionKind,
    params: Array<Pattern>,
    signature: TypeExpression | null,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type NonVerbalOperator = {
    type: "NonVerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    name: string,
    start: number,
    end: number
}

type VerbalOperatorKind = "ref" | "case" | "throw" | "in" | "in!" | "of" | "to" | "is" | "is!" | "as"

type VerbalOperator = {
    type: "VerbalOperator",
    kind: "infix" | "prefix" | "postfix",
    name: VerbalOperatorKind,
    start: number,
    end: number
}

type InfixOperation = {
    type: "InfixOperation",
    left: Literal | Term | Expression,
    right: Literal | Term | InfixOperation | Expression,
    operator: InfixCallOperator | NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type PrefixOperation = {
    type: "PrefixOperation",
    operand: Literal | Term | Expression,
    operator: NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type PostfixOperation = {
    type: "PostfixOperation",
    operand: Literal | Term | Expression,
    operator: NonVerbalOperator | VerbalOperator,
    start: number,
    end: number
}

type InlineMacroApplication = {
    type: "InlineMacroApplication",
    caller: Identifier | PropertyAccess,
    arguments: CallSiteArgsList,
    body: Inline,
    start: number,
    end: number
}

type FunctionCall = {
    type: "FunctionCall",
    arguments: CallSiteArgsList,
    caller: Identifier | PropertyAccess | OperatorRef | Expression,
    start: number,
    end: number
}

type OperatorRef = {
    type: "OperatorRef",
    operator: string,
    start: number,
    end: number
}

type CallSiteArgsList = {
    type: "CallSiteArgsList",
    positional: Array<Expression>,
    keyword: Array<Expression>,
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
    type: "InfixCallNotation",
    caller: Identifier | PropertyAccess,
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
    condition: Expression,
    cases: MatchCaseExpr[],
    start: number,
    end: number
}

type MatchCaseExpr = {
    type: "MatchCaseExpr",
    pattern: Pattern,
    body: Array<Inline | Block>,
    start: number,
    end: number
}

type CaseExpr = {
    type: "CaseExpr",
    pattern: Pattern,
    body: Inline,
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
    body: Literal | Term,
    start: number,
    end: number
}

type Literal = {
    type: "Literal",
    value: MapLiteral | TupleLiteral | ArrayLiteral | StringLiteral | NumericLiteral | DoExpr | AnonFunction | UnitFunction | Identifier,
    start: number,
    end: number
}

type Term = {
    type: "Term",
    value: MetaDataInterpolation | TaggedSymbol | TaggedString | InlineStringFragment | ImplicitMultiplication | TaggedNumber | ForInline | MatchInline | IfInline | ObjectCascadeNotation | ObjectExtendNotation | ExternalCallbackNotation | PipelineNotation | FunctionCall | InlineMacroApplication | PropertyAccess,
    start: number,
    end: number
}

type Expression = {
    type: "Expression",
    value: InfixOperation | PrefixOperation | PostfixOperation | Term | Literal,
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
    tag: Identifier | PropertyAccess | FunctionCall,
    number: NumericLiteral,
    start: number,
    end: number
}

type ImplicitMultiplication = {
    type: "ImplicitMultiplication",
    left: NumericLiteral,
    right: Identifier | PropertyAccess | Expression,
    start: number,
    end: number
}

type NumericLiteral = {
    type: "NumericLiteral",
    value: IntegerLiteral |  FloatLiteral,
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
    format: "ascii" | "unicode",
    start: number,
    end: number
}

type InlineStringLiteral = StringLiteral & {kind: "inline"}
type MultilineStringLiteral = StringLiteral & {kind: "multiline"}

type InlineTaggedString = {
    type: "InlineTaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | Expression,
    fragments: Array<InlineStringLiteral | InstringExpr | InstringId>,
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
    tag: Identifier | PropertyAccess | FunctionCall | Expression,
    fragments: Array<InlineStringLiteral | InstringExpr | InstringId>,
    start: number,
    end: number
}

type TaggedString = {
    type: "TaggedString",
    tag: Identifier | PropertyAccess | FunctionCall | Expression,
    value: InlineTaggedString | MultilineTaggedString,
    start: number,
    end: number
}
    
type TaggedSymbol = {
    type: "TaggedSymbol",
    tag: Identifier | PropertyAccess | FunctionCall | Expression,
    fragments: Array<SymASCIICharLiteral | SymUnicodeCharLiteral | SymASCIIStringLiteral | SymUnicodeStringLiteral>,
    start: number,
    end: number
}

type ArrayLiteral = {
    type: "ArrayLiteral",
    elements: Array<Expression>,
    start: number,
    end: number
}

type TupleLiteral = {
    type: "TupleLiteral",
    elements: Array<Expression>,
    start: number,
    end: number
}

type MapLiteral = {
    type: "MapLiteral",
    elements: Pair[],
    start: number,
    end: number
}

type Pair = {
    type: "Pair",
    key: Expression,
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
    value: Term | Literal,
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
    left: Array<TypeExpression>,
    right: Array<TypeExpression>,
    start: number,
    end: number
}

type IntersectionType = {
    type: "IntersectionType",
    left: Array<TypeExpression>,
    right: Array<TypeExpression>,
    start: number,
    end: number
}

type NegateType = {
    type: "NegateType",
    operand: TypeExpression,
    start: number,
    end: number
}

type DifferenceType = {
    type: "DifferenceType",
    left: Array<TypeExpression>,
    right: Array<TypeExpression>,
    start: number,
    end: number
}

type FunctionType = {
    type: "FunctionType",
    params: Array<TypeExpression>,
    body: TypeExpression,
    start: number,
    end: number
}

type TypeExpression = {
    type: "TypeExpression",
    body: TypeName | UnionType | IntersectionType | NegateType | DifferenceType | FunctionType | StructureType,
    constraint: TypeConstraint | null,
    start: number,
    end: number
}

type TypeConstraint = {
    type: "TypeConstraint",
    assert: UnitFunction | null,
    structure: StructureType | null,
    body: object,
    start: number,
    end: number
}

type StructureType = {
    type: "StructureType",
    fields: Array<TypeAssertion>,
    start: number,
    end: number
}

type PropertyAccess = {
    type: "PropertyAccess",
    accessor: Literal | TaggedSymbol | TaggedString | ImplicitMultiplication | TaggedNumber | FunctionCall,
    field: Identifier,
    computed: boolean,
    start: number,
    end: number
}