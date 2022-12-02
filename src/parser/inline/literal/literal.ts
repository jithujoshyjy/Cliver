import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"
import { generateAnonFunction } from "./anonFunction.js"
import { generateArrayLiteral } from "./arrayLiteral.js"
import { generateDoExpr } from "./doExpr.js"
import { generateIdentifier } from "./identifier.js"
import { generateMapLiteral } from "./mapLiteral.js"
import { generateNumericLiteral } from "./numericLiteral.js"
import { generateStringLiteral } from "./stringLiteral.js"
import { generateTupleLiteral } from "./tupleLiteral.js"
import { generateUnitFunction } from "./unitFunction.js"

export function generateLiteral(context: Node, tokens: TokenStream): Literal | MismatchToken {
    const literal: Literal = {
        type: "Literal",
        value: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    const generateNodes = [
        generateMapLiteral, generateTupleLiteral, generateArrayLiteral, generateStringLiteral,
        generateNumericLiteral, generateDoExpr, generateAnonFunction, generateUnitFunction, generateIdentifier
    ]

    for (let [i, generateNode] of generateNodes.entries()) {
        const node = generateNode(literal, tokens)
        if (node.type == "MismatchToken") {
            if (i < generateNodes.length)
                continue
            
            tokens.cursor = initialCursor
            return node
        }

        literal.value = node
        literal.start = node.start
        literal.end = node.end
        break
    }

    return literal
}