import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"
import { generateAnonFunction } from "./anon-function/anon-function.js"
import { generateArrayLiteral } from "./array-literal.js"
import { generateDoExpr } from "./do-expr.js"
import { generateIdentifier } from "./identifier.js"
import { generateMapLiteral } from "./map-literal.js"
import { generateNumericLiteral } from "./numeric-literal/numericLiteral.js"
import { generateStringLiteral } from "./string-literal.js"
import { generateTupleLiteral } from "./tuple-literal.js"
import { generateUnitFunction } from "./unit-function.js"

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
        generateNumericLiteral, generateDoExpr, generateAnonFunction, generateUnitFunction, generateIdentifier
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

    literal.value = node

    return literal
}