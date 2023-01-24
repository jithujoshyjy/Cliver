import { TokenStream } from "../../../../lexer/token.js"
import { type Node } from "../../../utility.js"
import { generateLiteral } from "../../literal/literal.js"
import { generateTypeAssertion } from "../../type/type-assertion.js"
import { generateAsExpression } from "../as-expression.js"
import { generateBracePattern } from "./brace-pattern.js"
import { generateBracketPattern } from "./bracket-pattern.js"
import { generateInfixPattern } from "./infix-pattern.js"
import { generateInterpPattern } from "./interp-pattern.js"
import { generateParenPattern } from "./paren-pattern.js"
import { generatePostfixPattern } from "./postfix-pattern.js"
import { generatePrefixPattern } from "./prefix-pattern.js"

export function generatePattern(context: Node, tokens: TokenStream): Pattern | MismatchToken {
    const pattern: Pattern = {
        type: "Pattern",
        body: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateAsExpression, generateInfixPattern, generatePrefixPattern, generatePostfixPattern,generateTypeAssertion, generateBracePattern,  generateParenPattern, generateBracketPattern,
        generateInterpPattern, generateLiteral
    ]

    let patternNode: AsExpression
        | TypeAssertion
        | BracePattern
        | BracketPattern
        | ParenPattern
        | PrefixPattern
        | InfixPattern
        | PostfixPattern
        | InterpPattern
        | Literal
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        patternNode = nodeGenerator(pattern, tokens)
        currentToken = tokens.currentToken
        if (patternNode.type != "MismatchToken") {
            break
        }

        if (patternNode.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return patternNode
        }
    }

    if (patternNode.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return patternNode
    }

    pattern.body = patternNode

    return pattern
}

export function printPattern(token: Pattern, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "Pattern\n"
}

/*
case pattern: expression

case pattern &&
case pattern: expression

case pattern ||
case pattern: expression

case pattern &&
expression: expression

x
x :: Type
x && condition
x & y
x | y
u - x
x?
$""
${}

{x}
{x}!
{...xs}
{x: y}
{x as y}
{x, y}
x.{y}

[x]
[x]!
[...xs]
[x as y]
[x, y]
x.[y]

(x, )
(x: y)
(x as y)
(x, y)

(None)
(Just(x))
(Just(1))

*/