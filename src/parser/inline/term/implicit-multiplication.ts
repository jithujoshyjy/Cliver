import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateNumericLiteral } from "../literal/numeric-literal/numericLiteral.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateImplicitMultiplication(context: Node, tokens: TokenStream): ImplicitMultiplication | MismatchToken {
    const implicitMultiplication: ImplicitMultiplication = {
        type: "ImplicitMultiplication",
        left: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const number = generateNumericLiteral(implicitMultiplication, tokens)
    if(number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    implicitMultiplication.left = number
    tokens.advance()
    currentToken = tokens.currentToken

    const nodeGenerators = [
        generateGroupExpression, /* generatePropertyAccess,  */generateIdentifier
    ]

    let multiplier: Identifier | PropertyAccess | GroupExpression | MismatchToken = null!
    for(let nodeGenerator of nodeGenerators) {
        multiplier = nodeGenerator(implicitMultiplication, tokens)
        currentToken = tokens.currentToken
        if(multiplier.type != "MismatchToken") {
            break
        }
    }

    if(multiplier.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return multiplier
    }

    implicitMultiplication.right = multiplier
    tokens.advance()

    return implicitMultiplication
}