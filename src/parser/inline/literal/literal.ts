import { TokenStream, TokenType } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateArrayLiteral } from "./array-literal.js"
import { generateDoExpr } from "./do-expr.js"
import { generateIdentifier } from "./identifier.js"
import { generateMapLiteral } from "./map-literal.js"
import { generateNumericLiteral } from "./numeric-literal/numericLiteral.js"
import { generateStringLiteral } from "./string-literal.js"
import { generateTupleLiteral } from "./tuple-literal.js"
import { generateCharLiteral } from "./char-literal.js"
import { generateSymbolLiteral } from "./symbol-literal.js"

export function generateLiteral(context: Node, tokens: TokenStream): Literal | MismatchToken {
    const literal: Literal = {
        type: "Literal",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateMapLiteral, generateTupleLiteral, generateArrayLiteral, generateStringLiteral,
        generateCharLiteral, generateSymbolLiteral, generateNumericLiteral, generateDoExpr,
        generateIdentifier, generateGroupExpression
    ]

    let node: typeof literal.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(literal, tokens)

        currentToken = tokens.currentToken
        if (node.type != "MismatchToken") {
            break
        }
    }

    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    literal.start = node.start
    literal.end = node.end
    literal.value = node

    tokens.advance()
    return literal
}